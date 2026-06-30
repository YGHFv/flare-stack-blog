import { Link } from "@tanstack/react-router";
import { CalendarDays, Eye, Flame, Pin } from "lucide-react";
import type { PostItem } from "@/features/posts/schema/posts.schema";
import { m } from "@/paraglide/messages";
import { getPostPreviewImage } from "../utils/post-preview";

function formatPostDate(date: Date | string | null) {
  if (!date) return null;
  return m.format_date({ date: new Date(date) });
}

interface PostImageCardProps {
  post: PostItem;
  pinned?: boolean;
  popular?: boolean;
  views?: number;
  isLoadingViews: boolean;
  index: number;
}

export function PostImageCard({
  post,
  pinned = false,
  popular = false,
  views,
  isLoadingViews,
  index,
}: PostImageCardProps) {
  const date = formatPostDate(post.publishedAt ?? post.createdAt);
  const previewImage = getPostPreviewImage(post.slug, post.coverImage);

  return (
    <Link
      to="/post/$slug"
      params={{ slug: post.slug }}
      className="atelier-card-base group block overflow-hidden p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--atelier-primary)/60"
      style={{
        animationDelay: `calc(var(--atelier-content-delay) + ${index * 50}ms)`,
        viewTransitionName: `post-card-${post.slug}`,
      }}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-[1.25rem] bg-white/25 dark:bg-white/8">
        <img
          src={previewImage}
          alt=""
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading={index < 2 ? "eager" : "lazy"}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/45 via-slate-950/5 to-transparent" />
        <span className="absolute right-3 top-3 rounded-full bg-white/75 px-2.5 py-1 text-xs font-mono text-slate-500 shadow-sm backdrop-blur-md dark:bg-slate-900/65 dark:text-slate-300">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
          {pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-(--atelier-primary) shadow-sm backdrop-blur-md dark:bg-slate-900/75">
              <Pin size={12} />
              {m.home_pinned_posts()}
            </span>
          )}
          {popular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-pink-600 shadow-sm backdrop-blur-md dark:bg-slate-900/75 dark:text-pink-300">
              <Flame size={12} />
              {m.home_popular_posts()}
            </span>
          )}
        </div>
      </div>

      <div className="p-3 pb-4">
        <h2
          className="mb-3 line-clamp-2 text-xl font-black leading-tight tracking-tight atelier-text-90 group-hover:text-(--atelier-primary)"
          style={{ viewTransitionName: `post-title-${post.slug}` }}
        >
          {post.title}
        </h2>

        {post.summary && (
          <p className="mb-5 line-clamp-3 text-sm leading-6 atelier-text-75">
            {post.summary}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-xs atelier-text-50">
          {date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} />
              {date}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Eye size={14} />
            {isLoadingViews ? "..." : m.post_views_count({ count: views ?? 0 })}
          </span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-white/35 px-2.5 py-1 text-xs font-bold text-(--atelier-btn-content) dark:bg-white/8"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
