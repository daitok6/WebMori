interface BlogJsonLdProps {
  title: string;
  description: string;
  datePublished: string;
  slug: string;
  locale: string;
  image?: string;
}

export function BlogJsonLd({ title, description, datePublished, slug, locale, image }: BlogJsonLdProps) {
  const url = `https://www.webmori.jp/${locale}/blog/${slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: image ?? "https://www.webmori.jp/webmori_logo.jpg",
    url,
    datePublished,
    dateModified: datePublished,
    author: {
      "@type": "Person",
      name: locale === "ja" ? "小島 大都" : "Daito Kojima",
      url: `https://www.webmori.jp/${locale}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "WebMori",
      logo: {
        "@type": "ImageObject",
        url: "https://www.webmori.jp/favicon_clean.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    inLanguage: locale === "ja" ? "ja-JP" : "en-US",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
