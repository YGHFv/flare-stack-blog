const POST_PREVIEW_IMAGES: Record<string, string> = {
  "demo-glass-blog-theme":
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
  "demo-tanstack-start-local-notes":
    "https://images.unsplash.com/photo-1498050108023-c5249f4df0852?auto=format&fit=crop&w=1200&q=80",
  "demo-floating-music-player":
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
  "demo-bento-homepage-layout":
    "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80",
  "demo-cloudflare-d1-cache":
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  "demo-desk-notes":
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
};

const FALLBACK_PREVIEW_IMAGES = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
];

export function getPostPreviewImage(slug: string, coverImage?: string | null) {
  if (coverImage?.trim()) return coverImage;

  const configured = POST_PREVIEW_IMAGES[slug];
  if (configured) return configured;

  const hash = Array.from(slug).reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );
  return FALLBACK_PREVIEW_IMAGES[hash % FALLBACK_PREVIEW_IMAGES.length];
}
