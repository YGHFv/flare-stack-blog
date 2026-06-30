import z from "zod";

const clientEnvSchema = z.object({
  VITE_ENABLE_DEVTOOLS: z.string().optional(),
  VITE_UMAMI_WEBSITE_ID: z.string().optional(),
  VITE_TURNSTILE_SITE_KEY: z.string().optional(),
});

export function clientEnv() {
  return clientEnvSchema.parse(import.meta.env);
}
