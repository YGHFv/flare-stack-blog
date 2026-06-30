import { LayoutGrid, List, Search, Tags, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useViewCounts } from "@/features/pageview/queries";
import type { PostItem } from "@/features/posts/schema/posts.schema";
import type { PostsPageProps } from "@/features/theme/contract/pages";
import { m } from "@/paraglide/messages";
import { ArchivePanel } from "../../components/archive/archive-panel";
import { PostImageCard } from "../../components/post-image-card";

const DISPLAY_STYLE_LABEL = "\u663e\u793a\u6837\u5f0f";
const ARCHIVE_STYLE_LABEL = "\u5f52\u6863\u5217\u8868";
const CARD_STYLE_LABEL = "\u56fe\u7247\u5361\u7247";
const SEARCH_LABEL = "\u6587\u7ae0\u641c\u7d22";
const SEARCH_PLACEHOLDER = "\u8f93\u5165\u6807\u9898\u6216\u6458\u8981";
const TAG_FILTER_LABEL = "\u6807\u7b7e\u7b5b\u9009";

type PostDisplayMode = "archive" | "cards";

function CardPostsPanel({
  posts,
  pinnedSlugs,
  popularSlugs,
  viewCounts,
  isLoadingViews,
}: {
  posts: Array<PostItem>;
  pinnedSlugs: Set<string>;
  popularSlugs: Set<string>;
  viewCounts?: Record<string, number>;
  isLoadingViews: boolean;
}) {
  return (
    <section>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {posts.map((post, index) => (
          <PostImageCard
            key={post.slug}
            post={post}
            pinned={pinnedSlugs.has(post.slug)}
            popular={popularSlugs.has(post.slug)}
            views={viewCounts?.[post.slug]}
            isLoadingViews={isLoadingViews}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

function PostsControlPanel({
  mode,
  onModeChange,
  tags,
  selectedTags,
  searchQuery,
  onTagClick,
  onSearchChange,
}: {
  mode: PostDisplayMode;
  onModeChange: (mode: PostDisplayMode) => void;
  tags: PostsPageProps["tags"];
  selectedTags: Array<string>;
  searchQuery: string;
  onTagClick: (tag: string) => void;
  onSearchChange?: (query: string) => void;
}) {
  const selectedTagSet = useMemo(() => new Set(selectedTags), [selectedTags]);
  const sortedTags = useMemo(
    () =>
      [...tags].sort(
        (a, b) => b.postCount - a.postCount || a.name.localeCompare(b.name),
      ),
    [tags],
  );

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
      <div className="atelier-card-base p-5">
        <div className="relative mb-4 ml-4 text-base font-black atelier-text-90">
          <span
            className="absolute -left-4 top-1 h-4 w-1 rounded-md"
            style={{ backgroundColor: "var(--atelier-primary)" }}
          />
          {DISPLAY_STYLE_LABEL}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onModeChange("archive")}
            className={`flex h-11 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-bold transition active:scale-[0.98] ${
              mode === "archive"
                ? "bg-(--atelier-primary) text-white shadow-lg"
                : "atelier-btn-regular"
            }`}
          >
            <List size={16} />
            {ARCHIVE_STYLE_LABEL}
          </button>
          <button
            type="button"
            onClick={() => onModeChange("cards")}
            className={`flex h-11 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-bold transition active:scale-[0.98] ${
              mode === "cards"
                ? "bg-(--atelier-primary) text-white shadow-lg"
                : "atelier-btn-regular"
            }`}
          >
            <LayoutGrid size={16} />
            {CARD_STYLE_LABEL}
          </button>
        </div>
      </div>

      <div className="atelier-card-base p-5">
        <div className="relative mb-4 ml-4 text-base font-black atelier-text-90">
          <span
            className="absolute -left-4 top-1 h-4 w-1 rounded-md"
            style={{ backgroundColor: "var(--atelier-primary)" }}
          />
          <span className="inline-flex items-center gap-2">
            <Search size={16} />
            {SEARCH_LABEL}
          </span>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 atelier-text-30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            className="h-11 w-full rounded-2xl border border-(--atelier-input-border) bg-(--atelier-input-bg) pr-10 pl-11 text-sm font-medium atelier-text-90 outline-none transition placeholder:text-black/30 focus:border-(--atelier-primary)/50 focus:bg-(--atelier-primary)/5 dark:placeholder:text-white/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange?.("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full atelier-btn-regular"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="atelier-card-base p-5">
        <div className="relative mb-4 ml-4 text-base font-black atelier-text-90">
          <span
            className="absolute -left-4 top-1 h-4 w-1 rounded-md"
            style={{ backgroundColor: "var(--atelier-primary)" }}
          />
          <span className="inline-flex items-center gap-2">
            <Tags size={16} />
            {TAG_FILTER_LABEL}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {sortedTags.map((tag) => {
            const isSelected = selectedTagSet.has(tag.name);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onTagClick(tag.name)}
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-5 text-base font-medium transition active:scale-95 ${
                  isSelected
                    ? "bg-(--atelier-primary) text-white"
                    : "bg-sky-100/70 text-blue-600 hover:bg-sky-100 dark:bg-sky-400/10 dark:text-sky-200"
                }`}
              >
                <span>{tag.name}</span>
                <span
                  className={`rounded-xl px-2.5 py-1 text-sm ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-sky-200/45 text-blue-500 dark:bg-white/10 dark:text-sky-100"
                  }`}
                >
                  {tag.postCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export function PostsPage({
  posts,
  pinnedPosts = [],
  popularPosts = [],
  tags,
  selectedTags = [],
  searchQuery = "",
  onTagClick,
  onSearchChange,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: PostsPageProps) {
  const observerRef = useRef<HTMLDivElement>(null);
  const [displayMode, setDisplayMode] = useState<PostDisplayMode>("archive");

  const pinnedSlugs = useMemo(
    () => new Set(pinnedPosts.map((post) => post.slug)),
    [pinnedPosts],
  );
  const popularSlugs = useMemo(
    () => new Set(popularPosts.map((post) => post.slug)),
    [popularPosts],
  );
  const matchesControls = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (selectedTags.length === 0 && !query) return () => true;
    return (post: PostItem) => {
      const postTagNames = new Set((post.tags ?? []).map((tag) => tag.name));
      const matchesTags = selectedTags.every((tagName) =>
        postTagNames.has(tagName),
      );
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        (post.summary ?? "").toLowerCase().includes(query);
      return matchesTags && matchesSearch;
    };
  }, [selectedTags, searchQuery]);
  const filteredPinnedPosts = useMemo(() => {
    return pinnedPosts.filter(matchesControls);
  }, [pinnedPosts, matchesControls]);
  const filteredPopularPosts = useMemo(() => {
    return popularPosts.filter(matchesControls);
  }, [popularPosts, matchesControls]);
  const cardPosts = useMemo(() => {
    const seen = new Set<string>();
    const result: PostItem[] = [];

    for (const post of [
      ...filteredPinnedPosts,
      ...filteredPopularPosts,
      ...posts,
    ]) {
      if (seen.has(post.slug)) continue;
      seen.add(post.slug);
      result.push(post);
    }

    return result;
  }, [filteredPinnedPosts, filteredPopularPosts, posts]);
  const visibleSlugs = useMemo(() => {
    return cardPosts.map((post) => post.slug);
  }, [cardPosts]);
  const { data: viewCounts, isPending: isPendingViewCounts } =
    useViewCounts(visibleSlugs);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "0px" },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="atelier-onload-animation grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="flex min-w-0 flex-col gap-5">
        {displayMode === "archive" ? (
          <>
            {filteredPinnedPosts.length > 0 && (
              <ArchivePanel
                posts={filteredPinnedPosts}
                title={"\u7f6e\u9876\u6587\u7ae0"}
                icon="pin"
              />
            )}

            {filteredPopularPosts.length > 0 && (
              <ArchivePanel
                posts={filteredPopularPosts}
                title={"\u70ed\u95e8\u6587\u7ae0"}
                icon="flame"
              />
            )}

            {posts.length > 0 && <ArchivePanel posts={posts} />}
          </>
        ) : (
          cardPosts.length > 0 && (
            <CardPostsPanel
              posts={cardPosts}
              pinnedSlugs={pinnedSlugs}
              popularSlugs={popularSlugs}
              viewCounts={viewCounts}
              isLoadingViews={isPendingViewCounts}
            />
          )
        )}

        {/* Infinite Scroll trigger and loading indicator */}
        <div
          ref={observerRef}
          className="flex flex-col items-center justify-center pt-2 pb-8"
        >
          {isFetchingNextPage ? (
            <div className="atelier-card-base w-full px-8 py-6 opacity-70 animate-pulse">
              {/* Inline Mini Skeleton for appending items */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-full rounded-lg flex flex-row justify-start items-center"
                >
                  <div className="w-[15%] md:w-[10%] flex justify-end pr-2">
                    <Skeleton className="h-4 w-10 bg-black/10 dark:bg-white/10" />
                  </div>
                  <div className="w-[15%] md:w-[10%] relative h-full flex items-center before:absolute before:w-1 left-1/2 -ml-0.5 pointer-events-none before:border-l-2 before:border-dashed before:border-black/5 dark:before:border-white/5 before:-top-5 before:bottom-0 before:h-20 z-0">
                    <div className="mx-auto w-2 h-2 rounded-full bg-black/20 dark:bg-white/20 z-10" />
                  </div>
                  <div className="w-[70%] md:max-w-[65%] md:w-[65%] flex justify-start pl-2">
                    <Skeleton className="h-5 w-3/4 max-w-50 bg-black/10 dark:bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasNextPage ? (
            <div className="h-px w-24 bg-black/10 dark:bg-white/10"></div>
          ) : posts.length > 0 ? (
            <div className="flex items-center gap-4 text-black/20 dark:text-white/20 mt-4">
              <span className="h-px w-12 bg-current" />
              <span className="text-sm font-bold italic">{m.posts_end()}</span>
              <span className="h-px w-12 bg-current" />
            </div>
          ) : (
            <div className="atelier-card-base w-full px-8 py-12 text-center text-sm atelier-text-50">
              {m.posts_no_posts()}
            </div>
          )}
        </div>
      </div>

      <PostsControlPanel
        mode={displayMode}
        onModeChange={setDisplayMode}
        tags={tags}
        selectedTags={selectedTags}
        searchQuery={searchQuery}
        onTagClick={onTagClick}
        onSearchChange={onSearchChange}
      />
    </div>
  );
}
