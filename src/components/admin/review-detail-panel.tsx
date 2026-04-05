"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReasonPromptDialog } from "./reason-prompt-dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ExternalLink,
  GitPullRequest,
  FileText,
  Loader2,
  Shield,
} from "lucide-react";

const SEVERITY_ORDER: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const severityVariant: Record<string, "default" | "critical" | "high" | "medium" | "low"> = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

const effortLabel: Record<string, string> = {
  QUICK_WIN: "Quick Win",
  MODERATE: "Moderate",
  LARGE: "Large",
};

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
  reportPdfUrl: string | null;
  findingsPdfUrl: string | null;
  reportMdKey: string | null;
  prLinks: string[];
  findings: Finding[];
};

type ActiveDialog = "revision" | "reject" | null;
type ActiveTab = "findings" | "report";

export function ReviewDetailPanel({
  audit,
  onAction,
}: {
  audit: ReviewAudit;
  onAction: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("findings");
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [updating, setUpdating] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [mdLoading, setMdLoading] = useState(false);
  const [mdError, setMdError] = useState<"no-key" | "fetch-failed" | null>(null);

  const sortedFindings = [...audit.findings].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9),
  );

  useEffect(() => {
    if (activeTab !== "report" || markdown !== null || mdError !== null) return;

    if (!audit.reportMdKey) {
      setMdError("no-key");
      return;
    }

    setMdLoading(true);
    fetch(`/api/admin/audits/${audit.id}/markdown`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.text();
      })
      .then((text) => setMarkdown(text))
      .catch(() => setMdError("fetch-failed"))
      .finally(() => setMdLoading(false));
  }, [activeTab, audit.id, audit.reportMdKey, markdown, mdError]);

  async function updateStatus(newStatus: string, failureReason?: string) {
    setUpdating(true);
    setActiveDialog(null);
    try {
      await fetch(`/api/admin/audits/${audit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...(failureReason ? { failureReason } : {}) }),
      });
      onAction();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="border-t border-border bg-surface-raised">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("findings")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "findings"
              ? "border-b-2 border-primary text-primary"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Findings ({audit.findings.length})
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "report"
              ? "border-b-2 border-primary text-primary"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Report Preview
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Findings tab */}
        {activeTab === "findings" && (
          <>
            {sortedFindings.length === 0 ? (
              <p className="text-sm text-ink-muted">No findings recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-medium text-ink-muted">Finding</th>
                      <th className="text-left py-2 pr-4 font-medium text-ink-muted">Severity</th>
                      <th className="text-left py-2 pr-4 font-medium text-ink-muted">Effort</th>
                      <th className="text-left py-2 font-medium text-ink-muted">Auto-fix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFindings.map((f) => (
                      <tr key={f.id} className="border-b border-border/50 hover:bg-surface transition-colors">
                        <td className="py-2.5 pr-4">
                          <p className="font-medium text-ink">{f.title}</p>
                          {f.evidence && (
                            <p className="text-xs text-ink-muted mt-0.5 font-mono truncate max-w-xs">
                              {f.evidence.slice(0, 80)}{f.evidence.length > 80 ? "…" : ""}
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge variant={severityVariant[f.severity] ?? "default"}>
                            {f.severity}
                          </Badge>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="text-xs text-ink-muted">
                            {effortLabel[f.effort] ?? f.effort}
                          </span>
                        </td>
                        <td className="py-2.5">
                          {f.safeAutoFix ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700">
                              <Shield className="h-3 w-3" /> Safe
                            </span>
                          ) : (
                            <span className="text-xs text-ink-muted">Manual</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Report preview tab */}
        {activeTab === "report" && (
          <div>
            {mdLoading && (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-5 w-5 animate-spin text-ink-muted" />
              </div>
            )}
            {!mdLoading && markdown && (
              <div className="prose prose-sm max-w-none text-ink prose-headings:text-ink prose-code:text-primary prose-a:text-primary max-h-96 overflow-y-auto rounded-lg border border-border p-4 bg-surface">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
              </div>
            )}
            {!mdLoading && mdError && (
              <div className="space-y-3">
                <p className="text-sm text-ink-muted">
                  {mdError === "no-key"
                    ? "Markdown source was not uploaded for this audit. Open the PDF to review."
                    : "Could not load markdown from storage. Open the PDF to review."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {audit.reportPdfUrl && (
                    <a
                      href={`/api/admin/audits/${audit.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Open Report PDF
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                  {audit.findingsPdfUrl && (
                    <a
                      href={`/api/admin/audits/${audit.id}/pdf?type=findings`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface-raised transition-colors"
                    >
                      <FileText className="h-4 w-4 text-ink-muted" />
                      Open Findings PDF
                      <ExternalLink className="ml-1 h-3 w-3 text-ink-muted" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PDF + PR links */}
        <div className="flex flex-wrap gap-2 pt-1">
          {audit.reportPdfUrl && (
            <a
              href={`/api/admin/audits/${audit.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-ink hover:bg-surface transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              Report PDF
              <ExternalLink className="h-3 w-3 text-ink-muted" />
            </a>
          )}
          {audit.findingsPdfUrl && (
            <a
              href={`/api/admin/audits/${audit.id}/pdf?type=findings`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-ink hover:bg-surface transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-ink-muted" />
              Findings PDF
              <ExternalLink className="h-3 w-3 text-ink-muted" />
            </a>
          )}
          {audit.prLinks.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-ink hover:bg-surface transition-colors"
            >
              <GitPullRequest className="h-3.5 w-3.5 text-green-600" />
              {url.split("/").slice(-2).join("/")}
              <ExternalLink className="h-3 w-3 text-ink-muted" />
            </a>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button
            size="sm"
            onClick={() => updateStatus("DELIVERED")}
            loading={updating}
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Approve & Deliver
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveDialog("revision")}
            disabled={updating}
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Request Revision
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setActiveDialog("reject")}
            disabled={updating}
          >
            <XCircle className="mr-1.5 h-4 w-4" />
            Reject
          </Button>
        </div>
      </div>

      {activeDialog === "revision" && (
        <ReasonPromptDialog
          title="Revision Request"
          description="Describe what needs to be changed. This will be stored as the revision reason."
          placeholder="例: M-3の対応目安が不正確です。再確認してください。"
          confirmLabel="Send Back for Revision"
          confirmVariant="outline"
          onConfirm={(reason) => updateStatus("IN_PROGRESS", reason)}
          onCancel={() => setActiveDialog(null)}
        />
      )}

      {activeDialog === "reject" && (
        <ReasonPromptDialog
          title="Reject Audit"
          description="Provide a reason for rejection. The audit will move to FAILED status."
          placeholder="例: 重大な問題の証拠が不足しています。"
          confirmLabel="Reject"
          confirmVariant="danger"
          onConfirm={(reason) => updateStatus("FAILED", reason)}
          onCancel={() => setActiveDialog(null)}
        />
      )}
    </div>
  );
}
