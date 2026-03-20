import Stripe from "stripe";
import { env } from "./env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Stripe price IDs — validated at startup via env.ts
export const STRIPE_PRICES = {
  STARTER: {
    MONTHLY: env.STRIPE_PRICE_STARTER_MONTHLY,
    ANNUAL: env.STRIPE_PRICE_STARTER_ANNUAL,
  },
  GROWTH: {
    MONTHLY: env.STRIPE_PRICE_GROWTH_MONTHLY,
    ANNUAL: env.STRIPE_PRICE_GROWTH_ANNUAL,
  },
  PRO: {
    MONTHLY: env.STRIPE_PRICE_PRO_MONTHLY,
    ANNUAL: env.STRIPE_PRICE_PRO_ANNUAL,
  },
} as const;

// Onboarding one-time prices
export const STRIPE_ONBOARDING = {
  GROWTH: env.STRIPE_PRICE_ONBOARDING_GROWTH,
  PRO: env.STRIPE_PRICE_ONBOARDING_PRO,
} as const;

export type PlanKey = keyof typeof STRIPE_PRICES;
export type BillingCycleKey = "MONTHLY" | "ANNUAL";
