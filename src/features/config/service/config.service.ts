import { blogConfig } from "@/blog.config";
import * as CacheService from "@/features/cache/cache.service";
import type { SiteConfig, SystemConfig } from "@/features/config/config.schema";
import {
  CONFIG_CACHE_KEYS,
  DEFAULT_CONFIG,
  SystemConfigSchema,
} from "@/features/config/config.schema";
import * as ConfigRepo from "@/features/config/data/config.data";
import { FullSiteConfigSchema } from "@/features/config/site-config.schema";
import type { SocialLink } from "@/features/config/utils/social-platforms";
import * as Storage from "@/features/media/data/media.storage";
import { purgeSiteCDNCache } from "@/lib/invalidate";

const DEFAULT_SMTP_PORT = 465;
const RESEND_SMTP_HOST = "smtp.resend.com";
const RESEND_SMTP_USERNAME = "resend";
const LEGACY_DEFAULT_BACKGROUND_IMAGE = "/images/home-bg.webp";
const LEGACY_DEFAULT_SITE_TITLE = "\u7ad9\u70b9\u540d\u79f0";
const LEGACY_DEFAULT_AUTHOR = "\u4f5c\u8005";

type ThemeBackgroundAppearanceInput = {
  light?: {
    opacity?: number;
  };
  dark?: {
    opacity?: number;
  };
  backdropBlur?: number;
  transitionDuration?: number;
};

function resolveEmailConfig(config: SystemConfig | null | undefined) {
  const email = config?.email;
  const legacyApiKey = email?.apiKey?.trim() || "";
  const password = email?.password?.trim() || legacyApiKey;
  const host = email?.host?.trim() || (legacyApiKey ? RESEND_SMTP_HOST : "");
  const username =
    email?.username?.trim() || (legacyApiKey ? RESEND_SMTP_USERNAME : "");

  return {
    host,
    port: email?.port ?? DEFAULT_SMTP_PORT,
    username,
    password,
    senderName: email?.senderName ?? "",
    senderAddress: email?.senderAddress ?? "",
  };
}

export function resolveSystemConfig(
  config: SystemConfig | null | undefined,
): SystemConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    email: resolveEmailConfig(config),
    notification: {
      ...DEFAULT_CONFIG.notification,
      ...config?.notification,
      admin: {
        ...DEFAULT_CONFIG.notification?.admin,
        ...config?.notification?.admin,
        channels: {
          ...DEFAULT_CONFIG.notification?.admin?.channels,
          ...config?.notification?.admin?.channels,
        },
      },
      user: {
        ...DEFAULT_CONFIG.notification?.user,
        ...config?.notification?.user,
      },
      webhooks:
        config?.notification?.webhooks ?? DEFAULT_CONFIG.notification?.webhooks,
    },
    music: {
      ...DEFAULT_CONFIG.music,
      ...config?.music,
      playlist: config?.music?.playlist ?? DEFAULT_CONFIG.music?.playlist,
    },
    site: resolveSiteConfig(config),
  };
}

function migrateSocial(social: unknown): SocialLink[] {
  // New format — already an array
  if (Array.isArray(social)) return social;

  // Old format — { github?: string, email?: string }
  if (social && typeof social === "object") {
    const old = social as { github?: string; email?: string };
    const migrated: SocialLink[] = [];
    if (old.github) migrated.push({ platform: "github", url: old.github });
    if (old.email)
      migrated.push({ platform: "email", url: `mailto:${old.email}` });
    return migrated;
  }

  // Fallback to blogConfig defaults
  return [...blogConfig.social];
}

function resolveThemeBackgroundAppearance(
  config: ThemeBackgroundAppearanceInput | undefined,
  fallback:
    | typeof blogConfig.theme.fuwari.background
    | typeof blogConfig.theme.atelier.background,
) {
  return {
    light: {
      opacity: config?.light?.opacity ?? fallback.light.opacity,
    },
    dark: {
      opacity: config?.dark?.opacity ?? fallback.dark.opacity,
    },
    backdropBlur: config?.backdropBlur ?? fallback.backdropBlur,
    transitionDuration:
      config?.transitionDuration ?? fallback.transitionDuration,
  };
}

function resolveThemeBackgroundImage(value: string | undefined, fallback = "") {
  if (!value || value === LEGACY_DEFAULT_BACKGROUND_IMAGE) {
    return fallback;
  }
  return value;
}

function resolveThemeBackgroundImages(
  values: Array<string> | undefined,
  fallback: Array<string>,
) {
  if (!values || values.length === 0) return fallback;

  const migratedValues = values.map((value) =>
    resolveThemeBackgroundImage(value, blogConfig.theme.atelier.homeBg),
  );

  return migratedValues;
}

function resolveSiteText(
  value: string | undefined,
  fallback: string,
  legacyDefaults: Array<string> = [],
) {
  const trimmedValue = value?.trim();
  if (!trimmedValue || legacyDefaults.includes(trimmedValue)) return fallback;
  return value;
}

