"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { GitBranch, ScanSearch, FileText, GitPullRequest } from "lucide-react";

const stepIcons = [GitBranch, ScanSearch, FileText, GitPullRequest];

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <section className="bg-bg-cream py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <h2 className="text-center text-3xl font-bold text-navy-dark sm:text-4xl">
            {t("title")}
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => {
            const Icon = stepIcons[i];
            return (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-dark text-white shadow-lg">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-white shadow">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-navy-dark">
                    {t(`steps.${i}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">
                    {t(`steps.${i}.description`)}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
