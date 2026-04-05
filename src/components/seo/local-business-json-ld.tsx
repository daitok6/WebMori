interface LocalBusinessJsonLdProps {
  locale: string;
}

export function LocalBusinessJsonLd({ locale }: LocalBusinessJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "WebMori",
    alternateName: "ウェブ守り",
    url: "https://www.webmori.jp",
    description:
      locale === "ja"
        ? "東京のフリーランス・中小企業向けウェブセキュリティ監査サービス"
        : "Web security audit service for Tokyo-based freelancers and SMBs",
    areaServed: {
      "@type": "City",
      name: "Tokyo",
      "@id": "https://www.wikidata.org/wiki/Q1490",
    },
    serviceType: "Web Security Audit",
    priceRange: "¥19,800–¥69,800/月",
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@webmori.jp",
      contactType: "customer support",
      availableLanguage: ["Japanese", "English"],
    },
    founder: {
      "@type": "Person",
      name: locale === "ja" ? "小島 大都" : "Daito Kojima",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
