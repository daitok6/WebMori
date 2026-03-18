import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrg, getAuditById } from "@/lib/dashboard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const audit = await getAuditById(id, org.id);

  if (!audit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: audit.id,
    repoName: audit.repo.name,
    repoUrl: audit.repo.url,
    status: audit.status,
    date: audit.createdAt.toISOString(),
    reportPdfUrl: audit.reportPdfUrl,
    findingsPdfUrl: audit.findingsPdfUrl,
    prLinks: audit.prLinks,
    findings: audit.findings.map((f) => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      evidence: f.evidence,
      impact: f.impact,
      fix: f.fix,
      effort: f.effort,
      prUrl: f.prUrl,
    })),
  });
}
