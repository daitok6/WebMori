export function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WebMori",
    alternateName: "ウェブ守り",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    description:
      "Web security audit service for Tokyo-based freelancers and SMBs. Monthly audits covering security, performance, LINE API, i18n, and maintainability.",
    offers: [
      {
        "@type": "Offer",
        name: "Starter",
        price: "19800",
        priceCurrency: "JPY",
        priceValidUntil: "2027-03-31",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Growth",
        price: "39800",
        priceCurrency: "JPY",
        priceValidUntil: "2027-03-31",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Pro",
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
