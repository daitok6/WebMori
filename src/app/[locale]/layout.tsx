import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { MarketingShell } from "@/components/layout/marketing-shell";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "WebMori - Web Security Audit Service",
    template: "%s | WebMori",
  },
  description:
    "Tokyo-based web security audit service for freelancers and SMBs. Monthly audits covering security, performance, LINE API, i18n, and maintainability.",
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
    <html lang={locale}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <MarketingShell>{children}</MarketingShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
