import { z } from "zod";
import { blogConfig } from "@/blog.config";
import {
  createSiteConfigInputFormSchema,
  type SiteConfigInput,
  SiteConfigInputSchema,
} from "@/features/config/site-config.schema";
import { webhookEndpointSchema } from "@/features/webhook/webhook.schema";
import type { Messages } from "@/lib/i18n";

export const MusicPlaylistItemSchema = z.object({
  id: z.string().trim().min(1).max(120),
  source: z.enum(["netease", "custom"]).optional(),
  title: z.string().trim().max(120).optional(),
  artist: z.string().trim().max(120).optional(),
  cover: z.string().trim().max(500).optional(),
  src: z.string().trim().max(500).optional(),
  lrc: z.string().max(30000).optional(),
  enabled: z.boolean().optional(),
});

export const MusicConfigSchema = z.object({
  playlist: z.array(MusicPlaylistItemSchema).max(50).optional(),
});

export const SystemConfigSchema = z.object({
  email: z
    .object({
      apiKey: z.string().optional(),
      host: z.string().optional(),
      port: z.number().int().positive().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      senderName: z.string().optional(),
      senderAddress: z.union([z.email(), z.literal("")]).optional(),
    })
    .optional(),
  notification: z
    .object({
      admin: z
        .object({
          channels: z
            .object({
              email: z.boolean().optional(),
              webhook: z.boolean().optional(),
            })
            .optional(),
        })
        .optional(),
      user: z
        .object({
          emailEnabled: z.boolean().optional(),
        })
        .optional(),
      webhooks: z.array(webhookEndpointSchema).optional(),
    })
    .optional(),
  music: MusicConfigSchema.optional(),
  site: SiteConfigInputSchema.optional(),
});

export const createSystemConfigFormSchema = (messages: Messages) =>
  z.object({
    email: SystemConfigSchema.shape.email,
    notification: SystemConfigSchema.shape.notification,
    music: SystemConfigSchema.shape.music,
    site: createSiteConfigInputFormSchema(messages).optional(),
  });

export type SystemConfig = z.infer<typeof SystemConfigSchema>;
export type {
  SiteConfig,
  SiteConfigInput,
} from "@/features/config/site-config.schema";

export const DEFAULT_CONFIG: SystemConfig = {
  email: {
    host: "",
    port: 465,
    username: "",
    password: "",
    senderName: "",
    senderAddress: "",
  },
  notification: {
    admin: {
      channels: {
        email: true,
        webhook: true,
      },
    },
    user: {
      emailEnabled: true,
    },
    webhooks: [],
  },
  music: {
    playlist: [
      {
        id: "707720",
        source: "netease",
        enabled: true,
      },
    ],
  },
  site: blogConfig satisfies SiteConfigInput,
};

export const CONFIG_CACHE_KEYS = {
  system: ["system"] as const,
} as const;
