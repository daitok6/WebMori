import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contacts = await prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organization: {
        include: { users: { select: { id: true }, take: 1 } },
      },
    },
  });

  return NextResponse.json(
    contacts.map((c) => ({
      ...c,
      userId: c.organization?.users[0]?.id ?? null,
    })),
  );
}
