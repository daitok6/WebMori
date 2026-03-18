"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { AuditStatusBadge } from "@/components/dashboard/audit-status-badge";
import { FileText, Download, ArrowRight, Loader2 } from "lucide-react";

interface AuditSummary {
  id: string;
  repoName: string;
  status: string;
  date: string;
  findingsCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  hasPdf: boolean;
  prCount: number;
}

interface FreeEvalReport {
  id: string;
  siteUrl: string | null;
  date: string;
}

export default function ReportsPage() {
  const t = useTranslations("dashboard.reports");
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [freeEvals, setFreeEvals] = useState<FreeEvalReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/reports")
        .then((r) => (r.ok ? r.json() : []))
        .then(setAudits),
      fetch("/api/dashboard/reports/free-evals")
        .then((r) => (r.ok ? r.json() : []))
        .then(setFreeEvals),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-navy-dark">{t("title")}</h1>

      {freeEvals.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-navy-dark mb-3">無料診断レポート</h2>
          <div className="space-y-3">
            {freeEvals.map((r) => (
              <Card key={r.id} className="border-l-4 border-l-gold">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">無料診断</Badge>
                      {r.siteUrl && (
                        <span className="text-sm text-text-muted">{r.siteUrl}</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      {new Date(r.date).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <a href={`/api/dashboard/reports/free-evals/${r.id}/pdf`}>
                    <Button variant="secondary" size="sm">
                      <Download className="mr-1 h-4 w-4" />
                      PDF
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {audits.length === 0 && freeEvals.length === 0 ? (
        <Card className="mt-6 text-center py-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bg-cream">
            <FileText className="h-7 w-7 text-text-muted" />
          </div>
          <p className="font-medium text-navy-dark">{t("noReports")}</p>
          <p className="mt-1 text-sm text-text-muted">{t("noReportsDesc")}</p>
        </Card>
      ) : audits.length > 0 ? (
        <>
          {(audits.length > 0 || freeEvals.length > 0) && (
            <h2 className="text-lg font-semibold text-navy-dark mt-6 mb-3">監査レポート</h2>
          )}
        <div className="mt-0 space-y-4">
          {audits.map((audit) => (
            <Card key={audit.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-navy-dark">
                      {audit.repoName}
                    </h3>
                    <AuditStatusBadge status={audit.status} />
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {new Date(audit.date).toLocaleDateString("ja-JP")}
                  </p>

                  {/* Severity breakdown */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {audit.criticalCount > 0 && (
                      <Badge variant="critical">
                        Critical: {audit.criticalCount}
                      </Badge>
                    )}
                    {audit.highCount > 0 && (
                      <Badge variant="high">High: {audit.highCount}</Badge>
                    )}
                    {audit.mediumCount > 0 && (
                      <Badge variant="medium">
                        Medium: {audit.mediumCount}
                      </Badge>
                    )}
                    {audit.lowCount > 0 && (
                      <Badge variant="low">Low: {audit.lowCount}</Badge>
                    )}
                    {audit.findingsCount === 0 && (
                      <Badge variant="good">No issues</Badge>
                    )}
                    {audit.prCount > 0 && (
                      <span className="text-xs text-text-muted">
                        {audit.prCount} {t("prLinks")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {audit.hasPdf && (
                    <a href={`/api/dashboard/reports/${audit.id}/pdf`}>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  <Link href={`/dashboard/reports/${audit.id}`}>
                    <Button variant="secondary" size="sm">
                      {t("viewDetails")}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
        </>
      ) : null}
    </>
  );
}
