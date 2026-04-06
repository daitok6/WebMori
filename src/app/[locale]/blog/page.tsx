import { getTranslations } from "next-intl/server";
import { getAllPosts } from "@/lib/blog";

export const revalidate = 1800;
import { PostCard } from "@/components/blog/post-card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.blog" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `https://www.webmori.jp/${locale}/blog`,
      languages: { ja: "/ja/blog", en: "/en/blog" },
    },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blogPage" });
  const posts = getAllPosts(locale);

  return (
    <section className="bg-gradient-to-b from-surface-raised to-surface pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <h1 className="text-center text-4xl font-bold text-ink sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-ink-muted">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ScrollReveal key={post.slug}>
              <PostCard post={post} />
            </ScrollReveal>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="mt-12 text-center text-ink-muted">{t("empty")}</p>
        )}
      </div>
    </section>
  );
}
