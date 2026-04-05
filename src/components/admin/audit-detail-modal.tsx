"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReasonPromptDialog } from "./reason-prompt-dialog";
import { ReplacePdfButton } from "./replace-pdf-button";
import type { AuditRow } from "./audit-calendar";
import {
  X,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  FileText,
  GitPullRequest,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";

type ActiveDialog = "revision" | "reject" | null;

const statusVariant: Record<string, "default" | "medium" | "low" | "good" | "growth"> = {
  SCHEDULED: "default",
  IN_PROGRESS: "medium",
  REVIEW: "low",
  DELIVERED: "growth",
  COMPLETED: "good",
  FAILED: "default",
};

export function AuditDetailModal({
  audit,
  onClose,
  onStatusChange,
}: {
  audit: AuditRow;
  onClose: () => void;
  onStatusChange: () => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [copied, setCopied] = useState(false);

  function copyId() {
    navigator.clipboard.writeText(audit.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  async function updateStatus(newStatus: string, failureReason?: string) {
    setUpdating(true);
    setActiveDialog(null);
    try {
      const res = await fetch(`/api/admin/audits/${audit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...(failureReason ? { failureReason } : {}) }),
      });
      if (res.ok) {
        onStatusChange();
      }
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-muted hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-ink">{audit.orgName}</h2>
            {audit.isWelcome && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Star className="h-3 w-3" />
                Welcome
              </span>
            )}
          </div>
          <a
            href={audit.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary transition-colors"
          >
            {audit.repoName}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Status</span>
            <Badge variant={statusVariant[audit.status] ?? "default"}>
              {audit.status.replace("_", " ")}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span className="text-ink-muted">Findings</span>
            <span className="font-medium text-ink">{audit.findingsCount}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Audit ID</span>
            <button
              onClick={copyId}
              className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-0.5 font-mono text-xs text-ink hover:bg-surface-raised transition-colors"
              title="Copy audit ID"
            >
              <span className="truncate max-w-[160px]">{audit.id}</span>
              {copied ? (
                <Check className="h-3 w-3 text-green-600 shrink-0" />
              ) : (
                <Copy className="h-3 w-3 text-ink-muted shrink-0" />
              )}
            </button>
          </div>

          {audit.reportCode && (
            <div className="flex justify-between">
              <span className="text-ink-muted">Report Code</span>
              <span className="font-mono text-xs font-medium text-ink">{audit.reportCode}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-ink-muted">Depth</span>
            <span className="font-medium text-ink capitalize">{audit.auditDepth ?? "standard"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-ink-muted">Scheduled</span>
            <span className="text-ink">
              {audit.scheduledAt
                ? new Date(audit.scheduledAt).toLocaleDateString("ja-JP")
                : "—"}
            </span>
          </div>

          {audit.deliveredAt && (
            <div className="flex justify-between">
              <span className="text-ink-muted">Delivered</span>
              <span className="text-ink">
                {new Date(audit.deliveredAt).toLocaleDateString("ja-JP")}
              </span>
            </div>
          )}

          {audit.failureReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-medium text-red-700 mb-1">Failure Reason</p>
              <p className="text-xs text-red-600">{audit.failureReason}</p>
            </div>
          )}
        </div>

        {/* Report & PR links */}
        {(audit.reportPdfUrl || audit.findingsPdfUrl || audit.prLinks.length > 0) && (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <ReplacePdfButton auditId={audit.id} />
            {audit.reportPdfUrl && (
              <a
                href={`/api/admin/audits/${audit.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-ink hover:bg-surface-raised transition-colors"
              >
                <FileText className="h-4 w-4 text-primary" />
                View Report PDF
                <ExternalLink className="ml-auto h-3 w-3 text-ink-muted" />
              </a>
            )}
            {audit.findingsPdfUrl && (
              <a
                href={`/api/admin/audits/${audit.id}/pdf?type=findings`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-ink hover:bg-surface-raised transition-colors"
              >
                <FileText className="h-4 w-4 text-ink-muted" />
                View Findings PDF
                <ExternalLink className="ml-auto h-3 w-3 text-ink-muted" />
              </a>
            )}
            {audit.prLinks.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-ink-muted">Pull Requests</p>
                {audit.prLinks.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-ink hover:bg-surface-raised transition-colors"
                  >
                    <GitPullRequest className="h-4 w-4 text-green-600" />
                    <span className="truncate">{url.split("/").slice(-2).join("/")}</span>
                    <ExternalLink className="ml-auto h-3 w-3 text-ink-muted" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-2 border-t border-border pt-4">
          {audit.status === "REVIEW" && (
            <>
              <Button
                size="sm"
                onClick={() => updateStatus("DELIVERED")}
                loading={updating}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve & Deliver
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveDialog("revision")}
                disabled={updating}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Request Revision
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setActiveDialog("reject")}
                disabled={updating}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}

          {audit.status === "SCHEDULED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus("IN_PROGRESS")}
              loading={updating}
            >
              <Clock className="mr-2 h-4 w-4" />
              Start Audit
            </Button>
          )}

          {audit.status === "IN_PROGRESS" && (
            <Button
              size="sm"
              onClick={() => updateStatus("REVIEW")}
              loading={updating}
            >
              Mark as Ready for Review
            </Button>
          )}

          {audit.status === "DELIVERED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus("COMPLETED")}
              loading={updating}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          )}

          {audit.status === "FAILED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus("SCHEDULED")}
              loading={updating}
            >
              Reschedule
            </Button>
          )}
        </div>
      </Card>

      {activeDialog === "revision" && (
        <ReasonPromptDialog
          title="Revision Request"
          description="Describe what needs to be changed. The audit will return to IN_PROGRESS."
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
          description="Provide a reason for rejection."
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
