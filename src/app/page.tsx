import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { PublicRepoSearch } from "@/components/public-repo-search";
import { Button } from "@/components/ui/button";
import { GitCommitHorizontal, GitPullRequest, LineChart } from "lucide-react";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Know exactly what&apos;s happening in your repos.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            GitPulse tracks commits, pull requests, and contributor activity across
            every repo your team touches — with trend charts, review turnaround,
            and one dashboard for it all.
          </p>

          <PublicRepoSearch />

          <div className="mt-2 flex gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/dashboard">Get started free</Link>}
            />
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/pricing">See pricing</Link>}
            />
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-16 sm:grid-cols-3">
            <Feature
              icon={<GitCommitHorizontal className="h-6 w-6" />}
              title="Commit activity"
              description="See who's shipping, how often, and where activity is trending up or down."
            />
            <Feature
              icon={<GitPullRequest className="h-6 w-6" />}
              title="PR & review velocity"
              description="Track open/merged PRs and how long reviews actually take — spot bottlenecks early."
            />
            <Feature
              icon={<LineChart className="h-6 w-6" />}
              title="Repo health trends"
              description="Stars, forks, and issue counts over time, synced automatically in the background."
            />
          </div>
        </section>
      </main>
    </>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
      <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
