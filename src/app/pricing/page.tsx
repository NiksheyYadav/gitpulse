import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const FREE_FEATURES = [
  "Track up to 2 repos",
  "30-day commit & PR history",
  "Hourly background sync",
  "Public repo lookup",
];

const PRO_FEATURES = [
  "Unlimited tracked repos",
  "Full history & trend charts",
  "Sync every 10–15 minutes",
  "Team contributor analytics",
  "Priority support",
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold">Simple pricing</h1>
          <p className="mt-2 text-muted-foreground">
            Start free. Upgrade when you need more repos and fresher data.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
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
                ₹499 <span className="text-base font-normal text-muted-foreground">/mo</span>
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
              <Button className="w-full" disabled>
                Billing coming soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
