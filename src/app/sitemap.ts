import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog";

const BASE_URL = "https://www.webmori.jp";

const pages = ["", "/features", "/pricing", "/about", "/contact", "/blog", "/services", "/compare", "/sample-report"];
const locales = ["ja", "en"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : page === "/blog" ? 0.7 : 0.8,
        alternates: {
          languages: {
            ja: `${BASE_URL}/ja${page}`,
            en: `${BASE_URL}/en${page}`,
          },
        },
      });
    }
  }

  // Blog posts
  const slugs = getAllSlugs();
  for (const slug of slugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: {
            ja: `${BASE_URL}/ja/blog/${slug}`,
            en: `${BASE_URL}/en/blog/${slug}`,
          },
        },
      });
    }
  }

  return entries;
}
