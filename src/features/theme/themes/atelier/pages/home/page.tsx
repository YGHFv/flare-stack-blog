import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import {
  Loader2,
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  resolveSocialHref,
  SOCIAL_PLATFORMS,
} from "@/features/config/utils/social-platforms";
import { useViewCounts } from "@/features/pageview/queries";
import type { PostItem } from "@/features/posts/schema/posts.schema";
import type { HomePageProps } from "@/features/theme/contract/pages";
import { useMusic } from "../../components/music/music-provider";
import { PostImageCard } from "../../components/post-image-card";

interface MergedPost {
  post: PostItem;
  pinned: boolean;
  popular: boolean;
}

const GITHUB_USERNAME = "YGHFv";
const GITHUB_CONTRIBUTIONS_API = `/api/github/contributions?username=${GITHUB_USERNAME}`;
const GITHUB_CONTRIBUTIONS_CACHE_KEY = `atelier:github-contributions:${GITHUB_USERNAME}`;

interface GitHubContributionDay {
  date: string;
  count: number;
  level: number;
}

interface GitHubContributionsResponse {
  total?: {
    lastYear?: number;
  };
  contributions?: Array<GitHubContributionDay>;
}

interface LocalCacheValue<T> {
  savedAt: number;
  data: T;
}

function readLocalCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const cached = JSON.parse(raw) as LocalCacheValue<T>;
    if (!cached.savedAt) return null;

    return cached.data;
  } catch {
    return null;
  }
}

function writeLocalCache<T>(key: string, data: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: Date.now(),
        data,
      } satisfies LocalCacheValue<T>),
    );
  } catch {
    // Storage can be unavailable in private mode; network data still renders.
  }
}

function formatTime(time: number) {
  if (!time || Number.isNaN(time)) return "00:00";
  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function createMergedPosts(
  posts: Array<PostItem>,
  pinnedPosts?: Array<PostItem>,
  popularPosts?: Array<PostItem>,
) {
  const seen = new Set<string>();
  const result: Array<MergedPost> = [];
  const popularSlugs = new Set((popularPosts ?? []).map((post) => post.slug));

  for (const post of pinnedPosts ?? []) {
    if (seen.has(post.slug)) continue;
    seen.add(post.slug);
    result.push({ post, pinned: true, popular: popularSlugs.has(post.slug) });
  }

  for (const post of popularPosts ?? []) {
    if (seen.has(post.slug)) continue;
    seen.add(post.slug);
    result.push({ post, pinned: false, popular: true });
  }

  for (const post of posts) {
    if (seen.has(post.slug)) continue;
    seen.add(post.slug);
    result.push({ post, pinned: false, popular: false });
  }

  return result;
}

function useTypedText(text: string, speed = 42) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    setDisplayedText("");

    if (!text) return;

    const timer = window.setInterval(() => {
      index += 1;
      setDisplayedText(text.slice(0, index));

      if (index >= text.length) window.clearInterval(timer);
    }, speed);

    return () => window.clearInterval(timer);
  }, [text, speed]);

  return displayedText;
}

function formatContributionDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${year}-${Number(month)}-${Number(day)}`;
}

function formatContributionTooltip(day: GitHubContributionDay) {
  return `${formatContributionDate(day.date)} ${day.count}次更新`;
}

function getContributionMonthLabel(date: string) {
  const [, month] = date.split("-");
  return `${Number(month)}月`;
}

function createContributionMonthLabels(
  contributions: Array<GitHubContributionDay>,
) {
  const rawLabels: Array<{ label: string; weekIndex: number }> = [];

  contributions.forEach((day, index) => {
    const currentMonth = day.date.slice(0, 7);
    const previousMonth = contributions[index - 1]?.date.slice(0, 7);

    if (index === 0 || currentMonth !== previousMonth) {
      rawLabels.push({
        label: getContributionMonthLabel(day.date),
        weekIndex: Math.floor(index / 7),
      });
    }
  });

  const visibleLabels: Array<{ label: string; weekIndex: number }> = [];

  rawLabels.forEach((label, index) => {
    const nextLabel = rawLabels[index + 1];
    if (index === 0 && nextLabel && nextLabel.weekIndex - label.weekIndex < 3) {
      return;
    }

    const previousLabel = visibleLabels[visibleLabels.length - 1];
    if (previousLabel && label.weekIndex - previousLabel.weekIndex < 3) {
      return;
    }

    visibleLabels.push(label);
  });

  return visibleLabels;
}

function useGitHubContributions() {
  const [data, setData] = useState<GitHubContributionsResponse | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadContributions() {
      const cached = readLocalCache<GitHubContributionsResponse>(
        GITHUB_CONTRIBUTIONS_CACHE_KEY,
      );
      if (cached && !ignore) setData(cached);

      try {
        const response = await fetch(GITHUB_CONTRIBUTIONS_API, {
          cache: "no-cache",
        });
        if (!response.ok) return;

        const nextData = (await response.json()) as GitHubContributionsResponse;
        writeLocalCache(GITHUB_CONTRIBUTIONS_CACHE_KEY, nextData);
        if (!ignore) setData(nextData);
      } catch {
        if (!ignore && !cached) setData(null);
      }
    }

    loadContributions();

    return () => {
      ignore = true;
    };
  }, []);

  return data;
}

function ProfileIntroCard({ totalPosts }: { totalPosts: number }) {
  const { siteConfig } = useRouteContext({ from: "__root__" });

  return (
    <section className="atelier-card-base group relative flex min-h-[260px] flex-col justify-between overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-7 lg:col-span-7">
      <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-(--atelier-primary)/25 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
      <div className="relative z-10 flex items-start gap-4 sm:gap-6">
        <div className="h-20 w-20 shrink-0 rounded-[1.25rem] bg-linear-to-tr from-(--atelier-primary) via-pink-500 to-sky-400 p-1 shadow-xl transition-transform duration-500 group-hover:rotate-3 sm:h-24 sm:w-24">
          <img
            src={siteConfig.theme.atelier.avatar}
            alt=""
            className="h-full w-full rounded-2xl bg-white object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="mb-3 truncate text-2xl font-black leading-tight tracking-normal atelier-text-90 sm:text-3xl">
            {siteConfig.author}
          </h1>
          <p className="line-clamp-3 text-sm font-medium leading-7 atelier-text-75 sm:text-base">
            {siteConfig.description}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-7 flex items-end justify-between gap-4">
        <Link
          to="/posts"
          search={{ q: undefined, tagNames: undefined }}
          className="group/stat flex shrink-0 rounded-2xl px-1 py-1 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--atelier-primary)/60"
          aria-label="查看文章"
        >
          <ProfileStat count={totalPosts} label="文章" />
        </Link>

        <div className="flex flex-wrap justify-end gap-2">
          {siteConfig.social
            .filter((link) => link.url)
            .slice(0, 6)
            .map((link, index) => {
              const preset =
                link.platform !== "custom"
                  ? SOCIAL_PLATFORMS[link.platform]
                  : null;
              const Icon = preset?.icon;
              const label = preset?.label ?? link.label ?? "Social link";
              const href = resolveSocialHref(link.platform, link.url);

              return (
                <a
                  key={`${link.platform}-${index}`}
                  href={href}
                  target={link.platform === "email" ? undefined : "_blank"}
                  rel={link.platform === "email" ? undefined : "me noreferrer"}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/45 bg-white/45 text-slate-700 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-(--atelier-primary) hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-slate-200"
                >
                  {Icon ? (
                    <Icon size={19} strokeWidth={1.8} />
                  ) : (
                    <img src={link.icon} alt="" className="h-5 w-5" />
                  )}
                </a>
              );
            })}
        </div>
      </div>
    </section>
  );
}

function ProfileStat({ count, label }: { count: number; label: string }) {
  return (
    <div className="min-w-20 text-center">
      <div className="text-4xl font-black leading-none text-(--atelier-primary) transition-transform group-hover/stat:scale-110">
        {count}
      </div>
      <div className="mt-2 text-sm font-bold tracking-[0.14em] atelier-text-50">
        {label}
      </div>
    </div>
  );
}

function MusicShowcaseCard() {
  const navigate = useNavigate();
  const {
    playlist,
    currentSong,
    isPlaying,
    isLoading,
    currentLyric,
    currentTime,
    duration,
    progress,
    togglePlay,
    prevSong,
    nextSong,
    seekToProgress,
  } = useMusic();
  const typedLyric = useTypedText(currentLyric || "", 46);

  if (isLoading) {
    return (
      <div className="atelier-card-base flex min-h-[260px] flex-col items-center justify-center p-6 lg:col-span-5">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-(--atelier-primary)" />
        <span className="text-xs font-black uppercase tracking-[0.24em] atelier-text-75">
          Connecting
        </span>
      </div>
    );
  }

  if (playlist.length === 0 || !currentSong) {
    return (
      <div className="atelier-card-base flex min-h-[260px] flex-col items-center justify-center p-6 lg:col-span-5">
        <Music2 className="mb-4 h-12 w-12 text-(--atelier-primary)" />
        <span className="text-xs font-black uppercase tracking-[0.24em] atelier-text-75">
          No Music Available
        </span>
      </div>
    );
  }

  return (
    <div
      className="atelier-card-base group relative flex min-h-[260px] cursor-pointer flex-col justify-between overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-6 lg:col-span-5"
      onClick={() => navigate({ to: "/music" })}
    >
      <div
        className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-(--atelier-primary)/25 blur-3xl transition-opacity duration-700 ${
          isPlaying ? "opacity-90" : "opacity-35"
        }`}
      />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-white/60 shadow-xl animate-[spin_7s_linear_infinite]"
          style={{ animationPlayState: isPlaying ? "running" : "paused" }}
        >
          <img
            src={currentSong.cover}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300/60 bg-white/85 shadow-inner" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-black tracking-normal atelier-text-90">
            {currentSong.title} - {currentSong.artist}
          </h2>
        </div>
      </div>

      <div className="relative z-10 my-5 min-h-7 overflow-hidden text-center">
        <p className="truncate text-sm font-bold text-(--atelier-primary)">
          {typedLyric || currentLyric || "Instrumental"}
        </p>
      </div>

      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-3 text-xs font-bold atelier-text-60">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Number.isFinite(progress) ? progress : 0}
            onChange={(event) => seekToProgress(Number(event.target.value))}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/45 accent-(--atelier-primary) outline-none shadow-inner dark:bg-white/10"
            aria-label="Music progress"
            style={{
              background: `linear-gradient(to right, var(--atelier-primary) ${progress}%, rgba(148,163,184,0.35) ${progress}%)`,
            }}
          />
          <span className="w-10">{formatTime(duration)}</span>
        </div>
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              prevSong();
            }}
            className="text-slate-600 transition-colors hover:text-(--atelier-primary) dark:text-slate-300"
            aria-label="Previous song"
          >
            <SkipBack className="h-6 w-6" fill="currentColor" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              togglePlay();
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/60 bg-(--atelier-primary) text-white shadow-lg transition-transform hover:scale-110"
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" fill="currentColor" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
            )}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              nextSong();
            }}
            className="text-slate-600 transition-colors hover:text-(--atelier-primary) dark:text-slate-300"
            aria-label="Next song"
          >
            <SkipForward className="h-6 w-6" fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}

