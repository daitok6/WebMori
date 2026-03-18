import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orgId } = await params;

  await prisma.message.updateMany({
    where: { organizationId: orgId, fromOperator: false, readByOperator: false },
    data: { readByOperator: true },
  });

  return NextResponse.json({ success: true });
}
