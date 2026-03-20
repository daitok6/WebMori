import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Upstash Redis rate limiter
// Falls back to no-op when env vars are not configured (dev mode)
// ---------------------------------------------------------------------------

let _ratelimit: Ratelimit | null | undefined;

function getRatelimit(): Ratelimit | null {
  if (_ratelimit === undefined) {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      _ratelimit = new Ratelimit({
        redis: new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(10, "60 s"),
        analytics: true,
        prefix: "webmori:ratelimit",
      });
    } else {
      _ratelimit = null;
    }
  }
  return _ratelimit;
}

// Stricter limiter for public endpoints (contact form)
let _publicRatelimit: Ratelimit | null | undefined;

function getPublicRatelimit(): Ratelimit | null {
  if (_publicRatelimit === undefined) {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      _publicRatelimit = new Ratelimit({
        redis: new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(5, "3600 s"),
        analytics: true,
        prefix: "webmori:ratelimit:public",
      });
    } else {
      _publicRatelimit = null;
    }
  }
  return _publicRatelimit;
}

/**
 * Extract client IP from request headers.
 * On Vercel, prefer x-real-ip (set by the platform, not spoofable by clients).
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/**
 * Check rate limit for authenticated API routes.
 * Returns null if allowed, or a 429 NextResponse if rate-limited.
 */
export async function checkRateLimit(
  request: NextRequest,
  identifier?: string,
): Promise<NextResponse | null> {
  const rl = getRatelimit();
  if (!rl) return null; // No Redis configured — allow through

  const id = identifier ?? getClientIp(request);
  const { success, remaining, reset } = await rl.limit(id);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      },
    );
  }

  return null;
}

/**
 * Stricter rate limit for public endpoints (contact form).
 * 5 requests per hour per IP.
 */
export async function checkPublicRateLimit(
  request: NextRequest,
): Promise<NextResponse | null> {
  const rl = getPublicRatelimit();
  if (!rl) return null;

  const ip = getClientIp(request);
  const { success, remaining, reset } = await rl.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      },
    );
  }

  return null;
}
