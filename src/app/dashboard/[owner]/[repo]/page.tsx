import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CommitActivityChart } from "@/components/dashboard/commit-activity-chart";
import { StarsTrendChart } from "@/components/dashboard/stars-trend-chart";
import { format, subDays, formatDistanceStrict } from "date-fns";

export default async function RepoDashboardPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");
  const userId = session.user.id;

  const { owner, repo: name } = await params;

  const repo = await prisma.trackedRepo.findUnique({
    where: { userId_owner_name: { userId, owner, name } },
  });
  if (!repo) notFound();

  const since = subDays(new Date(), 30);

  const [commits, pullRequests, contributors, snapshots] = await Promise.all([
    prisma.commit.findMany({
      where: { repoId: repo.id, committedAt: { gte: since } },
      orderBy: { committedAt: "asc" },
    }),
    prisma.pullRequest.findMany({
      where: { repoId: repo.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.contributor.findMany({
      where: { repoId: repo.id },
      orderBy: { commitsCount: "desc" },
      take: 10,
    }),
    prisma.repoSnapshot.findMany({
      where: { repoId: repo.id },
      orderBy: { date: "asc" },
    }),
  ]);

  const commitsByDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    commitsByDay.set(format(subDays(new Date(), i), "MMM d"), 0);
  }
  for (const commit of commits) {
    const key = format(commit.committedAt, "MMM d");
    commitsByDay.set(key, (commitsByDay.get(key) ?? 0) + 1);
  }
  const commitChartData = Array.from(commitsByDay, ([date, count]) => ({
    date,
    commits: count,
  }));

  const trendData = snapshots.map((s) => ({
    date: format(s.date, "MMM d"),
    stars: s.stars,
    openIssues: s.openIssues,
  }));

  const openPRs = pullRequests.filter((p) => p.state === "OPEN").length;
  const mergedPRs = pullRequests.filter((p) => p.state === "MERGED");
  const avgMergeSeconds =
    mergedPRs.length > 0
      ? mergedPRs.reduce((sum, p) => sum + (p.timeToMergeSeconds ?? 0), 0) / mergedPRs.length
      : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-10">
        <div>
          <h1 className="text-2xl font-bold">
            {owner}/{name}
          </h1>
          {repo.isPrivate && <Badge variant="secondary" className="mt-1">Private</Badge>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Commits (30d)" value={commits.length} />
          <StatCard label="Open PRs" value={openPRs} />
          <StatCard
            label="Avg. time to merge"
            value={
              avgMergeSeconds
                ? formatDistanceStrict(0, avgMergeSeconds * 1000)
                : "—"
            }
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Commit activity (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <CommitActivityChart data={commitChartData} />
          </CardContent>
        </Card>

        {trendData.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Stars & open issues over time</CardTitle>
            </CardHeader>
            <CardContent>
              <StarsTrendChart data={trendData} />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contributor</TableHead>
                    <TableHead className="text-right">Commits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributors.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.login}</TableCell>
                      <TableCell className="text-right">{c.commitsCount}</TableCell>
                    </TableRow>
                  ))}
                  {contributors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No data yet — sync this repo from the dashboard.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent pull requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>State</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pullRequests.map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell>{pr.number}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{pr.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            pr.state === "MERGED"
                              ? "default"
                              : pr.state === "OPEN"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {pr.state}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pullRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No data yet — sync this repo from the dashboard.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
