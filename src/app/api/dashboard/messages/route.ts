import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";
import { Resend } from "resend";

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
  const { content } = body as { content: string };

  if (!content?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      organizationId: org.id,
      content: content.trim(),
      fromOperator: false,
    },
  });

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (process.env.RESEND_API_KEY && adminEmail) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM ?? "WebMori <noreply@webmori.jp>";
    await resend.emails.send({
      from,
      to: [adminEmail],
      subject: `【WebMori】${org.name} からメッセージが届いています`,
      html: `
        <body style="background:#FDFBF7;font-family:-apple-system,sans-serif;padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
            <tr><td style="background:#0F1923;padding:24px 32px;border-radius:8px 8px 0 0;">
              <span style="color:#C9A84C;font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
            </td></tr>
            <tr><td style="background:white;padding:32px;border:1px solid #EDE9E3;border-top:none;border-radius:0 0 8px 8px;">
              <p style="color:#0F1923;font-size:16px;margin:0 0 8px;"><strong>${org.name}</strong> からメッセージが届いています。</p>
              <div style="background:#F8F5EE;border-radius:8px;padding:16px;margin:0 0 24px;">
                <p style="color:#1A1A1A;font-size:14px;margin:0;">${content.trim()}</p>
              </div>
              <a href="https://webmori.jp/ja/admin/messages"
                style="background:#C9A84C;color:#0F1923;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                管理画面で確認する
              </a>
            </td></tr>
          </table>
        </body>
      `,
    }).catch(() => {/* non-fatal */});
  }

  return NextResponse.json(message, { status: 201 });
}
