import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const PLAN_PRICES: Record<string, number> = {
  STARTER: 19800,
  GROWTH: 39800,
  PRO: 69800,
};

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const staleThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [
    pendingAudits,
    reviewCount,
    failedAudits,
    allMessages,
    pendingContactsCount,
    activeAlerts,
    upcomingAudits,
    activeSubs,
    pastDueCount,
    deliveredToday,
    csatResult,
  ] = await Promise.all([
    // Audits due today (scheduledAt <= now)
    prisma.audit.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
        organization: { subscription: { status: { in: ["ACTIVE", "TRIALING"] } } },
      },
      include: {
        repo: { select: { name: true, url: true, isRepoless: true } },
        organization: {
          select: {
            name: true,
            subscription: { select: { plan: true } },
            users: { select: { email: true }, take: 1 },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    }),

    // Reports awaiting review
    prisma.audit.count({ where: { status: "REVIEW" } }),

    // Failed audits
    prisma.audit.findMany({
      where: { status: "FAILED" },
      include: {
        repo: { select: { name: true } },
        organization: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),

    // All unread messages (fromOperator=false, readByOperator=false)
    prisma.message.findMany({
      where: { fromOperator: false, readByOperator: false },
      select: { organizationId: true, organization: { select: { name: true } } },
    }),

    // Pending contacts
    prisma.contactRequest.count({ where: { status: "PENDING" } }),

    // Active (unresolved) alerts
    prisma.alert.findMany({
      where: { resolvedAt: null },
      include: {
        repo: { select: { name: true } },
        organization: { select: { name: true } },
      },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    }),

    // Upcoming audits (next 7 days, excluding today's already-due ones)
    prisma.audit.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { gt: now, lte: in7Days },
      },
      include: {
        repo: { select: { name: true } },
        organization: { select: { name: true } },
      },
      orderBy: { scheduledAt: "asc" },
    }),

    // MRR: active subscriptions
    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      select: { plan: true, billingCycle: true },
    }),

    // Past due count
    prisma.subscription.count({ where: { status: "PAST_DUE" } }),

    // Delivered today
    prisma.audit.count({
      where: {
        status: { in: ["DELIVERED", "COMPLETED"] },
        updatedAt: { gte: todayStart },
      },
    }),

    // Avg CSAT last 90 days
    prisma.satisfactionRating.aggregate({
      where: { createdAt: { gte: ninetyDaysAgo } },
      _avg: { score: true },
    }),
  ]);

  // Compute MRR
  const mrr = activeSubs.reduce((sum, s) => {
    const price = PLAN_PRICES[s.plan] ?? 0;
    return sum + (s.billingCycle === "ANNUAL" ? Math.round(price * 0.85) : price);
  }, 0);

  // Group unread messages by org
  const msgMap = new Map<string, { orgId: string; orgName: string; count: number }>();
  for (const m of allMessages) {
    const existing = msgMap.get(m.organizationId);
    if (existing) {
      existing.count++;
    } else {
      msgMap.set(m.organizationId, {
        orgId: m.organizationId,
        orgName: m.organization.name,
        count: 1,
      });
    }
  }

  return NextResponse.json({
    kpis: {
      mrr,
      activeClients: activeSubs.length,
      pastDueSubs: pastDueCount,
      avgCsat: csatResult._avg.score ? Math.round(csatResult._avg.score * 10) / 10 : null,
      deliveredToday,
    },
    tasks: {
      pendingAudits: pendingAudits.map((a) => ({
        id: a.id,
        orgName: a.organization.name,
        repoName: a.repo.name,
        repoUrl: a.repo.url,
        isRepoless: a.repo.isRepoless,
        plan: a.organization.subscription?.plan ?? "STARTER",
        userEmail: a.organization.users[0]?.email ?? "",
        scheduledAt: a.scheduledAt?.toISOString() ?? null,
        isStale: a.scheduledAt ? a.scheduledAt <= staleThreshold : false,
      })),
      reviewCount,
      failedAudits: failedAudits.map((a) => ({
        id: a.id,
        orgName: a.organization.name,
        repoName: a.repo.name,
        failureReason: a.failureReason ?? null,
      })),
      unreadMessages: Array.from(msgMap.values()),
      pendingContacts: pendingContactsCount,
      activeAlerts: activeAlerts.map((a) => ({
        id: a.id,
        orgName: a.organization.name,
        repoName: a.repo.name,
        checkType: a.checkType,
        severity: a.severity,
        message: a.message,
        createdAt: a.createdAt.toISOString(),
      })),
    },
    upcoming: upcomingAudits.map((a) => ({
      id: a.id,
      orgName: a.organization.name,
      repoName: a.repo.name,
      scheduledAt: a.scheduledAt?.toISOString() ?? null,
      isWelcome: a.isWelcome,
    })),
    timestamp: now.toISOString(),
  });
}
