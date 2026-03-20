import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";
import { checkRateLimit } from "@/lib/rate-limit";

const profileSchema = z.object({
  name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  company: z.string().max(100).optional(),
  website: z.string().max(500).optional(),
  orgPhone: z.string().max(20).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    name: user.name ?? "",
    email: user.email,
    phone: user.phone ?? "",
    bio: user.bio ?? "",
    company: user.organization?.name ?? "",
    website: user.organization?.website ?? "",
    orgPhone: user.organization?.phone ?? "",
  });
}

export async function PATCH(request: NextRequest) {
  const rateLimited = await checkRateLimit(request);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const result = profileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input", details: result.error.flatten().fieldErrors }, { status: 400 });
  }
  const { name, phone, bio, company, website, orgPhone } = result.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(bio !== undefined && { bio }),
    },
  });

  const org = await getCurrentOrg();
  if (org && (company !== undefined || website !== undefined || orgPhone !== undefined)) {
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        ...(company !== undefined && { name: company }),
        ...(website !== undefined && { website }),
        ...(orgPhone !== undefined && { phone: orgPhone }),
      },
    });
  }

  return NextResponse.json({ success: true });
}
