import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";

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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, phone, bio, company, website, orgPhone } = (await request.json()) as {
    name?: string;
    phone?: string;
    bio?: string;
    company?: string;
    website?: string;
    orgPhone?: string;
  };

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
