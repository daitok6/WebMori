import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg, getOrgStats, getOrgAudits } from "@/lib/dashboard";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [stats, audits, user, freeEval] = await Promise.all([
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
  const onboarding = {
    profileComplete: !!user?.name,
    hasRepo: org.repos.length > 0,
    hasRequestedEval: !!freeEval,
  };
  const onboardingComplete = onboarding.profileComplete && onboarding.hasRepo && onboarding.hasRequestedEval;

  return NextResponse.json({
    plan: org.subscription?.plan ?? null,
    status: org.subscription?.status ?? null,
    repoCount: org.repos.length,
    stats,
    recentAudits,
    onboarding: onboardingComplete ? null : onboarding,
  });
}
