import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sendNewMessageEmail } from "@/lib/notifications";

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

  // Email notification to client (checks emailNotifications preference)
  await sendNewMessageEmail(orgId, content);

  return NextResponse.json(message, { status: 201 });
}
