import { NextResponse } from "next/server";
import { getCurrentOrg, getOrgAudits } from "@/lib/dashboard";

export async function GET() {
  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const audits = await getOrgAudits(org.id);

  return NextResponse.json(
    audits.map((a) => ({
      id: a.id,
      repoName: a.repo.name,
      status: a.status,
      date: a.createdAt.toISOString(),
      findingsCount: a.findings.length,
      criticalCount: a.findings.filter((f) => f.severity === "CRITICAL").length,
      highCount: a.findings.filter((f) => f.severity === "HIGH").length,
      mediumCount: a.findings.filter((f) => f.severity === "MEDIUM").length,
      lowCount: a.findings.filter((f) => f.severity === "LOW").length,
      hasPdf: !!a.reportPdfUrl,
      prCount: a.prLinks.length,
    })),
  );
}
