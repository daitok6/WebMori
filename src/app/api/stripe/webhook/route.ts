import { NextRequest, NextResponse } from "next/server";
import { getStripe, getStripePrices, getWebhookSecret } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";
import { Plan, BillingCycle, SubStatus, Prisma } from "@/generated/prisma/client";
import { env } from "@/lib/env";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      getWebhookSecret(),
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency — skip already-processed events
  try {
    await prisma.stripeEvent.create({ data: { id: event.id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      // Duplicate event — already processed
      return NextResponse.json({ received: true, duplicate: true });
    }
    throw e;
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.type === "addon") {
        await handleAddonCheckoutCompleted(session);
      } else {
        await handleCheckoutCompleted(session);
      }
      break;
    }
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case "invoice.payment_succeeded":
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, organizationId, plan, billingCycle } = session.metadata ?? {};
  if (!userId || !plan) return;

  const validPlans = ["STARTER", "GROWTH", "PRO"];
  if (!validPlans.includes(plan)) return;

  // Ensure organization exists
  let orgId = organizationId;
  if (!orgId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const org = await prisma.organization.create({
      data: { name: user.name ?? user.email },
    });
    orgId = org.id;

    await prisma.user.update({
      where: { id: userId },
      data: { organizationId: orgId },
    });
  }

  // Fetch subscription from Stripe to get period dates
  let periodStart: Date | undefined;
  let periodEnd: Date | undefined;
  if (session.subscription) {
    try {
      const stripeSub = await getStripe().subscriptions.retrieve(
        session.subscription as string,
      );
      const firstItem = stripeSub.items?.data?.[0];
      if (firstItem) {
        periodStart = new Date(firstItem.current_period_start * 1000);
        periodEnd = new Date(firstItem.current_period_end * 1000);
      }
    } catch {
      // Non-fatal — period dates will be filled by subscription.updated
    }
  }

  await prisma.subscription.upsert({
    where: { organizationId: orgId },
    create: {
      organizationId: orgId,
      plan: plan as Plan,
      billingCycle: (billingCycle as BillingCycle) ?? "MONTHLY",
      status: "ACTIVE",
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      ...(periodStart && { currentPeriodStart: periodStart }),
      ...(periodEnd && { currentPeriodEnd: periodEnd }),
    },
    update: {
      plan: plan as Plan,
      billingCycle: (billingCycle as BillingCycle) ?? "MONTHLY",
      status: "ACTIVE",
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      ...(periodStart && { currentPeriodStart: periodStart }),
      ...(periodEnd && { currentPeriodEnd: periodEnd }),
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!sub) return;

  const statusMap: Record<string, SubStatus> = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    trialing: "TRIALING",
  };

  // Detect plan changes from Stripe portal
  const firstItem = subscription.items?.data?.[0];
  const priceId = firstItem?.price?.id;
  let plan: Plan | undefined;
  let billingCycle: BillingCycle | undefined;

  if (priceId) {
    const prices = getStripePrices();
    for (const [planKey, cycles] of Object.entries(prices)) {
      for (const [cycleKey, id] of Object.entries(cycles)) {
        if (id === priceId) {
          plan = planKey as Plan;
          billingCycle = cycleKey as BillingCycle;
        }
      }
    }
  }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: statusMap[subscription.status] ?? "ACTIVE",
      ...(plan && { plan }),
      ...(billingCycle && { billingCycle }),
      ...(priceId && { stripePriceId: priceId }),
      ...(firstItem && {
        currentPeriodStart: new Date(firstItem.current_period_start * 1000),
        currentPeriodEnd: new Date(firstItem.current_period_end * 1000),
      }),
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: "CANCELED" },
  });
}

function getSubscriptionId(invoice: Stripe.Invoice): string | null {
  const details = invoice.parent?.subscription_details;
  if (!details?.subscription) return null;
  return typeof details.subscription === "string"
    ? details.subscription
    : details.subscription.id;
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionId(invoice);
  if (!subscriptionId) return;

  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });
  if (!sub) return;

  try {
    await prisma.payment.create({
      data: {
        subscriptionId: sub.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: "succeeded",
        stripeInvoiceId: invoice.id,
        paidAt: new Date(),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      // Duplicate event — already processed, ignore
      return;
    }
    throw e;
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionId(invoice);
  if (!subscriptionId) return;

  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });
  if (!sub) return;

  try {
    await prisma.payment.create({
      data: {
        subscriptionId: sub.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: "failed",
        stripeInvoiceId: invoice.id,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      // Duplicate event — already processed, ignore
      return;
    }
    throw e;
  }

  // Set 3-day grace period before pausing audits
  const gracePeriodEnd = new Date();
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3);

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: "PAST_DUE",
      gracePeriodEnd,
    },
  });
}

async function handleAddonCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { organizationId, auditId, findingId, effort } = session.metadata ?? {};
  if (!organizationId || !auditId) return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  // Update the pre-created AddOn record to PAID
  await prisma.addOn.updateMany({
    where: { stripeSessionId: session.id },
    data: {
      status: "PAID",
      stripePaymentIntentId: paymentIntentId,
    },
  });

  // Notify operator
  const resend = new Resend(env.RESEND_API_KEY);
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true },
  });

  const effortLabel =
    effort === "QUICK_WIN" ? "クイック対応 (¥5,000)" :
    effort === "MODERATE" ? "標準対応 (¥15,000)" :
    effort === "LARGE" ? "大規模対応 (¥30,000)" : effort ?? "—";

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: env.OPERATOR_EMAIL,
    subject: `[WebMori] 修正代行の依頼が入りました — ${org?.name ?? organizationId}`,
    html: `
      <h2>修正代行の依頼</h2>
      <p><strong>クライアント:</strong> ${org?.name ?? organizationId}</p>
      <p><strong>対応レベル:</strong> ${effortLabel}</p>
      <p><strong>監査ID:</strong> ${auditId}</p>
      ${findingId ? `<p><strong>指摘ID:</strong> ${findingId}</p>` : ""}
      <p><strong>Stripe Session:</strong> ${session.id}</p>
      <p>管理画面からAddOnのステータスを更新してください。</p>
    `.trim(),
  }).catch(() => {});
}
