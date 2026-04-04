import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getResend, EMAIL_FROM, esc } from "@/lib/email";

/**
 * GET /api/admin/test-notify?email=...
 * Fires a raw Resend email directly to the given address.
 * Returns the exact Resend response so we can see any errors.
 * Temporary — remove after debugging.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const to = request.nextUrl.searchParams.get("email") ?? "daito.k631@gmail.com";

  const resend = getResend();
  if (!resend) {
    return NextResponse.json({ error: "Resend not configured (RESEND_API_KEY missing)" }, { status: 500 });
  }

  const result = await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject: "WebMori テスト通知",
    html: `<p>This is a test email from WebMori. From: ${esc(EMAIL_FROM)}</p>`,
  });

  return NextResponse.json({
    resendResult: result,
    sentFrom: EMAIL_FROM,
    sentTo: to,
  });
}
