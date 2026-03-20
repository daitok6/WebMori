import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [subscriptions, payments, mrr] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        organization: { select: { name: true } },
      },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        subscription: {
          select: {
            organization: { select: { name: true } },
            plan: true,
          },
        },
      },
    }),
    // Calculate MRR from active subscriptions
    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      select: { plan: true, billingCycle: true },
    }),
  ]);

  const planPrices: Record<string, number> = {
    STARTER: 19800,
    GROWTH: 39800,
    PRO: 69800,
  };

  const totalMrr = mrr.reduce((sum, s) => {
    const price = planPrices[s.plan] ?? 0;
    return sum + (s.billingCycle === "ANNUAL" ? Math.round(price * 0.85) : price);
  }, 0);

  return NextResponse.json({
    mrr: totalMrr,
    activeCount: mrr.length,
    subscriptions: subscriptions.map((s) => ({
      id: s.id,
      orgName: s.organization.name,
      plan: s.plan,
      billingCycle: s.billingCycle,
      status: s.status,
      currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
    })),
    payments: payments.map((p) => ({
      id: p.id,
      orgName: p.subscription.organization.name,
      plan: p.subscription.plan,
      amount: p.amount,
      status: p.status,
      paidAt: p.paidAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}
