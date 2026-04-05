import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { generateReportCode } from "@/lib/report-code";
import { sendAuditCompleteEmail, sendOperatorReviewAlert, sendOperatorFailureAlert } from "@/lib/notifications";
import type { AuditStatus } from "@/generated/prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: { status?: string; failureReason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const audit = await prisma.audit.findUnique({
    where: { id },
    include: { repo: true, organization: true },
  });
  if (!audit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const validStatuses: AuditStatus[] = [
    "SCHEDULED", "IN_PROGRESS", "REVIEW", "DELIVERED", "COMPLETED", "FAILED",
  ];
  const newStatus = body.status as AuditStatus | undefined;
  if (newStatus && !validStatuses.includes(newStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (newStatus) updateData.status = newStatus;
  if (newStatus === "IN_PROGRESS") {
    updateData.startedAt = new Date();
    // Revision reason (when sending back from REVIEW for rework)
    if (body.failureReason) updateData.failureReason = body.failureReason;
  }
  if (newStatus === "DELIVERED") updateData.deliveredAt = new Date();
  if (newStatus === "COMPLETED") updateData.completedAt = new Date();
  if (newStatus === "FAILED") {
    updateData.failedAt = new Date();
    if (body.failureReason) updateData.failureReason = body.failureReason;
  }

  // Generate report code in a transaction when transitioning to IN_PROGRESS
  let updated;
  if (newStatus === "IN_PROGRESS" && !audit.reportCode) {
    updated = await prisma.$transaction(async (tx) => {
      const reportCode = await generateReportCode(tx);
      return tx.audit.update({
        where: { id },
        data: { ...updateData, reportCode },
        include: { repo: true, findings: true },
      });
    });
  } else {
    updated = await prisma.audit.update({
      where: { id },
      data: updateData,
      include: { repo: true, findings: true },
    });
  }

  // Notify operator when audit is ready for review
  if (newStatus === "REVIEW") {
    await sendOperatorReviewAlert(
      audit.id,
      audit.organization.name,
      updated.reportCode,
    ).catch(() => {});
  }

  // Alert operator when an audit fails
  if (newStatus === "FAILED") {
    await sendOperatorFailureAlert(
      audit.id,
      audit.organization.name,
      body.failureReason ?? "不明なエラー",
    ).catch(() => {});
  }

  // Auto-send email (+ LINE for Growth/Pro) when approved (DELIVERED)
  if (newStatus === "DELIVERED") {
    await sendAuditCompleteEmail(audit.organizationId, {
      repoName: audit.repo.name,
      findingsCount: updated.findings.length,
    }).catch((err) => {
      console.error("[audit DELIVERED] sendAuditCompleteEmail failed:", err);
    });
  }

  return NextResponse.json(updated);
}
