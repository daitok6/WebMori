"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Link } from "@/i18n/navigation";
import {
  Shield,
  Zap,
  Globe,
  Code,
  LineChart,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";

const severityIcon = {
  critical: XCircle,
  high: AlertTriangle,
  medium: Info,
  low: Info,
  good: CheckCircle,
};

const severityColor = {
  critical: "text-severity-critical",
  high: "text-severity-high",
  medium: "text-severity-medium",
  low: "text-severity-low",
  good: "text-severity-good",
};

export function SampleReportContent() {
  const t = useTranslations("sampleReport");

  const lenses = [
    { icon: Shield, key: "security", score: "7/10" },
    { icon: Zap, key: "performance", score: "6/10" },
    { icon: LineChart, key: "line", score: "9/10" },
    { icon: Globe, key: "i18n", score: "8/10" },
    { icon: Code, key: "maintainability", score: "7/10" },
  ];

  const findings = [
    { severity: "critical" as const, key: "finding1" },
    { severity: "high" as const, key: "finding2" },
    { severity: "medium" as const, key: "finding3" },
    { severity: "low" as const, key: "finding4" },
  ];

  return (
    <>
      <section className="bg-gradient-to-b from-bg-cream to-white pt-32 pb-12">
        <div className="mx-auto max-w-4xl px-6">
          <ScrollReveal>
            <div className="text-center">
              <Badge variant="growth" className="mb-4">
                {t("badge")}
              </Badge>
              <h1 className="text-3xl font-bold text-navy-dark sm:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-4 text-lg text-text-muted">
                {t("subtitle")}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Report header */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-6">
          <ScrollReveal>
            <Card className="border-gold/30">
              <div className="flex flex-col gap-1 text-sm text-text-muted mb-6">
                <span><strong>{t("client")}:</strong> {t("clientName")}</span>
                <span><strong>{t("site")}:</strong> example-store.jp</span>
                <span><strong>{t("date")}:</strong> 2026-03-15</span>
                <span><strong>{t("plan")}:</strong> Growth</span>
              </div>

              {/* Lens scores */}
              <h2 className="text-xl font-bold text-navy-dark mb-4">
                {t("overviewTitle")}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {lenses.map((lens) => (
                  <div
                    key={lens.key}
                    className="flex flex-col items-center rounded-lg bg-bg-cream p-4"
                  >
                    <lens.icon className="h-6 w-6 text-navy-dark mb-2" />
                    <span className="text-xs text-text-muted">{t(`lens.${lens.key}`)}</span>
                    <span className="mt-1 text-lg font-bold text-navy-dark">
                      {lens.score}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Findings */}
      <section className="bg-bg-cream py-12">
        <div className="mx-auto max-w-4xl px-6">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-navy-dark mb-6">
              {t("findingsTitle")}
            </h2>
          </ScrollReveal>

          <div className="space-y-4">
            {findings.map((finding, i) => {
              const Icon = severityIcon[finding.severity];
              return (
                <ScrollReveal key={finding.key} delay={i * 0.1}>
                  <Card>
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${severityColor[finding.severity]}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-navy-dark">
                            {t(`findings.${finding.key}.title`)}
                          </h3>
                          <Badge variant={finding.severity}>
                            {t(`severity.${finding.severity}`)}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-muted mb-3">
                          {t(`findings.${finding.key}.impact`)}
                        </p>
                        <div className="rounded-lg bg-bg-cream p-3">
                          <p className="text-xs font-medium text-text-muted mb-1">
                            {t("recommendedFix")}
                          </p>
                          <p className="text-sm text-text-body">
                            {t(`findings.${finding.key}.fix`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Priorities */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-6">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-navy-dark mb-6">
              {t("prioritiesTitle")}
            </h2>
            <Card>
              <ol className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/10 text-xs font-bold text-gold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-text-body">
                      {t(`priorities.${i}`)}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-dark py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-white">
              {t("ctaTitle")}
            </h2>
            <p className="mt-4 text-lg text-white/70">
              {t("ctaDescription")}
            </p>
            <Link href="/auth/signin?callbackUrl=/dashboard/free-eval" className="mt-8 inline-block">
              <Button size="lg">{t("ctaButton")}</Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
