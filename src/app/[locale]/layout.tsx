import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_JP } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import { MarketingShell } from "@/components/layout/marketing-shell";
import "../globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: false,
  weight: ["400", "500", "700", "900"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.webmori.jp";

export const metadata: Metadata = {
  title: {
    default: "WebMori（ウェブ守り）- Web Security Audit Service",
    template: "%s | WebMori（ウェブ守り）",
  },
  description:
    "Tokyo-based web security audit service for freelancers and SMBs. Monthly audits covering security, performance, LINE API, i18n, and maintainability.",
  icons: {
    icon: "/favicon_clean.png",
    shortcut: "/favicon_clean.png",
    apple: "/favicon_clean.png",
  },
  metadataBase: new URL(siteUrl),
  openGraph: {
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "WebMori（ウェブ守り）- Web Security Audit Service",
      },
    ],
    siteName: "WebMori（ウェブ守り）",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale} className={`${dmSans.variable} ${notoSansJP.variable}`}>
      <body className="font-sans antialiased bg-surface text-ink">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <MarketingShell>{children}</MarketingShell>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
        <Script
          src="https://umami.zeroen.dev/script.js"
          data-website-id="1f2865e4-c090-4bc3-b83d-1865e12b6c23"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
