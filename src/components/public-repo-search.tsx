"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, Star, GitFork, CircleDot } from "lucide-react";

type PublicRepoSummary = {
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  updatedAt: string;
  topContributors: { login?: string; contributions: number; avatarUrl?: string }[];
  recentPRs: { open: number; merged: number; sampled: number };
};

export function PublicRepoSearch() {
  const [value, setValue] = useState("vercel/next.js");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicRepoSummary | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim().replace(/^https?:\/\/github\.com\//, "");
    if (!trimmed.includes("/")) {
      setError("Enter a repo as owner/name (e.g. vercel/next.js)");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/public/${trimmed}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Repo not found");
      }
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="owner/repo, e.g. facebook/react"
          className="h-11"
        />
        <Button type="submit" size="lg" disabled={loading} className="h-11">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Look up
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {result && (
        <Card className="mt-4 text-left">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{result.fullName}</span>
              {result.language && <Badge variant="secondary">{result.language}</Badge>}
            </CardTitle>
            {result.description && (
              <p className="text-sm text-muted-foreground">{result.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" /> {result.stars.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4" /> {result.forks.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <CircleDot className="h-4 w-4" /> {result.openIssues.toLocaleString()} open issues
              </span>
              <span className="text-muted-foreground">
                {result.recentPRs.open} open / {result.recentPRs.merged} merged PRs (last {result.recentPRs.sampled})
              </span>
            </div>

            {result.topContributors.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Top contributors
                </p>
                <div className="flex -space-x-2">
                  {result.topContributors.map((c) => (
                    <Avatar key={c.login} className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={c.avatarUrl} alt={c.login ?? ""} />
                      <AvatarFallback>{c.login?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
