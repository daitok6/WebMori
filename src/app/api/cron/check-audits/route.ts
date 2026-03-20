import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find active subscriptions with repos that are due for audit
  // Includes repos with their latest audit to avoid N+1 queries
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: {
      organization: {
        include: {
          repos: {
            where: { isActive: true },
            include: {
              audits: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  const dueAudits: { orgName: string; repoName: string; repoUrl: string }[] = [];

  const now = new Date();
  for (const sub of activeSubscriptions) {
    const org = sub.organization;
    if (!org.repos.length) continue;

    // Determine audit frequency based on plan
    const auditIntervalDays =
      sub.plan === "PRO" ? 7 : sub.plan === "GROWTH" ? 14 : 30;

    for (const repo of org.repos) {
      const lastAudit = repo.audits[0] ?? null;

      const daysSinceLastAudit = lastAudit
        ? Math.floor(
            (now.getTime() - lastAudit.createdAt.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : Infinity;

      if (daysSinceLastAudit >= auditIntervalDays) {
        // Create a scheduled audit
        await prisma.audit.create({
          data: {
            organizationId: org.id,
            repoId: repo.id,
            status: "SCHEDULED",
            scheduledAt: now,
          },
        });

        dueAudits.push({
          orgName: org.name,
          repoName: repo.name,
          repoUrl: repo.url,
        });
      }
    }
  }

  // In production, this would also notify the operator (e.g., via Slack/email)
  // For now, return the list of scheduled audits
  return NextResponse.json({
    scheduled: dueAudits.length,
    audits: dueAudits,
    timestamp: now.toISOString(),
  });
}
