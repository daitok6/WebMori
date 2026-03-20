import { vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock: Prisma
// ---------------------------------------------------------------------------
export const mockPrisma = {
  stripeEvent: { create: vi.fn() },
  subscription: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    findMany: vi.fn(),
  },
  payment: { create: vi.fn() },
  user: { findUnique: vi.fn(), update: vi.fn() },
  organization: { create: vi.fn() },
  audit: { create: vi.fn() },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

// ---------------------------------------------------------------------------
// Mock: Stripe
// ---------------------------------------------------------------------------
export const mockStripe = {
  webhooks: {
    constructEvent: vi.fn(),
  },
  checkout: {
    sessions: { create: vi.fn() },
  },
  billingPortal: {
    sessions: { create: vi.fn() },
  },
};

vi.mock("@/lib/stripe", () => ({
  getStripe: () => mockStripe,
  STRIPE_PRICES: {
    STARTER: { MONTHLY: "price_starter_m", ANNUAL: "price_starter_a" },
    GROWTH: { MONTHLY: "price_growth_m", ANNUAL: "price_growth_a" },
    PRO: { MONTHLY: "price_pro_m", ANNUAL: "price_pro_a" },
  },
  STRIPE_ONBOARDING: {
    GROWTH: "price_onboard_growth",
    PRO: "price_onboard_pro",
  },
}));

// ---------------------------------------------------------------------------
// Mock: Auth
// ---------------------------------------------------------------------------
export const mockAuth = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

// ---------------------------------------------------------------------------
// Mock: Rate limiter (always allow in tests)
// ---------------------------------------------------------------------------
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
  checkPublicRateLimit: vi.fn().mockResolvedValue(null),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

// ---------------------------------------------------------------------------
// Mock: env (bypass Zod validation in tests)
// ---------------------------------------------------------------------------
vi.mock("@/lib/env", () => ({
  env: {
    STRIPE_SECRET_KEY: "sk_test_123",
    STRIPE_WEBHOOK_SECRET: "whsec_test_123",
    STRIPE_PRICE_STARTER_MONTHLY: "price_starter_m",
    STRIPE_PRICE_STARTER_ANNUAL: "price_starter_a",
    STRIPE_PRICE_GROWTH_MONTHLY: "price_growth_m",
    STRIPE_PRICE_GROWTH_ANNUAL: "price_growth_a",
    STRIPE_PRICE_PRO_MONTHLY: "price_pro_m",
    STRIPE_PRICE_PRO_ANNUAL: "price_pro_a",
    STRIPE_PRICE_ONBOARDING_GROWTH: "price_onboard_growth",
    STRIPE_PRICE_ONBOARDING_PRO: "price_onboard_pro",
    CRON_SECRET: "test-cron-secret",
    DATABASE_URL: "postgresql://test",
    AUTH_SECRET: "test-auth-secret",
    RESEND_API_KEY: "re_test_123",
    EMAIL_FROM: "test@webmori.jp",
    OPERATOR_EMAIL: "operator@webmori.jp",
    ADMIN_EMAIL: "admin@webmori.jp",
    R2_ACCOUNT_ID: "test",
    R2_ACCESS_KEY_ID: "test",
    R2_SECRET_ACCESS_KEY: "test",
    R2_BUCKET_NAME: "webmori-reports",
    R2_PUBLIC_URL: "",
    CRON_SECRET: "test-cron-secret",
  },
  clientEnv: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_123",
  },
}));

// ---------------------------------------------------------------------------
// Mock: Generated Prisma client enums
// ---------------------------------------------------------------------------
vi.mock("@/generated/prisma/client", () => ({
  Plan: { STARTER: "STARTER", GROWTH: "GROWTH", PRO: "PRO" },
  BillingCycle: { MONTHLY: "MONTHLY", ANNUAL: "ANNUAL" },
  SubStatus: {
    ACTIVE: "ACTIVE",
    PAST_DUE: "PAST_DUE",
    CANCELED: "CANCELED",
    TRIALING: "TRIALING",
  },
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string;
      constructor(message: string, { code }: { code: string }) {
        super(message);
        this.code = code;
      }
    },
  },
}));
