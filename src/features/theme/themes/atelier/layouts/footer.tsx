import { ClientOnly, useRouteContext } from "@tanstack/react-router";
import type { NavOption } from "@/features/theme/contract/layouts";
import { m } from "@/paraglide/messages";

interface FooterProps {
  navOptions: Array<NavOption>;
}

export function Footer(_: FooterProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 text-center md:bottom-5">
      <div className="pointer-events-auto max-w-[calc(100vw-2rem)] rounded-full border border-white/30 bg-white/45 px-5 py-3 text-sm leading-6 text-slate-600 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/45 dark:text-slate-300">
        <ClientOnly fallback="-">
          {m.footer_copyright({
            year: currentYear.toString(),
            author: siteConfig.author,
          })}
        </ClientOnly>
        <span className="mx-2 text-slate-400">/</span>
        <a
          href="/rss.xml"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-(--atelier-primary) transition-colors hover:text-indigo-500"
        >
          RSS
        </a>
        <span className="mx-2 text-slate-400">/</span>
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-(--atelier-primary) transition-colors hover:text-indigo-500"
        >
          Sitemap
        </a>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {m.footer_powered_by()}{" "}
          <a
            href="https://tanstack.com/start"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-(--atelier-primary) transition-colors hover:text-indigo-500"
          >
            Tanstack Start
          </a>{" "}
          &{" "}
          <a
            href="https://github.com/du2333/flare-stack-blog"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-(--atelier-primary) transition-colors hover:text-indigo-500"
          >
            Flare Stack Blog
          </a>
        </div>
      </div>
    </footer>
  );
}
