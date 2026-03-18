import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json(null);

  const request = await prisma.contactRequest.findFirst({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, url: true, createdAt: true },
  });

  return NextResponse.json(request);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  // Prevent duplicate active requests
  const existing = await prisma.contactRequest.findFirst({
    where: {
      organizationId: org.id,
      status: { in: ["PENDING", "REVIEWING"] },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "already_submitted" }, { status: 409 });
  }

  const body = await request.json() as {
    name: string;
    website: string;
    stack?: string;
    message?: string;
  };

  if (!body.name?.trim() || !body.website?.trim()) {
    return NextResponse.json({ error: "Name and website are required" }, { status: 400 });
  }

  const contact = await prisma.contactRequest.create({
    data: {
      name: body.name.trim(),
      email: user.email,
      url: body.website.trim(),
      stack: body.stack?.trim() || null,
      message: body.message?.trim() || null,
      organizationId: org.id,
      status: "PENDING",
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
