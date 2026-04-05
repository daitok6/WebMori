import { prisma } from "./prisma";
import type { Plan } from "@/generated/prisma/client";

/**
 * Get the Nth occurrence of a specific weekday in a given month.
 * weekday: 1=Mon..5=Fri, week: 3 or 4 (3rd or 4th occurrence)
 */
export function getNthWeekday(year: number, month: number, week: number, weekday: number): Date {
  // month is 0-indexed for Date constructor
  const firstDay = new Date(year, month, 1);
  // JS getDay: 0=Sun, 1=Mon..6=Sat — our weekday is 1=Mon..5=Fri
  const firstDayOfWeek = firstDay.getDay();
  // Calculate offset to first occurrence of target weekday
  let offset = weekday - firstDayOfWeek;
  if (offset < 0) offset += 7;
  // Day of the Nth occurrence
  const day = 1 + offset + (week - 1) * 7;
  return new Date(year, month, day);
}

/**
 * Get the next audit date for an organization based on its assigned week/day.
 * Returns the next occurrence that is at least `minGapDays` from the last audit.
 */
export function getNextAuditDate(
  auditWeek: number,
  auditDayOfWeek: number,
  lastAuditDate?: Date | null,
  minGapDays = 25,
): Date {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Check this month and next 2 months
  for (let offset = 0; offset < 3; offset++) {
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const auditDate = getNthWeekday(
      targetMonth.getFullYear(),
      targetMonth.getMonth(),
      auditWeek,
      auditDayOfWeek,
    );

    // Must be today or in the future
    if (auditDate < today) continue;

    // Must be at least minGapDays from last audit
    if (lastAuditDate) {
      const daysSinceLastAudit = Math.floor(
        (auditDate.getTime() - lastAuditDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceLastAudit < minGapDays) continue;
    }

    return auditDate;
  }

  // Fallback: 3 months from now (shouldn't normally happen)
  const fallback = new Date(today.getFullYear(), today.getMonth() + 3, 1);
  return getNthWeekday(fallback.getFullYear(), fallback.getMonth(), auditWeek, auditDayOfWeek);
}

/**
 * Assign an audit day (week + dayOfWeek) to an organization.
 * Balances load across the 10 available slots (week 3-4, Mon-Fri).
 */
export async function assignAuditDay(orgId: string): Promise<{ auditWeek: number; auditDayOfWeek: number }> {
  // Count current assignments per slot
  const orgs = await prisma.organization.findMany({
    where: {
      auditWeek: { not: null },
      auditDayOfWeek: { not: null },
    },
    select: { auditWeek: true, auditDayOfWeek: true },
  });

  // Build counts for each slot: week 3 Mon-Fri, week 4 Mon-Fri
  const slots: { week: number; day: number; count: number }[] = [];
  for (const week of [3, 4]) {
    for (const day of [1, 2, 3, 4, 5]) {
      const count = orgs.filter((o) => o.auditWeek === week && o.auditDayOfWeek === day).length;
      slots.push({ week, day, count });
    }
  }

  // Sort by count ascending, pick the slot with the fewest assignments
  slots.sort((a, b) => a.count - b.count);
  const best = slots[0];

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      auditWeek: best.week,
      auditDayOfWeek: best.day,
    },
  });

  return { auditWeek: best.week, auditDayOfWeek: best.day };
}

/**
 * Schedule monthly audits. Called by daily cron.
 * Checks all orgs with active subscriptions and creates SCHEDULED audits
 * when today matches their assigned audit day.
 */
export async function scheduleMonthlyAudits(): Promise<{ orgName: string; repoName: string; repoUrl: string }[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const activeOrgs = await prisma.organization.findMany({
    where: {
      onboardingComplete: true,
      auditWeek: { not: null },
      auditDayOfWeek: { not: null },
      subscription: {
        status: { in: ["ACTIVE", "TRIALING"] },
        pausedAt: null,
      },
    },
    include: {
      subscription: true,
      repos: {
        where: { isActive: true },
        include: {
          audits: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const scheduled: { orgName: string; repoName: string; repoUrl: string }[] = [];

  for (const org of activeOrgs) {
    if (!org.auditWeek || !org.auditDayOfWeek || !org.repos.length) continue;

    // Check if today is this org's audit day
    const auditDate = getNthWeekday(
      today.getFullYear(),
      today.getMonth(),
      org.auditWeek,
      org.auditDayOfWeek,
    );

    if (auditDate.getTime() !== today.getTime()) continue;

    for (const repo of org.repos) {
      const lastAudit = repo.audits[0] ?? null;

      // Enforce 25-day minimum gap
      if (lastAudit) {
        const daysSince = Math.floor(
          (today.getTime() - lastAudit.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSince < 25) continue;
      }

      // Check no audit already scheduled this month
      const existingThisMonth = await prisma.audit.findFirst({
        where: {
          repoId: repo.id,
          scheduledAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
            lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
          },
          status: { not: "FAILED" },
        },
      });
      if (existingThisMonth) continue;

      // Determine audit depth based on plan
      const plan = org.subscription?.plan;
      const auditDepth = plan === "STARTER" ? "lite" : "full";

      await prisma.audit.create({
        data: {
          organizationId: org.id,
          repoId: repo.id,
          status: "SCHEDULED",
          scheduledAt: today,
          auditDepth,
        },
      });

      scheduled.push({
        orgName: org.name,
        repoName: repo.name,
        repoUrl: repo.url,
      });
    }
  }

  return scheduled;
}

/**
 * Schedule the next monthly audit for a specific repo after the current one completes.
 * Called reactively when an audit is marked COMPLETED. Uses the org's assigned week/day
 * slot and the 25-day minimum gap rule. The daily cron remains as a catch-up safety net.
 */
export async function scheduleNextAuditForRepo(
  organizationId: string,
  repoId: string,
): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { subscription: true },
  });

  if (!org?.auditWeek || !org?.auditDayOfWeek) return;
  if (!org.subscription || !["ACTIVE", "TRIALING"].includes(org.subscription.status)) return;

  const lastAudit = await prisma.audit.findFirst({
    where: { repoId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const nextDate = getNextAuditDate(
    org.auditWeek,
    org.auditDayOfWeek,
    lastAudit?.createdAt,
    25,
  );

  // Don't create a duplicate for the same month
  const existing = await prisma.audit.findFirst({
    where: {
      repoId,
      scheduledAt: {
        gte: new Date(nextDate.getFullYear(), nextDate.getMonth(), 1),
        lt: new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 1),
      },
      status: { not: "FAILED" },
    },
  });
  if (existing) return;

  const auditDepth = org.subscription.plan === "STARTER" ? "lite" : "full";

  await prisma.audit.create({
    data: {
      organizationId,
      repoId,
      status: "SCHEDULED",
      scheduledAt: nextDate,
      auditDepth,
    },
  });
}

/**
 * Trigger a welcome audit immediately after onboarding.
 */
export async function triggerWelcomeAudit(orgId: string, plan: Plan): Promise<void> {
  const repos = await prisma.repo.findMany({
    where: { organizationId: orgId, isActive: true },
  });

  const auditDepth = plan === "STARTER" ? "lite" : "full";

  for (const repo of repos) {
    await prisma.audit.create({
      data: {
        organizationId: orgId,
        repoId: repo.id,
        status: "SCHEDULED",
        scheduledAt: new Date(),
        isWelcome: true,
        auditDepth,
      },
    });
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: { welcomeAuditSent: true },
  });
}
