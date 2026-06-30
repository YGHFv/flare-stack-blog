import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { tagsQueryOptions } from "@/features/tags/queries";
import { m } from "@/paraglide/messages";

export function TagsSkeleton() {
  return (
    <div className="atelier-card-base p-5">
      <Skeleton className="mb-4 h-5 w-20" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function Tags() {
  const { data: tags } = useSuspenseQuery(tagsQueryOptions);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Check if content height exceeds max height (10rem / 160px)
      setShowToggle(containerRef.current.scrollHeight > 160);
    }
  }, [tags]);

  if (tags.length === 0) return null;

  return (
    <div className="atelier-card-base p-5 transition-all duration-300">
      <div className="relative mb-4 ml-4 text-base font-black atelier-text-90">
        <span
          className="absolute -left-4 top-1 w-1 h-4 rounded-md"
          style={{ backgroundColor: "var(--atelier-primary)" }}
        />
        {m.tags_title()}
      </div>

      <div
        ref={containerRef}
        className={`flex flex-wrap gap-2 overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          isExpanded || !showToggle ? "max-h-250" : "max-h-40"
        }`}
      >
        {tags.map((tag) => (
          <Link
            key={tag.id}
            to="/posts"
            search={{ q: undefined, tagNames: [tag.name] }}
            className="atelier-btn-regular h-8 rounded-full px-3 text-sm font-medium flex items-center gap-2"
          >
            <span>{tag.name}</span>
            <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-xs opacity-70 dark:bg-white/10">
              {tag.postCount}
            </span>
          </Link>
        ))}
      </div>

      {showToggle && (
        <div className="pt-3 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-center gap-1 rounded-full py-2 text-sm atelier-text-50 transition-colors hover:bg-(--atelier-btn-plain-bg-hover) hover:text-(--atelier-primary)"
          >
            {isExpanded ? (
              <>
                {m.tags_collapse()} <ChevronUp size={16} />
              </>
            ) : (
              <>
                {m.tags_expand()} <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
