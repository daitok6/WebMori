import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendOnboardingReminderEmail,
  sendAuditScheduledEmail,
  sendMonthlySummaryEmail,
  sendDripEmail,
} from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = {
    onboardingReminders: 0,
    auditReminders: 0,
    monthlyDigests: 0,
    dripEmails: 0,
  };

  // ─── 1. Onboarding reminders ───────────────────────────
  // Find paid orgs that haven't completed onboarding
  const incompleteOrgs = await prisma.organization.findMany({
    where: {
      onboardingComplete: false,
      subscription: { status: { in: ["ACTIVE", "TRIALING"] } },
    },
    select: { id: true, createdAt: true },
  });

  for (const org of incompleteOrgs) {
    const hoursOld = (now.getTime() - org.createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursOld >= 168) {
      // 7 days
      await sendOnboardingReminderEmail(org.id, "onboarding_7d");
      results.onboardingReminders++;
    } else if (hoursOld >= 72) {
      await sendOnboardingReminderEmail(org.id, "onboarding_72h");
      results.onboardingReminders++;
    } else if (hoursOld >= 24) {
      await sendOnboardingReminderEmail(org.id, "onboarding_24h");
      results.onboardingReminders++;
    }
  }

  // ─── 2. Audit scheduled reminders (3 days before) ─────
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const threeDaysStart = new Date(threeDaysFromNow.getFullYear(), threeDaysFromNow.getMonth(), threeDaysFromNow.getDate());
  const threeDaysEnd = new Date(threeDaysStart);
  threeDaysEnd.setDate(threeDaysEnd.getDate() + 1);

  const upcomingAudits = await prisma.audit.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { gte: threeDaysStart, lt: threeDaysEnd },
    },
    select: { organizationId: true, scheduledAt: true },
  });

  const notifiedOrgs = new Set<string>();
  for (const audit of upcomingAudits) {
    if (audit.scheduledAt && !notifiedOrgs.has(audit.organizationId)) {
      await sendAuditScheduledEmail(audit.organizationId, audit.scheduledAt);
      notifiedOrgs.add(audit.organizationId);
      results.auditReminders++;
    }
  }

  // ─── 3. Monthly summary digest (last day of month) ────
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isLastDayOfMonth = tomorrow.getDate() === 1;

  if (isLastDayOfMonth) {
    const activeOrgs = await prisma.organization.findMany({
      where: {
        onboardingComplete: true,
        subscription: { status: "ACTIVE" },
      },
      select: { id: true },
    });

    for (const org of activeOrgs) {
      await sendMonthlySummaryEmail(org.id);
      results.monthlyDigests++;
    }
  }

  // ─── 4. Free tier drip emails ──────────────────────────
  // Find free eval reports and send drip emails based on age
  const freeEvals = await prisma.freeEvalReport.findMany({
    where: {
      organization: {
        subscription: null,
      },
    },
    select: { organizationId: true, createdAt: true },
  });

  for (const eval_ of freeEvals) {
    const daysOld = Math.floor((now.getTime() - eval_.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOld >= 7) {
      await sendDripEmail(eval_.organizationId, "drip_3");
      results.dripEmails++;
    } else if (daysOld >= 3) {
      await sendDripEmail(eval_.organizationId, "drip_2");
      results.dripEmails++;
    } else if (daysOld >= 1) {
      await sendDripEmail(eval_.organizationId, "drip_1");
      results.dripEmails++;
    }
  }

  // ─── 5. Grace period → pause audits ───────────────────
  await prisma.subscription.updateMany({
    where: {
      status: "PAST_DUE",
      gracePeriodEnd: { lt: now },
      pausedAt: null,
    },
    data: { pausedAt: now },
  });

  return NextResponse.json({
    ...results,
    timestamp: now.toISOString(),
  });
}
