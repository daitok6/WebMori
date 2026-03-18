"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Feature indices per plan (Starter=4, Growth=6, Pro=7)
const featureCounts = [
  [0, 1, 2, 3],
  [0, 1, 2, 3, 4, 5],
  [0, 1, 2, 3, 4, 5, 6],
];

export function PricingPreview() {
  const t = useTranslations("pricing");

  return (
    <section className="bg-bg-warm py-20">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <h2 className="text-center text-3xl font-bold text-navy-dark sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-center text-text-muted">
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
                    highlighted && "border-gold ring-2 ring-gold/20 shadow-lg scale-105",
                  )}
                >
                  {highlighted && (
                    <Badge variant="growth" className="absolute -top-3 left-1/2 -translate-x-1/2">
                      {t("popular")}
                    </Badge>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-navy-dark">
                      {t(`plans.${i}.name`)}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {t(`plans.${i}.description`)}
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-navy-dark">
                      &yen;{t(`plans.${i}.price`)}
                    </span>
                    <span className="text-text-muted">{t("perMonth")}</span>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {featureCounts[i].map((j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-text-body">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-severity-good" />
                          {t(`plans.${i}.features.${j}`)}
                        </li>
                      ))}
                  </ul>

                  <Link href="/contact" className="mt-auto">
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
