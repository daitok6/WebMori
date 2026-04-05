"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { ReviewDetailPanel } from "./review-detail-panel";
import {
  Loader2,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  Timer,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star,
  Copy,
  Check,
} from "lucide-react";

type Finding = {
  id: string;
  title: string;
  severity: string;
  effort: string;
  evidence: string | null;
  impact: string | null;
  fix: string | null;
  safeAutoFix: boolean;
  prUrl: string | null;
};

type ReviewAudit = {
  id: string;
  orgName: string;
  repoName: string;
  repoUrl: string;
  reportCode: string | null;
  isWelcome: boolean;
  auditDepth: string | null;
  reportPdfUrl: string | null;
  findingsPdfUrl: string | null;
  reportMdKey: string | null;
  prLinks: string[];
  scheduledAt: string | null;
  updatedAt: string;
  findings: Finding[];
};

type Stats = {
  reviewCount: number;
  approvedToday: number;
  avgReviewHours: number | null;
};

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-red-700 bg-red-50 border-red-200",
  HIGH: "text-orange-700 bg-orange-50 border-orange-200",
  MEDIUM: "text-amber-700 bg-amber-50 border-amber-200",
  LOW: "text-blue-700 bg-blue-50 border-blue-200",
};

function SeveritySummary({ findings }: { findings: Finding[] }) {
  const counts: Record<string, number> = {};
  for (const f of findings) {
    counts[f.severity] = (counts[f.severity] ?? 0) + 1;
  }
  const sorted = Object.entries(counts).sort(
    ([a], [b]) => (SEVERITY_ORDER[a] ?? 9) - (SEVERITY_ORDER[b] ?? 9),
  );
  return (
    <div className="flex gap-1 flex-wrap">
      {sorted.map(([sev, count]) => (
        <span
          key={sev}
          className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold ${SEVERITY_COLORS[sev] ?? ""}`}
        >
          {count}{sev[0]}
        </span>
      ))}
      {sorted.length === 0 && <span className="text-xs text-ink-muted">—</span>}
    </div>
  );
}

function humanizeAge(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const hours = diffMs / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(hours * 60)}m ago`;
  if (hours < 24) return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function CopyIdButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(id).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1 font-mono text-[10px] text-ink-muted hover:text-ink transition-colors"
      title="Copy audit ID"
    >
      <span className="truncate max-w-[100px]">{id}</span>
      {copied ? <Check className="h-2.5 w-2.5 text-green-600 shrink-0" /> : <Copy className="h-2.5 w-2.5 shrink-0" />}
    </button>
  );
}

export function ReviewQueue() {
  const [queue, setQueue] = useState<ReviewAudit[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchQueue = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/reviews")
      .then((r) => (r.ok ? r.json() : { queue: [], stats: null }))
      .then(({ queue, stats }) => {
        setQueue(queue);
        setStats(stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  function handleAction() {
    setExpandedId(null);
    fetchQueue();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <ClipboardCheck className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-ink">{stats?.reviewCount ?? 0}</p>
            <p className="text-xs text-ink-muted">In Review</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-ink">{stats?.approvedToday ?? 0}</p>
            <p className="text-xs text-ink-muted">Approved Today</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <Timer className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-ink">
              {stats?.avgReviewHours != null ? `${stats.avgReviewHours}h` : "—"}
            </p>
            <p className="text-xs text-ink-muted">Avg Review Time</p>
          </div>
        </Card>
      </div>

      {/* Queue table */}
      {queue.length === 0 ? (
        <Card className="text-center py-16">
          <CheckCircle2 className="mx-auto h-10 w-10 text-green-500 mb-3" />
          <p className="text-base font-semibold text-ink mb-1">All clear</p>
          <p className="text-sm text-ink-muted mb-4">No audits awaiting review.</p>
          <Link href="/admin/audits" className="text-sm text-primary hover:underline">
            View audit calendar →
          </Link>
        </Card>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-800 text-white">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Client</th>
                <th className="text-left px-4 py-3 font-medium">Repo</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Report Code</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Findings</th>
                <th className="text-left px-4 py-3 font-medium">
                  <Clock className="h-4 w-4" />
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {queue.map((audit) => {
                const expanded = expandedId === audit.id;
                return (
                  <>
                    <tr
                      key={audit.id}
                      className={`border-b border-border transition-colors ${
                        expanded ? "bg-surface-raised" : "hover:bg-surface-raised/50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-ink">{audit.orgName}</span>
                          {audit.isWelcome && (
                            <Star className="h-3 w-3 text-primary shrink-0" />
                          )}
                        </div>
                        {audit.auditDepth && (
                          <span className="text-xs text-ink-muted capitalize">{audit.auditDepth}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={audit.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-ink hover:text-primary transition-colors"
                        >
                          <span className="truncate max-w-[140px]">{audit.repoName}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 text-ink-muted" />
                        </a>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {audit.reportCode ? (
                          <span className="font-mono text-xs text-ink">{audit.reportCode}</span>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                        <div className="mt-0.5">
                          <CopyIdButton id={audit.id} />
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <SeveritySummary findings={audit.findings} />
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-muted whitespace-nowrap">
                        {humanizeAge(audit.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpandedId(expanded ? null : audit.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-surface-raised transition-colors"
                        >
                          Review
                          {expanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr key={`${audit.id}-panel`}>
                        <td colSpan={6} className="p-0">
                          <ReviewDetailPanel audit={audit} onAction={handleAction} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
