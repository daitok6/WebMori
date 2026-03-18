import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, STRIPE_PRICES, STRIPE_ONBOARDING } from "@/lib/stripe";
import type { PlanKey, BillingCycleKey } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { plan, billingCycle } = body as {
    plan: PlanKey;
    billingCycle: BillingCycleKey;
  };

  if (!STRIPE_PRICES[plan]?.[billingCycle]) {
    return NextResponse.json({ error: "Invalid plan or billing cycle" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: { include: { subscription: true } } },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Build line items
  const lineItems: { price: string; quantity: number }[] = [
    { price: STRIPE_PRICES[plan][billingCycle], quantity: 1 },
  ];

  // Add onboarding fee for Growth/Pro
  const onboardingPrice =
    plan === "GROWTH"
      ? STRIPE_ONBOARDING.GROWTH
      : plan === "PRO"
        ? STRIPE_ONBOARDING.PRO
        : undefined;

  if (onboardingPrice) {
    lineItems.push({ price: onboardingPrice, quantity: 1 });
  }

  const locale = request.headers.get("accept-language")?.startsWith("en")
    ? "en"
    : "ja";

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: lineItems,
    success_url: `${request.nextUrl.origin}/${locale}/dashboard?checkout=success`,
    cancel_url: `${request.nextUrl.origin}/${locale}/pricing`,
    customer_email: user.email,
    locale: locale === "ja" ? "ja" : "en",
    metadata: {
      userId: user.id,
      organizationId: user.organizationId ?? "",
      plan,
      billingCycle,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        organizationId: user.organizationId ?? "",
        plan,
        billingCycle,
      },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
