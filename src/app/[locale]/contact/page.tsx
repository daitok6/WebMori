"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Send, Clock } from "lucide-react";

const stacks = ["Shopify", "WordPress", "Next.js", "LINE Mini App", "Other"];

export default function ContactPage() {
  const t = useTranslations("contactPage");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="bg-gradient-to-b from-bg-cream to-white pt-32 pb-20">
      <div className="mx-auto max-w-2xl px-6">
        <ScrollReveal>
          <h1 className="text-center text-4xl font-bold text-navy-dark sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-center text-lg text-text-muted">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Card className="mt-12">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-severity-good/10">
                  <Send className="h-8 w-8 text-severity-good" />
                </div>
                <h2 className="text-xl font-semibold text-navy-dark">
                  {t("successTitle")}
                </h2>
                <p className="mt-2 text-text-muted">
                  {t("successMessage")}
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-1.5">
                    {t("name")} <span className="text-severity-critical">{t("required")}</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
                    placeholder={t("namePlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-1.5">
                    {t("email")} <span className="text-severity-critical">{t("required")}</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-1.5">
                    {t("url")}
                  </label>
                  <input
                    type="url"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none"
                    placeholder={t("urlPlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-1.5">
                    {t("stack")}
                  </label>
                  <select className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-text-body focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none">
                    <option value="">{t("stackPlaceholder")}</option>
                    {stacks.map((stack) => (
                      <option key={stack} value={stack}>
                        {stack}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-dark mb-1.5">
                    {t("message")}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-gold focus:ring-2 focus:ring-gold/20 focus:outline-none resize-none"
                    placeholder={t("messagePlaceholder")}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  {t("submit")}
                </Button>

                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Clock className="h-4 w-4" />
                  <span>{t("responseTime")}</span>
                </div>
              </form>
            )}
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
}
