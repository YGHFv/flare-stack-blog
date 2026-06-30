import type { CSSProperties } from "react";
import type { SiteConfig } from "@/features/config/site-config.schema";

export function getFuwariThemeStyle(siteConfig: SiteConfig): CSSProperties {
  const { background } = siteConfig.theme.fuwari;

  return {
    "--fuwari-hue": String(siteConfig.theme.fuwari.primaryHue),
    "--fuwari-bg-opacity-light": String(background.light.opacity),
    "--fuwari-bg-opacity-dark": String(background.dark.opacity),
    "--fuwari-bg-blur": `${background.backdropBlur}px`,
    "--fuwari-bg-transition": `${background.transitionDuration}ms`,
  } as CSSProperties;
}
