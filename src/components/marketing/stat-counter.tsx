"use client";

import { useTranslations } from "next-intl";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export function StatCounter() {
  const t = useTranslations("stats");

  const items = [
    { value: t("items.0.value"), label: t("items.0.label") },
    { value: t("items.1.value"), label: t("items.1.label") },
    { value: t("items.2.value"), label: t("items.2.label") },
    { value: t("items.3.value"), label: t("items.3.label") },
  ];

  return (
    <section className="bg-navy-dark py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {items.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="text-center">
                <AnimatedCounter
                  value={item.value}
                  className="text-3xl font-bold text-gold sm:text-4xl"
                />
                <p className="mt-2 text-sm text-white/60">{item.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
