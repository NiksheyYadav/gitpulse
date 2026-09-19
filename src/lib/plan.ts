import { Plan } from "@/generated/prisma/client";

export const PLAN_LIMITS: Record<Plan, { maxRepos: number; historyDays: number }> = {
  FREE: { maxRepos: 2, historyDays: 30 },
  PRO: { maxRepos: Infinity, historyDays: Infinity },
};

export function limitsFor(plan: Plan) {
  return PLAN_LIMITS[plan];
}
