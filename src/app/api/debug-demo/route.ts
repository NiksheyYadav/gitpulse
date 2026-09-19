import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY diagnostic route — remove after the demo-login issue is fixed.
export async function GET() {
  const out: Record<string, unknown> = {};
  try {
    out.hasEmailEnv = Boolean(process.env.DEMO_ACCOUNT_EMAIL);
    out.hasPasswordEnv = Boolean(process.env.DEMO_ACCOUNT_PASSWORD);
    out.hasAuthSecret = Boolean(process.env.AUTH_SECRET);
    out.emailEnvValue = process.env.DEMO_ACCOUNT_EMAIL;
  } catch (err) {
    out.envError = err instanceof Error ? err.message : String(err);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: process.env.DEMO_ACCOUNT_EMAIL ?? "demo@gitpulse.app" },
    });
    out.userFound = Boolean(user);
    out.userId = user?.id ?? null;
  } catch (err) {
    out.prismaError = err instanceof Error ? err.message : String(err);
    out.prismaStack = err instanceof Error ? err.stack : undefined;
  }

  return NextResponse.json(out);
}
