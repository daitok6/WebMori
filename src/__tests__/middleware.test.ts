import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock next-intl middleware before importing our middleware
vi.mock("next-intl/middleware", () => ({
  default: () => {
    return (_req: NextRequest) => {
      return new NextResponse(null, { status: 200 });
    };
  },
}));

vi.mock("@/i18n/routing", () => ({
  routing: {
    locales: ["ja", "en"],
    defaultLocale: "ja",
  },
}));

// Now import the middleware under test
import middleware from "@/middleware";

function makeRequest(path: string, cookies: Record<string, string> = {}): NextRequest {
  const url = `http://localhost:3000${path}`;
  const req = new NextRequest(url);
  for (const [k, v] of Object.entries(cookies)) {
    req.cookies.set(k, v);
  }
  return req;
}

describe("Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── CSP ────────────────────────────────────────────────────────────

  it("adds CSP header with nonce to all responses", async () => {
    const res = await middleware(makeRequest("/ja"));
    const csp = res.headers.get("Content-Security-Policy");
    expect(csp).toContain("script-src");
    expect(csp).toContain("nonce-");
    expect(res.headers.get("x-nonce")).toBeTruthy();
  });

  // ─── Protected paths ───────────────────────────────────────────────

  it("redirects to signin when no session cookie on /dashboard", async () => {
    const res = await middleware(makeRequest("/ja/dashboard"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/signin");
  });

  it("redirects to signin when no session cookie on /admin", async () => {
    const res = await middleware(makeRequest("/ja/admin"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/signin");
  });

  it("allows access to /dashboard with session cookie", async () => {
    const res = await middleware(
      makeRequest("/ja/dashboard", { "authjs.session-token": "valid-token" }),
    );
    expect(res.status).toBe(200);
  });

  it("works with __Secure- prefixed cookie", async () => {
    const res = await middleware(
      makeRequest("/ja/dashboard", { "__Secure-authjs.session-token": "valid-token" }),
    );
    expect(res.status).toBe(200);
  });

  // ─── Admin paths ───────────────────────────────────────────────────

  it("redirects non-admin users from /admin to /dashboard", async () => {
    const res = await middleware(
      makeRequest("/ja/admin", { "authjs.session-token": "valid-token" }),
    );
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("allows admin users to access /admin", async () => {
    const res = await middleware(
      makeRequest("/ja/admin", {
        "authjs.session-token": "valid-token",
        "webmori-admin": "1",
      }),
    );
    expect(res.status).toBe(200);
  });

  // ─── Public paths ──────────────────────────────────────────────────

  it("allows access to public paths without auth", async () => {
    const res = await middleware(makeRequest("/ja"));
    expect(res.status).toBe(200);
  });

  // ─── Callback URL ──────────────────────────────────────────────────

  it("includes callbackUrl in redirect to signin", async () => {
    const res = await middleware(makeRequest("/ja/dashboard/reports"));
    expect(res.status).toBe(307);
    const location = res.headers.get("location")!;
    expect(location).toContain("callbackUrl=%2Fja%2Fdashboard%2Freports");
  });

  // ─── Locale detection ──────────────────────────────────────────────

  it("uses en locale in signin redirect for /en paths", async () => {
    const res = await middleware(makeRequest("/en/dashboard"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/en/auth/signin");
  });
});
