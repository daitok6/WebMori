"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ParallaxSection } from "@/components/motion/parallax-section";
import { CTASection } from "@/components/marketing/cta-section";
import { Shield, Zap, MessageCircle, Globe, Code, FileText, GitPullRequest } from "lucide-react";
import { cn } from "@/lib/utils";

const lenses = [
  { icon: Shield, color: "text-severity-critical", bg: "bg-severity-critical/10" },
  { icon: Zap, color: "text-severity-high", bg: "bg-severity-high/10" },
  { icon: MessageCircle, color: "text-severity-good", bg: "bg-severity-good/10" },
  { icon: Globe, color: "text-severity-low", bg: "bg-severity-low/10" },
  { icon: Code, color: "text-ink-muted", bg: "bg-ink-subtle/10" },
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
            {[0, 1, 2, 3, 4].map((i) => {
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

      {/* Report Showcase with Parallax */}
      <section className="bg-stone-900 py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
              {t("reportShowcase.title")}
            </h2>
          </ScrollReveal>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <ParallaxSection speed={0.3}>
              <ScrollReveal delay={0.1}>
                <div className="rounded-2xl bg-stone-800 p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-white/70">
                      {t("reportShowcase.markdownLabel")}
                    </span>
                  </div>
                  <div className="space-y-2 font-mono text-sm text-white/60">
                    <p className="text-primary">## 重要な問題</p>
                    <p>### <span className="text-severity-critical">Critical</span> — APIキーがハードコード</p>
                    <p className="text-white/40">- ファイル: src/config.ts:24</p>
                    <p className="text-white/40">- 影響: 第三者によるAPI悪用の可能性</p>
                    <p className="text-white/40">- 修正: 環境変数に移行</p>
                    <p className="mt-4 text-primary">## 改善提案</p>
                    <p>### <span className="text-severity-medium">Medium</span> — 画像の最適化</p>
                    <p className="text-white/40">- 未圧縮の画像が12件検出</p>
                    <p className="text-white/40">- 推定改善: LCP -1.2s</p>
                  </div>
                </div>
              </ScrollReveal>
            </ParallaxSection>

            <ParallaxSection speed={0.15}>
              <ScrollReveal delay={0.2}>
                <div className="rounded-2xl bg-white p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-ink-muted">
                      {t("reportShowcase.pdfLabel")}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-3/4 rounded bg-ink/10" />
                    <div className="flex gap-3">
                      <div className="rounded-lg bg-severity-critical/10 px-3 py-2 text-xs font-medium text-severity-critical">Critical: 1</div>
                      <div className="rounded-lg bg-severity-medium/10 px-3 py-2 text-xs font-medium text-severity-medium">Medium: 3</div>
                      <div className="rounded-lg bg-severity-low/10 px-3 py-2 text-xs font-medium text-severity-low">Low: 2</div>
                    </div>
                    <div className="h-2 w-full rounded bg-border" />
                    <div className="h-2 w-5/6 rounded bg-border" />
                    <div className="h-2 w-4/6 rounded bg-border" />
                    <div className="mt-4 rounded-lg border border-border p-3">
                      <div className="h-2 w-1/2 rounded bg-primary/30 mb-2" />
                      <div className="h-2 w-full rounded bg-border" />
                      <div className="h-2 w-3/4 rounded bg-border mt-1" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </ParallaxSection>
          </div>
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
