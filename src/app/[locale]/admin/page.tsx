"use client";

import { useEffect, useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, TrendingUp, Users, CheckCircle2, Star, AlertTriangle,
  Play, ClipboardCheck, MessageSquare, Mail, Zap, Terminal,
} from "lucide-react";

interface PendingAudit {
  id: string;
  orgName: string;
  repoName: string;
  repoUrl: string;
  isRepoless: boolean;
  plan: string;
  userEmail: string;
  scheduledAt: string | null;
  isStale: boolean;
}

interface FailedAudit {
  id: string;
  orgName: string;
  repoName: string;
  failureReason: string | null;
}

interface UnreadMessage {
  orgId: string;
  orgName: string;
  count: number;
}

interface ActiveAlert {
  id: string;
  orgName: string;
  repoName: string;
  checkType: string;
  severity: string;
  message: string;
  createdAt: string;
}

interface UpcomingAudit {
  id: string;
  orgName: string;
  repoName: string;
  scheduledAt: string | null;
  isWelcome: boolean;
}

interface DashboardData {
  kpis: {
    mrr: number;
    activeClients: number;
    pastDueSubs: number;
    avgCsat: number | null;
    deliveredToday: number;
  };
  tasks: {
    pendingAudits: PendingAudit[];
    reviewCount: number;
    failedAudits: FailedAudit[];
    unreadMessages: UnreadMessage[];
    pendingContacts: number;
    activeAlerts: ActiveAlert[];
  };
  upcoming: UpcomingAudit[];
  timestamp: string;
}

const planVariant: Record<string, "starter" | "growth" | "pro"> = {
  STARTER: "starter",
  GROWTH: "growth",
  PRO: "pro",
};

const checkTypeLabel: Record<string, string> = {
  uptime: "Uptime",
  ssl_expiry: "SSL",
  security_headers: "Security Headers",
  performance: "Performance",
};

