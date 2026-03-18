import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const protectedPaths = ["/dashboard"];

function isProtectedPath(pathname: string): boolean {
  // Strip locale prefix to check the actual path
  const pathWithoutLocale = pathname.replace(/^\/(ja|en)/, "") || "/";
  return protectedPaths.some((p) => pathWithoutLocale.startsWith(p));
}

export default async function middleware(request: NextRequest) {
  // Run i18n middleware first
  const response = intlMiddleware(request);

  // Check auth for protected routes
  if (isProtectedPath(request.nextUrl.pathname)) {
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ??
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      const locale = request.nextUrl.pathname.match(/^\/(ja|en)/)?.[1] ?? "ja";
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/(ja|en)/:path*"],
};
