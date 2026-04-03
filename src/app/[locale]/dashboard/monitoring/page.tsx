"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import {
  Activity,
  ShieldAlert,
  Globe,
  Lock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ── Types ──────────────────────────────────────────

interface CheckResult {
  checkType: string;
  status: string;
  value: string | null;
  responseTimeMs: number | null;
  checkedAt: string;
}

interface RepoStatus {
  repoId: string;
  repoName: string;
  overallStatus: string;
  checks: CheckResult[];
}

interface TrendPoint {
  date: string;
  avgMs: number;
}

interface ResponseTrend {
  repoId: string;
  repoName: string;
  data: TrendPoint[];
}

interface AlertItem {
  id: string;
  repoName: string;
  checkType: string;
  severity: string;
  message: string;
  resolvedAt: string | null;
  createdAt: string;
}

interface MonitoringData {
  repos: RepoStatus[];
  responseTrend: ResponseTrend[];
  openAlerts: AlertItem[];
  alertHistory: AlertItem[];
  hasData: boolean;
}

// ── Helpers ────────────────────────────────────────

const CHECK_ICONS: Record<string, React.ElementType> = {
  uptime: Globe,
  ssl_expiry: Lock,
  security_headers: ShieldAlert,
  performance: Zap,
};

function StatusDot({ status }: { status: string }) {
  if (status === "OK")
    return <CheckCircle2 className="h-4 w-4 text-severity-good" />;
  if (status === "WARNING")
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <XCircle className="h-4 w-4 text-severity-critical" />;
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "OK"
      ? "bg-severity-good/10 text-severity-good"
      : status === "WARNING"
      ? "bg-amber-500/10 text-amber-600"
      : "bg-severity-critical/10 text-severity-critical";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

// ── Page ───────────────────────────────────────────

export default function MonitoringPage() {
  const t = useTranslations("dashboard.monitoring");
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/monitoring")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="mt-6 py-12 text-center">
        <p className="text-ink-muted">{t("error")}</p>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
          <p className="mt-1 text-ink-muted">{t("subtitle")}</p>
        </div>
        <Activity className="h-6 w-6 text-ink-muted/40" />
      </div>

      {!data.hasData ? (
        /* Empty state */
        <Card className="mt-8 py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-ink">{t("emptyTitle")}</h2>
          <p className="mt-2 text-sm text-ink-muted">{t("emptyDesc")}</p>
        </Card>
      ) : (
        <>
          {/* Open alerts banner */}
          {data.openAlerts.length > 0 && (
            <div className="mt-6 space-y-2">
              {data.openAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                    alert.severity === "CRITICAL"
                      ? "border-severity-critical/30 bg-severity-critical/10 text-severity-critical"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-700"
                  }`}
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <span className="font-medium">{alert.repoName}</span>
                    {" · "}
                    {t(`checkType.${alert.checkType}` as never) ?? alert.checkType}
                    {" — "}
                    {alert.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Per-repo status cards */}
          <div className="mt-6 space-y-4">
            {data.repos.map((repo) => (
              <Card key={repo.repoId}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusDot status={repo.overallStatus} />
                    <h2 className="font-semibold text-ink">{repo.repoName}</h2>
                  </div>
                  <StatusBadge status={repo.overallStatus} />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {repo.checks.map((check) => {
                    const Icon = CHECK_ICONS[check.checkType] ?? Activity;
                    return (
                      <div
                        key={check.checkType}
                        className="rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Icon className="h-4 w-4 text-ink-muted" />
                          <StatusBadge status={check.status} />
                        </div>
                        <p className="text-xs font-medium text-ink">
                          {t(`checkType.${check.checkType}` as never) ?? check.checkType}
                        </p>
                        {check.value && (
                          <p className="mt-0.5 text-xs text-ink-muted truncate" title={check.value}>
                            {check.value}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] text-ink-muted/60">
                          {new Date(check.checkedAt).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          {/* Response time chart */}
          {data.responseTrend.some((r) => r.data.length > 1) && (
            <Card className="mt-6">
              <h2 className="mb-4 text-lg font-semibold text-ink">
                {t("responseTrend")}
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    unit="ms"
                    tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                  />
                  <Tooltip
                    formatter={(val) => [`${val}ms`, t("responseTime")]}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                    }}
                  />
                  {data.responseTrend.map((repo, i) => (
                    <Line
                      key={repo.repoId}
                      data={repo.data}
                      dataKey="avgMs"
                      name={repo.repoName}
                      stroke={i === 0 ? "var(--color-primary)" : "#6366f1"}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Alert history */}
          {data.alertHistory.length > 0 && (
            <Card className="mt-6">
              <h2 className="mb-4 text-lg font-semibold text-ink">
                {t("alertHistory")}
              </h2>
              <div className="divide-y divide-border">
                {data.alertHistory.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="mt-0.5 shrink-0">
                      {alert.resolvedAt ? (
                        <CheckCircle2 className="h-4 w-4 text-severity-good" />
                      ) : alert.severity === "CRITICAL" ? (
                        <XCircle className="h-4 w-4 text-severity-critical" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-ink">{alert.repoName}</span>
                        <span className="text-xs text-ink-muted">
                          {t(`checkType.${alert.checkType}` as never) ?? alert.checkType}
                        </span>
                        <StatusBadge status={alert.severity} />
                      </div>
                      <p className="mt-0.5 text-xs text-ink-muted">{alert.message}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-ink-muted">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </p>
                      {alert.resolvedAt && (
                        <p className="text-xs text-severity-good">
                          {t("resolved")} {new Date(alert.resolvedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </>
  );
}
