import { NextRequest, NextResponse } from "next/server";
import { isCronOrAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/audits/lookup
 *
 * Supports two query modes:
 *   ?email=user@example.com  — Resolve user → org → subscription → repos → latest scheduled audit
 *   ?reportCode=WM-202603-001 — Look up audit by report code with findings and org info
 */
export async function GET(request: NextRequest) {
  if (!(await isCronOrAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const reportCode = searchParams.get("reportCode");

  if (email) {
    return lookupByEmail(email);
  }
  if (reportCode) {
    return lookupByReportCode(reportCode);
  }

  return NextResponse.json(
    { error: "Provide either ?email= or ?reportCode= query parameter" },
    { status: 400 },
  );
}

async function lookupByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: {
      id: true,
      email: true,
      name: true,
      organization: {
        select: {
          id: true,
          name: true,
          website: true,
          subscription: {
            select: {
              id: true,
              plan: true,
              status: true,
              billingCycle: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
              gracePeriodEnd: true,
              payments: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { amount: true, paidAt: true, status: true },
              },
            },
          },
          repos: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              url: true,
              stack: true,
              isRepoless: true,
            },
          },
          audits: {
            where: { status: "SCHEDULED" },
            orderBy: { scheduledAt: "desc" },
            select: {
              id: true,
              reportCode: true,
              repoId: true,
              scheduledAt: true,
              status: true,
              auditDepth: true,
              repo: { select: { name: true, url: true, isRepoless: true } },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.organization) {
    return NextResponse.json(
      { error: "User has no organization" },
      { status: 404 },
    );
  }

  const org = user.organization;
  const sub = org.subscription;
  const lastPayment = sub?.payments[0] ?? null;

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
    organization: { id: org.id, name: org.name, website: org.website },
    subscription: sub
      ? {
          plan: sub.plan,
          status: sub.status,
          billingCycle: sub.billingCycle,
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          gracePeriodEnd: sub.gracePeriodEnd,
          lastPayment,
        }
      : null,
    repos: org.repos,
    audits: org.audits,
  });
}

async function lookupByReportCode(reportCode: string) {
  const audit = await prisma.audit.findUnique({
    where: { reportCode },
    select: {
      id: true,
      reportCode: true,
      status: true,
      reportPdfUrl: true,
      findingsPdfUrl: true,
      reportMdKey: true,
      prLinks: true,
      scheduledAt: true,
      completedAt: true,
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      repo: {
        select: {
          id: true,
          name: true,
          url: true,
          stack: true,
          isRepoless: true,
        },
      },
      findings: {
        select: {
          id: true,
          title: true,
          severity: true,
          evidence: true,
          impact: true,
          fix: true,
          effort: true,
          safeAutoFix: true,
          prUrl: true,
        },
      },
    },
  });

  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  return NextResponse.json(audit);
}
