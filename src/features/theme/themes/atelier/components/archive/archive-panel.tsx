import { CalendarDays, Flame, Pin } from "lucide-react";
import type { PostItem } from "@/features/posts/schema/posts.schema";
import { m } from "@/paraglide/messages";
import { ArchivePost } from "./archive-post";
import { ArchiveYear } from "./archive-year";

interface ArchivePanelProps {
  posts: Array<PostItem>;
  title?: string;
  icon?: "calendar" | "pin" | "flame";
}

const PANEL_ICONS = {
  calendar: CalendarDays,
  pin: Pin,
  flame: Flame,
};

export function ArchivePanel({
  posts,
  title = m.posts_title(),
  icon = "calendar",
}: ArchivePanelProps) {
  const Icon = PANEL_ICONS[icon];
  const groupedPosts = posts.reduce(
    (acc, post) => {
      if (!post.publishedAt) {
        return acc;
      }

      const year = new Date(post.publishedAt).getUTCFullYear();
      acc[year] ??= [];
      acc[year].push(post);
      return acc;
    },
    {} as Record<number, Array<PostItem>>,
  );

  const years = Object.keys(groupedPosts)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="atelier-card-base p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--atelier-primary)/12 text-(--atelier-primary)">
            <Icon size={21} strokeWidth={1.7} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight atelier-text-90">
              {title}
            </h1>
            <p className="mt-1 text-sm atelier-text-50">
              {m.posts_count({ count: posts.length })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-7">
        {years.map((year) => (
          <section key={year}>
            <ArchiveYear year={year} count={groupedPosts[year].length} />
            <div className="mt-3 grid grid-cols-1 gap-3">
              {groupedPosts[year].map((post) => (
                <ArchivePost key={post.id} post={post} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
