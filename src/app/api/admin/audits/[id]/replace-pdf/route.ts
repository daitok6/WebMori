import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { uploadPdf } from "@/lib/r2";

/**
 * POST /api/admin/audits/[id]/replace-pdf
 *
 * Replaces one or both PDFs in R2 without touching findings, status, or prLinks.
 * Used by the operator to swap out a delivered report after edits.
 *
 * Content-Type: multipart/form-data
 * Fields (at least one required):
 *   - reportPdf (file)   — replaces report-ja.pdf
 *   - findingsPdf (file) — replaces findings.pdf
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: auditId } = await params;

  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: { id: true, organizationId: true, reportPdfUrl: true, findingsPdfUrl: true },
  });

  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const reportPdfFile = formData.get("reportPdf") as File | null;
  const findingsPdfFile = formData.get("findingsPdf") as File | null;

  if (!reportPdfFile && !findingsPdfFile) {
    return NextResponse.json(
      { error: "At least one of reportPdf or findingsPdf is required" },
      { status: 400 },
    );
  }

  const orgId = audit.organizationId;
  const updates: { reportPdfUrl?: string; findingsPdfUrl?: string } = {};

  if (reportPdfFile) {
    const buffer = Buffer.from(await reportPdfFile.arrayBuffer());
    const key = `audits/${orgId}/${auditId}/report.pdf`;
    updates.reportPdfUrl = await uploadPdf(key, buffer);
  }

  if (findingsPdfFile) {
    const buffer = Buffer.from(await findingsPdfFile.arrayBuffer());
    const key = `audits/${orgId}/${auditId}/findings.pdf`;
    updates.findingsPdfUrl = await uploadPdf(key, buffer);
  }

  await prisma.audit.update({
    where: { id: auditId },
    data: updates,
  });

  return NextResponse.json({
    ok: true,
    replaced: {
      reportPdf: !!reportPdfFile,
      findingsPdf: !!findingsPdfFile,
    },
  });
}
