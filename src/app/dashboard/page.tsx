import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { AddRepoForm } from "@/components/dashboard/add-repo-form";
import { TrackedRepoCard } from "@/components/dashboard/tracked-repo-card";
import { limitsFor } from "@/lib/plan";
import { Plan } from "@/generated/prisma/client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const [repos, subscription] = await Promise.all([
    prisma.trackedRepo.findMany({
      where: { userId: session.user.id },
      include: { syncJob: true },
      orderBy: { addedAt: "desc" },
    }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  const plan: Plan = subscription?.plan ?? Plan.FREE;
  const limits = limitsFor(plan);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your repos</h1>
            <p className="text-sm text-muted-foreground">
              {repos.length} / {limits.maxRepos === Infinity ? "unlimited" : limits.maxRepos}{" "}
              tracked on the {plan === "PRO" ? "Pro" : "Free"} plan
            </p>
          </div>
        </div>

        <AddRepoForm />

        <div className="mt-6 grid gap-4">
          {repos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No repos tracked yet. Add one above to start syncing commits, PRs, and
              contributor stats.
            </p>
          )}
          {repos.map((repo) => (
            <TrackedRepoCard
              key={repo.id}
              id={repo.id}
              owner={repo.owner}
              name={repo.name}
              isPrivate={repo.isPrivate}
              syncJob={
                repo.syncJob
                  ? {
                      status: repo.syncJob.status,
                      lastSyncedAt: repo.syncJob.lastSyncedAt?.toISOString() ?? null,
                      error: repo.syncJob.error,
                    }
                  : null
              }
            />
          ))}
        </div>
      </main>
    </>
  );
}
