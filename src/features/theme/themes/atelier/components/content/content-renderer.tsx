import type { JSONContent } from "@tiptap/react";
import { useMemo } from "react";
import { renderReact } from "@/features/theme/themes/atelier/components/content/render";
import { cn } from "@/lib/utils";

interface ContentRendererProps {
  content: JSONContent | null;
  className?: string;
}

/**
 * Atelier Content Renderer:
 * Resolves standard Tiptap AST into React components tailored for the Atelier theme (like Expressive Code).
 */
export function ContentRenderer({ content, className }: ContentRendererProps) {
  const renderedContent = useMemo(() => {
    if (!content) return null;
    return renderReact(content);
  }, [content]);

  if (!content) {
    return null;
  }

  return <div className={cn(className)}>{renderedContent}</div>;
}
