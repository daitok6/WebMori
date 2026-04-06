export function LocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": "https://www.webmori.jp/#organization",
    name: "WebMori（ウェブ守り）",
    alternateName: "WebMori",
    url: "https://www.webmori.jp",
    logo: "https://www.webmori.jp/logo-on-light.png",
    image: "https://www.webmori.jp/webmori_logo.jpg",
    description:
      "東京のフリーランス・中小企業向け月次ウェブ監査サービス。セキュリティ・パフォーマンス・LINE API・SEOを毎月チェックし、日本語レポートでお届けします。",
    slogan: "守る。改善する。成長させる。",
    address: {
      "@type": "PostalAddress",
      addressLocality: "東京都",
      addressCountry: "JP",
    },
    foundingDate: "2025",
    inLanguage: "ja",
    priceRange: "¥19,800〜¥69,800/月",
    currenciesAccepted: "JPY",
    paymentAccepted: "クレジットカード",
    areaServed: [
      {
        "@type": "City",
        name: "東京",
        sameAs: "https://www.wikidata.org/wiki/Q1490",
      },
      {
        "@type": "Country",
        name: "日本",
        sameAs: "https://www.wikidata.org/wiki/Q17",
      },
    ],
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 35.6762,
        longitude: 139.6503,
      },
      geoRadius: "50000",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "WebMori 監査プラン",
      itemListElement: [
        {
          "@type": "Offer",
          name: "Starterプラン",
          description: "セキュリティ + パフォーマンス監査（月次）",
          price: "19800",
          priceCurrency: "JPY",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "19800",
            priceCurrency: "JPY",
            unitText: "月",
          },
        },
        {
          "@type": "Offer",
          name: "Growthプラン",
          description:
            "セキュリティ + パフォーマンス + LINE API + i18n + 保守性監査（月次）",
          price: "39800",
          priceCurrency: "JPY",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "39800",
            priceCurrency: "JPY",
            unitText: "月",
          },
        },
        {
          "@type": "Offer",
          name: "Proプラン",
          description:
            "全6項目の完全監査（セキュリティ・パフォーマンス・LINE・i18n・保守性・フロントエンド設計）、最大2サイト対応",
          price: "69800",
          priceCurrency: "JPY",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "69800",
            priceCurrency: "JPY",
            unitText: "月",
          },
        },
      ],
    },
    knowsAbout: [
      "ウェブセキュリティ監査",
      "SEO監査",
      "LINE API セキュリティ",
      "パフォーマンス最適化",
      "Core Web Vitals",
      "i18n・日本語UX",
      "Shopify監査",
      "WordPress監査",
      "Next.js監査",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@webmori.jp",
      availableLanguage: {
        "@type": "Language",
        name: "Japanese",
        alternateName: "ja",
      },
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    sameAs: [
      "https://note.com/webmori",
      "https://zenn.dev/webmori",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
