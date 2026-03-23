import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month"); // e.g., "2026-03"

  // Default to current month
  let year: number, month: number;
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    month = m - 1; // 0-indexed
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 1);

  const audits = await prisma.audit.findMany({
    where: {
      OR: [
        { scheduledAt: { gte: startOfMonth, lt: endOfMonth } },
        { createdAt: { gte: startOfMonth, lt: endOfMonth }, scheduledAt: null },
      ],
    },
    orderBy: { scheduledAt: "asc" },
    include: {
      repo: { select: { name: true, url: true } },
      _count: { select: { findings: true } },
      organization: { select: { name: true } },
    },
  });

  const mapped = audits.map((a) => ({
    id: a.id,
    repoName: a.repo.name,
    repoUrl: a.repo.url,
    orgName: a.organization.name,
    status: a.status,
    findingsCount: a._count.findings,
    isWelcome: a.isWelcome,
    auditDepth: a.auditDepth,
    scheduledAt: a.scheduledAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    deliveredAt: a.deliveredAt?.toISOString() ?? null,
    failureReason: a.failureReason,
  }));

  // Summary stats
  const stats = {
    total: mapped.length,
    scheduled: mapped.filter((a) => a.status === "SCHEDULED").length,
    inProgress: mapped.filter((a) => a.status === "IN_PROGRESS").length,
    review: mapped.filter((a) => a.status === "REVIEW").length,
    delivered: mapped.filter((a) => a.status === "DELIVERED").length,
    completed: mapped.filter((a) => a.status === "COMPLETED").length,
    failed: mapped.filter((a) => a.status === "FAILED").length,
  };

  return NextResponse.json({ audits: mapped, stats, month: `${year}-${String(month + 1).padStart(2, "0")}` });
}
