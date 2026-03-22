"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Shield, Zap, MessageCircle, Globe, GitPullRequest, BarChart3 } from "lucide-react";

const featureIcons = [Shield, Zap, MessageCircle, Globe, GitPullRequest, BarChart3];
const iconColors = [
  "text-severity-critical",
  "text-severity-high",
  "text-severity-good",
  "text-severity-low",
  "text-primary",
  "text-ink-muted",
];

export function FeatureGrid() {
  const t = useTranslations("features");

  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <h2 className="text-center text-3xl font-bold text-ink sm:text-4xl">
            {t("title")}
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const Icon = featureIcons[i];
            const isLarge = i === 0;
            return (
              <ScrollReveal key={i} delay={i * 0.08}>
                <Card className={`h-full transition-all hover:shadow-md hover:border-primary/30 ${isLarge ? "sm:col-span-2 lg:col-span-2" : ""}`}>
                  <div className={`mb-3 ${iconColors[i]}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-semibold text-ink">
                    {t(`items.${i}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                    {t(`items.${i}.description`)}
                  </p>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
