import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesPage" });
  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: {
      canonical: `https://www.webmori.jp/${locale}/services`,
      languages: { ja: "/ja/services", en: "/en/services" },
    },
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesPage" });

  const tiers = t.raw("tiers.items") as Array<{
    label: string;
    name: string;
    price: string;
    unit: string;
    sub: string;
    description: string;
    bullets: string[];
  }>;

  const tierAccents = [
    { accent: "border-green-500", accentText: "text-green-600", accentBg: "bg-green-500" },
    { accent: "border-orange-400", accentText: "text-orange-500", accentBg: "bg-orange-400" },
    { accent: "border-rose-400", accentText: "text-rose-500", accentBg: "bg-rose-400" },
  ];

  const steps = t.raw("howItWorks.steps") as Array<{ title: string; desc: string }>;

  const faqs = t.raw("faq.items") as Array<{ q: string; a: string }>;

  const lineFriendUrl = process.env.NEXT_PUBLIC_LINE_FRIEND_URL ?? "https://line.me/R/ti/p/@webmori";
  const contactEmail = process.env.OPERATOR_EMAIL ?? "contact@webmori.jp";

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-surface-raised to-surface pt-24 sm:pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <ScrollReveal>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-6">
              {t("hero.badge")}
            </span>
            <h1 className="text-4xl font-bold text-ink sm:text-5xl leading-tight">
              {t("hero.heading")}
            </h1>
            <p className="mt-6 text-lg text-ink-muted max-w-2xl mx-auto">
              {t("hero.subheading")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={lineFriendUrl}
                className="inline-flex items-center justify-center rounded-lg bg-[#06C755] px-6 py-3 text-sm font-semibold text-white hover:bg-[#05b34c] transition-colors"
              >
                {t("hero.ctaLine")}
              </a>
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-ink hover:bg-surface-raised transition-colors"
              >
                {t("hero.ctaEmail")}
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Subscription prerequisite notice */}
      <section className="bg-surface py-8">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <div className="flex items-start gap-4 rounded-xl border border-primary/25 bg-primary/5 px-6 py-4">
              <span className="mt-0.5 text-xl leading-none">ℹ️</span>
              <div>
                <p className="font-semibold text-ink text-sm">
                  {t("subscriptionNote.title")}
                </p>
                <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                  {t("subscriptionNote.body")}{" "}
                  <Link href="/pricing" className="font-medium text-primary hover:underline">
                    {t("subscriptionNote.pricingLink")}
                  </Link>
                  {t("subscriptionNote.bodySuffix")}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Three tier cards */}
      <section className="bg-surface pb-16 sm:pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-ink sm:text-4xl mb-12">
              {t("tiers.heading")}
            </h2>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {tiers.map((tier, i) => {
              const { accent, accentText } = tierAccents[i];
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <Card className={`border-l-4 ${accent} flex flex-col h-full`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${accentText}`}>
                        {tier.label}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-ink mb-2">{tier.name}</h3>
                    <p className="text-3xl font-bold text-ink">
                      {tier.price}
                      <span className="text-base font-normal text-ink-muted">{tier.unit}</span>
                    </p>
                    <p className="text-xs text-ink-muted mb-4 h-4">{tier.sub}</p>
                    <p className="text-sm text-ink-muted mb-5">{tier.description}</p>
                    <ul className="mt-auto space-y-2">
                      {tier.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-ink">
                          <Check className={`mt-0.5 h-4 w-4 shrink-0 ${accentText}`} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface-raised py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-ink mb-12">
              {t("howItWorks.heading")}
            </h2>
          </ScrollReveal>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {i + 1}
                  </div>
                  <h3 className="text-base font-semibold text-ink mb-2">{step.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* PR merge special */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-xl px-6">
          <ScrollReveal>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-ink mb-2">
                {t("prMerge.heading")}
              </h3>
              <p className="text-sm text-ink-muted mb-4">
                {t("prMerge.body")}
              </p>
              <p className="text-2xl font-bold text-ink">
                {t("prMerge.price")}{" "}
                <span className="text-sm font-normal text-ink-muted">{t("prMerge.priceNote")}</span>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface-raised py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold text-ink mb-10">
              {t("faq.heading")}
            </h2>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="rounded-xl border border-border bg-surface p-6">
                  <p className="font-semibold text-ink mb-2">{faq.q}</p>
                  <p className="text-sm text-ink-muted leading-relaxed">{faq.a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-primary sm:text-4xl mb-4">
              {t("cta.heading")}
            </h2>
            <p className="text-white/70 mb-8">
              {t("cta.body")}
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              {t("cta.button")}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
