import { NextRequest, NextResponse } from "next/server";
import { isCronOrAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { uploadPdf } from "@/lib/r2";
import { env } from "@/lib/env";
import { sendPdfReplacedEmail } from "@/lib/notifications";

/**
 * POST /api/admin/audits/[id]/replace-pdf
 *
 * Replaces one or both PDFs in R2 without touching the DB URL, findings, status, or prLinks.
 * Derives the R2 key from the existing stored URL so the same key is always overwritten.
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
  if (!(await isCronOrAdmin(request))) {
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

  // Derive the R2 key from the existing stored URL (or fall back to the canonical path).
  // We never update the DB URL — just overwrite the object at the same key in R2.
  function keyFromUrl(storedUrl: string | null, fallback: string): string {
    if (!storedUrl) return fallback;
    if (storedUrl.startsWith("http")) {
      // e.g. "https://cdn.webmori.jp/audits/org/audit/report.pdf" → "audits/org/audit/report.pdf"
      return new URL(storedUrl).pathname.replace(/^\//, "");
    }
    // Relative path stored — strip leading slash
    return storedUrl.replace(/^\//, "");
  }

  const orgId = audit.organizationId;

  if (reportPdfFile) {
    const key = keyFromUrl(
      audit.reportPdfUrl,
      `audits/${orgId}/${auditId}/report.pdf`,
    );
    const buffer = Buffer.from(await reportPdfFile.arrayBuffer());
    await uploadPdf(key, buffer);
  }

  if (findingsPdfFile) {
    const key = keyFromUrl(
      audit.findingsPdfUrl,
      `audits/${orgId}/${auditId}/findings.pdf`,
    );
    const buffer = Buffer.from(await findingsPdfFile.arrayBuffer());
    await uploadPdf(key, buffer);
  }

  // If no URL was stored yet (first-time upload), persist the new URL now
  const needsUrlUpdate =
    (reportPdfFile && !audit.reportPdfUrl) ||
    (findingsPdfFile && !audit.findingsPdfUrl);

  if (needsUrlUpdate) {
    const publicUrl = env.R2_PUBLIC_URL;
    const updates: { reportPdfUrl?: string; findingsPdfUrl?: string } = {};
    if (reportPdfFile && !audit.reportPdfUrl) {
      updates.reportPdfUrl = `${publicUrl}/audits/${orgId}/${auditId}/report.pdf`;
    }
    if (findingsPdfFile && !audit.findingsPdfUrl) {
      updates.findingsPdfUrl = `${publicUrl}/audits/${orgId}/${auditId}/findings.pdf`;
    }
    await prisma.audit.update({ where: { id: auditId }, data: updates });
  }

  const replacedFlags = {
    reportPdf: !!reportPdfFile,
    findingsPdf: !!findingsPdfFile,
  };

  // Notify client — fire-and-forget, never block the response
  sendPdfReplacedEmail(audit.organizationId, replacedFlags).catch((err) => {
    console.error("[replace-pdf] notification error:", err);
  });

  return NextResponse.json({ ok: true, replaced: replacedFlags });
}
