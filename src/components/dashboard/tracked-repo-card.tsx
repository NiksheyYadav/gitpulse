"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type SyncJob = {
  status: "IDLE" | "RUNNING" | "SUCCESS" | "ERROR";
  lastSyncedAt: string | null;
  error: string | null;
} | null;

export function TrackedRepoCard({
  id,
  owner,
  name,
  isPrivate,
  syncJob,
}: {
  id: string;
  owner: string;
  name: string;
  isPrivate: boolean;
  syncJob: SyncJob;
}) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch(`/api/repos/${id}/sync`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Sync failed");
      toast.success(`Synced ${owner}/${name}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/repos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove repo");
      toast.success(`Stopped tracking ${owner}/${name}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove repo");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>
            <Link href={`/dashboard/${owner}/${name}`} className="hover:underline">
              {owner}/{name}
            </Link>
          </CardTitle>
          <div className="mt-1 flex items-center gap-2">
            {isPrivate && <Badge variant="secondary">Private</Badge>}
            {syncJob?.status === "ERROR" && <Badge variant="destructive">Sync failed</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleSync} disabled={syncing}>
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {syncJob?.lastSyncedAt
            ? `Last synced ${formatDistanceToNow(new Date(syncJob.lastSyncedAt), { addSuffix: true })}`
            : "Not synced yet — click refresh to pull data"}
        </p>
      </CardContent>
    </Card>
  );
}
