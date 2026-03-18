import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";

export async function POST() {
  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.message.updateMany({
    where: { organizationId: org.id, fromOperator: true, readByClient: false },
    data: { readByClient: true },
  });

  return NextResponse.json({ ok: true });
}
