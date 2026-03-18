import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailNotifications: true },
  });

  return NextResponse.json(user ?? { emailNotifications: true });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { emailNotifications } = (await request.json()) as { emailNotifications: boolean };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { emailNotifications },
  });

  return NextResponse.json({ ok: true });
}
