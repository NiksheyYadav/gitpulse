import type { Octokit } from "octokit";
import { prisma } from "@/lib/prisma";
import { PullRequestState, SyncStatus } from "@/generated/prisma/client";

const MAX_COMMITS_PER_SYNC = 300;
const MAX_COMMITS_WITH_STATS = 30; // stats need a per-commit call; keep this bounded
const MAX_PRS_PER_SYNC = 200;

type TrackedRepoRef = {
  id: string;
  owner: string;
  name: string;
};

export async function syncRepo(octokit: Octokit, repo: TrackedRepoRef) {
  await prisma.syncJob.upsert({
    where: { repoId: repo.id },
    create: { repoId: repo.id, status: SyncStatus.RUNNING },
    update: { status: SyncStatus.RUNNING, error: null },
  });

  try {
    await syncRepoMetadata(octokit, repo);
    await syncCommits(octokit, repo);
    await syncPullRequests(octokit, repo);
    await syncContributors(octokit, repo);

    await prisma.syncJob.update({
      where: { repoId: repo.id },
      data: { status: SyncStatus.SUCCESS, lastSyncedAt: new Date() },
    });
  } catch (err) {
    await prisma.syncJob.update({
      where: { repoId: repo.id },
      data: {
        status: SyncStatus.ERROR,
        error: err instanceof Error ? err.message : String(err),
      },
    });
    throw err;
  }
}

async function syncRepoMetadata(octokit: Octokit, repo: TrackedRepoRef) {
  const { data } = await octokit.rest.repos.get({
    owner: repo.owner,
    repo: repo.name,
  });

  await prisma.trackedRepo.update({
    where: { id: repo.id },
    data: {
      githubRepoId: BigInt(data.id),
      isPrivate: data.private,
      defaultBranch: data.default_branch,
    },
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await prisma.repoSnapshot.upsert({
    where: { repoId_date: { repoId: repo.id, date: today } },
    create: {
      repoId: repo.id,
      date: today,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      watchers: data.subscribers_count ?? data.watchers_count,
    },
    update: {
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      watchers: data.subscribers_count ?? data.watchers_count,
    },
  });
}

async function syncCommits(octokit: Octokit, repo: TrackedRepoRef) {
  const latest = await prisma.commit.findFirst({
    where: { repoId: repo.id },
    orderBy: { committedAt: "desc" },
  });

  const commits = await octokit.paginate(
    octokit.rest.repos.listCommits,
    {
      owner: repo.owner,
      repo: repo.name,
      per_page: 100,
      since: latest?.committedAt.toISOString(),
    },
    (response, done) => {
      if (response.data.length >= MAX_COMMITS_PER_SYNC) done();
      return response.data;
    }
  );

  const capped = commits.slice(0, MAX_COMMITS_PER_SYNC);

  for (const [index, commit] of capped.entries()) {
    let additions: number | undefined;
    let deletions: number | undefined;

    if (index < MAX_COMMITS_WITH_STATS) {
      try {
        const { data: full } = await octokit.rest.repos.getCommit({
          owner: repo.owner,
          repo: repo.name,
          ref: commit.sha,
        });
        additions = full.stats?.additions;
        deletions = full.stats?.deletions;
      } catch {
        // rate limit or transient error — skip stats for this commit
      }
    }

    await prisma.commit.upsert({
      where: { repoId_sha: { repoId: repo.id, sha: commit.sha } },
      create: {
        repoId: repo.id,
        sha: commit.sha,
        authorLogin: commit.author?.login ?? null,
        authorEmail: commit.commit.author?.email ?? null,
        message: commit.commit.message,
        committedAt: new Date(
          commit.commit.author?.date ?? commit.commit.committer?.date ?? Date.now()
        ),
        additions,
        deletions,
      },
      update: {},
    });
  }
}

async function syncPullRequests(octokit: Octokit, repo: TrackedRepoRef) {
  const prs = await octokit.paginate(
    octokit.rest.pulls.list,
    {
      owner: repo.owner,
      repo: repo.name,
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: 100,
    },
    (response, done) => {
      if (response.data.length >= MAX_PRS_PER_SYNC) done();
      return response.data;
    }
  );

  for (const pr of prs.slice(0, MAX_PRS_PER_SYNC)) {
    const state: PullRequestState = pr.merged_at
      ? PullRequestState.MERGED
      : pr.state === "open"
        ? PullRequestState.OPEN
        : PullRequestState.CLOSED;

    const createdAt = new Date(pr.created_at);
    const mergedAt = pr.merged_at ? new Date(pr.merged_at) : null;
    const closedAt = pr.closed_at ? new Date(pr.closed_at) : null;
    const timeToMergeSeconds = mergedAt
      ? Math.round((mergedAt.getTime() - createdAt.getTime()) / 1000)
      : null;

    await prisma.pullRequest.upsert({
      where: { repoId_number: { repoId: repo.id, number: pr.number } },
      create: {
        repoId: repo.id,
        number: pr.number,
        title: pr.title,
        authorLogin: pr.user?.login ?? null,
        state,
        createdAt,
        mergedAt,
        closedAt,
        timeToMergeSeconds,
      },
      update: {
        title: pr.title,
        state,
        mergedAt,
        closedAt,
        timeToMergeSeconds,
      },
    });
  }
}

async function syncContributors(octokit: Octokit, repo: TrackedRepoRef) {
  const { data: contributors } = await octokit.rest.repos.listContributors({
    owner: repo.owner,
    repo: repo.name,
    per_page: 100,
  });

  for (const contributor of contributors) {
    if (!contributor.login) continue;

    await prisma.contributor.upsert({
      where: {
        repoId_login: { repoId: repo.id, login: contributor.login },
      },
      create: {
        repoId: repo.id,
        login: contributor.login,
        commitsCount: contributor.contributions,
        lastActiveAt: new Date(),
      },
      update: {
        commitsCount: contributor.contributions,
        lastActiveAt: new Date(),
      },
    });
  }
}
