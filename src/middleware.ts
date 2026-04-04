import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const protectedPaths = ["/dashboard", "/admin"];

function isProtectedPath(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(ja|en)/, "") || "/";
  return protectedPaths.some((p) => pathWithoutLocale.startsWith(p));
}

function isAdminPath(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(ja|en)/, "") || "/";
  return pathWithoutLocale.startsWith("/admin");
}

function buildCspHeader(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com https://api.resend.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never run intl or auth middleware on API routes — they must return raw responses.
  // The matcher regex should prevent this, but guard explicitly as a safety net.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);

  // Generate per-request nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  response.headers.set("Content-Security-Policy", buildCspHeader(nonce));
  response.headers.set("x-nonce", nonce);

  if (isProtectedPath(request.nextUrl.pathname)) {
    // Check for session cookie existence (fast pre-filter for Edge Runtime).
    // Full session validation happens server-side via auth() in API routes and pages.
    // Edge middleware cannot import Prisma, so we cannot validate the token here.
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ??
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      const locale = request.nextUrl.pathname.match(/^\/(ja|en)/)?.[1] ?? "ja";
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    // For admin paths, check for server-set admin marker cookie.
    // This is a UI-level gate only — real authorization is enforced by isAdmin() in API routes.
    if (isAdminPath(request.nextUrl.pathname)) {
      const isAdminUser = request.cookies.get("webmori-admin")?.value === "1";
      if (!isAdminUser) {
        const locale = request.nextUrl.pathname.match(/^\/(ja|en)/)?.[1] ?? "ja";
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
      }
    }
  }

  return response;
}

export const config = {
  // Exclude /api/*, /_next/*, /_vercel/*, and static files from middleware.
  // The intl middleware must never run on API routes — it redirects them.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
