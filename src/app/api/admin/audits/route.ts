import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const audits = await prisma.audit.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      repo: { select: { name: true, url: true } },
      _count: { select: { findings: true } },
      organization: { select: { name: true } },
    },
  });

  return NextResponse.json(
    audits.map((a) => ({
      id: a.id,
      repoName: a.repo.name,
      repoUrl: a.repo.url,
      orgName: a.organization.name,
      status: a.status,
      findingsCount: a._count.findings,
      createdAt: a.createdAt.toISOString(),
    })),
  );
}
