import type { SiteConfig } from "@/features/config/site-config.schema";

export const blogConfig = {
  title: "\u6e90\u8c37\u7ed8",
  author: "\u6e90\u8c37\u7ed8",
  description:
    "这是我的个人网站和博客。在这里，我主要分享与技术和生活相关的内容。欢迎阅读！",
  social: [
    { platform: "github", url: "https://github.com/example" },
    { platform: "email", url: "mailto:example@email.com" },
    { platform: "rss", url: "/rss.xml" },
  ],
  icons: {
    faviconSvg: "/favicon.svg",
    faviconIco: "/favicon.ico",
    favicon96: "/favicon-96x96.png",
    appleTouchIcon: "/apple-touch-icon.png",
    webApp192: "/web-app-manifest-192x192.png",
    webApp512: "/web-app-manifest-512x512.png",
  },
  theme: {
    default: {
      navBarName: "导航栏名称",
      background: {
        homeImage: "/images/home-bg.jpg",
        globalImage: "/images/home-bg.jpg",
        light: {
          opacity: 0.18,
        },
        dark: {
          opacity: 0.12,
        },
        backdropBlur: 4,
        transitionDuration: 600,
      },
    },
    fuwari: {
      homeBg: "/images/home-bg.jpg",
      avatar: "/images/avatar.png",
      primaryHue: 250,
      background: {
        light: {
          opacity: 0.32,
        },
        dark: {
          opacity: 0.22,
        },
        backdropBlur: 0,
        transitionDuration: 300,
      },
    },
    atelier: {
      homeBg: "/images/home-bg.jpg",
      avatar: "/images/avatar.png",
      primaryHue: 255,
      backgroundImages: ["/images/home-bg.jpg"],
      background: {
        light: {
          opacity: 0.34,
        },
        dark: {
          opacity: 0.24,
        },
        backdropBlur: 8,
        transitionDuration: 300,
      },
    },
  },
} as const satisfies SiteConfig;
