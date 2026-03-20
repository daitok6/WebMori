import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { esc, getResend, EMAIL_FROM } from "@/lib/email";
import { checkPublicRateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().min(1, "Email is required").max(254).email("Invalid email address"),
  url: z.string().max(500).optional().default(""),
  stack: z.string().max(100).optional().default(""),
  message: z.string().max(2000).optional().default(""),
});

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // Rate limiting (Upstash Redis — 5 per hour per IP)
  const rateLimited = await checkPublicRateLimit(request);
  if (rateLimited) return rateLimited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input", details: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const trimmedName = result.data.name.trim();
  const trimmedEmail = result.data.email.trim();
  const trimmedUrl = result.data.url.trim();
  const trimmedStack = result.data.stack.trim();
  const trimmedMessage = result.data.message.trim();

  // Save to DB
  await prisma.contactRequest.create({
    data: {
      name: trimmedName,
      email: trimmedEmail,
      url: trimmedUrl || null,
      stack: trimmedStack || null,
      message: trimmedMessage || null,
    },
  });

  // Escaped values for HTML email templates
  const safeName = esc(trimmedName);
  const safeEmail = esc(trimmedEmail);
  const safeUrl = trimmedUrl ? esc(trimmedUrl) : "未入力";
  const safeStack = trimmedStack ? esc(trimmedStack) : "未入力";
  const safeMessage = trimmedMessage ? esc(trimmedMessage) : "未入力";

  const operatorEmail = process.env.OPERATOR_EMAIL;
  const resend = getResend();

  // Notify operator
  if (operatorEmail && resend) await resend.emails.send({
    from: EMAIL_FROM,
    to: [operatorEmail],
    subject: `【WebMori】無料診断のお申し込み: ${safeName}`,
    html: `
      <body style="background:#FDFBF7;font-family:-apple-system,sans-serif;margin:0;padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
          <tr>
            <td style="background:#0F1923;padding:24px 32px;border-radius:8px 8px 0 0;">
              <span style="color:#C9A84C;font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
            </td>
          </tr>
          <tr>
            <td style="background:white;padding:32px;border:1px solid #EDE9E3;border-top:none;border-radius:0 0 8px 8px;">
              <h2 style="margin:0 0 20px;color:#0F1923;font-size:18px;">新しい無料診断のお申し込みがあります</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${(
                  [
                    ["お名前", safeName],
                    ["メールアドレス", safeEmail],
                    ["サイトURL", safeUrl],
                    ["スタック", safeStack],
                    ["メッセージ", safeMessage],
                  ] as [string, string][]
                )
                  .map(
                    ([label, value]) => `
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #EDE9E3;color:#5A6478;font-size:13px;width:140px;vertical-align:top;">${label}</td>
                    <td style="padding:10px 0;border-bottom:1px solid #EDE9E3;color:#1A1A1A;font-size:13px;">${value}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </table>
            </td>
          </tr>
        </table>
      </body>
    `,
  });

  // Confirm to customer
  if (resend) await resend.emails.send({
    from: EMAIL_FROM,
    to: [trimmedEmail],
    subject: "【WebMori】お問い合わせを受け付けました",
    html: `
      <body style="background:#FDFBF7;font-family:-apple-system,sans-serif;margin:0;padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
          <tr>
            <td style="background:#0F1923;padding:24px 32px;border-radius:8px 8px 0 0;">
              <span style="color:#C9A84C;font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
            </td>
          </tr>
          <tr>
            <td style="background:white;padding:32px;border:1px solid #EDE9E3;border-top:none;border-radius:0 0 8px 8px;">
              <p style="margin:0 0 16px;color:#0F1923;font-size:16px;">${safeName} 様</p>
              <p style="margin:0 0 16px;color:#1A1A1A;font-size:14px;line-height:1.7;">
                お問い合わせありがとうございます。<br>
                内容を確認の上、3営業日以内にご連絡いたします。
              </p>
              <p style="margin:24px 0 0;color:#5A6478;font-size:13px;">
                WebMori（ウェブ守り）<br>
                <a href="https://webmori.jp" style="color:#C9A84C;">webmori.jp</a>
              </p>
            </td>
          </tr>
        </table>
      </body>
    `,
  });

  return NextResponse.json({ success: true });
}
