import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";
import { Plan, BillingCycle, SubStatus, Prisma } from "@/generated/prisma/client";

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
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
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

  await prisma.subscription.upsert({
    where: { organizationId: orgId },
    create: {
      organizationId: orgId,
      plan: plan as Plan,
      billingCycle: (billingCycle as BillingCycle) ?? "MONTHLY",
      status: "ACTIVE",
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
    },
    update: {
      plan: plan as Plan,
      billingCycle: (billingCycle as BillingCycle) ?? "MONTHLY",
      status: "ACTIVE",
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
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

  const firstItem = subscription.items?.data?.[0];
  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: statusMap[subscription.status] ?? "ACTIVE",
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

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: "PAST_DUE" },
  });
}
