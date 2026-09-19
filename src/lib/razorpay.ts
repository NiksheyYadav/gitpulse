import Razorpay from "razorpay";

let client: Razorpay | null = null;

export function razorpay() {
  if (!client) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set");
    }
    client = new Razorpay({ key_id, key_secret });
  }
  return client;
}

/** ₹199/mo Pro plan. Created once via scripts/create-razorpay-plan.ts. */
export function proPlanId() {
  const id = process.env.RAZORPAY_PLAN_ID_PRO;
  if (!id) throw new Error("RAZORPAY_PLAN_ID_PRO is not set");
  return id;
}
