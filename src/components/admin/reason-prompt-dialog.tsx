"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReasonPromptDialogProps {
  title: string;
  description?: string;
  placeholder?: string;
  confirmLabel: string;
  confirmVariant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  required?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function ReasonPromptDialog({
  title,
  description,
  placeholder = "理由を入力してください...",
  confirmLabel,
  confirmVariant = "danger" as const,
  required = false,
  onConfirm,
  onCancel,
}: ReasonPromptDialogProps) {
  const [reason, setReason] = useState("");

  function handleConfirm() {
    if (required && !reason.trim()) return;
    onConfirm(reason.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-ink-muted mb-3">{description}</p>
        )}
        <textarea
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          rows={4}
          placeholder={placeholder}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          autoFocus
        />
        <div className="mt-3 flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button
            size="sm"
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={required && !reason.trim()}
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
