import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";

export async function GET() {
  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ count: 0 });

  const count = await prisma.message.count({
    where: { organizationId: org.id, fromOperator: true, readByClient: false },
  });

  return NextResponse.json({ count });
}
