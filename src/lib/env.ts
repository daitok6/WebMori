import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.url(),

  // NextAuth
  AUTH_SECRET: z.string().min(1),

  // Resend
  RESEND_API_KEY: z.string().startsWith("re_"),
  EMAIL_FROM: z.string().min(1),
  OPERATOR_EMAIL: z.email(),
  ADMIN_EMAIL: z.email(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  STRIPE_PRICE_STARTER_MONTHLY: z.string().startsWith("price_"),
  STRIPE_PRICE_STARTER_ANNUAL: z.string().startsWith("price_"),
  STRIPE_PRICE_GROWTH_MONTHLY: z.string().startsWith("price_"),
  STRIPE_PRICE_GROWTH_ANNUAL: z.string().startsWith("price_"),
  STRIPE_PRICE_PRO_MONTHLY: z.string().startsWith("price_"),
  STRIPE_PRICE_PRO_ANNUAL: z.string().startsWith("price_"),
  STRIPE_PRICE_ONBOARDING_GROWTH: z.string().startsWith("price_").optional(),
  STRIPE_PRICE_ONBOARDING_PRO: z.string().startsWith("price_").optional(),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().default("webmori-reports"),
  R2_PUBLIC_URL: z.string().default(""),

  // Cron
  CRON_SECRET: z.string().min(1),
});

const clientSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function validateEnv() {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = z.prettifyError(result.error);
    console.error("❌ Invalid server environment variables:\n", formatted);
    throw new Error("Invalid server environment variables");
  }
  return result.data;
}

function validateClientEnv() {
  const result = clientSchema.safeParse({
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
  if (!result.success) {
    const formatted = z.prettifyError(result.error);
    console.error("❌ Invalid client environment variables:\n", formatted);
    throw new Error("Invalid client environment variables");
  }
  return result.data;
}

export const env = validateEnv();
export const clientEnv = validateClientEnv();
