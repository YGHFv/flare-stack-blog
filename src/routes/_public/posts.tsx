import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import theme from "@theme";
import { useMemo } from "react";
import { z } from "zod";
import { siteConfigQuery, siteDomainQuery } from "@/features/config/queries";
import {
  pinnedPostsQuery,
  popularPostsQuery,
  postsInfiniteQueryOptions,
} from "@/features/posts/queries";
import { tagsQueryOptions } from "@/features/tags/queries";
import { buildCanonicalUrl, canonicalLink } from "@/lib/seo";
import { m } from "@/paraglide/messages";

const { postsPerPage } = theme.config.posts;
const popularPostsLimit = 3;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

const PostsSearchSchema = z.object({
  q: z.string().optional(),
  tagName: z.string().optional(),
  tagNames: z.preprocess((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value
        .split(",")
        .map((tagName) => tagName.trim())
        .filter(Boolean);
    }
    return value;
  }, z.array(z.string()).optional()),
});

function normalizeSearchTagNames(search: {
  tagName?: string;
  tagNames?: Array<string>;
}) {
  return [
    ...new Set(
      [...(search.tagNames ?? []), search.tagName]
        .filter(isNonEmptyString)
        .map((tagName) => tagName.trim()),
    ),
  ].sort();
}

export const Route = createFileRoute("/_public/posts")({
  validateSearch: (search) => {
    const parsed = PostsSearchSchema.parse(search);
    const tagNames = normalizeSearchTagNames(parsed);
    const q = parsed.q?.trim() || undefined;
    return { q, tagNames: tagNames.length > 0 ? tagNames : undefined };
  },
  component: RouteComponent,
  pendingComponent: PostsSkeleton,
  loaderDeps: ({ search: { q, tagNames } }) => ({
    q,
    tagNames: tagNames ?? [],
  }),
  loader: async ({ context, deps }) => {
    const [, , , , domain, siteConfig] = await Promise.all([
      context.queryClient.prefetchInfiniteQuery(
        postsInfiniteQueryOptions({
          search: deps.q,
          tagNames: deps.tagNames,
          limit: postsPerPage,
        }),
      ),
      context.queryClient.ensureQueryData(pinnedPostsQuery),
      context.queryClient.ensureQueryData(popularPostsQuery(popularPostsLimit)),
      context.queryClient.prefetchQuery(tagsQueryOptions),
      context.queryClient.ensureQueryData(siteDomainQuery),
      context.queryClient.ensureQueryData(siteConfigQuery),
    ]);

    return {
      title: m.posts_title(),
      description: siteConfig.description,
      canonicalHref: buildCanonicalUrl(domain, "/posts", {
        q: deps.q,
        tagNames:
          deps.tagNames.length > 0 ? deps.tagNames.join(",") : undefined,
      }),
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title,
      },
      {
        name: "description",
        content: loaderData?.description,
      },
    ],
    links: [canonicalLink(loaderData?.canonicalHref ?? "/posts")],
  }),
});

function RouteComponent() {
  const { q, tagNames = [] } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: tags } = useSuspenseQuery(tagsQueryOptions);
  const { data: pinnedPosts } = useSuspenseQuery(pinnedPostsQuery);
  const { data: popularPosts } = useSuspenseQuery(
    popularPostsQuery(popularPostsLimit),
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      postsInfiniteQueryOptions({
        search: q,
        tagNames,
        limit: postsPerPage,
      }),
    );

  const posts = useMemo(() => {
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  const handleTagClick = (clickedTag: string) => {
    const selectedTags = new Set(tagNames);
    if (selectedTags.has(clickedTag)) {
      selectedTags.delete(clickedTag);
    } else {
      selectedTags.add(clickedTag);
    }
    const nextTagNames = [...selectedTags].sort();

    navigate({
      search: {
        q,
        tagNames: nextTagNames.length > 0 ? nextTagNames : undefined,
      },
      replace: true, // Replace history to avoid back-button clutter
    });
  };

  const handleClearTags = () => {
    navigate({
      search: { q, tagNames: undefined },
      replace: true,
    });
  };

  const handleSearchChange = (query: string) => {
    navigate({
      search: {
        q: query.trim() || undefined,
        tagNames: tagNames.length > 0 ? tagNames : undefined,
      },
      replace: true,
    });
  };

  return (
    <theme.PostsPage
      posts={posts}
      pinnedPosts={pinnedPosts}
      popularPosts={popularPosts}
      tags={tags}
      selectedTags={tagNames}
      searchQuery={q}
      onTagClick={handleTagClick}
      onClearTags={handleClearTags}
      onSearchChange={handleSearchChange}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}

function PostsSkeleton() {
  return <theme.PostsPageSkeleton />;
}
