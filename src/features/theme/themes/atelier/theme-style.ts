import type { CSSProperties } from "react";
import type { SiteConfig } from "@/features/config/site-config.schema";

export function getAtelierThemeStyle(siteConfig: SiteConfig): CSSProperties {
  const { background } = siteConfig.theme.atelier;

  return {
    "--atelier-hue": String(siteConfig.theme.atelier.primaryHue),
    "--atelier-bg-opacity-light": String(background.light.opacity),
    "--atelier-bg-opacity-dark": String(background.dark.opacity),
    "--atelier-bg-blur": `${background.backdropBlur}px`,
    "--atelier-bg-transition": `${background.transitionDuration}ms`,
  } as CSSProperties;
}
