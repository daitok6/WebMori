import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "./lib/auth";

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
  const response = intlMiddleware(request);

  // Generate per-request nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  response.headers.set("Content-Security-Policy", buildCspHeader(nonce));
  response.headers.set("x-nonce", nonce);

  if (isProtectedPath(request.nextUrl.pathname)) {
    // Validate session against the database (not just cookie existence)
    const session = await auth();

    if (!session?.user?.id) {
      const locale = request.nextUrl.pathname.match(/^\/(ja|en)/)?.[1] ?? "ja";
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    // For admin paths, check the user's role from the session
    if (isAdminPath(request.nextUrl.pathname)) {
      const isAdminUser =
        session.user.email === process.env.ADMIN_EMAIL ||
        (session.user as { role?: string }).role === "ADMIN";

      if (!isAdminUser) {
        const locale = request.nextUrl.pathname.match(/^\/(ja|en)/)?.[1] ?? "ja";
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/(ja|en)/:path*",
    "/dashboard/:path*",
    "/dashboard",
    "/auth/:path*",
    "/admin/:path*",
    "/admin",
  ],
};
