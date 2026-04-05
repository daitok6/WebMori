import { NextRequest, NextResponse } from "next/server";
import { isCronOrAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { uploadPdf, uploadFile } from "@/lib/r2";
import { generateReportCode } from "@/lib/report-code";
import { Severity, Effort } from "@/generated/prisma/client";
import { sendOperatorReviewAlert } from "@/lib/notifications";

const VALID_SEVERITIES = new Set(Object.values(Severity));
const VALID_EFFORTS = new Set(Object.values(Effort));

interface FindingInput {
  title: string;
  severity: string;
  evidence: string;
  impact: string;
  fix: string;
  effort: string;
  safeAutoFix: boolean;
  prUrl?: string;
}

/**
 * POST /api/admin/audits/[id]/publish
 *
 * Uploads audit PDFs to R2, creates Finding records, and sets audit status to REVIEW.
 * Supports re-publish: overwrites PDFs and replaces findings.
 *
 * Content-Type: multipart/form-data
 * Fields:
 *   - reportPdf (file) — client-facing PDF
 *   - findingsPdf (file) — internal findings PDF
 *   - reportMarkdown (file, optional) — report-ja.md source for editreport
 *   - findings (string) — JSON array of finding objects
 *   - prLinks (string, optional) — JSON array of PR URL strings
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isCronOrAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: auditId } = await params;

  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: {
      id: true,
      organizationId: true,
      status: true,
      reportCode: true,
      organization: { select: { name: true } },
    },
  });

  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  const formData = await request.formData();

  const reportPdfFile = formData.get("reportPdf") as File | null;
  const findingsPdfFile = formData.get("findingsPdf") as File | null;
  const reportMdFile = formData.get("reportMarkdown") as File | null;
  const findingsJson = formData.get("findings") as string | null;
  const prLinksJson = formData.get("prLinks") as string | null;

  if (!reportPdfFile || !findingsPdfFile) {
    return NextResponse.json(
      { error: "reportPdf and findingsPdf files are required" },
      { status: 400 },
    );
  }

  if (!findingsJson) {
    return NextResponse.json(
      { error: "findings JSON is required" },
      { status: 400 },
    );
  }

  // Parse and validate findings
  let findings: FindingInput[];
  try {
    findings = JSON.parse(findingsJson);
    if (!Array.isArray(findings)) throw new Error("findings must be an array");
  } catch {
    return NextResponse.json(
      { error: "Invalid findings JSON" },
      { status: 400 },
    );
  }

  for (const f of findings) {
    if (!f.title || !f.severity || !f.evidence || !f.impact || !f.fix || !f.effort) {
      return NextResponse.json(
        { error: "Each finding must have title, severity, evidence, impact, fix, effort" },
        { status: 400 },
      );
    }
    if (!VALID_SEVERITIES.has(f.severity as Severity)) {
      return NextResponse.json(
        { error: `Invalid severity: ${f.severity}. Must be one of: ${[...VALID_SEVERITIES].join(", ")}` },
        { status: 400 },
      );
    }
    if (!VALID_EFFORTS.has(f.effort as Effort)) {
      return NextResponse.json(
        { error: `Invalid effort: ${f.effort}. Must be one of: ${[...VALID_EFFORTS].join(", ")}` },
        { status: 400 },
      );
    }
  }

  // Parse PR links
  let prLinks: string[] = [];
  if (prLinksJson) {
    try {
      prLinks = JSON.parse(prLinksJson);
      if (!Array.isArray(prLinks)) throw new Error();
    } catch {
      return NextResponse.json(
        { error: "Invalid prLinks JSON" },
        { status: 400 },
      );
    }
  }

  // Upload files to R2
  const orgId = audit.organizationId;
  const reportPdfBuffer = Buffer.from(await reportPdfFile.arrayBuffer());
  const findingsPdfBuffer = Buffer.from(await findingsPdfFile.arrayBuffer());

  const reportPdfKey = `audits/${orgId}/${auditId}/report.pdf`;
  const findingsPdfKey = `audits/${orgId}/${auditId}/findings.pdf`;

  const [reportPdfUrl, findingsPdfUrl] = await Promise.all([
    uploadPdf(reportPdfKey, reportPdfBuffer),
    uploadPdf(findingsPdfKey, findingsPdfBuffer),
  ]);

  // Upload markdown source if provided
  let reportMdKey: string | null = null;
  if (reportMdFile) {
    const mdBuffer = Buffer.from(await reportMdFile.arrayBuffer());
    reportMdKey = `audits/${orgId}/${auditId}/report-ja.md`;
    await uploadFile(reportMdKey, mdBuffer, "text/markdown; charset=utf-8");
  }

  // Persist to database in a transaction
  const updatedAudit = await prisma.$transaction(async (tx) => {
    // Generate report code if not already assigned
    const reportCode = audit.reportCode ?? (await generateReportCode(tx));

    // Delete existing findings if re-publishing
    await tx.finding.deleteMany({ where: { auditId } });

    // Create new findings
    await tx.finding.createMany({
      data: findings.map((f) => ({
        auditId,
        title: f.title,
        severity: f.severity as Severity,
        evidence: f.evidence,
        impact: f.impact,
        fix: f.fix,
        effort: f.effort as Effort,
        safeAutoFix: f.safeAutoFix ?? false,
        prUrl: f.prUrl ?? null,
      })),
    });

    // Update audit record
    return tx.audit.update({
      where: { id: auditId },
      data: {
        reportCode,
        reportPdfUrl,
        findingsPdfUrl,
        reportMdKey,
        prLinks,
        status: audit.status === "DELIVERED" || audit.status === "COMPLETED"
          ? audit.status // Don't revert status if already delivered
          : "REVIEW",
        completedAt: new Date(),
      },
      select: {
        id: true,
        reportCode: true,
        status: true,
        reportPdfUrl: true,
        findingsPdfUrl: true,
      },
    });
  });

  // Notify operator that audit is ready for review (only on first publish, not re-publish)
  if (audit.status !== "DELIVERED" && audit.status !== "COMPLETED") {
    await sendOperatorReviewAlert(
      auditId,
      audit.organization.name,
      updatedAudit.reportCode ?? null,
    ).catch(() => {});
  }

  return NextResponse.json(updatedAudit);
}
