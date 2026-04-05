import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export const revalidate = 3600;
import { Card } from "@/components/ui/card";
import { CTASection } from "@/components/marketing/cta-section";
import { Target, Shield, Cpu } from "lucide-react";

const icons = [Target, Shield, Cpu];

function AboutContent() {
  const t = useTranslations("aboutPage");

  return (
    <>
      <section className="bg-gradient-to-b from-surface-raised to-surface pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <h1 className="text-center text-4xl font-bold text-ink sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-ink-muted">
              {t("subtitle")}
            </p>
          </ScrollReveal>

          <div className="mt-16 space-y-8">
            {[0, 1, 2].map((i) => {
              const Icon = icons[i];
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <Card className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-ink">
                        {t(`sections.${i}.title`)}
                      </h2>
                      <p className="mt-2 text-ink-muted leading-relaxed">
                        {t(`sections.${i}.description`)}
                      </p>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="mt-12 rounded-2xl border border-border bg-surface-raised p-8 flex flex-col items-center text-center md:flex-row md:text-left md:gap-8">
              {/* Avatar — initials fallback since no photo yet */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary mb-4 md:mb-0">
                DK
              </div>
              <div>
                <p className="text-xl font-semibold text-ink">{t("founder.name")}</p>
                <p className="text-sm text-primary mt-0.5">{t("founder.role")}</p>
                <p className="mt-3 text-ink-muted leading-relaxed">{t("founder.bio")}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <CTASection />
    </>
  );
}

export default function AboutPage() {
  return <AboutContent />;
}
