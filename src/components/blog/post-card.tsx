import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import type { PostMeta } from "@/lib/blog";

interface PostCardProps {
  post: PostMeta;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md group">
        <Badge className="mb-3">{post.category}</Badge>
        <h2 className="text-lg font-semibold text-navy-dark group-hover:text-gold transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="mt-2 text-sm text-text-muted leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime}
          </span>
        </div>
      </Card>
    </Link>
  );
}
