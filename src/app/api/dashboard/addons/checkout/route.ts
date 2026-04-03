import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";
import { getStripe, getStripeAddonPrices, ADDON_AMOUNTS } from "@/lib/stripe";
import { clientEnv } from "@/lib/env";
import { Effort } from "@/generated/prisma/client";

const bodySchema = z.object({
  findingId: z.string().cuid().optional(),
  auditId: z.string().cuid(),
  effort: z.enum(["QUICK_WIN", "MODERATE", "LARGE"]),
  findingTitle: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org || !org.subscription) {
    return NextResponse.json({ error: "No active subscription" }, { status: 403 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Verify the audit belongs to this org
  const audit = await prisma.audit.findUnique({
    where: { id: body.auditId },
    select: { id: true, organizationId: true },
  });
  if (!audit || audit.organizationId !== org.id) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  const addonPrices = getStripeAddonPrices();
  const priceId = addonPrices[body.effort];
  const amount = ADDON_AMOUNTS[body.effort];

  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL ?? "https://webmori.jp";
  const successUrl = `${siteUrl}/dashboard/reports/${body.auditId}?addon=success`;
  const cancelUrl = `${siteUrl}/dashboard/reports/${body.auditId}`;

  const stripe = getStripe();

  // Use price ID if configured, otherwise use price_data with fixed JPY amount
  const lineItem = priceId
    ? { price: priceId, quantity: 1 }
    : {
        price_data: {
          currency: "jpy",
          unit_amount: amount,
          product_data: {
            name: `修正代行: ${body.findingTitle ?? body.effort}`,
            description: `WebMori 修正代行サービス — ${
              body.effort === "QUICK_WIN" ? "クイック対応" :
              body.effort === "MODERATE" ? "標準対応" : "大規模対応"
            }`,
          },
        },
        quantity: 1,
      };

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [lineItem],
    customer: org.subscription.stripeCustomerId ?? undefined,
    customer_creation: org.subscription.stripeCustomerId ? undefined : "always",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: "addon",
      organizationId: org.id,
      auditId: body.auditId,
      findingId: body.findingId ?? "",
      effort: body.effort,
    },
  });

  // Pre-create the AddOn record in PENDING state
  await prisma.addOn.create({
    data: {
      organizationId: org.id,
      auditId: body.auditId,
      findingId: body.findingId ?? null,
      effort: body.effort as Effort,
      amount,
      stripeSessionId: checkoutSession.id,
      status: "PENDING",
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
