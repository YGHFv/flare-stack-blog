import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import type { PublicLayoutProps } from "@/features/theme/contract/layouts";
import { BackToTop } from "../components/control/back-to-top";
import { FloatingMusicPlayer } from "../components/music/floating-music-player";
import { MusicProvider } from "../components/music/music-provider";
import { Footer } from "./footer";
import { MobileMenu } from "./mobile-menu";
import { Navbar } from "./navbar";

export function PublicLayout({
  children,
  navOptions,
  user,
  isSessionLoading,
  logout,
}: PublicLayoutProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const backgroundImage =
    siteConfig.theme.atelier.backgroundImages[0] ||
    siteConfig.theme.atelier.homeBg;

  return (
    <MusicProvider>
      <div className="relative min-h-screen bg-(--atelier-page-bg) transition-colors overflow-x-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={backgroundImage}
            alt=""
            fetchPriority="high"
            className="h-full w-full scale-[1.04] object-cover"
            style={{
              filter: "blur(var(--atelier-bg-blur))",
              opacity: "var(--atelier-bg-opacity)",
              transition:
                "opacity var(--atelier-bg-transition) ease, filter var(--atelier-bg-transition) ease",
            }}
          />
          <div className="absolute inset-0 bg-white/35 dark:bg-slate-950/55" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.28),rgba(236,72,153,0.18),rgba(14,165,233,0.2))] opacity-70 dark:opacity-35" />
        </div>

        <MobileMenu
          navOptions={navOptions}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          user={user}
          logout={logout}
        />

        <div className="sticky top-0 z-50 pointer-events-none">
          <div className="pointer-events-auto max-w-(--atelier-page-width) mx-auto px-0 md:px-4">
            <Navbar
              navOptions={navOptions}
              onMenuClick={() => setIsMenuOpen(true)}
              user={user}
              isLoading={isSessionLoading}
              bannerHeightVh={0}
            />
          </div>
        </div>

        <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col pt-20 md:pt-24">
          <div
            className="relative mx-auto w-full flex-1 px-4 pb-32"
            style={{ maxWidth: "var(--atelier-page-width)" }}
          >
            <main className="flex min-w-0 flex-col gap-5">{children}</main>

            <BackToTop />
          </div>

          <div
            className="atelier-onload-animation"
            style={{ animationDelay: "250ms" }}
          >
            <Footer navOptions={navOptions} />
          </div>
        </div>

        <FloatingMusicPlayer />
      </div>
    </MusicProvider>
  );
}
