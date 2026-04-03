import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrg } from "@/lib/dashboard";

export async function GET() {
  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ count: 0, showFreeEval: true });

  const [count, hasPaidSubscription, hasRequestedFreeEval] = await Promise.all([
    prisma.message.count({
      where: { organizationId: org.id, fromOperator: true, readByClient: false },
    }),
    prisma.subscription.findFirst({
      where: { organizationId: org.id, status: { not: "CANCELED" } },
      select: { id: true },
    }).then((s) => !!s),
    prisma.contactRequest.findFirst({
      where: { organizationId: org.id },
      select: { id: true },
    }).then((c) => !!c),
  ]);

  const showFreeEval = !hasPaidSubscription && !hasRequestedFreeEval;

  return NextResponse.json({ count, showFreeEval });
}
