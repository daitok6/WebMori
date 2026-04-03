/**
 * Daily health check cron — runs at 06:00 JST (21:00 UTC).
 * Checks uptime, SSL expiry, security headers, and performance for every
 * active organisation's site. Creates Alert records and notifies clients
 * when checks degrade, and auto-resolves when they recover.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAllChecks } from "@/lib/monitor";
import { sendAlertEmail } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pagespeedKey = process.env.PAGESPEED_API_KEY ?? undefined;

  // All active orgs with at least one repo
  const orgs = await prisma.organization.findMany({
    where: {
      onboardingComplete: true,
      subscription: { status: { in: ["ACTIVE", "TRIALING"] } },
      repos: { some: { isActive: true } },
    },
    select: {
      id: true,
      website: true,
      repos: {
        where: { isActive: true },
        select: { id: true, url: true, isRepoless: true },
      },
    },
  });

  const results = { checked: 0, alerts: 0, resolved: 0 };

  for (const org of orgs) {
    for (const repo of org.repos) {
      // Determine URL to check: isRepoless uses repo.url directly; otherwise use org.website
      const siteUrl = repo.isRepoless ? repo.url : (org.website ?? null);
      if (!siteUrl || !siteUrl.startsWith("http")) continue;

      const checks = await runAllChecks(siteUrl, pagespeedKey);

      for (const [checkType, result] of Object.entries(checks)) {
        // Store the check result
        await prisma.monitorCheck.create({
          data: {
            organizationId: org.id,
            repoId: repo.id,
            checkType,
            status: result.status,
            value: result.value,
            responseTimeMs: result.responseTimeMs ?? null,
          },
        });
        results.checked++;

        if (result.status === "OK") {
          // Auto-resolve any open alert for this check type
          const resolved = await prisma.alert.updateMany({
            where: {
              organizationId: org.id,
              repoId: repo.id,
              checkType,
              resolvedAt: null,
            },
            data: { resolvedAt: new Date() },
          });
          if (resolved.count > 0) results.resolved += resolved.count;
        } else {
          // Only create a new alert if there's no open one already
          const openAlert = await prisma.alert.findFirst({
            where: {
              organizationId: org.id,
              repoId: repo.id,
              checkType,
              resolvedAt: null,
            },
          });

          if (!openAlert) {
            const alert = await prisma.alert.create({
              data: {
                organizationId: org.id,
                repoId: repo.id,
                checkType,
                severity: result.status,
                message: result.value,
              },
            });

            await sendAlertEmail(org.id, {
              checkType,
              severity: result.status,
              message: result.value,
              siteUrl,
              alertId: alert.id,
            });

            await prisma.alert.update({
              where: { id: alert.id },
              data: { notifiedAt: new Date() },
            });

            results.alerts++;
          }
        }
      }
    }
  }

  return NextResponse.json({ ...results, timestamp: new Date().toISOString() });
}
