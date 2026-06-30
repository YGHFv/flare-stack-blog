import { ClientOnly, Link } from "@tanstack/react-router";
import { CalendarDays, Clock } from "lucide-react";
import type { PostItem } from "@/features/posts/schema/posts.schema";
import { m } from "@/paraglide/messages";
import { getPostPreviewImage } from "../../utils/post-preview";

interface ArchivePostProps {
  post: PostItem;
}

export function ArchivePost({ post }: ArchivePostProps) {
  const date = post.publishedAt ? new Date(post.publishedAt) : null;
  const previewImage = getPostPreviewImage(post.slug, post.coverImage);

  return (
    <Link
      to="/post/$slug"
      params={{ slug: post.slug }}
      className="group block w-full rounded-2xl border border-white/30 bg-white/25 p-3 transition-all hover:-translate-y-0.5 hover:bg-white/45 active:bg-white/55 dark:border-white/8 dark:bg-white/5 dark:hover:bg-white/10"
      aria-label={post.title}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-white/25 sm:w-36 dark:bg-white/8">
          <img
            src={previewImage}
            alt=""
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-base font-black atelier-text-90 transition-colors group-hover:text-(--atelier-primary) md:text-lg">
                {post.title}
              </h2>
              {post.summary && (
                <p className="mt-1 line-clamp-1 text-sm atelier-text-50">
                  {post.summary}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3 text-xs atelier-text-50">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} />
                <ClientOnly fallback="-">
                  {date ? m.format_month_day({ date }) : "-"}
                </ClientOnly>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} />
                {m.read_time({ count: post.readTimeInMinutes })}
              </span>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.slice(0, 4).map((tag) => (
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
      </div>
    </Link>
  );
}
