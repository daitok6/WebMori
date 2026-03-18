import { NextResponse } from "next/server";
import { getCurrentOrg, getOrgStats, getOrgAudits } from "@/lib/dashboard";

export async function GET() {
  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [stats, audits] = await Promise.all([
    getOrgStats(org.id),
    getOrgAudits(org.id),
  ]);

  const recentAudits = audits.slice(0, 5).map((a) => ({
    id: a.id,
    repoName: a.repo.name,
    status: a.status,
    date: a.createdAt.toISOString(),
    findingsCount: a.findings.length,
    criticalCount: a.findings.filter((f) => f.severity === "CRITICAL").length,
  }));

  return NextResponse.json({
    plan: org.subscription?.plan ?? null,
    status: org.subscription?.status ?? null,
    repoCount: org.repos.length,
    stats,
    recentAudits,
  });
}
