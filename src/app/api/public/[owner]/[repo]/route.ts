import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { publicOctokit } from "@/lib/github/client";

const getPublicRepoSummary = unstable_cache(
  async (owner: string, repo: string) => {
    const octokit = publicOctokit();

    const [{ data: repoData }, { data: contributors }, { data: pulls }] =
      await Promise.all([
        octokit.rest.repos.get({ owner, repo }),
        octokit.rest.repos
          .listContributors({ owner, repo, per_page: 10 })
          .catch(() => ({ data: [] as { login?: string; contributions: number; avatar_url?: string }[] })),
        octokit.rest.pulls
          .list({ owner, repo, state: "all", per_page: 30, sort: "updated", direction: "desc" })
          .catch(() => ({ data: [] as { state: string; merged_at: string | null }[] })),
      ]);

    const openPRs = pulls.filter((p) => p.state === "open").length;
    const mergedPRs = pulls.filter((p) => p.merged_at).length;

    return {
      fullName: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues: repoData.open_issues_count,
      language: repoData.language,
      updatedAt: repoData.updated_at,
      topContributors: contributors.slice(0, 5).map((c) => ({
        login: c.login,
        contributions: c.contributions,
        avatarUrl: c.avatar_url,
      })),
      recentPRs: { open: openPRs, merged: mergedPRs, sampled: pulls.length },
    };
  },
  ["public-repo-summary"],
  { revalidate: 900 } // 15 min — stays well within GitHub's 60 req/hr unauthenticated limit
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;

  try {
    const summary = await getPublicRepoSummary(owner, repo);
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json(
      { error: "Repo not found or GitHub API rate limit reached" },
      { status: 404 }
    );
  }
}
