import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { UpgradeButton } from "@/components/billing/upgrade-button";

const FREE_FEATURES = [
  "2 private repos tracked",
  "30-day commit & PR history",
  "Hourly background sync",
  "Unlimited public repo lookups",
];

const PRO_FEATURES = [
  "Unlimited private repos",
  "Full history & trend charts",
  "Sync every 10–15 minutes",
  "Weekly email digest",
  "Priority support",
];

const TEAM_FEATURES = [
  "Everything in Pro, per seat",
  "Reviewer load & stale-PR alerts",
  "Shared team dashboards",
  "Slack notifications",
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold">Simple, low-cost pricing</h1>
          <p className="mt-2 text-muted-foreground">
            Free for public repos. Pay only once you need private-repo tracking.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Free</CardTitle>
              <p className="text-3xl font-bold">
                ₹0 <span className="text-base font-normal text-muted-foreground">/mo</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full"
                nativeButton={false}
                render={<Link href="/dashboard">Get started</Link>}
              />
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-xl">Pro</CardTitle>
              <p className="text-3xl font-bold">
                ₹199 <span className="text-base font-normal text-muted-foreground">/mo</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <UpgradeButton />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">Team</CardTitle>
                <Badge variant="secondary">Coming soon</Badge>
              </div>
              <p className="text-3xl font-bold">
                ₹999 <span className="text-base font-normal text-muted-foreground">/mo</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {TEAM_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Join the waitlist
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
