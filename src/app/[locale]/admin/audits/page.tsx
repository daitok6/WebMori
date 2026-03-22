"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, ExternalLink } from "lucide-react";

interface AuditRow {
  id: string;
  repoName: string;
  repoUrl: string;
  orgName: string;
  status: string;
  findingsCount: number;
  createdAt: string;
}

const statusVariant: Record<string, "default" | "medium" | "low" | "good" | "growth"> = {
  SCHEDULED: "default",
  IN_PROGRESS: "medium",
  REVIEW: "low",
  DELIVERED: "growth",
  COMPLETED: "good",
};

export default function AdminAuditsPage() {
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/admin/audits")
      .then((r) => (r.ok ? r.json() : []))
      .then(setAudits)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? audits : audits.filter((a) => a.status === filter);
  const statuses = ["ALL", "SCHEDULED", "IN_PROGRESS", "REVIEW", "DELIVERED", "COMPLETED"];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Audit Management</h1>
      <p className="mt-1 text-sm text-ink-muted">{audits.length} total audits</p>

      {/* Filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === s
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-border bg-white text-ink-muted hover:border-ink"
            }`}
          >
            {s === "ALL" ? "All" : s.replace("_", " ")}
            {s !== "ALL" && (
              <span className="ml-1.5 opacity-60">
                {audits.filter((a) => a.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-6 py-12 text-center">
          <BarChart3 className="mx-auto mb-3 h-8 w-8 text-ink-muted" />
          <p className="text-ink-muted">No audits found</p>
        </Card>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 font-medium text-ink-muted">Organization</th>
                <th className="pb-2 font-medium text-ink-muted">Repository</th>
                <th className="pb-2 font-medium text-ink-muted">Status</th>
                <th className="pb-2 font-medium text-ink-muted">Findings</th>
                <th className="pb-2 font-medium text-ink-muted">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((audit) => (
                <tr key={audit.id}>
                  <td className="py-3 text-ink font-medium">{audit.orgName}</td>
                  <td className="py-3">
                    <a
                      href={audit.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-ink hover:text-primary transition-colors"
                    >
                      {audit.repoName}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="py-3">
                    <Badge variant={statusVariant[audit.status] ?? "default"}>
                      {audit.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="py-3 text-ink-muted">{audit.findingsCount}</td>
                  <td className="py-3 text-ink-muted">
                    {new Date(audit.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
