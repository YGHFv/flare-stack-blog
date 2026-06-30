import { createServerFn } from "@tanstack/react-start";
import * as ConfigService from "@/features/config/service/config.service";
import { dbMiddleware } from "@/lib/middlewares";

export const getMusicPlaylistConfigFn = createServerFn()
  .middleware([dbMiddleware])
  .handler(({ context }) => ConfigService.getMusicPlaylistConfig(context));
