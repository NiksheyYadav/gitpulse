import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay, proPlanId } from "@/lib/razorpay";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing?.status === "ACTIVE" && existing.plan === "PRO") {
    return NextResponse.json({ error: "Already on Pro" }, { status: 400 });
  }

  const subscription = await razorpay().subscriptions.create({
    plan_id: proPlanId(),
    customer_notify: 1,
    // Razorpay subscriptions require a fixed cycle count rather than
    // "until cancelled" — 120 months (10 years) stands in for indefinite;
    // cancellation happens via the cancel API regardless of count.
    total_count: 120,
    notes: { userId },
  });

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: "FREE",
      status: "NONE",
      razorpaySubscriptionId: subscription.id,
    },
    update: { razorpaySubscriptionId: subscription.id },
  });

  return NextResponse.json({
    subscriptionId: subscription.id,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}
