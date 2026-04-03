"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Link } from "@/i18n/navigation";

export function CTASection() {
  const t = useTranslations("cta");

  return (
    <section className="bg-gradient-to-br from-stone-900 to-stone-800 py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(217,119,6,0.15),_transparent_70%)]" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center relative">
        <ScrollReveal direction="scale">
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl [text-wrap:balance]">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-white/70 leading-relaxed">
            {t("description")}
          </p>
          <Link href="/auth/signin?callbackUrl=/dashboard/free-eval" className="mt-8 inline-block">
            <Button size="lg">{t("button")}</Button>
          </Link>
          <p className="mt-4 text-sm text-white/50">
            {t("noCreditCard")}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
