import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";
import { esc, getResend, EMAIL_FROM } from "@/lib/email";
import { buildEmail } from "@/lib/email-template";
import { checkRateLimit } from "@/lib/rate-limit";

const messageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export async function GET() {
  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const rateLimited = await checkRateLimit(request);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const result = messageSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input", details: result.error.flatten().fieldErrors }, { status: 400 });
  }
  const { content } = result.data;

  const message = await prisma.message.create({
    data: {
      organizationId: org.id,
      content: content.trim(),
      fromOperator: false,
    },
  });

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL;
  const resend = getResend();
  if (resend && adminEmail) {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: [adminEmail],
      subject: `【WebMori】${esc(org.name)} からメッセージが届いています`,
      html: buildEmail(
        `<p style="color:#0F1923;font-size:16px;margin:0 0 8px;"><strong>${esc(org.name)}</strong> からメッセージが届いています。</p>
        <div style="background:#F8F5EE;border-radius:8px;padding:16px;margin:0 0 24px;">
          <p style="color:#1A1A1A;font-size:14px;margin:0;">${esc(content.trim())}</p>
        </div>
        <a href="https://webmori.jp/ja/admin/messages"
          style="background:#C9A84C;color:#0F1923;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
          管理画面で確認する
        </a>`,
      ),
    }).catch(() => {/* non-fatal */});
  }

  return NextResponse.json(message, { status: 201 });
}
