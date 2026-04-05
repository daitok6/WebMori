import { getTranslations } from "next-intl/server";
import { FaqJsonLd } from "@/components/seo/faq-json-ld";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.pricing" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "ja" ? "ja_JP" : "en_US",
      siteName: "WebMori",
    },
    alternates: {
      canonical: `https://www.webmori.jp/${locale}/pricing`,
      languages: { ja: "/ja/pricing", en: "/en/pricing" },
    },
  };
}

export default async function PricingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricingPage" });

  // Get the FAQ items from translations
  const faqCount = 6; // there are 6 FAQ items
  const faqs = Array.from({ length: faqCount }, (_, i) => ({
    q: t(`faq.${i}.q`),
    a: t(`faq.${i}.a`),
  }));

  return (
    <>
      <FaqJsonLd faqs={faqs} />
      {children}
    </>
  );
}
