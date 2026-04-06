import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;
import { Card } from "@/components/ui/card";
import { CTASection } from "@/components/marketing/cta-section";
import { Target, Shield, GitPullRequest } from "lucide-react";

const sectionIcons = [Target, Shield, GitPullRequest];

function AboutContent() {
  const t = useTranslations("aboutPage");

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-surface-raised to-surface pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <ScrollReveal>
            <h1 className="text-4xl font-bold text-ink sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
              {t("subtitle")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Story section ── */}
      <section className="bg-surface border-y border-border py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-start">
            <ScrollReveal direction="left">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                {t("storyLabel")}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink leading-tight mb-6">
                {t("storyTitle")}
              </h2>
              <div className="space-y-4 text-ink-muted leading-relaxed">
                <p>{t("storyBody1")}</p>
                <p>{t("storyBody2")}</p>
              </div>
            </ScrollReveal>

            {/* Visual accent block */}
            <ScrollReveal direction="right" delay={0.15}>
              <div className="rounded-2xl bg-surface-raised border border-border p-8 space-y-5">
                {/* Amber rule */}
                <div className="h-[3px] w-10 rounded-full bg-primary" />
                <p className="text-4xl font-black tracking-tight text-ink">
                  毎月、<span className="text-primary">プロが守る</span>。
                </p>
                <p className="text-ink-muted text-sm leading-relaxed">
                  セキュリティ · パフォーマンス · LINE API<br />
                  国際化 · 保守性 · フロントエンド品質
                </p>
                <div className="pt-2 border-t border-border flex flex-col gap-2.5">
                  {(["✓ OWASP準拠", "✓ IPA推奨基準", "✓ LINE公式パートナー対応"] as const).map((item) => (
                    <span key={item} className="text-sm text-ink-muted">{item}</span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Principles ── */}
      <section className="bg-surface-raised py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              {t("principlesLabel")}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-10">
              WebMoriが大切にしていること
            </h2>
          </ScrollReveal>

          <div className="space-y-5">
            {([0, 1, 2] as const).map((i) => {
              const Icon = sectionIcons[i];
              return (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <Card className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-ink">
                        {t(`sections.${i}.title`)}
                      </h3>
                      <p className="mt-2 text-ink-muted leading-relaxed">
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

      {/* ── Supported stacks ── */}
      <section className="bg-surface border-y border-border py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              {t("stackLabel")}
            </p>
            <h2 className="text-2xl font-bold text-ink mb-10">
              {t("stackTitle")}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {([0, 1, 2, 3, 4] as const).map((i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="rounded-xl border border-border bg-surface-raised p-5 text-center">
                  <div className="text-3xl mb-3">{t(`stacks.${i}.icon`)}</div>
                  <p className="font-semibold text-ink text-sm mb-1">{t(`stacks.${i}.name`)}</p>
                  <p className="text-xs text-ink-subtle leading-snug">{t(`stacks.${i}.desc`)}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder ── */}
      <section className="bg-surface-raised py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal>
            <div className="rounded-2xl border border-border bg-surface p-8 sm:p-10 flex flex-col items-center text-center md:flex-row md:text-left md:gap-10">
              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary mb-6 md:mb-0">
                DK
              </div>
              <div>
                <p className="text-2xl font-bold text-ink">{t("founder.name")}</p>
                <p className="text-sm text-primary font-medium mt-1">{t("founder.role")}</p>
                <p className="mt-4 text-ink-muted leading-relaxed max-w-xl">{t("founder.bio")}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.about" });
  return { title: t("title"), description: t("description") };
}

export default function AboutPage() {
  return <AboutContent />;
}
