import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);

  // Support ?countOnly=true for the nav badge
  if (searchParams.get("countOnly") === "true") {
    const count = await prisma.audit.count({ where: { status: "REVIEW" } });
    return NextResponse.json({ count });
  }

  const [queue, approvedTodayCount, recentlyDelivered] = await Promise.all([
    prisma.audit.findMany({
      where: { status: "REVIEW" },
      orderBy: { updatedAt: "asc" },
      include: {
        repo: { select: { name: true, url: true } },
        organization: { select: { name: true } },
        findings: {
          select: {
            id: true,
            title: true,
            severity: true,
            effort: true,
            evidence: true,
            impact: true,
            fix: true,
            safeAutoFix: true,
            prUrl: true,
          },
          orderBy: [
            { severity: "asc" }, // CRITICAL < HIGH < LOW < MEDIUM alphabetically — sorted by weight below in component
          ],
        },
      },
    }),
    // Audits delivered today
    prisma.audit.count({
      where: {
        status: { in: ["DELIVERED", "COMPLETED"] },
        deliveredAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    // Recent deliveries for avg review time calculation
    prisma.audit.findMany({
      where: {
        status: { in: ["DELIVERED", "COMPLETED"] },
        deliveredAt: { not: null },
      },
      select: { updatedAt: true, deliveredAt: true },
      orderBy: { deliveredAt: "desc" },
      take: 20,
    }),
  ]);

  // Average review time in hours (time from entering REVIEW to being delivered)
  // updatedAt is used as a proxy for when status last changed to REVIEW
  const avgReviewHours =
    recentlyDelivered.length > 0
      ? recentlyDelivered.reduce((sum, a) => {
          const diffMs = (a.deliveredAt!.getTime() - a.updatedAt.getTime());
          return sum + diffMs / (1000 * 60 * 60);
        }, 0) / recentlyDelivered.length
      : null;

  const mapped = queue.map((a) => ({
    id: a.id,
    orgName: a.organization.name,
    repoName: a.repo.name,
    repoUrl: a.repo.url,
    reportCode: a.reportCode ?? null,
    isWelcome: a.isWelcome,
    auditDepth: a.auditDepth,
    reportPdfUrl: a.reportPdfUrl ?? null,
    findingsPdfUrl: a.findingsPdfUrl ?? null,
    reportMdKey: a.reportMdKey ?? null,
    prLinks: a.prLinks ?? [],
    scheduledAt: a.scheduledAt?.toISOString() ?? null,
    updatedAt: a.updatedAt.toISOString(),
    findings: a.findings,
  }));

  return NextResponse.json({
    queue: mapped,
    stats: {
      reviewCount: mapped.length,
      approvedToday: approvedTodayCount,
      avgReviewHours: avgReviewHours !== null ? Math.round(avgReviewHours * 10) / 10 : null,
    },
  });
}
