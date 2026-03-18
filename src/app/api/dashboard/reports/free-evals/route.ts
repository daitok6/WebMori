import { NextResponse } from "next/server";
import { getCurrentOrg } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await prisma.freeEvalReport.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    reports.map((r) => ({
      id: r.id,
      siteUrl: r.siteUrl,
      date: r.createdAt.toISOString(),
    })),
  );
}
