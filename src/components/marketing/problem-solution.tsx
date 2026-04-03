"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { SectionHeader } from "@/components/marketing/section-header";
import {
  ShieldAlert,
  Gauge,
  HelpCircle,
  ScanSearch,
  FileCode,
  FileText,
  X,
  Check,
} from "lucide-react";

const problemIcons = [ShieldAlert, Gauge, HelpCircle];
const solutionIcons = [ScanSearch, FileCode, FileText];

export function ProblemSolution() {
  const tProblem = useTranslations("problem");
  const tSolution = useTranslations("solution");

  return (
    <section className="bg-surface-raised py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader title={tProblem("title")} />

        {/* Side-by-side Before / After comparison */}
        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          {/* Before (Problem) side */}
          <ScrollReveal direction="left">
            <div className="rounded-2xl border-2 border-severity-high/20 bg-severity-high/5 p-6 sm:p-8 h-full">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-severity-high/10">
                  <X className="h-4 w-4 text-severity-high" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider text-severity-high">
                  {tProblem("label")}
                </span>
              </div>
              <div className="space-y-5">
                {[0, 1, 2].map((i) => {
                  const Icon = problemIcons[i];
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-severity-high/10">
                        <Icon className="h-5 w-5 text-severity-high" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-ink">
                          {tProblem(`items.${i}.title`)}
                        </h3>
                        <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                          {tProblem(`items.${i}.description`)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* After (Solution) side */}
          <ScrollReveal delay={0.15} direction="right">
            <div className="rounded-2xl border-2 border-primary/20 bg-primary-subtle/30 p-6 sm:p-8 h-full">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {tSolution("label")}
                </span>
              </div>
              <div className="space-y-5">
                {[0, 1, 2].map((i) => {
                  const Icon = solutionIcons[i];
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-ink">
                          {tSolution(`items.${i}.title`)}
                        </h3>
                        <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                          {tSolution(`items.${i}.description`)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
