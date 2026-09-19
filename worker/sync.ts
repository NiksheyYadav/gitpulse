/**
 * One-shot sync pass over every tracked repo. Meant to be invoked on a
 * schedule (VPS cron or PM2 cron_restart) rather than run as a daemon —
 * simpler to reason about and restart than a long-lived loop.
 *
 * Usage: npx tsx worker/sync.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { userOctokit } from "../src/lib/github/client";
import { syncRepo } from "../src/lib/github/sync";

const DELAY_BETWEEN_REPOS_MS = 2000;

async function main() {
  const repos = await prisma.trackedRepo.findMany({
    include: { user: { include: { subscription: true } } },
  });

  console.log(`[sync] starting pass over ${repos.length} tracked repos`);

  for (const repo of repos) {
    try {
      const octokit = await userOctokit(repo.userId);

      const { data: rateLimit } = await octokit.rest.rateLimit.get();
      if (rateLimit.resources.core.remaining < 50) {
        console.warn(
          `[sync] skipping ${repo.owner}/${repo.name} — rate limit low (${rateLimit.resources.core.remaining} remaining, resets ${new Date(rateLimit.resources.core.reset * 1000).toISOString()})`
        );
        continue;
      }

      await syncRepo(octokit, repo);
      console.log(`[sync] ok: ${repo.owner}/${repo.name}`);
    } catch (err) {
      console.error(
        `[sync] failed: ${repo.owner}/${repo.name} —`,
        err instanceof Error ? err.message : err
      );
    }

    await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REPOS_MS));
  }

  console.log("[sync] pass complete");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[sync] fatal error", err);
  process.exit(1);
});
