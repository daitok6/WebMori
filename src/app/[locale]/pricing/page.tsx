"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCheckout } from "@/lib/use-checkout";
import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { featureCounts } from "@/lib/pricing-data";

export default function PricingPage() {
  const t = useTranslations("pricing");
  const tFaq = useTranslations("pricingPage");
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { checkout, loading } = useCheckout();

  return (
    <>
      <section className="bg-gradient-to-b from-surface-raised to-surface pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <h1 className="text-center text-4xl font-bold text-ink sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-center text-lg text-ink-muted">
              {t("subtitle")}
            </p>
          </ScrollReveal>

          {/* Toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={cn("text-sm font-medium", !annual ? "text-ink" : "text-ink-muted")}>
              {t("monthly")}
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              role="switch"
              aria-checked={annual}
              aria-label={t("annual")}
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                annual ? "bg-primary" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                  annual && "translate-x-5",
                )}
              />
            </button>
            <span className={cn("text-sm font-medium", annual ? "text-ink" : "text-ink-muted")}>
              {t("annual")}
            </span>
            {annual && (
              <Badge variant="growth">{t("annualDiscount")}</Badge>
            )}
          </div>

          {/* Cards */}
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[0, 1, 2].map((i) => {
              const highlighted = i === 1;
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <Card
                    className={cn(
                      "relative flex flex-col h-full",
                      highlighted && "border-primary ring-2 ring-primary/20 shadow-lg md:scale-105",
                    )}
                  >
                    {highlighted && (
                      <Badge variant="growth" className="absolute -top-3 left-1/2 -translate-x-1/2">
                        {t("popular")}
                      </Badge>
                    )}

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-ink">
                        {t(`plans.${i}.name`)}
                      </h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        {t(`plans.${i}.description`)}
                      </p>
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-ink">
                        &yen;{annual ? t(`plans.${i}.annualPrice`) : t(`plans.${i}.price`)}
                      </span>
                      <span className="text-ink-muted">{t("perMonth")}</span>
                      {annual && (
                        <p className="mt-1 text-xs font-medium text-severity-good">
                          {(t.raw("annualSavings") as string[])[i]}
                        </p>
                      )}
                      {t.has(`plans.${i}.onboarding`) && (
                        <p className="mt-2 text-xs text-ink-muted">
                          {t("onboardingFee", { amount: t(`plans.${i}.onboarding`) })}
                        </p>
                      )}
                    </div>

                    <ul className="mb-8 flex-1 space-y-3">
                      {featureCounts[i].map((j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-ink">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-severity-good" />
                          {t(`plans.${i}.features.${j}`)}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto">
                      <Button
                        variant={highlighted ? "primary" : "secondary"}
                        className="w-full"
                        disabled={loading}
                        onClick={() => checkout(i, annual)}
                      >
                        {t("getStarted")}
                      </Button>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Free eval banner */}
      <section className="bg-surface-raised py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-ink">
              {t("freeEvalTitle")}
            </h2>
            <p className="mt-3 text-ink-muted">
              {t("freeEvalDescription")}
            </p>
            <Link href="/auth/signin?callbackUrl=/dashboard/free-eval" className="mt-6 inline-block">
              <Button size="lg">{t("freeEvalButton")}</Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Implementation add-on */}
      <section className="bg-surface-raised py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">実装代行オプション</span>
              <h2 className="mt-2 text-3xl font-bold text-ink">見つけた問題、WebMoriが直接修正します</h2>
              <p className="mt-3 text-ink-muted">月次レポートには各問題の代行見積もりが記載されています。ご希望の項目をLINEまたはメールでご連絡ください。</p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Tier A */}
            <ScrollReveal delay={0}>
              <div className="rounded-xl border border-border bg-surface p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-green-600">Tier A</span>
                </div>
                <h3 className="text-lg font-semibold text-ink mb-1">完全代行</h3>
                <p className="text-2xl font-bold text-ink mb-1">¥7,500<span className="text-sm font-normal text-ink-muted">/時</span></p>
                <p className="text-xs text-ink-muted mb-4">PR適用: ¥5,000固定</p>
                <p className="text-sm text-ink-muted flex-1">画像最適化、フォント自ホスト化、設定変更など低リスクの修正を直接実装します。</p>
              </div>
            </ScrollReveal>
            {/* Tier B */}
            <ScrollReveal delay={0.1}>
              <div className="rounded-xl border border-border bg-surface p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block w-3 h-3 rounded-full bg-orange-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-500">Tier B</span>
                </div>
                <h3 className="text-lg font-semibold text-ink mb-1">ステージング確認</h3>
                <p className="text-2xl font-bold text-ink mb-1">¥9,000<span className="text-sm font-normal text-ink-muted">/時</span></p>
                <p className="text-xs text-ink-muted mb-4"> </p>
                <p className="text-sm text-ink-muted flex-1">認証、外部API連携、依存関係更新などをステージング環境で確認のうえ実装します。</p>
              </div>
            </ScrollReveal>
            {/* Tier C */}
            <ScrollReveal delay={0.2}>
              <div className="rounded-xl border border-border bg-surface p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block w-3 h-3 rounded-full bg-rose-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Tier C</span>
                </div>
                <h3 className="text-lg font-semibold text-ink mb-1">実装ガイド</h3>
                <p className="text-2xl font-bold text-ink mb-1">¥12,000<span className="text-sm font-normal text-ink-muted">固定</span></p>
                <p className="text-xs text-ink-muted mb-4"> </p>
                <p className="text-sm text-ink-muted flex-1">i18n化やアーキテクチャ変更などの複雑な修正は、ガイドドキュメント＋1時間Q&Aで対応します。</p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <p className="mt-8 text-center text-sm text-ink-muted">
              <a href="/services" className="text-primary hover:underline font-medium">実装代行の詳細を見る →</a>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-ink">
              {tFaq("faqTitle")}
            </h2>
          </ScrollReveal>

          <div className="mt-12 space-y-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="rounded-xl border border-border">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    aria-controls={`faq-answer-${i}`}
                    className="flex w-full items-center justify-between px-6 py-4 text-left cursor-pointer"
                  >
                    <span className="font-medium text-ink">{tFaq(`faq.${i}.q`)}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-ink-muted transition-transform",
                        openFaq === i && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        key="content"
                        id={`faq-answer-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-sm text-ink-muted leading-relaxed">
                          {tFaq(`faq.${i}.a`)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