function totalTaskCount(tasks: DashboardData["tasks"]) {
  return (
    tasks.pendingAudits.length +
    tasks.failedAudits.length +
    tasks.reviewCount +
    tasks.unreadMessages.length +
    tasks.pendingContacts +
    tasks.activeAlerts.length
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  function copyAuditCommand(audit: PendingAudit) {
    const cmd = audit.userEmail
      ? `/audit ${audit.userEmail} --auditId=${audit.id}`
      : `/audit --auditId=${audit.id}`;
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedId(audit.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (!data) return <p className="text-ink-muted">Failed to load dashboard.</p>;

  const { kpis, tasks, upcoming } = data;
  const taskCount = totalTaskCount(tasks);

  // Group upcoming by date
  const upcomingByDate = new Map<string, UpcomingAudit[]>();
  for (const a of upcoming) {
    if (!a.scheduledAt) continue;
    const dateKey = new Date(a.scheduledAt).toLocaleDateString("ja-JP", {
      month: "long", day: "numeric", weekday: "short",
    });
    const arr = upcomingByDate.get(dateKey) ?? [];
    arr.push(a);
    upcomingByDate.set(dateKey, arr);
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{today}</p>
        </div>
        <p className="text-xs text-ink-muted mt-1">
          Updated {new Date(data.timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink-muted">MRR</p>
              <p className="text-lg font-bold text-ink">¥{kpis.mrr.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
              <Users className="h-4 w-4 text-green-700" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink-muted">Active Clients</p>
              <p className="text-lg font-bold text-ink">{kpis.activeClients}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-4 w-4 text-green-700" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink-muted">Delivered Today</p>
              <p className="text-lg font-bold text-ink">{kpis.deliveredToday}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Star className="h-4 w-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink-muted">CSAT (90d)</p>
              <p className="text-lg font-bold text-ink">
                {kpis.avgCsat !== null ? `${kpis.avgCsat} / 5` : "—"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${kpis.pastDueSubs > 0 ? "bg-red-100" : "bg-surface-raised"}`}>
              <AlertTriangle className={`h-4 w-4 ${kpis.pastDueSubs > 0 ? "text-red-600" : "text-ink-muted"}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink-muted">Past Due</p>
              <p className={`text-lg font-bold ${kpis.pastDueSubs > 0 ? "text-red-600" : "text-ink"}`}>
                {kpis.pastDueSubs}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card className="mt-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">Today&apos;s Tasks</h2>
          {taskCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-ink">
              {taskCount}
            </span>
          ) : null}
        </div>

        {taskCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
            <p className="font-medium text-ink">All clear</p>
            <p className="text-sm text-ink-muted mt-0.5">Nothing to do right now</p>
          </div>
        ) : (
          <div className="divide-y divide-border -mx-6 -mb-6">

            {/* Audits to run */}
            {tasks.pendingAudits.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-6 py-3 hover:bg-surface-raised transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Play className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-ink">{a.orgName}</span>
                    <span className="text-xs text-ink-muted">{a.repoName}</span>
                    <Badge variant={planVariant[a.plan] ?? "default"}>{a.plan}</Badge>
                    {a.isStale && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 font-medium">
                        Stale
                      </span>
                    )}
                  </div>
                  {a.scheduledAt && (
                    <p className="text-xs text-ink-muted mt-0.5">
                      Scheduled {new Date(a.scheduledAt).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => copyAuditCommand(a)}
                  title={`/audit ${a.userEmail} --auditId=${a.id}`}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-muted hover:border-primary hover:text-primary transition-colors"
                >
                  {copiedId === a.id ? (
                    <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /><span className="text-green-600">Copied</span></>
                  ) : (
                    <><Terminal className="h-3.5 w-3.5" />Copy command</>
                  )}
                </button>
              </div>
            ))}

            {/* Failed audits */}
            {tasks.failedAudits.map((a) => (
              <Link key={a.id} href="/admin/audits" className="flex items-center gap-3 px-6 py-3 hover:bg-surface-raised transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-ink">{a.orgName}</span>
                    <span className="text-xs text-ink-muted">{a.repoName}</span>
                    <Badge variant="critical">FAILED</Badge>
                  </div>
                  {a.failureReason && (
                    <p className="text-xs text-ink-muted mt-0.5 truncate max-w-sm">{a.failureReason}</p>
                  )}
                </div>
              </Link>
            ))}

            {/* Reports to review */}
            {tasks.reviewCount > 0 && (
              <Link href="/admin/reviews" className="flex items-center gap-3 px-6 py-3 hover:bg-surface-raised transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <ClipboardCheck className="h-3.5 w-3.5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-ink">
                    {tasks.reviewCount} {tasks.reviewCount === 1 ? "report" : "reports"} awaiting review
                  </span>
                </div>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-200 px-1.5 text-xs font-semibold text-amber-800">
                  {tasks.reviewCount}
                </span>
              </Link>
            )}

            {/* Unread messages */}
            {tasks.unreadMessages.map((m) => (
              <Link key={m.orgId} href={`/admin/messages?orgId=${m.orgId}`} className="flex items-center gap-3 px-6 py-3 hover:bg-surface-raised transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-ink">{m.orgName}</span>
                  <span className="text-xs text-ink-muted ml-2">{m.count} unread</span>
                </div>
              </Link>
            ))}

            {/* Pending contacts */}
            {tasks.pendingContacts > 0 && (
              <Link href="/admin/contacts" className="flex items-center gap-3 px-6 py-3 hover:bg-surface-raised transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised">
                  <Mail className="h-3.5 w-3.5 text-ink-muted" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-ink">
                    {tasks.pendingContacts} pending contact {tasks.pendingContacts === 1 ? "request" : "requests"}
                  </span>
                </div>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-200 px-1.5 text-xs font-semibold text-ink">
                  {tasks.pendingContacts}
                </span>
              </Link>
            )}

            {/* Active alerts */}
            {tasks.activeAlerts.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-6 py-3 hover:bg-surface-raised transition-colors">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${a.severity === "CRITICAL" ? "bg-red-100" : "bg-amber-100"}`}>
                  <Zap className={`h-3.5 w-3.5 ${a.severity === "CRITICAL" ? "text-red-600" : "text-amber-700"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-ink">{a.orgName}</span>
                    <span className="text-xs text-ink-muted">{checkTypeLabel[a.checkType] ?? a.checkType}</span>
                    <Badge variant={a.severity === "CRITICAL" ? "critical" : "high"}>{a.severity}</Badge>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5 truncate max-w-sm">{a.message}</p>
                </div>
              </div>
            ))}

          </div>
        )}
      </Card>

      {/* Upcoming Audits */}
      <Card className="mt-4">
        <h2 className="text-base font-semibold text-ink mb-4">Upcoming Audits (Next 7 Days)</h2>

        {upcomingByDate.size === 0 ? (
          <p className="text-sm text-ink-muted py-4 text-center">No scheduled audits in the next 7 days.</p>
        ) : (
          <div className="space-y-4">
            {Array.from(upcomingByDate.entries()).map(([date, audits]) => (
              <div key={date}>
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">{date}</p>
                <div className="space-y-1.5">
                  {audits.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-ink">{a.orgName}</span>
                      <span className="text-ink-muted">—</span>
                      <span className="text-ink-muted">{a.repoName}</span>
                      {a.isWelcome && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                          Welcome
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
