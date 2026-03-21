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
      <section className="bg-gradient-to-b from-bg-cream to-white pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <h1 className="text-center text-4xl font-bold text-navy-dark sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-center text-lg text-text-muted">
              {t("subtitle")}
            </p>
          </ScrollReveal>

          {/* Toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={cn("text-sm font-medium", !annual ? "text-navy-dark" : "text-text-muted")}>
              {t("monthly")}
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors cursor-pointer",
                annual ? "bg-gold" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                  annual && "translate-x-5",
                )}
              />
            </button>
            <span className={cn("text-sm font-medium", annual ? "text-navy-dark" : "text-text-muted")}>
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
                      highlighted && "border-gold ring-2 ring-gold/20 shadow-lg md:scale-105",
                    )}
                  >
                    {highlighted && (
                      <Badge variant="growth" className="absolute -top-3 left-1/2 -translate-x-1/2">
                        {t("popular")}
                      </Badge>
                    )}

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-navy-dark">
                        {t(`plans.${i}.name`)}
                      </h3>
                      <p className="mt-1 text-sm text-text-muted">
                        {t(`plans.${i}.description`)}
                      </p>
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-navy-dark">
                        &yen;{annual ? t(`plans.${i}.annualPrice`) : t(`plans.${i}.price`)}
                      </span>
                      <span className="text-text-muted">{t("perMonth")}</span>
                      {t.has(`plans.${i}.onboarding`) && (
                        <p className="mt-2 text-xs text-text-muted">
                          {t("onboardingFee", { amount: t(`plans.${i}.onboarding`) })}
                        </p>
                      )}
                    </div>

                    <ul className="mb-8 flex-1 space-y-3">
                      {featureCounts[i].map((j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-text-body">
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
      <section className="bg-bg-cream py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-navy-dark">
              {t("freeEvalTitle")}
            </h2>
            <p className="mt-3 text-text-muted">
              {t("freeEvalDescription")}
            </p>
            <Link href="/auth/signin?callbackUrl=/dashboard/free-eval" className="mt-6 inline-block">
              <Button size="lg">{t("freeEvalButton")}</Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-navy-dark">
              {tFaq("faqTitle")}
            </h2>
          </ScrollReveal>

          <div className="mt-12 space-y-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="rounded-lg border border-border-light">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left cursor-pointer"
                  >
                    <span className="font-medium text-navy-dark">{tFaq(`faq.${i}.q`)}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-text-muted transition-transform",
                        openFaq === i && "rotate-180",
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-sm text-text-muted leading-relaxed">
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
