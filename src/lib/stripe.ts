import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Stripe price IDs — set these in environment variables after creating products in Stripe
export const STRIPE_PRICES = {
  STARTER: {
    MONTHLY: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    ANNUAL: process.env.STRIPE_PRICE_STARTER_ANNUAL!,
  },
  GROWTH: {
    MONTHLY: process.env.STRIPE_PRICE_GROWTH_MONTHLY!,
    ANNUAL: process.env.STRIPE_PRICE_GROWTH_ANNUAL!,
  },
  PRO: {
    MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    ANNUAL: process.env.STRIPE_PRICE_PRO_ANNUAL!,
  },
} as const;

// Onboarding one-time prices
export const STRIPE_ONBOARDING = {
  GROWTH: process.env.STRIPE_PRICE_ONBOARDING_GROWTH,
  PRO: process.env.STRIPE_PRICE_ONBOARDING_PRO,
} as const;

export type PlanKey = keyof typeof STRIPE_PRICES;
export type BillingCycleKey = "MONTHLY" | "ANNUAL";