function LyricStrip() {
  const { isPlaying, currentLyric, currentSong } = useMusic();
  const typedLyric = useTypedText(currentLyric || "", 42);
  const waves = [0, 180, 360, 90, 270];

  return (
    <div className="hidden min-h-20 items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-xl md:flex md:px-6">
      <div className="flex h-9 w-16 shrink-0 items-end justify-center gap-1">
        {waves.map((delay, index) => (
          <span
            key={delay}
            className={`w-1.5 rounded-t-sm bg-(--atelier-primary) transition-all ${
              isPlaying ? "animate-[atelierWave_1s_ease-in-out_infinite]" : ""
            }`}
            style={{
              animationDelay: `${delay}ms`,
              height: isPlaying ? undefined : `${5 + index}px`,
            }}
          />
        ))}
      </div>
      <p className="min-w-0 flex-1 truncate text-center text-sm font-black tracking-normal text-white drop-shadow-[0_0_12px_rgba(99,102,241,0.65)] sm:text-lg">
        {typedLyric || currentLyric || currentSong?.title || "Music ready"}
        <span className="ml-1 inline-block h-5 w-0.5 align-middle bg-(--atelier-primary) animate-pulse" />
      </p>
      <Music2
        className={`h-6 w-6 shrink-0 text-(--atelier-primary) transition-opacity ${
          isPlaying ? "opacity-80" : "opacity-35"
        }`}
      />
    </div>
  );
}

