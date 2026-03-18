"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

const platforms = ["Shopify", "WordPress", "Next.js", "LINE"];

export function TrustLogos() {
  const t = useTranslations("trust");

  return (
    <section className="border-y border-border-light bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <p className="text-center text-sm font-medium uppercase tracking-wider text-text-muted">
            {t("title")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-12">
            {platforms.map((name) => (
              <span
                key={name}
                className="text-lg font-semibold text-text-muted/50 transition-colors hover:text-text-muted"
              >
                {name}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
