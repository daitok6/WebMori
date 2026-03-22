"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { SectionHeader } from "@/components/marketing/section-header";
import { GitBranch, ScanSearch, FileText, GitPullRequest } from "lucide-react";

const stepIcons = [GitBranch, ScanSearch, FileText, GitPullRequest];

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader title={t("title")} />

        {/* Timeline */}
        <div className="relative mt-14">
          {/* Dashed connector line (desktop only) */}
          <div className="absolute top-8 left-[calc(12.5%)] right-[calc(12.5%)] hidden h-px border-t-2 border-dashed border-primary/30 lg:block" />

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => {
              const Icon = stepIcons[i];
              return (
                <ScrollReveal key={i} delay={i * 0.15}>
                  <div className="flex flex-col items-center text-center">
                    {/* Step circle */}
                    <div className="relative mb-6">
                      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-surface border-2 border-primary shadow-lg shadow-primary/10">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <span className="absolute -right-1 -top-1 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-ink">
                      {t(`steps.${i}.title`)}
                    </h3>
                    <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                      {t(`steps.${i}.description`)}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
