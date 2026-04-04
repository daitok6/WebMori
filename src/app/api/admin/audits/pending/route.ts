import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/audits/pending
 * Returns SCHEDULED audits whose scheduledAt has arrived.
 * Used by the Claude Code /schedule trigger to discover and run pending audits.
 * Auth: Bearer {CRON_SECRET}
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const audits = await prisma.audit.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
      organization: {
        subscription: {
          status: { in: ["ACTIVE", "TRIALING"] },
        },
      },
    },
    include: {
      repo: { select: { name: true, url: true, isRepoless: true } },
      organization: {
        select: {
          name: true,
          users: { select: { email: true }, take: 1 },
          subscription: { select: { plan: true, status: true } },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const pending = audits.map((audit) => ({
    auditId: audit.id,
    email: audit.organization.users[0]?.email ?? null,
    orgName: audit.organization.name,
    repoName: audit.repo.name,
    repoUrl: audit.repo.url,
    isRepoless: audit.repo.isRepoless,
    auditDepth: audit.auditDepth ?? "full",
    plan: audit.organization.subscription?.plan ?? "STARTER",
    scheduledAt: audit.scheduledAt?.toISOString() ?? null,
  })).filter((a) => a.email !== null);

  return NextResponse.json({
    pending,
    count: pending.length,
    timestamp: now.toISOString(),
  });
}
