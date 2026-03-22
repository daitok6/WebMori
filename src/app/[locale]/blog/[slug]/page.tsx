import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs, getAllPosts } from "@/lib/blog";
import { getTranslations } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/blog/mdx-components";
import { PostCard } from "@/components/blog/post-card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "blogPage" });

  // Related posts: same category, excluding current
  const allPosts = getAllPosts(locale);
  const related = allPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  return (
    <article className="bg-surface pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal>
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToBlog")}
          </Link>

          <Badge className="mb-4">{post.category}</Badge>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl leading-tight">
            {post.title}
          </h1>

          <div className="mt-4 flex items-center gap-4 text-sm text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readingTime}
            </span>
          </div>

          <hr className="my-8 border-border" />
        </ScrollReveal>

        <div className="prose-webmori">
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="mx-auto max-w-7xl px-6 mt-20">
          <h2 className="text-2xl font-bold text-ink mb-8">
            {t("relatedPosts")}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
