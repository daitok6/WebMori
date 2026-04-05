"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type UploadState = "idle" | "uploading" | "success" | "error";

export function ReplacePdfButton({ auditId }: { auditId: string }) {
  const [open, setOpen] = useState(false);
  const [reportState, setReportState] = useState<UploadState>("idle");
  const [findingsState, setFindingsState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reportInputRef = useRef<HTMLInputElement>(null);
  const findingsInputRef = useRef<HTMLInputElement>(null);

  async function upload(reportFile: File | null, findingsFile: File | null) {
    if (!reportFile && !findingsFile) return;

    if (reportFile) setReportState("uploading");
    if (findingsFile) setFindingsState("uploading");
    setErrorMsg(null);

    try {
      const form = new FormData();
      if (reportFile) form.append("reportPdf", reportFile);
      if (findingsFile) form.append("findingsPdf", findingsFile);

      const res = await fetch(`/api/admin/audits/${auditId}/replace-pdf`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      if (reportFile) setReportState("success");
      if (findingsFile) setFindingsState("success");

      // Auto-close after success
      setTimeout(() => {
        setOpen(false);
        setReportState("idle");
        setFindingsState("idle");
      }, 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      if (reportFile) setReportState("error");
      if (findingsFile) setFindingsState("error");
    }
  }

  function handleFileChange(type: "report" | "findings") {
    const input = type === "report" ? reportInputRef.current : findingsInputRef.current;
    const file = input?.files?.[0] ?? null;
    if (!file) return;
    upload(
      type === "report" ? file : null,
      type === "findings" ? file : null,
    );
  }

  const isUploading = reportState === "uploading" || findingsState === "uploading";

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
        <div className="mt-2 rounded-lg border border-border bg-surface-raised p-3 space-y-2 text-xs">
          <p className="text-ink-muted">
            Select a new PDF to replace the current version in R2. Status and findings are not affected.
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

          {errorMsg && (
            <p className="text-red-600 text-xs">{errorMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}
