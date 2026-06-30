import { and, eq, inArray, isNull, or } from "drizzle-orm";
import type { CommentStatus } from "@/lib/db/schema";
import { CommentsTable, MusicCommentsTable } from "@/lib/db/schema";

export function buildCommentWhereClause(options: {
  status?: CommentStatus | Array<CommentStatus>;
  postId?: number;
  userId?: string;
  viewerId?: string;
  rootId?: number | null;
  rootOnly?: boolean;
}) {
  const { status, postId, userId, viewerId, rootId, rootOnly } = options;

  const whereClauses = [];

  if (postId) {
    whereClauses.push(eq(CommentsTable.postId, postId));
  }

  if (userId) {
    whereClauses.push(eq(CommentsTable.userId, userId));
  }

  if (rootOnly) {
    whereClauses.push(isNull(CommentsTable.rootId));
  } else if (rootId !== undefined) {
    if (rootId === null) {
      whereClauses.push(isNull(CommentsTable.rootId));
    } else {
      whereClauses.push(eq(CommentsTable.rootId, rootId));
    }
  }

  // logic:
  // 1. If viewerId is provided, we want (status: published) OR (userId: viewerId AND status: pending/verifying)
  // 2. If status is explicitly provided, we use that.

  if (viewerId && !status && !userId) {
    whereClauses.push(
      or(
        inArray(CommentsTable.status, ["published", "deleted"]),
        and(
          eq(CommentsTable.userId, viewerId),
          inArray(CommentsTable.status, ["pending", "verifying"]),
        ),
      ),
    );
  } else if (status) {
    if (Array.isArray(status)) {
      whereClauses.push(inArray(CommentsTable.status, status));
    } else {
      whereClauses.push(eq(CommentsTable.status, status));
    }
  }

  return whereClauses.length > 0 ? and(...whereClauses) : undefined;
}

export function buildMusicCommentWhereClause(options: {
  status?: CommentStatus | Array<CommentStatus>;
  songId?: string;
  userId?: string;
  viewerId?: string;
  rootId?: number | null;
  rootOnly?: boolean;
}) {
  const { status, songId, userId, viewerId, rootId, rootOnly } = options;

  const whereClauses = [];

  if (songId) {
    whereClauses.push(eq(MusicCommentsTable.songId, songId));
  }

  if (userId) {
    whereClauses.push(eq(MusicCommentsTable.userId, userId));
  }

  if (rootOnly) {
    whereClauses.push(isNull(MusicCommentsTable.rootId));
  } else if (rootId !== undefined) {
    if (rootId === null) {
      whereClauses.push(isNull(MusicCommentsTable.rootId));
    } else {
      whereClauses.push(eq(MusicCommentsTable.rootId, rootId));
    }
  }

  if (viewerId && !status && !userId) {
    whereClauses.push(
      or(
        inArray(MusicCommentsTable.status, ["published", "deleted"]),
        and(
          eq(MusicCommentsTable.userId, viewerId),
          inArray(MusicCommentsTable.status, ["pending", "verifying"]),
        ),
      ),
    );
  } else if (status) {
    if (Array.isArray(status)) {
      whereClauses.push(inArray(MusicCommentsTable.status, status));
    } else {
      whereClauses.push(eq(MusicCommentsTable.status, status));
    }
  }

  return whereClauses.length > 0 ? and(...whereClauses) : undefined;
}
