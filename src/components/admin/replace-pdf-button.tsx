"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type UploadState = "idle" | "uploading" | "success" | "error";

type PendingFile = {
  report: File | null;
  findings: File | null;
};

export function ReplacePdfButton({ auditId }: { auditId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<PendingFile>({ report: null, findings: null });
  const [reportState, setReportState] = useState<UploadState>("idle");
  const [findingsState, setFindingsState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const reportInputRef = useRef<HTMLInputElement>(null);
  const findingsInputRef = useRef<HTMLInputElement>(null);

  const isUploading = reportState === "uploading" || findingsState === "uploading";

  function handleFileChange(type: "report" | "findings") {
    const input = type === "report" ? reportInputRef.current : findingsInputRef.current;
    const file = input?.files?.[0] ?? null;
    if (!file) return;
    setPending((prev) => ({ ...prev, [type]: file }));
    setErrorMsg(null);
    setConfirming(true);
  }

  function cancelPending() {
    setPending({ report: null, findings: null });
    setConfirming(false);
    if (reportInputRef.current) reportInputRef.current.value = "";
    if (findingsInputRef.current) findingsInputRef.current.value = "";
  }

  async function confirmUpload() {
    const { report, findings } = pending;
    if (!report && !findings) return;

    setConfirming(false);
    if (report) setReportState("uploading");
    if (findings) setFindingsState("uploading");
    setErrorMsg(null);

    try {
      const form = new FormData();
      if (report) form.append("reportPdf", report);
      if (findings) form.append("findingsPdf", findings);

      const res = await fetch(`/api/admin/audits/${auditId}/replace-pdf`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      if (report) setReportState("success");
      if (findings) setFindingsState("success");
      setPending({ report: null, findings: null });

      setTimeout(() => {
        setOpen(false);
        setReportState("idle");
        setFindingsState("idle");
      }, 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      if (pending.report) setReportState("error");
      if (pending.findings) setFindingsState("error");
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors"
        disabled={isUploading}
      >
        <Upload className="h-3.5 w-3.5" />
        Replace PDFs
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-border bg-surface-raised p-3 space-y-3 text-xs">
          <p className="text-ink-muted">
            Select a new PDF to replace the current version in R2. The client will be notified by email.
          </p>

          {/* Report PDF row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-ink font-medium w-28 shrink-0">Report PDF</span>
            <div className="flex items-center gap-2 flex-1">
              <input
                ref={reportInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={() => handleFileChange("report")}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => reportInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs h-7 px-2"
              >
                Choose file
              </Button>
              {pending.report && reportState === "idle" && (
                <span className="text-ink truncate max-w-[140px]" title={pending.report.name}>
                  {pending.report.name}
                </span>
              )}
              {reportState === "uploading" && (
                <span className="text-ink-muted animate-pulse">Uploading…</span>
              )}
              {reportState === "success" && (
                <span className="inline-flex items-center gap-1 text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Replaced
                </span>
              )}
              {reportState === "error" && (
                <span className="inline-flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" /> Failed
                </span>
              )}
            </div>
          </div>

          {/* Findings PDF row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-ink font-medium w-28 shrink-0">Findings PDF</span>
            <div className="flex items-center gap-2 flex-1">
              <input
                ref={findingsInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={() => handleFileChange("findings")}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => findingsInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs h-7 px-2"
              >
                Choose file
              </Button>
              {pending.findings && findingsState === "idle" && (
                <span className="text-ink truncate max-w-[140px]" title={pending.findings.name}>
                  {pending.findings.name}
                </span>
              )}
              {findingsState === "uploading" && (
                <span className="text-ink-muted animate-pulse">Uploading…</span>
              )}
              {findingsState === "success" && (
                <span className="inline-flex items-center gap-1 text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Replaced
                </span>
              )}
              {findingsState === "error" && (
                <span className="inline-flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" /> Failed
                </span>
              )}
            </div>
          </div>

          {/* Confirmation banner */}
          {confirming && (pending.report || pending.findings) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-medium text-amber-800">Confirm replacement</p>
                  {pending.report && (
                    <p className="text-amber-700">Report PDF → <span className="font-mono">{pending.report.name}</span></p>
                  )}
                  {pending.findings && (
                    <p className="text-amber-700">Findings PDF → <span className="font-mono">{pending.findings.name}</span></p>
                  )}
                  <p className="text-amber-600 text-[11px] mt-1">The client will be notified by email.</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={confirmUpload}
                  className="text-xs h-7 px-3"
                >
                  Replace
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelPending}
                  className="text-xs h-7 px-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-red-600 text-xs">{errorMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}
