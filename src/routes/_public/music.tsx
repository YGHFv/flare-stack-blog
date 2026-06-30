import { createFileRoute } from "@tanstack/react-router";
import { MusicPage } from "@/features/theme/themes/atelier/pages/music/page";

export const Route = createFileRoute("/_public/music")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "\u97f3\u4e50",
      },
    ],
  }),
});

function RouteComponent() {
  if (__THEME_NAME__ !== "atelier") {
    return (
      <section className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white/80 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">{"\u97f3\u4e50"}</h1>
      </section>
    );
  }

  return <MusicPage />;
}
