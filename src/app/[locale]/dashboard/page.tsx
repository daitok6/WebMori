"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { AuditStatusBadge } from "@/components/dashboard/audit-status-badge";
import { DashboardError } from "@/components/dashboard/dashboard-error";
import { FindingsTrend } from "@/components/dashboard/findings-trend";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { useDashboardData } from "@/lib/use-dashboard-data";
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  GitBranch,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface OverviewData {
  plan: string | null;
  status: string | null;
  repoCount: number;
  onboarding: {
    profileComplete: boolean;
    hasRepo: boolean;
    hasRequestedEval: boolean;
  } | null;
  stats: {
    totalFindings: number;
    fixedFindings: number;
    nextAuditDate: string | null;
    trend: {
      date: string;
      critical: number;
      high: number;
      medium: number;
      low: number;
      total: number;
    }[];
  };
  recentAudits: {
    id: string;
    repoName: string;
    status: string;
    date: string;
    findingsCount: number;
    criticalCount: number;
  }[];
}

export default function DashboardPage() {
  const t = useTranslations("dashboard.overview");
  const tStatus = useTranslations("dashboard.auditStatus");
  const { data, loading, error, retry } = useDashboardData<OverviewData>("/api/dashboard/overview");

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (error || !data) return <DashboardError message={error ?? "Unknown error"} onRetry={retry} />;

  const hasAudits = data.recentAudits.length > 0;

  const stats = [
    {
      key: "nextAudit",
      icon: Calendar,
      value: data.stats.nextAuditDate ?? t("notScheduled"),
      color: "text-navy-light",
    },
    {
      key: "totalFindings",
      icon: AlertTriangle,
      value: String(data.stats.totalFindings),
      color: "text-severity-high",
    },
    {
      key: "fixedIssues",
      icon: CheckCircle2,
      value: String(data.stats.fixedFindings),
      color: "text-severity-good",
    },
    {
      key: "activePlan",
      icon: CreditCard,
      value: data.plan ?? t("noPlan"),
      color: "text-gold",
    },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold text-navy-dark">{t("title")}</h1>
      <p className="mt-1 text-text-muted">{t("welcome")}</p>

      {/* Onboarding checklist — shown until all steps complete */}
      {data.onboarding && <OnboardingChecklist data={data.onboarding} />}

      {/* Stats grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.key}>
            <div className="flex items-center gap-3">
              <div className={`rounded-lg bg-bg-cream p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-text-muted">{t(stat.key)}</p>
                <p className="text-xl font-bold text-navy-dark">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {hasAudits ? (
        <>
          {/* Findings trend chart */}
          {data.stats.trend.length > 1 && (
            <Card className="mt-6">
              <h2 className="mb-4 text-lg font-semibold text-navy-dark">
                {t("findingsTrend")}
              </h2>
              <FindingsTrend data={data.stats.trend} />
            </Card>
          )}

          {/* Recent audits */}
          <Card className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy-dark">
                {t("recentReports")}
              </h2>
              <Link href="/dashboard/reports">
                <Button variant="ghost" size="sm">
                  {t("viewAllReports")}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {data.recentAudits.map((audit) => (
                <Link
                  key={audit.id}
                  href={`/dashboard/reports/${audit.id}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-bg-cream/50 -mx-4 px-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-text-muted" />
                    <div>
                      <p className="font-medium text-navy-dark">
                        {audit.repoName}
                      </p>
                      <p className="text-xs text-text-muted">
                        {new Date(audit.date).toLocaleDateString("ja-JP")}
                        {" · "}
                        {audit.findingsCount} {t("findings")}
                        {audit.criticalCount > 0 && (
                          <span className="text-severity-critical">
                            {" "}
                            ({audit.criticalCount} {tStatus("CRITICAL")})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <AuditStatusBadge status={audit.status} />
                </Link>
              ))}
            </div>
          </Card>
        </>
      ) : (
        /* Empty state */
        <Card className="mt-8 text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
            <GitBranch className="h-8 w-8 text-gold" />
          </div>
          <h2 className="text-xl font-semibold text-navy-dark">
            {t("emptyTitle")}
          </h2>
          <p className="mt-2 text-text-muted">{t("emptyDescription")}</p>
          <Link href="/dashboard/repos" className="mt-6 inline-block">
            <Button>{t("addRepo")}</Button>
          </Link>
        </Card>
      )}

      {/* Quick actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/reports">
          <Card className="flex items-center justify-between group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-text-muted" />
              <span className="font-medium text-navy-dark">
                {t("viewAllReports")}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-gold transition-colors" />
          </Card>
        </Link>
        <Link href="/dashboard/billing">
          <Card className="flex items-center justify-between group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-text-muted" />
              <span className="font-medium text-navy-dark">
                {t("manageBilling")}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-gold transition-colors" />
          </Card>
        </Link>
      </div>
    </>
  );
}