export function resolveSiteConfig(
  config: SystemConfig | null | undefined,
): SiteConfig {
  const configDefaultBackground =
    config?.site?.theme?.default?.background ??
    blogConfig.theme.default.background;

  return FullSiteConfigSchema.parse({
    title: resolveSiteText(config?.site?.title, blogConfig.title, [
      LEGACY_DEFAULT_SITE_TITLE,
    ]),
    author: resolveSiteText(config?.site?.author, blogConfig.author, [
      LEGACY_DEFAULT_AUTHOR,
    ]),
    description: config?.site?.description ?? blogConfig.description,
    social: migrateSocial(config?.site?.social),
    icons: {
      faviconSvg:
        config?.site?.icons?.faviconSvg || blogConfig.icons.faviconSvg,
      faviconIco:
        config?.site?.icons?.faviconIco || blogConfig.icons.faviconIco,
      favicon96: config?.site?.icons?.favicon96 || blogConfig.icons.favicon96,
      appleTouchIcon:
        config?.site?.icons?.appleTouchIcon || blogConfig.icons.appleTouchIcon,
      webApp192: config?.site?.icons?.webApp192 || blogConfig.icons.webApp192,
      webApp512: config?.site?.icons?.webApp512 || blogConfig.icons.webApp512,
    },
    theme: {
      default: {
        navBarName:
          config?.site?.theme?.default?.navBarName ??
          blogConfig.theme.default.navBarName,
        background: {
          homeImage: resolveThemeBackgroundImage(
            configDefaultBackground.homeImage,
            blogConfig.theme.default.background.homeImage,
          ),
          globalImage: resolveThemeBackgroundImage(
            configDefaultBackground.globalImage,
            blogConfig.theme.default.background.globalImage,
          ),
          light: {
            opacity: configDefaultBackground.light?.opacity ?? 0.15,
          },
          dark: {
            opacity: configDefaultBackground.dark?.opacity ?? 0.1,
          },
          backdropBlur: configDefaultBackground.backdropBlur ?? 8,
          transitionDuration: configDefaultBackground.transitionDuration ?? 600,
        },
      },
      fuwari: {
        homeBg: resolveThemeBackgroundImage(
          config?.site?.theme?.fuwari?.homeBg,
          blogConfig.theme.fuwari.homeBg,
        ),
        avatar:
          config?.site?.theme?.fuwari?.avatar ?? blogConfig.theme.fuwari.avatar,
        primaryHue:
          config?.site?.theme?.fuwari?.primaryHue ??
          blogConfig.theme.fuwari.primaryHue,
        background: resolveThemeBackgroundAppearance(
          config?.site?.theme?.fuwari?.background,
          blogConfig.theme.fuwari.background,
        ),
      },
      atelier: {
        homeBg: resolveThemeBackgroundImage(
          config?.site?.theme?.atelier?.homeBg,
          blogConfig.theme.atelier.homeBg,
        ),
        avatar:
          config?.site?.theme?.atelier?.avatar ??
          blogConfig.theme.atelier.avatar,
        primaryHue:
          config?.site?.theme?.atelier?.primaryHue ??
          blogConfig.theme.atelier.primaryHue,
        backgroundImages: resolveThemeBackgroundImages(
          config?.site?.theme?.atelier?.backgroundImages,
          blogConfig.theme.atelier.backgroundImages,
        ),
        background: resolveThemeBackgroundAppearance(
          config?.site?.theme?.atelier?.background,
          blogConfig.theme.atelier.background,
        ),
      },
    },
  });
}

function hasSiteConfigChanged(
  currentConfig: SystemConfig | null | undefined,
  nextConfig: SystemConfig | null | undefined,
) {
  return (
    JSON.stringify(resolveSiteConfig(currentConfig)) !==
    JSON.stringify(resolveSiteConfig(nextConfig))
  );
}

export async function getSystemConfig(
  context: DbContext & { executionCtx: ExecutionContext },
) {
  const config = await CacheService.get(
    context,
    CONFIG_CACHE_KEYS.system,
    SystemConfigSchema,
    async () =>
      resolveSystemConfig(await ConfigRepo.getSystemConfig(context.db)),
  );

  const normalizedConfig = resolveSystemConfig(config);

  if (JSON.stringify(config) !== JSON.stringify(normalizedConfig)) {
    context.executionCtx.waitUntil(
      CacheService.set(
        context,
        CONFIG_CACHE_KEYS.system,
        JSON.stringify(normalizedConfig),
        { ttl: "1h" },
      ),
    );
  }

  return normalizedConfig;
}

export async function getSiteConfig(
  context: DbContext & { executionCtx: ExecutionContext },
) {
  const config = await getSystemConfig(context);
  return resolveSiteConfig(config);
}

export async function getMusicPlaylistConfig(
  context: DbContext & { executionCtx: ExecutionContext },
) {
  const config = await getSystemConfig(context);
  return config.music?.playlist ?? DEFAULT_CONFIG.music?.playlist ?? [];
}

export async function updateSystemConfig(
  context: DbContext & { executionCtx: ExecutionContext },
  data: SystemConfig,
) {
  const currentConfig = await ConfigRepo.getSystemConfig(context.db);
  const nextConfig = resolveSystemConfig(data);

  await ConfigRepo.upsertSystemConfig(context.db, nextConfig);
  await CacheService.deleteKey(context, CONFIG_CACHE_KEYS.system);

  if (hasSiteConfigChanged(currentConfig, nextConfig)) {
    await purgeSiteCDNCache(context.env);
  }

  return { success: true };
}

export async function uploadSiteAsset(
  context: { env: Env },
  input: { file: File; assetPath: string },
): Promise<{ url: string }> {
  const { url } = await Storage.putSiteAsset(
    context.env,
    input.file,
    input.assetPath,
  );

  const timestamp = Math.floor(Date.now() / 1000);
  const isFavicon = input.assetPath.startsWith("favicon/");
  const finalUrl = isFavicon
    ? `${url}?original=true&v=${timestamp}`
    : `${url}?v=${timestamp}`;

  return { url: finalUrl };
}
