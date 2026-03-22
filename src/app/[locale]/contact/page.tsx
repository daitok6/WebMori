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
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    url: "",
    stack: "",
    message: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-gradient-to-b from-surface-raised to-surface pt-24 sm:pt-32 pb-12 sm:pb-20">
      <div className="mx-auto max-w-2xl px-6">
        <ScrollReveal>
          <h1 className="text-center text-4xl font-bold text-ink sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-center text-lg text-ink-muted">
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
                <h2 className="text-xl font-semibold text-ink">
                  {t("successTitle")}
                </h2>
                <p className="mt-2 text-ink-muted">{t("successMessage")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    {t("name")}{" "}
                    <span className="text-severity-critical">{t("required")}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    placeholder={t("namePlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    {t("email")}{" "}
                    <span className="text-severity-critical">{t("required")}</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    {t("url")}
                  </label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => set("url", e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    placeholder={t("urlPlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    {t("stack")}
                  </label>
                  <select
                    value={form.stack}
                    onChange={(e) => set("stack", e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="">{t("stackPlaceholder")}</option>
                    {stacks.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    {t("message")}
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                    placeholder={t("messagePlaceholder")}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  {t("submit")}
                </Button>

                <div className="flex items-center gap-2 text-sm text-ink-muted">
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
