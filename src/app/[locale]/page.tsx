import { getTranslations } from "next-intl/server";
import { HeroSection } from "@/components/marketing/hero-section";

export const revalidate = 3600;
import { TrustLogos } from "@/components/marketing/trust-logos";
import { ProblemSolution } from "@/components/marketing/problem-solution";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { ImplementationTeaser } from "@/components/marketing/implementation-teaser";
import { StatCounter } from "@/components/marketing/stat-counter";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { CTASection } from "@/components/marketing/cta-section";
import { JsonLd } from "@/components/seo/json-ld";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: locale === "ja" ? "ja_JP" : "en_US",
      siteName: "WebMori",
    },
    alternates: {
      languages: { ja: "/ja", en: "/en" },
    },
  };
}

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <HeroSection />
      <TrustLogos />
      <ProblemSolution />
      <HowItWorks />
      <FeatureGrid />
      <ImplementationTeaser />
      <StatCounter />
      <PricingPreview />
      <CTASection />
    </>
  );
}
