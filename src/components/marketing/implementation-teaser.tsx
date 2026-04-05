"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

type Tier = {
  tier: string;
  label: string;
  price: string;
  desc: string;
};

const tierColors: Record<string, string> = {
  A: "text-green-600",
  B: "text-orange-500",
  C: "text-rose-500",
};

export function ImplementationTeaser() {
  const t = useTranslations("implementation");
  const tiers = t.raw("tiers") as Tier[];

  return (
    <section className="bg-surface-raised py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <ScrollReveal>
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">{t("badge")}</span>
            <h2 className="mt-2 text-3xl font-bold text-ink">{t("title")}</h2>
            <p className="mt-3 max-w-2xl mx-auto text-ink-muted">{t("description")}</p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          {tiers.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="rounded-lg border border-border bg-surface p-5 text-center">
                <span className={`inline-block mb-2 text-xs font-bold uppercase tracking-wider ${tierColors[item.tier] ?? "text-primary"}`}>
                  Tier {item.tier} — {item.label}
                </span>
                <p className="text-xl font-bold text-ink">{item.price}</p>
                <p className="mt-1 text-sm text-ink-muted">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="text-center">
            <Link href="/services" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              {t("link")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
