import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.contact" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "ja" ? "ja_JP" : "en_US",
      siteName: "WebMori（ウェブ守り）",
    },
    alternates: {
      canonical: `https://www.webmori.jp/${locale}/contact`,
      languages: { ja: "/ja/contact", en: "/en/contact" },
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
