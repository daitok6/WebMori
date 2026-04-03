"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Star, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeedbackPage() {
  const t = useTranslations("dashboard.feedback");
  const searchParams = useSearchParams();
  const auditId = searchParams.get("auditId") ?? undefined;

  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!score) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, comment: comment.trim() || undefined, auditId }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-severity-good/10 mb-4">
          <Check className="h-8 w-8 text-severity-good" />
        </div>
        <h1 className="text-2xl font-bold text-ink">{t("thankYouTitle")}</h1>
        <p className="mt-2 text-ink-muted">{t("thankYouDesc")}</p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button>
            {t("backToDashboard")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
      <p className="mt-1 text-ink-muted">{t("subtitle")}</p>

      <Card className="mt-6 max-w-lg">
        {/* Star rating */}
        <div className="mb-6">
          <p className="text-sm font-medium text-ink mb-3">{t("rateLabel")}</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setScore(n)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg p-3 transition-colors border-2",
                  score === n
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-surface-raised",
                )}
              >
                <Star
                  className={cn(
                    "h-7 w-7",
                    score && n <= score ? "fill-primary text-primary" : "text-ink-muted",
                  )}
                />
                <span className="text-xs text-ink-muted">{n}</span>
              </button>
            ))}
          </div>
          {score && (
            <p className="mt-2 text-sm text-ink-muted">
              {score <= 2 ? t("scoreLow") : score === 3 ? t("scoreMid") : t("scoreHigh")}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-ink mb-2">
            {t("commentLabel")}
            <span className="text-ink-muted font-normal"> ({t("optional")})</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder={t("commentPlaceholder")}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="mt-1 text-xs text-ink-muted text-right">{comment.length}/1000</p>
        </div>

        {error && <p className="mb-4 text-sm text-severity-critical">{error}</p>}

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!score || submitting}
          >
            {submitting ? t("submitting") : t("submit")}
          </Button>
          <Link href="/dashboard">
            <Button variant="ghost">{t("skip")}</Button>
          </Link>
        </div>
      </Card>
    </>
  );
}
