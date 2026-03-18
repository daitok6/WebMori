import { getTranslations } from "next-intl/server";

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
      siteName: "WebMori",
    },
  };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
