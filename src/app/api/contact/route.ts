import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { esc, getResend, EMAIL_FROM } from "@/lib/email";
import { buildEmail, buildKVTable, buildParagraph } from "@/lib/email-template";
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
    html: buildEmail(
      `<h2 style="margin:0 0 20px;color:#1C1917;font-size:18px;">新しい無料診断のお申し込みがあります</h2>` +
      buildKVTable([
        ["お名前", safeName],
        ["メールアドレス", safeEmail],
        ["サイトURL", safeUrl],
        ["スタック", safeStack],
        ["メッセージ", safeMessage],
      ]),
    ),
  });

  // Confirm to customer
  if (resend) await resend.emails.send({
    from: EMAIL_FROM,
    to: [trimmedEmail],
    subject: "【WebMori】お問い合わせを受け付けました",
    html: buildEmail(
      buildParagraph(
        `${safeName} 様`,
        "お問い合わせありがとうございます。<br>内容を確認の上、3営業日以内にご連絡いたします。",
      ),
    ),
  });

  return NextResponse.json({ success: true });
}
