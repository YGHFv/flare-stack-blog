import { Link, useRouteContext } from "@tanstack/react-router";
import {
  resolveSocialHref,
  SOCIAL_PLATFORMS,
} from "@/features/config/utils/social-platforms";
import { m } from "@/paraglide/messages";

export function Profile() {
  const { siteConfig } = useRouteContext({ from: "__root__" });

  return (
    <div className="atelier-card-base p-5">
      <Link
        to="/"
        className="group relative mx-auto mb-4 flex h-28 w-28 overflow-hidden rounded-full bg-linear-to-br from-(--atelier-primary) via-pink-500 to-sky-400 p-1 shadow-lg active:scale-95"
        aria-label={m.profile_avatar_label()}
      >
        <div className="absolute inset-1 z-10 rounded-full bg-black/0 transition-colors pointer-events-none group-hover:bg-black/20 group-active:bg-black/35" />
        <img
          src={siteConfig.theme.atelier.avatar}
          alt=""
          className="h-full w-full rounded-full object-cover"
        />
      </Link>
      <div className="text-center">
        <div className="mb-1 text-xl font-black tracking-tight atelier-text-90">
          {siteConfig.author}
        </div>
        <div
          className="mx-auto mb-3 h-1 w-8 rounded-full"
          style={{ backgroundColor: "var(--atelier-primary)" }}
        />
        <div className="mb-4 text-sm leading-6 atelier-text-75">
          {siteConfig.description}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {siteConfig.social
            .filter((link) => link.url)
            .map((link, i) => {
              const preset =
                link.platform !== "custom"
                  ? SOCIAL_PLATFORMS[link.platform]
                  : null;
              const Icon = preset?.icon;
              const label = preset?.label ?? link.label ?? "";
              const href = resolveSocialHref(link.platform, link.url);

              return (
                <a
                  key={`${link.platform}-${i}`}
                  href={href}
                  target={link.platform === "email" ? undefined : "_blank"}
                  rel={link.platform === "email" ? undefined : "me noreferrer"}
                  aria-label={label}
                  className="atelier-btn-regular h-10 w-10 rounded-2xl transition-colors hover:text-(--atelier-primary) active:scale-90"
                >
                  {Icon ? (
                    <Icon size={20} strokeWidth={1.5} />
                  ) : (
                    <img src={link.icon} alt={label} className="w-5 h-5" />
                  )}
                </a>
              );
            })}
        </div>
      </div>
    </div>
  );
}
