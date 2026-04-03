import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg, getOrgStats, getOrgAudits } from "@/lib/dashboard";
import { computeHealthScore } from "@/lib/health-score";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [stats, audits, user, freeEval, healthScore] = await Promise.all([
    getOrgStats(org.id),
    getOrgAudits(org.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    }),
    prisma.contactRequest.findFirst({
      where: { organizationId: org.id },
      select: { id: true },
    }),
    computeHealthScore(org.id),
  ]);

  const recentAudits = audits.slice(0, 5).map((a) => ({
    id: a.id,
    repoName: a.repo.name,
    status: a.status,
    date: a.createdAt.toISOString(),
    findingsCount: a.findings.length,
    criticalCount: a.findings.filter((f) => f.severity === "CRITICAL").length,
  }));

  // Onboarding checklist state
  const isFree = !org.subscription;
  const hasPaidSubscription = !!org.subscription && org.subscription.status !== "CANCELED";
  const hasCompletedFreeEval = !!freeEval;

  // For paid users: use organization.onboardingComplete flag
  // For free users: use legacy checklist
  const onboarding = isFree
    ? {
        profileComplete: !!user?.name,
        hasRepo: org.repos.length > 0,
        hasRequestedEval: hasCompletedFreeEval,
      }
    : null;
  const freeOnboardingComplete = onboarding
    ? onboarding.profileComplete && onboarding.hasRepo && onboarding.hasRequestedEval
    : true;

  return NextResponse.json({
    plan: org.subscription?.plan ?? null,
    status: org.subscription?.status ?? null,
    repoCount: org.repos.length,
    stats,
    recentAudits,
    healthScore,
    onboarding: freeOnboardingComplete ? null : onboarding,
    isFree,
    hasPaidSubscription,
    hasCompletedFreeEval,
    needsOnboarding: hasPaidSubscription && !org.onboardingComplete,
  });
}
