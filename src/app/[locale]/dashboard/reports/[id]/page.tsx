"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { AuditStatusBadge } from "@/components/dashboard/audit-status-badge";
import {
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";

interface Finding {
  id: string;
  title: string;
  severity: string;
  evidence: string;
  impact: string;
  fix: string;
  effort: string;
  prUrl: string | null;
}

interface AuditDetail {
  id: string;
  repoName: string;
  repoUrl: string;
  status: string;
  date: string;
  reportPdfUrl: string | null;
  findingsPdfUrl: string | null;
  prLinks: string[];
  findings: Finding[];
}

const severityVariant: Record<string, "critical" | "high" | "medium" | "low"> =
  {
    CRITICAL: "critical",
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
  };

export default function ReportDetailPage() {
  const t = useTranslations("dashboard.reportDetail");
  const tNav = useTranslations("dashboard.nav");
  const tSev = useTranslations("dashboard.severity");
  const tEff = useTranslations("dashboard.effort");
  const params = useParams();
  const [audit, setAudit] = useState<AuditDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard/reports/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setAudit)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (!audit) {
    return (
      <Card className="mt-6 text-center py-12">
        <FileText className="mx-auto mb-4 h-10 w-10 text-ink-muted" />
        <p className="font-medium text-ink">{t("notFound")}</p>
        <p className="mt-1 text-sm text-ink-muted">{t("notFoundDesc")}</p>
        <Link href="/dashboard/reports" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            {t("backToReports")}
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-ink-muted">
        <Link href="/dashboard" className="hover:text-ink transition-colors">
          {tNav("overview")}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/dashboard/reports" className="hover:text-ink transition-colors">
          {tNav("reports")}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink font-medium truncate max-w-[200px]">
          {audit?.repoName ?? "..."}
        </span>
      </nav>

      {/* Header */}
      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {audit.repoName}
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm text-ink-muted">
              {new Date(audit.date).toLocaleDateString("ja-JP")}
            </span>
            <AuditStatusBadge status={audit.status} />
          </div>
        </div>

        <div className="flex gap-2">
          {audit.reportPdfUrl ? (
            <a href={`/api/dashboard/reports/${audit.id}/pdf`}>
              <Button variant="primary" size="sm">
                <Download className="mr-1.5 h-4 w-4" />
                {t("downloadReport")}
              </Button>
            </a>
          ) : (
            <Button variant="secondary" size="sm" disabled>
              {t("noPdf")}
            </Button>
          )}
          {audit.findingsPdfUrl && (
            <a href={`/api/dashboard/reports/${audit.id}/pdf?type=findings`}>
              <Button variant="ghost" size="sm">
                <Download className="mr-1.5 h-4 w-4" />
                {t("downloadFindings")}
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Summary card */}
      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-ink mb-3">
          {t("summary")}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => {
            const count = audit.findings.filter(
              (f) => f.severity === sev,
            ).length;
            return (
              <div key={sev} className="text-center">
                <Badge variant={severityVariant[sev]}>{sev}</Badge>
                <p className="mt-1 text-2xl font-bold text-ink">
                  {count}
                </p>
              </div>
            );
          })}
        </div>

        {/* PR links */}
        {audit.prLinks.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-medium text-ink mb-2">
              Pull Requests
            </p>
            <div className="flex flex-wrap gap-2">
              {audit.prLinks.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  PR-{i + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Findings list */}
      <h2 className="mt-8 text-lg font-semibold text-ink">
        {t("findings")} ({audit.findings.length})
      </h2>

      <div className="mt-4 space-y-4">
        {audit.findings.map((finding) => (
          <Card key={finding.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={severityVariant[finding.severity]}>
                  {tSev.has(finding.severity) ? tSev(finding.severity) : finding.severity}
                </Badge>
                <h3 className="font-semibold text-ink">
                  {finding.title}
                </h3>
              </div>
              <span className="text-xs text-ink-muted">
                {tEff.has(finding.effort) ? tEff(finding.effort) : finding.effort}
              </span>
            </div>

            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="font-medium text-ink-muted">{t("evidence")}</p>
                <pre className="mt-1 overflow-x-auto rounded bg-surface-raised p-2 text-xs text-ink">
                  {finding.evidence}
                </pre>
              </div>
              <div>
                <p className="font-medium text-ink-muted">{t("impact")}</p>
                <p className="mt-1 text-ink">{finding.impact}</p>
              </div>
              <div>
                <p className="font-medium text-ink-muted">{t("fix")}</p>
                <p className="mt-1 text-ink">{finding.fix}</p>
              </div>

              {finding.prUrl && (
                <a
                  href={finding.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  {t("prLink")}
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
