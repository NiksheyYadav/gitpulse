"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function UpgradeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const body = await res.json();

      if (res.status === 401) {
        router.push("/");
        return;
      }
      if (!res.ok) throw new Error(body.error ?? "Could not start checkout");

      const razorpay = new window.Razorpay({
        key: body.keyId,
        subscription_id: body.subscriptionId,
        name: "GitPulse",
        description: "Pro plan — ₹199/mo",
        theme: { color: "#ff6b2c" },
        handler: () => {
          toast.success("Payment received — activating Pro shortly");
          router.refresh();
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      razorpay.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptReady(true)}
      />
      <Button className="w-full" onClick={handleUpgrade} disabled={loading || !scriptReady}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upgrade to Pro"}
      </Button>
    </>
  );
}
