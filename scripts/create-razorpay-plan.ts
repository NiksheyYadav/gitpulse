/**
 * One-time setup: creates the ₹199/mo Pro plan in Razorpay and prints its
 * ID to put in RAZORPAY_PLAN_ID_PRO. Re-running is safe but creates a
 * duplicate plan each time — only run this once per Razorpay account
 * (test mode and live mode each need their own).
 *
 * Usage: npx tsx scripts/create-razorpay-plan.ts
 */
import "dotenv/config";
import { razorpay } from "../src/lib/razorpay";

async function main() {
  const plan = await razorpay().plans.create({
    period: "monthly",
    interval: 1,
    item: {
      name: "GitPulse Pro",
      amount: 19900, // ₹199.00 in paise
      currency: "INR",
      description: "Unlimited private repos, full history, weekly digest",
    },
  });

  console.log("Created plan:", plan.id);
  console.log("Add this to your .env (and Vercel env vars):");
  console.log(`RAZORPAY_PLAN_ID_PRO="${plan.id}"`);
}

main().catch((err) => {
  console.error("Failed to create plan:", err);
  process.exit(1);
});
