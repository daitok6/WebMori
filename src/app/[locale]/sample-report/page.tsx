import { getTranslations } from "next-intl/server";
import { SampleReportContent } from "@/components/marketing/sample-report-content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sampleReport" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      locale: locale === "ja" ? "ja_JP" : "en_US",
      siteName: "WebMori",
    },
    alternates: {
      canonical: `https://www.webmori.jp/${locale}/sample-report`,
      languages: { ja: "/ja/sample-report", en: "/en/sample-report" },
    },
  };
}

export default function SampleReportPage() {
  return <SampleReportContent />;
}