function ContributionHeatmap() {
  const contributionData = useGitHubContributions();
  const scrollRef = useRef<HTMLDivElement>(null);
  const contributions = contributionData?.contributions ?? [];
  const contributionCount = contributionData?.total?.lastYear ?? null;
  const weeks = useMemo(() => {
    const result: Array<Array<GitHubContributionDay>> = [];

    for (let index = 0; index < contributions.length; index += 7) {
      result.push(contributions.slice(index, index + 7));
    }

    return result;
  }, [contributions]);
  const monthLabels = useMemo(() => {
    return createContributionMonthLabels(contributions);
  }, [contributions]);
  const heatmapGridStyle = {
    width: "100%",
    gridTemplateColumns: `repeat(${Math.max(weeks.length, 53)}, 0.75rem)`,
    columnGap: "0.25rem",
    justifyContent: "space-between",
  };
  const levelClassName = [
    "bg-white/35 dark:bg-white/8",
    "bg-emerald-300/55 dark:bg-emerald-500/25",
    "bg-emerald-400/70 dark:bg-emerald-400/45",
    "bg-emerald-500/85 dark:bg-emerald-300/65",
    "bg-emerald-600 dark:bg-emerald-200/90",
  ];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || weeks.length === 0) return;

    if (window.matchMedia("(max-width: 767px)").matches) {
      container.scrollLeft = container.scrollWidth;
    }
  }, [weeks.length]);

  return (
    <section className="atelier-card-base overflow-hidden p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-normal atelier-text-90">
            项目动态
          </h2>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold atelier-text-60">
            GitHub @{GITHUB_USERNAME}
          </div>
          <div className="mt-1 text-xs font-bold atelier-text-50">
            {contributionCount === null
              ? "Loading contributions..."
              : `${contributionCount} contributions in the last year`}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-2">
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noreferrer"
          className="block min-w-[900px] rounded-2xl bg-white/35 p-4 transition-opacity hover:opacity-95 dark:bg-white/8"
        >
          {weeks.length > 0 ? (
            <div className="space-y-2">
              <div
                className="grid h-4 text-[10px] font-bold leading-none atelier-text-50"
                style={heatmapGridStyle}
                aria-hidden
              >
                {monthLabels.map(({ label, weekIndex }) => (
                  <span
                    key={`${label}-${weekIndex}`}
                    className="pointer-events-none w-max whitespace-nowrap justify-self-start"
                    style={{ gridColumnStart: weekIndex + 1 }}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div
                className="grid grid-flow-col grid-rows-7 gap-y-1"
                style={heatmapGridStyle}
                aria-label={`${GITHUB_USERNAME} GitHub contributions`}
              >
                {weeks.map((week, weekIndex) =>
                  week.map((day, dayIndex) => (
                    <span
                      key={day.date}
                      title={formatContributionTooltip(day)}
                      aria-label={formatContributionTooltip(day)}
                      className={`h-3 w-3 rounded-[0.1875rem] border border-white/30 transition-transform hover:scale-125 hover:ring-2 hover:ring-(--atelier-primary)/45 dark:border-white/8 ${
                        levelClassName[Math.max(0, Math.min(day.level, 4))]
                      }`}
                      style={{
                        gridColumnStart: weekIndex + 1,
                        gridRowStart: dayIndex + 1,
                      }}
                    />
                  )),
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-flow-col grid-rows-7 gap-1">
              {Array.from({ length: 371 }).map((_, index) => (
                <span
                  key={index}
                  className="h-3 w-3 animate-pulse rounded-[0.1875rem] bg-white/35 dark:bg-white/8"
                />
              ))}
            </div>
          )}
        </a>
      </div>
    </section>
  );
}

export function HomePage({ posts, pinnedPosts, popularPosts }: HomePageProps) {
  const mergedPosts = useMemo(
    () => createMergedPosts(posts, pinnedPosts, popularPosts),
    [posts, pinnedPosts, popularPosts],
  );
  const allPosts = useMemo(
    () => mergedPosts.map((item) => item.post),
    [mergedPosts],
  );
  const allSlugs = useMemo(() => allPosts.map((post) => post.slug), [allPosts]);
  const { data: viewCounts, isPending: isPendingViewCounts } =
    useViewCounts(allSlugs);

  return (
    <div className="flex flex-col gap-5">
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <ProfileIntroCard totalPosts={allPosts.length} />
        <MusicShowcaseCard />
      </section>

      <LyricStrip />

      <ContributionHeatmap />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-normal atelier-text-90">
              最新文章
            </h2>
          </div>
          <Link
            to="/posts"
            search={{ q: undefined, tagNames: undefined }}
            className="text-sm font-black text-(--atelier-primary) transition-opacity hover:opacity-70"
          >
            查看文章
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {mergedPosts.map((item, index) => (
            <PostImageCard
              key={item.post.slug}
              post={item.post}
              pinned={item.pinned}
              popular={item.popular}
              views={viewCounts?.[item.post.slug]}
              isLoadingViews={isPendingViewCounts}
              index={index}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
