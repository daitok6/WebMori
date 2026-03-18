import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Card } from "@/components/ui/card";
import { CTASection } from "@/components/marketing/cta-section";
import { Target, Shield, Cpu } from "lucide-react";

const icons = [Target, Shield, Cpu];

function AboutContent() {
  const t = useTranslations("aboutPage");

  return (
    <>
      <section className="bg-gradient-to-b from-bg-cream to-white pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <h1 className="text-center text-4xl font-bold text-navy-dark sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-text-muted">
              {t("subtitle")}
            </p>
          </ScrollReveal>

          <div className="mt-16 space-y-8">
            {[0, 1, 2].map((i) => {
              const Icon = icons[i];
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <Card className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                      <Icon className="h-7 w-7 text-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-navy-dark">
                        {t(`sections.${i}.title`)}
                      </h2>
                      <p className="mt-2 text-text-muted leading-relaxed">
                        {t(`sections.${i}.description`)}
                      </p>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}

export default function AboutPage() {
  return <AboutContent />;
}
