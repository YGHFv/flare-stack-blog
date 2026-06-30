import { Link, useLocation, useRouteContext } from "@tanstack/react-router";
import { Menu, UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import type { NavOption, UserInfo } from "@/features/theme/contract/layouts";
import { m } from "@/paraglide/messages";
import type { FileRoutesByTo } from "@/routeTree.gen";

interface NavbarProps {
  navOptions: Array<NavOption>;
  onMenuClick: () => void;
  isLoading?: boolean;
  user?: UserInfo;
  bannerHeightVh: number;
}

function isActivePath(pathname: string, to: keyof FileRoutesByTo) {
  return pathname === to || pathname === `${to}/`;
}

export function Navbar({
  user,
  navOptions,
  isLoading,
  onMenuClick,
  bannerHeightVh: _bannerHeightVh,
}: NavbarProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const location = useLocation();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/20 bg-white/40 shadow-sm backdrop-blur-xl transition-all duration-500 dark:border-white/5 dark:bg-slate-900/50">
      <div className="mx-auto flex h-16 w-[90%] max-w-6xl items-center justify-between px-4 sm:px-[30px]">
        <Link
          to="/"
          className="text-lg font-black tracking-tight text-slate-800 transition-colors duration-300 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 sm:text-xl"
        >
          {siteConfig.author}
          <span className="mx-1 text-indigo-500">の</span>
          宝藏之地
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-bold md:flex">
          {navOptions.map((option) => {
            const isActive = isActivePath(location.pathname, option.to);

            return (
              <Link
                key={option.id}
                to={option.to}
                className={`relative py-1 transition-colors ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"
                }`}
              >
                {option.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 animate-pulse rounded-full bg-indigo-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle className="h-10 w-10 rounded-full bg-transparent! p-0! text-slate-700 hover:bg-white/40 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-indigo-400 [&_div]:h-auto! [&_div]:w-auto! [&_svg]:h-4.5! [&_svg]:w-4.5!" />

          {isLoading ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : user ? (
            <Link
              to="/profile"
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-slate-700 transition-colors hover:bg-white/40 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-white/10"
              aria-label={m.profile_title()}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <UserIcon size={18} strokeWidth={1.5} />
              )}
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-white/40 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-indigo-400 md:flex"
              aria-label={m.nav_login()}
            >
              <UserIcon size={18} strokeWidth={1.5} />
            </Link>
          )}

          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-white/40 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-indigo-400 md:hidden"
            aria-label={m.common_open_menu()}
          >
            <Menu size={20} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
}
