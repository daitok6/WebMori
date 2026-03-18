"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ShieldAlert, Gauge, HelpCircle, ScanSearch, FileCode, FileText } from "lucide-react";

const problemIcons = [ShieldAlert, Gauge, HelpCircle];
const solutionIcons = [ScanSearch, FileCode, FileText];

export function ProblemSolution() {
  const tProblem = useTranslations("problem");
  const tSolution = useTranslations("solution");

  return (
    <>
      {/* Problem */}
      <section className="bg-bg-cream py-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-navy-dark sm:text-4xl">
              {tProblem("title")}
            </h2>
          </ScrollReveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[0, 1, 2].map((i) => {
              const Icon = problemIcons[i];
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <Card className="text-center h-full">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-severity-high/10">
                      <Icon className="h-6 w-6 text-severity-high" />
                    </div>
                    <h3 className="text-lg font-semibold text-navy-dark">
                      {tProblem(`items.${i}.title`)}
                    </h3>
                    <p className="mt-2 text-sm text-text-muted leading-relaxed">
                      {tProblem(`items.${i}.description`)}
                    </p>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-navy-dark sm:text-4xl">
              {tSolution("title")}
            </h2>
          </ScrollReveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[0, 1, 2].map((i) => {
              const Icon = solutionIcons[i];
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <Card accent className="h-full">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                      <Icon className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="text-lg font-semibold text-navy-dark">
                      {tSolution(`items.${i}.title`)}
                    </h3>
                    <p className="mt-2 text-sm text-text-muted leading-relaxed">
                      {tSolution(`items.${i}.description`)}
                    </p>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
