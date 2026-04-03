"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { featureCounts } from "@/lib/pricing-data";

export function PricingPreview() {
  const t = useTranslations("pricing");

  return (
    <section className="bg-surface-sunken py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl lg:text-4xl [text-wrap:balance]">
            {t("title")}
          </h2>
          <p className="mt-4 text-center text-ink-muted">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[0, 1, 2].map((i) => {
            const highlighted = i === 1;
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <Card
                  className={cn(
                    "relative flex flex-col h-full",
                    highlighted && "border-primary ring-2 ring-primary/20 shadow-xl bg-primary-subtle/10",
                  )}
                >
                  {highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="growth">
                        {t("popular")}
                      </Badge>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-ink">
                      {t(`plans.${i}.name`)}
                    </h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {t(`plans.${i}.description`)}
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-ink">
                      &yen;{t(`plans.${i}.price`)}
                    </span>
                    <span className="text-ink-muted">{t("perMonth")}</span>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {featureCounts[i].map((j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-ink">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-severity-good" />
                          {t(`plans.${i}.features.${j}`)}
                        </li>
                      ))}
                  </ul>

                  <Link href="/pricing" className="mt-auto">
                    <Button
                      variant={highlighted ? "primary" : "secondary"}
                      className="w-full"
                    >
                      {t("getStarted")}
                    </Button>
                  </Link>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
