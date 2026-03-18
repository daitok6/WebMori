import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const POSTS_DIR = path.join(process.cwd(), "src/content/blog");

export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  locale: string;
  readingTime: string;
}

export interface Post extends PostMeta {
  content: string;
}

function getPostFiles(): string[] {
  return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
}

export function getPostBySlug(slug: string, locale: string): Post | null {
  const filename = `${slug}.${locale}.mdx`;
  const filepath = path.join(POSTS_DIR, filename);

  if (!fs.existsSync(filepath)) {
    // Fall back to Japanese if English not available
    const fallback = path.join(POSTS_DIR, `${slug}.ja.mdx`);
    if (!fs.existsSync(fallback)) return null;
    return parsePost(fallback, slug);
  }

  return parsePost(filepath, slug);
}

function parsePost(filepath: string, slug: string): Post {
  const raw = fs.readFileSync(filepath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? "",
    excerpt: data.excerpt ?? "",
    date: data.date ?? "",
    category: data.category ?? "",
    locale: data.locale ?? "ja",
    readingTime: stats.text,
    content,
  };
}

export function getAllPosts(locale: string): PostMeta[] {
  const files = getPostFiles();
  const localeSuffix = `.${locale}.mdx`;

  const slugs = new Set<string>();
  for (const file of files) {
    if (file.endsWith(localeSuffix)) {
      slugs.add(file.replace(localeSuffix, ""));
    }
  }

  // For posts without locale-specific version, fall back to ja
  if (locale !== "ja") {
    for (const file of files) {
      if (file.endsWith(".ja.mdx")) {
        const slug = file.replace(".ja.mdx", "");
        slugs.add(slug);
      }
    }
  }

  const posts: PostMeta[] = [];
  for (const slug of slugs) {
    const post = getPostBySlug(slug, locale);
    if (post) {
      const { content: _, ...meta } = post;
      posts.push(meta);
    }
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllSlugs(): string[] {
  const files = getPostFiles();
  const slugs = new Set<string>();
  for (const file of files) {
    // Remove .<locale>.mdx suffix
    const slug = file.replace(/\.\w+\.mdx$/, "");
    slugs.add(slug);
  }
  return Array.from(slugs);
}
