"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

interface SetupIncompleteBannerProps {
  issues: string[];
}

const DISMISSED_KEY = "webmori-setup-banner-dismissed";

export function SetupIncompleteBanner({ issues }: SetupIncompleteBannerProps) {
  const t = useTranslations("dashboard.setupBanner");
  const locale = useLocale();
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    // Check sessionStorage — resets on each new browser session
    const dismissedIssues = sessionStorage.getItem(DISMISSED_KEY)?.split(",") ?? [];
    const allDismissed = issues.every((i) => dismissedIssues.includes(i));
    setDismissed(allDismissed);
  }, [issues]);

  if (dismissed || issues.length === 0) return null;

  function dismiss() {
    const existing = sessionStorage.getItem(DISMISSED_KEY)?.split(",") ?? [];
    const merged = Array.from(new Set([...existing, ...issues]));
    sessionStorage.setItem(DISMISSED_KEY, merged.join(","));
    setDismissed(true);
  }

  return (
    <div className="mt-4 flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3">
      <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">{t("title")}</p>
        <ul className="mt-1 space-y-0.5">
          {issues.map((issue) => (
            <li key={issue} className="text-sm text-ink-muted">
              {t(`issue.${issue}`)}
            </li>
          ))}
        </ul>
        <Link href="/dashboard/settings">
          <Button size="sm" className="mt-3">
            {t("cta")}
          </Button>
        </Link>
      </div>
      <button
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="shrink-0 rounded p-0.5 text-ink-muted hover:text-ink transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
