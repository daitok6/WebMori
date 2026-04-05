import { prisma } from "./prisma";
import { auth } from "./auth";

export async function getCurrentOrg() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      organization: {
        include: {
          subscription: true,
          repos: { where: { isActive: true }, orderBy: { createdAt: "desc" } },
        },
      },
    },
  });

  return user?.organization ?? null;
}

const CLIENT_VISIBLE_STATUSES = ["DELIVERED", "COMPLETED"] as const;

export async function getOrgAudits(orgId: string) {
  return prisma.audit.findMany({
    where: { organizationId: orgId, status: { in: [...CLIENT_VISIBLE_STATUSES] } },
    include: {
      repo: true,
      findings: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAuditById(auditId: string, orgId: string) {
  return prisma.audit.findFirst({
    where: { id: auditId, organizationId: orgId, status: { in: [...CLIENT_VISIBLE_STATUSES] } },
    include: {
      repo: true,
      findings: { orderBy: { severity: "asc" } },
    },
  });
}

export async function getOrgMessages(orgId: string) {
  return prisma.message.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getOrgStats(orgId: string) {
  const [totalFindings, fixedFindings, nextAudit, audits] = await Promise.all([
    prisma.finding.count({
      where: { audit: { organizationId: orgId } },
    }),
    prisma.finding.count({
      where: { audit: { organizationId: orgId }, prUrl: { not: null } },
    }),
    prisma.audit.findFirst({
      where: { organizationId: orgId, status: "SCHEDULED" },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.audit.findMany({
      where: { organizationId: orgId, status: { in: ["DELIVERED", "COMPLETED"] } },
      include: { findings: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Build trend data for chart
  const trend = audits.map((a) => ({
    date: a.createdAt.toISOString().slice(0, 10),
    critical: a.findings.filter((f) => f.severity === "CRITICAL").length,
    high: a.findings.filter((f) => f.severity === "HIGH").length,
    medium: a.findings.filter((f) => f.severity === "MEDIUM").length,
    low: a.findings.filter((f) => f.severity === "LOW").length,
    total: a.findings.length,
  }));

  return {
    totalFindings,
    fixedFindings,
    nextAuditDate: nextAudit?.scheduledAt?.toISOString().slice(0, 10) ?? null,
    trend,
  };
}

export async function getPaymentHistory(orgId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { organizationId: orgId },
    include: {
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  return sub?.payments ?? [];
}
