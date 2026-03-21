"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

const platforms = [
  { name: "Shopify", display: "shopify" },
  { name: "WordPress", display: "WordPress" },
  { name: "Next.js", display: "Next.js" },
  { name: "LINE", display: "LINE" },
];

export function TrustLogos() {
  const t = useTranslations("trust");

  return (
    <section className="border-y border-border-light bg-white py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <p className="text-center text-sm font-medium uppercase tracking-wider text-text-muted">
            {t("title")}
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {platforms.map(({ name, display }) => (
              <span
                key={name}
                className="text-lg sm:text-xl font-semibold text-text-muted/40 transition-colors hover:text-text-muted tracking-tight select-none"
              >
                {display}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
