import { NextResponse } from "next/server";
import { getCurrentOrg, getPaymentHistory } from "@/lib/dashboard";

export async function GET() {
  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payments = await getPaymentHistory(org.id);

  return NextResponse.json({
    plan: org.subscription?.plan ?? null,
    status: org.subscription?.status ?? null,
    billingCycle: org.subscription?.billingCycle ?? null,
    currentPeriodEnd: org.subscription?.currentPeriodEnd?.toISOString() ?? null,
    payments: payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      paidAt: p.paidAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}
