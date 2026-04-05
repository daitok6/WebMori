export function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WebMori",
    url: "https://www.webmori.jp",
    alternateName: "ウェブ守り",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    description:
      "Web security audit service for Tokyo-based freelancers and SMBs. Monthly audits covering security, performance, LINE API, i18n, and maintainability.",
    offers: [
      {
        "@type": "Offer",
        name: "Starter",
        description:
          "1 site, monthly security + performance audit, basic LINE check, all safe fixes as GitHub PRs",
        price: "19800",
        priceCurrency: "JPY",
        priceValidUntil: "2027-03-31",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Growth",
        description:
          "1 site, monthly 5-lens audit (security, performance, LINE API, i18n, maintainability), all safe fixes as GitHub PRs",
        price: "39800",
        priceCurrency: "JPY",
        priceValidUntil: "2027-03-31",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Pro",
        description:
          "2 sites, monthly + ad-hoc deep 5-lens audit, CVE tracking, quarterly strategic review, all safe fixes as GitHub PRs",
        price: "69800",
        priceCurrency: "JPY",
        priceValidUntil: "2027-03-31",
        availability: "https://schema.org/InStock",
      },
    ],
    provider: {
      "@type": "Organization",
      name: "WebMori",
      alternateName: "ウェブ守り",
      areaServed: {
        "@type": "City",
        name: "Tokyo",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
