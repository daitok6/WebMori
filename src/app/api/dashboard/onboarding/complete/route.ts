import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";
import { assignAuditDay, getNextAuditDate, triggerWelcomeAudit } from "@/lib/audit-scheduler";
import { sendWelcomeEmail } from "@/lib/notifications";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  if (org.onboardingComplete) {
    return NextResponse.json({ error: "Already completed" }, { status: 400 });
  }

  // Assign an audit day (load-balanced across weeks 3-4)
  const { auditWeek, auditDayOfWeek } = await assignAuditDay(org.id);

  // Mark onboarding as complete
  await prisma.organization.update({
    where: { id: org.id },
    data: { onboardingComplete: true },
  });

  // Trigger welcome audit
  const plan = org.subscription?.plan ?? "STARTER";
  await triggerWelcomeAudit(org.id, plan);

  // Send welcome email (non-blocking)
  sendWelcomeEmail(org.id, plan).catch(() => {});

  // Calculate next monthly audit date
  const nextAuditDate = getNextAuditDate(auditWeek, auditDayOfWeek);

  return NextResponse.json({
    auditWeek,
    auditDayOfWeek,
    nextAuditDate: nextAuditDate.toISOString().slice(0, 10),
    plan,
  });
}
