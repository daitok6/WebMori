import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sendAuditCompleteEmail } from "@/lib/notifications";

/**
 * GET /api/admin/test-notify?auditId=...
 * Triggers sendAuditCompleteEmail for the given audit's org.
 * Used to diagnose notification delivery issues.
 * Temporary — remove after debugging.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const auditId = request.nextUrl.searchParams.get("auditId");
  if (!auditId) {
    return NextResponse.json({ error: "auditId required" }, { status: 400 });
  }

  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: { repo: true, organization: { include: { users: { select: { email: true } } } } },
  });

  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  const clientEmail = audit.organization.users[0]?.email ?? "none";

  try {
    await sendAuditCompleteEmail(audit.organizationId, {
      repoName: audit.repo.name,
      findingsCount: 5,
    });
    return NextResponse.json({
      ok: true,
      sentTo: clientEmail,
      orgName: audit.organization.name,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: String(err),
      sentTo: clientEmail,
    }, { status: 500 });
  }
}
