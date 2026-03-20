import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";
import { checkRateLimit } from "@/lib/rate-limit";

const freeEvalSchema = z.object({
  name: z.string().min(1).max(100),
  website: z.string().min(1).max(500),
  stack: z.string().max(100).optional(),
  message: z.string().max(2000).optional(),
});

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
  const rateLimited = await checkRateLimit(request);
  if (rateLimited) return rateLimited;

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const result = freeEvalSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input", details: result.error.flatten().fieldErrors }, { status: 400 });
  }
  const { name, website, stack, message } = result.data;

  const contact = await prisma.contactRequest.create({
    data: {
      name: name.trim(),
      email: user.email,
      url: website.trim(),
      stack: stack?.trim() || null,
      message: message?.trim() || null,
      organizationId: org.id,
      status: "PENDING",
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
