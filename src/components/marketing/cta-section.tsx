"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Link } from "@/i18n/navigation";

export function CTASection() {
  const t = useTranslations("cta");

  return (
    <section className="bg-navy-dark py-12 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-white/70 leading-relaxed">
            {t("description")}
          </p>
          <Link href="/contact" className="mt-8 inline-block">
            <Button size="lg">{t("button")}</Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
