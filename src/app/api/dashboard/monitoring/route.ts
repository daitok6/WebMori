import { NextResponse } from "next/server";
import { getCurrentOrg } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Fetch latest check per (repoId, checkType) and last 7 days of history
  const [latestChecks, history, openAlerts, recentAlerts] = await Promise.all([
    // Latest check result for each repo × checkType
    prisma.$queryRaw<
      {
        repoId: string;
        repoName: string;
        checkType: string;
        status: string;
        value: string | null;
        responseTimeMs: number | null;
        createdAt: Date;
      }[]
    >`
      SELECT DISTINCT ON (mc."repoId", mc."checkType")
        mc."repoId",
        r."name" AS "repoName",
        mc."checkType",
        mc."status",
        mc."value",
        mc."responseTimeMs",
        mc."createdAt"
      FROM "MonitorCheck" mc
      JOIN "Repo" r ON r."id" = mc."repoId"
      WHERE mc."organizationId" = ${org.id}
      ORDER BY mc."repoId", mc."checkType", mc."createdAt" DESC
    `,

    // Response time history for uptime checks (last 7 days)
    prisma.monitorCheck.findMany({
      where: {
        organizationId: org.id,
        checkType: "uptime",
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        repoId: true,
        responseTimeMs: true,
        status: true,
        createdAt: true,
        repo: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),

    // Open (unresolved) alerts
    prisma.alert.findMany({
      where: { organizationId: org.id, resolvedAt: null },
      select: {
        id: true,
        checkType: true,
        severity: true,
        message: true,
        createdAt: true,
        repo: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    // All alerts last 30 days (for history)
    prisma.alert.findMany({
      where: {
        organizationId: org.id,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: {
        id: true,
        checkType: true,
        severity: true,
        message: true,
        resolvedAt: true,
        createdAt: true,
        repo: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  // Group latest checks by repo
  const repoMap = new Map<string, { repoName: string; checks: typeof latestChecks }>();
  for (const check of latestChecks) {
    if (!repoMap.has(check.repoId)) {
      repoMap.set(check.repoId, { repoName: check.repoName, checks: [] });
    }
    repoMap.get(check.repoId)!.checks.push(check);
  }

  const repos = Array.from(repoMap.entries()).map(([repoId, { repoName, checks }]) => {
    const overallStatus = checks.some((c) => c.status === "CRITICAL")
      ? "CRITICAL"
      : checks.some((c) => c.status === "WARNING")
      ? "WARNING"
      : "OK";

    return {
      repoId,
      repoName,
      overallStatus,
      checks: checks.map((c) => ({
        checkType: c.checkType,
        status: c.status,
        value: c.value,
        responseTimeMs: c.responseTimeMs,
        checkedAt: c.createdAt.toISOString(),
      })),
    };
  });

  // Response time trend per repo (last 7 days, bucketed by day)
  const trendByRepo = new Map<string, Map<string, number[]>>();
  for (const check of history) {
    const day = check.createdAt.toISOString().slice(0, 10);
    if (!trendByRepo.has(check.repoId)) trendByRepo.set(check.repoId, new Map());
    const dayMap = trendByRepo.get(check.repoId)!;
    if (!dayMap.has(day)) dayMap.set(day, []);
    if (check.responseTimeMs != null) dayMap.get(day)!.push(check.responseTimeMs);
  }

  const responseTrend = Array.from(trendByRepo.entries()).map(([repoId, dayMap]) => {
    const repoName = history.find((h) => h.repoId === repoId)?.repo.name ?? repoId;
    return {
      repoId,
      repoName,
      data: Array.from(dayMap.entries()).map(([date, times]) => ({
        date,
        avgMs: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      })),
    };
  });

  return NextResponse.json({
    repos,
    responseTrend,
    openAlerts: openAlerts.map((a) => ({
      id: a.id,
      repoName: a.repo.name,
      checkType: a.checkType,
      severity: a.severity,
      message: a.message,
      createdAt: a.createdAt.toISOString(),
    })),
    alertHistory: recentAlerts.map((a) => ({
      id: a.id,
      repoName: a.repo.name,
      checkType: a.checkType,
      severity: a.severity,
      message: a.message,
      resolvedAt: a.resolvedAt?.toISOString() ?? null,
      createdAt: a.createdAt.toISOString(),
    })),
    hasData: latestChecks.length > 0,
  });
}
