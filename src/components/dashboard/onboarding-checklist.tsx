"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Circle, User, GitBranch, FileSearch } from "lucide-react";

interface OnboardingData {
  profileComplete: boolean;
  hasRepo: boolean;
  hasRequestedEval: boolean;
}

export function OnboardingChecklist({ data }: { data: OnboardingData }) {
  const t = useTranslations("dashboard.onboarding");

  const steps = [
    {
      key: "profile" as const,
      done: data.profileComplete,
      icon: User,
      href: "/dashboard/profile",
    },
    {
      key: "repo" as const,
      done: data.hasRepo,
      icon: GitBranch,
      href: "/dashboard/repos",
    },
    {
      key: "eval" as const,
      done: data.hasRequestedEval,
      icon: FileSearch,
      href: "/dashboard/free-eval",
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <Card className="mt-6 border-primary/30 bg-gradient-to-br from-surface-raised to-surface">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-ink">{t("title")}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t("description")}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-2 rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <Link
            key={step.key}
            href={step.href}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-primary/50"
          >
            {step.done ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-severity-good" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-ink-muted" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${step.done ? "text-ink-muted line-through" : "text-ink"}`}
              >
                {t(`${step.key}Title`)}
              </p>
              <p className="text-xs text-ink-muted">{t(`${step.key}Desc`)}</p>
            </div>
            <step.icon className="h-4 w-4 shrink-0 text-ink-muted" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
