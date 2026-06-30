import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { JsonContentSchema } from "@/features/posts/schema/json-content.schema";
import type { CommentStatus } from "@/lib/db/schema";
import { CommentsTable, MusicCommentsTable } from "@/lib/db/schema";

// Date fields need to accept both Date objects and ISO strings (for JSON serialization)
const coercedDate = z.union([z.date(), z.string().pipe(z.coerce.date())]);

export const CommentSelectSchema = createSelectSchema(CommentsTable, {
  createdAt: coercedDate,
  updatedAt: coercedDate,
});
export const CommentInsertSchema = createInsertSchema(CommentsTable);
export const CommentUpdateSchema = createUpdateSchema(CommentsTable);
export const MusicCommentSelectSchema = createSelectSchema(MusicCommentsTable, {
  createdAt: coercedDate,
  updatedAt: coercedDate,
});

// User info schema for joined queries
export const CommentUserSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  role: z.string().nullable(),
});

export const CommentWithUserSchema = CommentSelectSchema.extend({
  user: CommentUserSchema.nullable(),
  post: z
    .object({
      title: z.string().optional().nullable(),
      slug: z.string().optional().nullable(),
    })
    .nullable()
    .optional(),
  replyToUser: z
    .object({
      id: z.string().optional().nullable(),
      name: z.string().optional().nullable(),
    })
    .nullable()
    .optional(),
});

export const MusicCommentWithUserSchema = MusicCommentSelectSchema.extend({
  user: CommentUserSchema.nullable(),
});

export const UserStatsSchema = z.object({
  totalComments: z.number(),
  rejectedComments: z.number(),
  registeredAt: z.date(),
});

export const GetUserStatsInputSchema = z.object({
  userId: z.string(),
});

// Public API Schemas
export const GetCommentsByPostIdInputSchema = z.object({
  postId: z.number(),
  offset: z.number().optional(),
  limit: z.number().optional(),
});

export const GetCommentsResponseSchema = z.object({
  items: z.array(CommentWithUserSchema),
  total: z.number(),
});

export const GetRepliesByRootIdInputSchema = z.object({
  postId: z.number(),
  rootId: z.number(),
  offset: z.number().optional(),
  limit: z.number().optional(),
});

export const ReplyWithUserAndReplyToSchema = CommentWithUserSchema.extend({
  replyTo: z
    .object({
      id: z.string().nullable(),
      name: z.string().nullable(),
    })
    .nullable(),
});

export const GetRepliesResponseSchema = z.object({
  items: z.array(ReplyWithUserAndReplyToSchema),
  total: z.number(),
});

export const RootCommentWithReplyCountSchema = CommentWithUserSchema.extend({
  replyCount: z.number(),
});

export const GetRootCommentsResponseSchema = z.object({
  items: z.array(RootCommentWithReplyCountSchema),
  total: z.number(),
});

export const GetMusicCommentsBySongIdInputSchema = z.object({
  songId: z.string().min(1),
  offset: z.number().optional(),
  limit: z.number().optional(),
});

export const GetMusicRepliesByRootIdInputSchema = z.object({
  songId: z.string().min(1),
  rootId: z.number(),
  offset: z.number().optional(),
  limit: z.number().optional(),
});

export const MusicReplyWithUserAndReplyToSchema =
  MusicCommentWithUserSchema.extend({
    replyTo: z
      .object({
        id: z.string().nullable(),
        name: z.string().nullable(),
      })
      .nullable(),
  });

export const RootMusicCommentWithReplyCountSchema =
  MusicCommentWithUserSchema.extend({
    replyCount: z.number(),
  });

// Authed User API Schemas
export const CreateCommentInputSchema = z.object({
  postId: z.number(),
  content: JsonContentSchema,
  rootId: z.number().optional(),
  replyToCommentId: z.number().optional(),
});

export const CreateMusicCommentInputSchema = z.object({
  songId: z.string().min(1),
  content: JsonContentSchema,
  rootId: z.number().optional(),
  replyToCommentId: z.number().optional(),
});

export const UpdateCommentInputSchema = z.object({
  id: z.number(),
  content: JsonContentSchema,
});

export const DeleteCommentInputSchema = z.object({
  id: z.number(),
});

export const GetMyCommentsInputSchema = z.object({
  offset: z.number().optional(),
  limit: z.number().optional(),
  status: z.custom<CommentStatus>().optional(),
});

// Admin API Schemas
export const GetAllCommentsInputSchema = z.object({
  offset: z.number().optional(),
  limit: z.number().optional(),
  status: z.custom<CommentStatus>().optional(),
  postId: z.number().optional(),
  userId: z.string().optional(),
  userName: z.string().optional(),
});

export const ModerateCommentInputSchema = z.object({
  id: z.number(),
  status: z.enum(["published", "deleted", "pending"]),
});

export const StartCommentModerationInputSchema = z.object({
  commentId: z.number(),
});

// Types
export type GetCommentsByPostIdInput = z.infer<
  typeof GetCommentsByPostIdInputSchema
>;
export type GetMusicCommentsBySongIdInput = z.infer<
  typeof GetMusicCommentsBySongIdInputSchema
>;
export type CreateCommentInput = z.infer<typeof CreateCommentInputSchema>;
export type CreateMusicCommentInput = z.infer<
  typeof CreateMusicCommentInputSchema
>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentInputSchema>;
export type DeleteCommentInput = z.infer<typeof DeleteCommentInputSchema>;
export type GetMyCommentsInput = z.infer<typeof GetMyCommentsInputSchema>;
export type GetAllCommentsInput = z.infer<typeof GetAllCommentsInputSchema>;
export type ModerateCommentInput = z.infer<typeof ModerateCommentInputSchema>;
export type StartCommentModerationInput = z.infer<
  typeof StartCommentModerationInputSchema
>;
export type RootCommentWithReplyCount = z.infer<
  typeof RootCommentWithReplyCountSchema
>;
export type RootMusicCommentWithReplyCount = z.infer<
  typeof RootMusicCommentWithReplyCountSchema
>;
export type CommentWithUser = z.infer<typeof CommentWithUserSchema>;
export type MusicCommentWithUser = z.infer<typeof MusicCommentWithUserSchema>;
