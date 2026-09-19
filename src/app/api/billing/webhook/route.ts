import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Plan, SubscriptionStatus } from "@/generated/prisma/client";

type RazorpaySubscriptionEntity = {
  id: string;
  status: string;
  current_end: number | null;
};

function verifySignature(body: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

const ACTIVE_EVENTS = new Set(["subscription.activated", "subscription.charged"]);
const ENDED_EVENTS = new Set([
  "subscription.cancelled",
  "subscription.completed",
  "subscription.expired",
]);

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    payload: { subscription?: { entity: RazorpaySubscriptionEntity } };
  };

  const entity = event.payload.subscription?.entity;
  if (!entity) {
    return NextResponse.json({ ok: true }); // event we don't care about
  }

  const subscription = await prisma.subscription.findFirst({
    where: { razorpaySubscriptionId: entity.id },
  });
  if (!subscription) {
    return NextResponse.json({ ok: true }); // unknown subscription, ignore
  }

  if (ACTIVE_EVENTS.has(event.event)) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: Plan.PRO,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: entity.current_end ? new Date(entity.current_end * 1000) : null,
      },
    });
  } else if (event.event === "subscription.pending" || event.event === "subscription.halted") {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.PAST_DUE },
    });
  } else if (ENDED_EVENTS.has(event.event)) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { plan: Plan.FREE, status: SubscriptionStatus.CANCELED },
    });
  }

  return NextResponse.json({ ok: true });
}
