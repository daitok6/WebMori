import { getTranslations } from "next-intl/server";
import { LocalBusinessJsonLd } from "@/components/seo/local-business-json-ld";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.about" });
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
      canonical: `https://www.webmori.jp/${locale}/about`,
      languages: { ja: "/ja/about", en: "/en/about" },
    },
  };
}

export default async function AboutLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <>
      <LocalBusinessJsonLd />
      {children}
    </>
  );
}
