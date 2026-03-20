import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { esc, getResend, EMAIL_FROM } from "@/lib/email";

const messageSchema = z.object({
  orgId: z.string().min(1),
  content: z.string().min(1).max(5000),
});

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgs = await prisma.organization.findMany({
    include: {
      users: { select: { id: true, email: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Count unread (from client, not yet read by operator) per org
  const unreadCounts = await prisma.message.groupBy({
    by: ["organizationId"],
    where: { fromOperator: false, readByOperator: false },
    _count: { id: true },
  });
  const unreadMap = Object.fromEntries(
    unreadCounts.map((r) => [r.organizationId, r._count.id]),
  );

  return NextResponse.json(
    orgs.map((org) => ({
      id: org.id,
      name: org.name,
      email: org.users[0]?.email ?? null,
      userId: org.users[0]?.id ?? null,
      lastMessage: org.messages[0] ?? null,
      messageCount: org._count.messages,
      unreadCount: unreadMap[org.id] ?? 0,
    })),
  );
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  const { orgId, content } = result.data;

  const message = await prisma.message.create({
    data: { organizationId: orgId, content: content.trim(), fromOperator: true },
  });

  // Email notification to client
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { users: { select: { email: true, emailNotifications: true } } },
  });

  const clientUser = org?.users[0];
  const clientEmail = clientUser?.emailNotifications !== false ? clientUser?.email : null;
  const resend = getResend();
  if (clientEmail && resend) {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: [clientEmail],
      subject: "【WebMori】新しいメッセージが届いています",
      html: `
        <body style="background:#FDFBF7;font-family:-apple-system,sans-serif;padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
            <tr><td style="background:#0F1923;padding:24px 32px;border-radius:8px 8px 0 0;">
              <span style="color:#C9A84C;font-size:20px;font-weight:bold;">Web<span style="color:white;">Mori</span></span>
            </td></tr>
            <tr><td style="background:white;padding:32px;border:1px solid #EDE9E3;border-top:none;border-radius:0 0 8px 8px;">
              <p style="color:#0F1923;font-size:16px;margin:0 0 16px;">WebMoriからメッセージが届いています。</p>
              <div style="background:#F8F5EE;border-radius:8px;padding:16px;margin:0 0 24px;">
                <p style="color:#1A1A1A;font-size:14px;margin:0;">${esc(content.trim())}</p>
              </div>
              <a href="https://webmori.jp/ja/dashboard/messages"
                style="background:#C9A84C;color:#0F1923;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                ダッシュボードで確認する
              </a>
            </td></tr>
          </table>
        </body>
      `,
    });
  }

  return NextResponse.json(message, { status: 201 });
}
