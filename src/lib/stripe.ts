import Stripe from "stripe";
import { env } from "./env";

function requireEnv(key: string): string {
  const value = env[key as keyof typeof env] as string | undefined;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

export function getWebhookSecret(): string {
  return requireEnv("STRIPE_WEBHOOK_SECRET");
}

// Stripe price IDs — validated lazily at runtime
export function getStripePrices() {
  return {
    STARTER: {
      MONTHLY: requireEnv("STRIPE_PRICE_STARTER_MONTHLY"),
      ANNUAL: requireEnv("STRIPE_PRICE_STARTER_ANNUAL"),
    },
    GROWTH: {
      MONTHLY: requireEnv("STRIPE_PRICE_GROWTH_MONTHLY"),
      ANNUAL: requireEnv("STRIPE_PRICE_GROWTH_ANNUAL"),
    },
    PRO: {
      MONTHLY: requireEnv("STRIPE_PRICE_PRO_MONTHLY"),
      ANNUAL: requireEnv("STRIPE_PRICE_PRO_ANNUAL"),
    },
  } as const;
}

// Onboarding one-time prices
export function getStripeOnboarding() {
  return {
    GROWTH: env.STRIPE_PRICE_ONBOARDING_GROWTH,
    PRO: env.STRIPE_PRICE_ONBOARDING_PRO,
  } as const;
}

export type PlanKey = "STARTER" | "GROWTH" | "PRO";
export type BillingCycleKey = "MONTHLY" | "ANNUAL";
