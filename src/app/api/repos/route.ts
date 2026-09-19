import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userOctokit } from "@/lib/github/client";
import { limitsFor } from "@/lib/plan";
import { Plan } from "@/generated/prisma/client";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repos = await prisma.trackedRepo.findMany({
    where: { userId: session.user.id },
    include: { syncJob: true },
    orderBy: { addedAt: "desc" },
  });

  return NextResponse.json({
    repos: repos.map((r) => ({ ...r, githubRepoId: r.githubRepoId.toString() })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await request.json().catch(() => null);
  const fullName = body?.fullName as string | undefined;
  if (!fullName || !fullName.includes("/")) {
    return NextResponse.json(
      { error: "Provide a repo as 'owner/name'" },
      { status: 400 }
    );
  }
  const [owner, name] = fullName.split("/");

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });
  const plan: Plan = subscription?.plan ?? Plan.FREE;
  const limits = limitsFor(plan);

  const currentCount = await prisma.trackedRepo.count({
    where: { userId },
  });
  if (currentCount >= limits.maxRepos) {
    return NextResponse.json(
      {
        error: `Free plan is limited to ${limits.maxRepos} tracked repos. Upgrade to Pro for unlimited repos.`,
      },
      { status: 403 }
    );
  }

  const octokit = await userOctokit(userId);
  const { data: ghRepo } = await octokit.rest.repos.get({ owner, repo: name });

  const trackedRepo = await prisma.trackedRepo.upsert({
    where: {
      userId_owner_name: { userId, owner, name },
    },
    create: {
      userId,
      owner,
      name,
      githubRepoId: BigInt(ghRepo.id),
      isPrivate: ghRepo.private,
      defaultBranch: ghRepo.default_branch,
    },
    update: {},
  });

  return NextResponse.json({
    repo: { ...trackedRepo, githubRepoId: trackedRepo.githubRepoId.toString() },
  });
}
