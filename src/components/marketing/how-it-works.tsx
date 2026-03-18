"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { GitBranch, ScanSearch, FileText, GitPullRequest } from "lucide-react";

const stepIcons = [GitBranch, ScanSearch, FileText, GitPullRequest];

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <section className="bg-bg-cream py-20">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <h2 className="text-center text-3xl font-bold text-navy-dark sm:text-4xl">
            {t("title")}
          </h2>
        </ScrollReveal>

        <div className="relative mt-16">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border md:block" />

          <div className="grid gap-12 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => {
              const Icon = stepIcons[i];
              return (
                <ScrollReveal key={i} delay={i * 0.15}>
                  <div className="relative text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-dark text-white shadow-lg">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-white text-sm font-bold">
                      {i + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-navy-dark">
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
      </div>
    </section>
  );
}
