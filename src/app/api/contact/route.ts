import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

// ---------------------------------------------------------------------------
// Input limits
// ---------------------------------------------------------------------------
const LIMITS = { name: 100, email: 254, url: 500, stack: 100, message: 2000 };

// ---------------------------------------------------------------------------
// HTML escaping — prevents HTML injection in email templates
// ---------------------------------------------------------------------------
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// Basic email format check
// ---------------------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// Best-effort in-memory rate limit (5 submissions per IP per hour)
// NOTE: resets on cold-start in serverless; use Redis for multi-instance
// ---------------------------------------------------------------------------
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, url, stack, message } = body as Record<string, unknown>;

  // Required field presence + type checks
  if (typeof name !== "string" || typeof email !== "string") {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  if (!trimmedName || !trimmedEmail) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }

  // Length limits
  if (trimmedName.length > LIMITS.name) {
    return NextResponse.json({ error: "Name too long" }, { status: 400 });
  }
  if (trimmedEmail.length > LIMITS.email) {
    return NextResponse.json({ error: "Email too long" }, { status: 400 });
  }

  // Email format
  if (!EMAIL_RE.test(trimmedEmail)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const trimmedUrl =
    typeof url === "string" ? url.trim().slice(0, LIMITS.url) : "";
  const trimmedStack =
    typeof stack === "string" ? stack.trim().slice(0, LIMITS.stack) : "";
  const trimmedMessage =
    typeof message === "string" ? message.trim().slice(0, LIMITS.message) : "";

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

  const operatorEmail = process.env.OPERATOR_EMAIL ?? "daito.k631@gmail.com";
  const from = process.env.EMAIL_FROM ?? "WebMori <noreply@webmori.jp>";

  // Notify operator
  await resend.emails.send({
    from,
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
  await resend.emails.send({
    from,
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
