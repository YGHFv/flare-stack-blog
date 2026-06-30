import { ClientOnly, Link } from "@tanstack/react-router";
import {
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  Flame,
  Pin,
  Tag,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostItem } from "@/features/posts/schema/posts.schema";
import { formatDate } from "@/lib/utils";
import { m } from "@/paraglide/messages";

interface PostCardProps {
  post: PostItem;
  pinned?: boolean;
  popular?: boolean;
  views?: number;
  isLoadingViews?: boolean;
}

export function PostCard({
  post,
  pinned,
  popular,
  views,
  isLoadingViews,
}: PostCardProps) {
  const tagNames = (post.tags ?? []).map((t) => t.name);

  return (
    <div
      className={`atelier-card-base group relative flex w-full flex-col p-5 transition-all duration-300 hover:-translate-y-1 sm:p-6 ${
        pinned ? "border-(--atelier-primary)/35" : ""
      }`}
    >
      {pinned && (
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-(--atelier-primary) via-pink-500 to-sky-400" />
      )}

      <div className="relative w-full">
        {/* Badge */}
        {(pinned || popular) && (
          <div className="mb-4 flex items-center gap-1.5 text-sm font-bold">
            {pinned ? (
              <>
                <Pin
                  size={16}
                  className="fill-current text-(--atelier-primary)"
                />
                <span className="text-(--atelier-primary)">
                  {m.home_pinned_posts()}
                </span>
              </>
            ) : (
              <>
                <Flame size={16} className="text-orange-500" />
                <span className="text-orange-500">
                  {m.home_popular_posts()}
                </span>
              </>
            )}
          </div>
        )}

        <Link
          to="/post/$slug"
          params={{ slug: post.slug }}
          className="mb-3 block w-full text-xl font-black leading-tight tracking-tight atelier-text-90 transition hover:text-(--atelier-primary) active:text-(--atelier-primary) sm:text-2xl"
        >
          {post.title}
          {
            <>
              <ChevronRight className="ml-1 inline-block align-middle text-(--atelier-primary) opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
            </>
          }
        </Link>

        {/* Metadata */}
        <div className="mb-4 flex flex-wrap items-center gap-4 gap-x-4 gap-y-2 atelier-text-50">
          <div className="flex items-center">
            <div className="atelier-meta-icon">
              <Calendar size={20} strokeWidth={1.5} />
            </div>
            <time
              dateTime={post.publishedAt?.toISOString()}
              className="text-sm font-medium"
            >
              <ClientOnly fallback="-">
                {formatDate(post.publishedAt)}
              </ClientOnly>
            </time>
          </div>
          {tagNames.length > 0 && (
            <div className="flex items-center">
              <div className="atelier-meta-icon">
                <Tag size={20} strokeWidth={1.5} />
              </div>
              <div className="flex flex-row flex-wrap items-center gap-x-1.5">
                {tagNames.map((name, i) => (
                  <span key={name} className="flex items-center">
                    {i > 0 && (
                      <span className="mx-1.5 text-(--atelier-meta-divider) text-sm">
                        /
                      </span>
                    )}
                    <Link
                      to="/posts"
                      search={{ q: undefined, tagNames: [name] }}
                      className="atelier-expand-animation rounded-md px-1.5 py-1 -m-1.5 text-sm font-medium hover:text-(--atelier-primary)"
                    >
                      {name}
                    </Link>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div
          className={`wrap-break-word atelier-text-75 ${
            pinned
              ? "mb-4 line-clamp-3 text-base leading-7"
              : "mb-3.5 line-clamp-2 md:line-clamp-1"
          }`}
        >
          {post.summary ?? ""}
        </div>

        {/* Read time and Views */}
        <div className="flex items-center gap-4 text-sm atelier-text-50 [&_svg]:shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} />
            {m.read_time({ count: post.readTimeInMinutes })}
          </span>
          {isLoadingViews ? (
            <span className="inline-flex items-center gap-1.5">
              <Eye size={15} />
              <Skeleton className="h-3.5 w-8 rounded bg-black/10 dark:bg-white/10" />
            </span>
          ) : (
            views !== undefined && (
              <span className="inline-flex items-center gap-1.5">
                <Eye size={15} />
                {views.toLocaleString()}
              </span>
            )
          )}
        </div>
      </div>

      {/* Enter button */}
      <Link
        to="/post/$slug"
        params={{ slug: post.slug }}
        aria-label={post.title}
        className="mt-5 hidden h-11 items-center justify-center gap-2 rounded-2xl bg-white/30 px-4 text-sm font-bold text-(--atelier-btn-content) transition hover:bg-white/45 active:scale-[0.98] dark:bg-white/8 dark:hover:bg-white/12 md:flex"
      >
        {m.post_read_more()}
        <ChevronRight
          className="text-(--atelier-primary)"
          size={18}
          strokeWidth={2}
        />
      </Link>
    </div>
  );
}
