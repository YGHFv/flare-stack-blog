import type { PostItem } from "@/features/posts/schema/posts.schema";
import type { TagWithCount } from "@/features/tags/tags.schema";

export interface PostsPageProps {
  posts: Array<PostItem>;
  pinnedPosts?: Array<PostItem>;
  popularPosts?: Array<PostItem>;
  tags: Array<Omit<TagWithCount, "createdAt">>;
  selectedTags?: Array<string>;
  searchQuery?: string;
  onTagClick: (tag: string) => void;
  onClearTags?: () => void;
  onSearchChange?: (query: string) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}
