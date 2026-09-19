import { Octokit } from "octokit";
import { prisma } from "@/lib/prisma";

/**
 * Unauthenticated client for public repo lookups. GitHub allows 60 req/hr
 * per IP unauthenticated, so callers should cache aggressively.
 */
export function publicOctokit() {
  return new Octokit();
}

/**
 * Authenticated client using the signed-in user's stored GitHub OAuth token
 * (captured by Auth.js into the Account table on login). 5,000 req/hr.
 */
export async function userOctokit(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: { access_token: true },
  });

  if (!account?.access_token) {
    throw new Error("No GitHub access token found for user");
  }

  return new Octokit({ auth: account.access_token });
}

export function rateLimitRemaining(headers: Record<string, unknown>) {
  const remaining = headers["x-ratelimit-remaining"];
  const reset = headers["x-ratelimit-reset"];
  return {
    remaining: remaining ? Number(remaining) : null,
    resetAt: reset ? new Date(Number(reset) * 1000) : null,
  };
}
