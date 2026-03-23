import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { Plan, BillingCycle } from "@/generated/prisma/client";

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stripe = getStripe();
  const customers = await stripe.customers.list({ limit: 100 });
  const synced: string[] = [];
  const errors: string[] = [];

  for (const customer of customers.data) {
    const email = customer.email;
    if (!email) continue;

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      include: { organization: true },
    });
    if (!user?.organizationId) {
      errors.push(`No org for ${email}`);
      continue;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
    });
    const sub = subscriptions.data[0];
    if (!sub) continue;

    const planMap: Record<string, Plan> = {
      STARTER: "STARTER",
      GROWTH: "GROWTH",
      PRO: "PRO",
    };
    const plan = planMap[sub.metadata.plan ?? ""] ?? "STARTER";
    const billingCycle: BillingCycle =
      sub.metadata.billingCycle === "ANNUAL" ? "ANNUAL" : "MONTHLY";

    const firstItem = sub.items?.data?.[0];

    await prisma.subscription.upsert({
      where: { organizationId: user.organizationId },
      create: {
        organizationId: user.organizationId,
        plan,
        billingCycle,
        status: sub.status === "active" ? "ACTIVE" : sub.status === "past_due" ? "PAST_DUE" : "ACTIVE",
        stripeCustomerId: customer.id,
        stripeSubscriptionId: sub.id,
        stripePriceId: firstItem?.price?.id ?? null,
        currentPeriodStart: firstItem
          ? new Date(firstItem.current_period_start * 1000)
          : null,
        currentPeriodEnd: firstItem
          ? new Date(firstItem.current_period_end * 1000)
          : null,
      },
      update: {
        plan,
        billingCycle,
        status: sub.status === "active" ? "ACTIVE" : sub.status === "past_due" ? "PAST_DUE" : "ACTIVE",
        stripeCustomerId: customer.id,
        stripeSubscriptionId: sub.id,
        stripePriceId: firstItem?.price?.id ?? null,
        currentPeriodStart: firstItem
          ? new Date(firstItem.current_period_start * 1000)
          : null,
        currentPeriodEnd: firstItem
          ? new Date(firstItem.current_period_end * 1000)
          : null,
      },
    });

    synced.push(`${email} → ${plan} (${sub.status})`);
  }

  return NextResponse.json({ synced, errors });
}
