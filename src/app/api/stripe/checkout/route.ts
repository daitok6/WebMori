import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, getStripePrices, getStripeOnboarding } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";

const checkoutSchema = z.object({
  plan: z.enum(["STARTER", "GROWTH", "PRO"]),
  billingCycle: z.enum(["MONTHLY", "ANNUAL"]),
});

export async function POST(request: NextRequest) {
  const rateLimited = await checkRateLimit(request);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const result = checkoutSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input", details: result.error.flatten().fieldErrors }, { status: 400 });
  }
  const { plan, billingCycle } = result.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: { include: { subscription: true } } },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Build line items
  const prices = getStripePrices();
  const lineItems: { price: string; quantity: number }[] = [
    { price: prices[plan][billingCycle], quantity: 1 },
  ];

  // Add onboarding fee for Growth/Pro
  const onboarding = getStripeOnboarding();
  const onboardingPrice =
    plan === "GROWTH"
      ? onboarding.GROWTH
      : plan === "PRO"
        ? onboarding.PRO
        : undefined;

  if (onboardingPrice) {
    lineItems.push({ price: onboardingPrice, quantity: 1 });
  }

  const locale = request.headers.get("accept-language")?.startsWith("en")
    ? "en"
    : "ja";

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    allow_promotion_codes: true,
    line_items: lineItems,
    success_url: `${request.nextUrl.origin}/${locale}/dashboard/onboarding?checkout=success`,
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
