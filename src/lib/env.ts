import { z } from "zod";

/**
 * Optional env var: an absent, empty, or whitespace-only value is treated as
 * unset. Vercel injects declared-but-blank vars as "", which `.optional()`
 * alone rejects because it only accepts `undefined`.
 */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => {
    if (typeof v !== "string") return v;
    const trimmed = v.trim();
    return trimmed === "" ? undefined : trimmed;
  }, schema.optional());

/** Same blank-string tolerance as `optional`, but keeps a fallback value. */
const withDefault = (schema: z.ZodString, fallback: string) =>
  z.preprocess((v) => {
    if (typeof v !== "string") return v;
    const trimmed = v.trim();
    return trimmed === "" ? undefined : trimmed;
  }, schema.default(fallback));

const serverSchema = z.object({
  DATABASE_URL: z.url(),

  // NextAuth
  AUTH_SECRET: z.string().min(1),

  // Resend
  RESEND_API_KEY: z.string().startsWith("re_"),
  EMAIL_FROM: z.string().min(1),
  OPERATOR_EMAIL: z.email(),
  ADMIN_EMAIL: z.string().min(1),

  // Stripe (optional at build time — validated at runtime in stripe.ts)
  STRIPE_SECRET_KEY: optional(z.string().startsWith("sk_")),
  STRIPE_WEBHOOK_SECRET: optional(z.string().startsWith("whsec_")),
  STRIPE_PRICE_STARTER_MONTHLY: optional(z.string().startsWith("price_")),
  STRIPE_PRICE_STARTER_ANNUAL: optional(z.string().startsWith("price_")),
  STRIPE_PRICE_GROWTH_MONTHLY: optional(z.string().startsWith("price_")),
  STRIPE_PRICE_GROWTH_ANNUAL: optional(z.string().startsWith("price_")),
  STRIPE_PRICE_PRO_MONTHLY: optional(z.string().startsWith("price_")),
  STRIPE_PRICE_PRO_ANNUAL: optional(z.string().startsWith("price_")),
  STRIPE_PRICE_ONBOARDING_GROWTH: optional(z.string().startsWith("price_")),
  STRIPE_PRICE_ONBOARDING_PRO: optional(z.string().startsWith("price_")),
  // Add-on one-time prices
  STRIPE_PRICE_ADDON_QUICK_WIN: optional(z.string().startsWith("price_")),
  STRIPE_PRICE_ADDON_MODERATE: optional(z.string().startsWith("price_")),
  STRIPE_PRICE_ADDON_LARGE: optional(z.string().startsWith("price_")),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: withDefault(z.string(), "webmori-reports"),
  R2_PUBLIC_URL: withDefault(z.string(), ""),

  // Cron
  CRON_SECRET: z.string().min(1),

  // LINE Messaging API (optional — required for Growth/Pro LINE delivery)
  LINE_CHANNEL_ACCESS_TOKEN: optional(z.string().min(1)),
  LINE_CHANNEL_SECRET: optional(z.string().min(1)),
  // Operator's own LINE userId for self-notifications (optional)
  OPERATOR_LINE_USER_ID: optional(z.string().min(1)),
});

const clientSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optional(z.string().startsWith("pk_")),
  NEXT_PUBLIC_SITE_URL: optional(z.string().url()),
  NEXT_PUBLIC_CALCOM_LINK: optional(z.string().url()),
  // LINE Official Account friend-add URL (e.g. https://line.me/R/ti/p/@your-id)
  NEXT_PUBLIC_LINE_FRIEND_URL: optional(z.string().url()),
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
    NEXT_PUBLIC_CALCOM_LINK: process.env.NEXT_PUBLIC_CALCOM_LINK,
    NEXT_PUBLIC_LINE_FRIEND_URL: process.env.NEXT_PUBLIC_LINE_FRIEND_URL,
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
