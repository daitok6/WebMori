import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";

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

  const body = await request.json();
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

  return NextResponse.json(message, { status: 201 });
}
