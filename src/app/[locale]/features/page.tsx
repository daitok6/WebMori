"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { CTASection } from "@/components/marketing/cta-section";
import { Shield, Zap, MessageCircle, Globe, Code, Search, GitPullRequest, AlertTriangle, XCircle, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

const lenses = [
  { icon: Shield, color: "text-severity-critical", bg: "bg-severity-critical/10" },
  { icon: Zap, color: "text-severity-high", bg: "bg-severity-high/10" },
  { icon: MessageCircle, color: "text-severity-good", bg: "bg-severity-good/10" },
  { icon: Globe, color: "text-severity-low", bg: "bg-severity-low/10" },
  { icon: Code, color: "text-ink-muted", bg: "bg-ink-subtle/10" },
  { icon: Search, color: "text-brand-gold", bg: "bg-brand-gold/10" },
];

const stackKeys = ["shopify", "wordpress", "nextjs", "line"] as const;

export default function FeaturesPage() {
  const t = useTranslations("featuresPage");
  const [activeStack, setActiveStack] = useState<string>("shopify");

  return (
    <>
      {/* Hero + Lenses */}
      <section className="bg-gradient-to-b from-surface-raised to-surface pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <h1 className="text-center text-4xl font-bold text-ink sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-ink-muted">
              {t("subtitle")}
            </p>
          </ScrollReveal>

          <div className="mt-16 space-y-8">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const LensIcon = lenses[i].icon;
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <Card className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${lenses[i].bg}`}>
                      <LensIcon className={`h-8 w-8 ${lenses[i].color}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-ink">
                        {t(`lenses.${i}.title`)}
                      </h2>
                      <p className="mt-2 text-ink-muted leading-relaxed">
                        {t(`lenses.${i}.description`)}
                      </p>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Report Preview */}
      <section className="bg-stone-900 py-20 overflow-hidden">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
              {t("reportShowcase.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/60">
              {t("reportShowcase.subtitle")}
            </p>
          </ScrollReveal>

          {/* PDF Report Mockup */}
          <ScrollReveal delay={0.1}>
            <div className="mt-12 mx-auto max-w-3xl">
              <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
                {/* Cover strip */}
                <div className="bg-gradient-to-r from-stone-900 to-stone-800 px-8 py-6 flex items-center justify-between">
                  <div>
                    <p className="text-primary font-bold text-lg tracking-wide">WebMori</p>
                    <p className="text-white/90 text-sm mt-1">{t("reportShowcase.coverTitle")}</p>
                  </div>
                  <div className="text-right text-xs text-white/50 space-y-0.5">
                    <p>example-store.jp</p>
                    <p>2026-03-15</p>
                    <p>Growth Plan</p>
                  </div>
                </div>

                <div className="px-8 py-6 space-y-6">
                  {/* Summary dashboard */}
                  <div>
                    <h3 className="text-sm font-bold text-ink mb-3">{t("reportShowcase.summaryLabel")}</h3>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 rounded-lg bg-severity-critical/10 px-3 py-1.5 text-xs font-medium text-severity-critical">
                        <XCircle className="h-3.5 w-3.5" /> Critical: 1
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-severity-high/10 px-3 py-1.5 text-xs font-medium text-severity-high">
                        <AlertTriangle className="h-3.5 w-3.5" /> High: 2
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-severity-medium/10 px-3 py-1.5 text-xs font-medium text-severity-medium">
                        Medium: 3
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-severity-low/10 px-3 py-1.5 text-xs font-medium text-severity-low">
                        Low: 2
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-severity-good/10 px-3 py-1.5 text-xs font-medium text-severity-good">
                        <CheckCircle className="h-3.5 w-3.5" /> PR: 4
                      </div>
                    </div>
                  </div>

                  {/* Sample finding */}
                  <div className="rounded-xl border border-border p-4">
                    <div className="flex items-start gap-2.5">
                      <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-severity-critical" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-ink">{t("reportShowcase.findingTitle")}</span>
                          <span className="rounded bg-severity-critical/10 px-2 py-0.5 text-[10px] font-bold text-severity-critical uppercase">Critical</span>
                        </div>
                        <p className="text-xs text-ink-muted mt-1.5">{t("reportShowcase.findingEvidence")}</p>
                        <p className="text-xs text-ink-muted mt-1">{t("reportShowcase.findingImpact")}</p>
                        <div className="mt-2.5 rounded-lg bg-surface-raised px-3 py-2">
                          <p className="text-[10px] font-medium text-ink-muted uppercase tracking-wide mb-0.5">{t("reportShowcase.fixLabel")}</p>
                          <p className="text-xs text-ink">{t("reportShowcase.findingFix")}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sample medium finding (condensed) */}
                  <div className="rounded-xl border border-border p-4">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-severity-high" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-ink">{t("reportShowcase.finding2Title")}</span>
                          <span className="rounded bg-severity-high/10 px-2 py-0.5 text-[10px] font-bold text-severity-high uppercase">High</span>
                          <span className="rounded bg-severity-good/10 px-2 py-0.5 text-[10px] font-medium text-severity-good">{t("reportShowcase.prReady")}</span>
                        </div>
                        <p className="text-xs text-ink-muted mt-1.5">{t("reportShowcase.finding2Impact")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Priorities */}
                  <div>
                    <h3 className="text-sm font-bold text-ink mb-2">{t("reportShowcase.prioritiesLabel")}</h3>
                    <ol className="space-y-1.5">
                      {[0, 1, 2].map((i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {i + 1}
                          </span>
                          <span className="text-xs text-ink-muted">
                            {t(`reportShowcase.priorities.${i}`)}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Fade out effect */}
                  <div className="relative h-8">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
                  </div>
                </div>
              </div>

              {/* CTA below the report */}
              <div className="mt-6 text-center">
                <Link
                  href="/sample-report"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {t("reportShowcase.viewSample")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* PR Diff Example */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-4xl px-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-2">
              <GitPullRequest className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold text-ink">{t("prExample.title")}</h2>
            </div>
            <p className="text-ink-muted mb-8">{t("prExample.description")}</p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="bg-surface-raised px-4 py-3 border-b border-border flex items-center gap-2">
                <span className="text-sm font-mono text-ink-muted">fix: move hardcoded API key to environment variable</span>
              </div>
              <div className="font-mono text-sm">
                <div className="bg-severity-critical/5 px-4 py-1 border-l-4 border-severity-critical/30">
                  <span className="text-severity-critical/60 select-none mr-3">-</span>
                  <span className="text-severity-critical">{'const API_KEY = "sk_live_abc123...";'}</span>
                </div>
                <div className="bg-severity-good/5 px-4 py-1 border-l-4 border-severity-good/30">
                  <span className="text-severity-good/60 select-none mr-3">+</span>
                  <span className="text-severity-good">{'const API_KEY = process.env.API_KEY;'}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stack-specific Tabs */}
      <section className="bg-surface-raised py-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-ink sm:text-4xl">
              {t("stacks.title")}
            </h2>
          </ScrollReveal>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {stackKeys.map((key) => (
              <button
                key={key}
                onClick={() => setActiveStack(key)}
                className={cn(
                  "rounded-lg px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  activeStack === key
                    ? "bg-stone-800 text-white"
                    : "bg-surface text-ink-muted hover:text-ink border border-border",
                )}
              >
                {t(`stacks.${key}.title`)}
              </button>
            ))}
          </div>

          <ScrollReveal delay={0.1}>
            <Card className="mt-8 mx-auto max-w-3xl">
              <h3 className="text-xl font-semibold text-ink mb-3">
                {t(`stacks.${activeStack}.title`)}
              </h3>
              <p className="text-ink-muted leading-relaxed">
                {t(`stacks.${activeStack}.description`)}
              </p>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
