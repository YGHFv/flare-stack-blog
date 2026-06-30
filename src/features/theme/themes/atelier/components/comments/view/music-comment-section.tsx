import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { JSONContent } from "@tiptap/react";
import { LogIn } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Turnstile, useTurnstile } from "@/components/common/turnstile";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CommentWithUser,
  MusicCommentWithUser,
  RootMusicCommentWithReplyCount,
} from "@/features/comments/comments.schema";
import { useMusicComments } from "@/features/comments/hooks/use-comments";
import {
  musicRepliesByRootIdInfiniteQuery,
  rootMusicCommentsBySongIdInfiniteQuery,
} from "@/features/comments/queries";
import { authClient } from "@/lib/auth/auth.client";
import { m } from "@/paraglide/messages";
import { AtelierCommentEditor } from "../editor/comment-editor";
import { AtelierCommentItem } from "./comment-item";
import AtelierConfirmationModal from "./confirmation-modal";

interface AtelierMusicCommentSectionProps {
  songId: string;
  songTitle: string;
}

export function AtelierMusicCommentSection({
  songId,
  songTitle,
}: AtelierMusicCommentSectionProps) {
  const { data: session } = authClient.useSession();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      rootMusicCommentsBySongIdInfiniteQuery(songId, session?.user.id),
    );

  const rootComments = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;
  const { createComment, deleteComment, isCreating, isDeleting } =
    useMusicComments(songId);

  const [replyTarget, setReplyTarget] = useState<{
    rootId: number;
    commentId: number;
    userName: string;
  } | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const {
    isPending: turnstilePending,
    reset: resetTurnstile,
    turnstileProps,
  } = useTurnstile("comment");

  const requireTurnstile = () => {
    if (!turnstilePending) return false;
    toast.error(m.comments_turnstile_required());
    turnstileRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    throw new Error("TURNSTILE_PENDING");
  };

  const handleCreateComment = async (content: JSONContent) => {
    requireTurnstile();
    try {
      await createComment({
        data: {
          songId,
          content,
        },
      });
    } finally {
      resetTurnstile();
    }
  };

  const handleCreateReply = async (content: JSONContent) => {
    if (!replyTarget) return;
    requireTurnstile();
    try {
      await createComment({
        data: {
          songId,
          content,
          rootId: replyTarget.rootId,
          replyToCommentId: replyTarget.commentId,
        },
      });
      setReplyTarget(null);
    } finally {
      resetTurnstile();
    }
  };

  const handleDelete = async () => {
    if (commentToDelete) {
      await deleteComment({ data: { id: commentToDelete } });
      setCommentToDelete(null);
    }
  };

  if (isLoading || !data) {
    return <AtelierMusicCommentSectionSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-(--atelier-primary)">
            {songTitle}
          </p>
          <h2 className="mt-1 text-xl font-bold atelier-text-90">
            {m.comments_count({ count: totalCount })}
          </h2>
        </div>
      </div>

      {session ? (
        <AtelierCommentEditor
          onSubmit={handleCreateComment}
          isSubmitting={isCreating && !replyTarget}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <p className="text-sm atelier-text-30">
            {m.comments_join_discussion()}
          </p>
          <Link to="/login">
            <button className="atelier-btn-primary h-9 rounded-lg px-5 text-sm gap-2">
              <LogIn size={14} />
              {m.comments_login()}
            </button>
          </Link>
        </div>
      )}

      <div ref={turnstileRef}>
        <Turnstile {...turnstileProps} />
      </div>

      <MusicCommentList
        songId={songId}
        rootComments={rootComments}
        onReply={(rootId, commentId, userName) =>
          setReplyTarget({ rootId, commentId, userName })
        }
        onDelete={(id) => setCommentToDelete(id)}
        replyTarget={replyTarget}
        onCancelReply={() => setReplyTarget(null)}
        onSubmitReply={handleCreateReply}
        isSubmittingReply={isCreating}
      />

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="atelier-btn-regular h-10 rounded-lg px-6 text-sm disabled:opacity-50"
          >
            {isFetchingNextPage ? m.comments_loading() : m.comments_load_more()}
          </button>
        </div>
      )}

      <AtelierConfirmationModal
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleDelete}
        title={m.comments_delete_title()}
        message={m.comments_delete_desc()}
        confirmLabel={m.comments_delete_confirm()}
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
}

function MusicCommentList({
  songId,
  rootComments,
  onReply,
  onDelete,
  replyTarget,
  onCancelReply,
  onSubmitReply,
  isSubmittingReply,
}: {
  songId: string;
  rootComments: Array<RootMusicCommentWithReplyCount>;
  onReply: (rootId: number, commentId: number, userName: string) => void;
  onDelete: (commentId: number) => void;
  replyTarget: { rootId: number; commentId: number; userName: string } | null;
  onCancelReply: () => void;
  onSubmitReply: (content: JSONContent) => Promise<void>;
  isSubmittingReply: boolean;
}) {
  const [expandedRoots, setExpandedRoots] = useState<Set<number>>(new Set());

  const toggleExpand = (targetRootId: number) => {
    setExpandedRoots((prev) => {
      const next = new Set(prev);
      if (next.has(targetRootId)) {
        next.delete(targetRootId);
      } else {
        next.add(targetRootId);
      }
      return next;
    });
  };

  if (rootComments.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm atelier-text-30">{m.comments_list_empty()}</p>
      </div>
    );
  }

  return (
    <div>
      {rootComments.map((root) => (
        <MusicRootCommentWithReplies
          key={root.id}
          songId={songId}
          root={root}
          isExpanded={expandedRoots.has(root.id)}
          onToggleExpand={() => toggleExpand(root.id)}
          onReply={onReply}
          onDelete={onDelete}
          replyTarget={replyTarget}
          onCancelReply={onCancelReply}
          onSubmitReply={onSubmitReply}
          isSubmittingReply={isSubmittingReply}
        />
      ))}
    </div>
  );
}

function MusicRootCommentWithReplies({
  songId,
  root,
  isExpanded,
  onToggleExpand,
  onReply,
  onDelete,
  replyTarget,
  onCancelReply,
  onSubmitReply,
  isSubmittingReply,
}: {
  songId: string;
  root: RootMusicCommentWithReplyCount;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onReply: (rootId: number, commentId: number, userName: string) => void;
  onDelete: (commentId: number) => void;
  replyTarget: { rootId: number; commentId: number; userName: string } | null;
  onCancelReply: () => void;
  onSubmitReply: (content: JSONContent) => Promise<void>;
  isSubmittingReply: boolean;
}) {
  const { data: session } = authClient.useSession();
  const {
    data: repliesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    musicRepliesByRootIdInfiniteQuery(songId, root.id, session?.user.id),
  );

  const allReplies = repliesData?.pages.flatMap((page) => page.items) ?? [];
  const isReplyingToRoot =
    replyTarget &&
    replyTarget.rootId === root.id &&
    replyTarget.commentId === root.id;

  return (
    <div>
      <AtelierCommentItem
        comment={asArticleComment(root)}
        onReply={() =>
          onReply(
            root.id,
            root.id,
            root.user?.name || m.comments_item_unknown_user(),
          )
        }
        onDelete={onDelete}
        className={root.replyCount > 0 ? "pb-2 border-b-0" : ""}
      />

      {isReplyingToRoot && (
        <div className="ml-12 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {session ? (
            <ReplyForm
              userName={replyTarget.userName}
              onSubmit={onSubmitReply}
              isSubmitting={isSubmittingReply}
              onCancel={onCancelReply}
            />
          ) : (
            <LoginToReplyPrompt
              userName={replyTarget.userName}
              onCancel={onCancelReply}
            />
          )}
        </div>
      )}

      {root.replyCount > 0 && (
        <div className="ml-12 mt-1">
          <button
            onClick={onToggleExpand}
            className="group flex items-center gap-3 py-1"
          >
            <div
              className={`h-px transition-all duration-300 ${
                isExpanded
                  ? "w-10 bg-(--atelier-primary)/50"
                  : "w-6 bg-black/10 group-hover:w-10 group-hover:bg-(--atelier-primary)/50 dark:bg-white/10"
              }`}
            />
            <span className="text-xs atelier-text-50 transition-colors group-hover:text-(--atelier-primary)">
              {isExpanded
                ? m.comments_list_collapse_replies()
                : m.comments_list_expand_replies({ count: root.replyCount })}
            </span>
          </button>

          {isExpanded && (
            <div className="mt-2 space-y-0 pl-4">
              {allReplies.map((reply) => {
                const isReplyingToThis =
                  replyTarget &&
                  replyTarget.rootId === root.id &&
                  replyTarget.commentId === reply.id;
                return (
                  <div key={reply.id}>
                    <AtelierCommentItem
                      comment={asArticleComment(reply)}
                      onReply={() =>
                        onReply(
                          root.id,
                          reply.id,
                          reply.replyTo?.name ||
                            reply.user?.name ||
                            m.comments_item_unknown_user(),
                        )
                      }
                      onDelete={onDelete}
                      isReply
                      replyToName={reply.replyTo?.name}
                    />
                    {isReplyingToThis && (
                      <div className="ml-0 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {session ? (
                          <ReplyForm
                            userName={replyTarget.userName}
                            onSubmit={onSubmitReply}
                            isSubmitting={isSubmittingReply}
                            onCancel={onCancelReply}
                          />
                        ) : (
                          <LoginToReplyPrompt
                            userName={replyTarget.userName}
                            onCancel={onCancelReply}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {hasNextPage && (
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="py-2 text-xs font-medium atelier-text-50 transition-colors hover:text-(--atelier-primary) disabled:opacity-50"
                >
                  {isFetchingNextPage
                    ? m.comments_loading()
                    : m.comments_list_load_more_replies()}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReplyForm({
  userName,
  onSubmit,
  isSubmitting,
  onCancel,
}: {
  userName: string;
  onSubmit: (content: JSONContent) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs atelier-text-50">
          {m.comments_item_reply()}
        </span>
        <span className="text-sm font-medium text-(--atelier-primary)">
          @{userName}
        </span>
      </div>
      <AtelierCommentEditor
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        autoFocus
        onCancel={onCancel}
        submitLabel={m.comments_editor_submit_reply()}
      />
    </div>
  );
}

function LoginToReplyPrompt({
  userName,
  onCancel,
}: {
  userName: string;
  onCancel?: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-(--atelier-radius-large) bg-(--atelier-input-bg) px-4 py-3">
      <span className="flex-1 text-sm atelier-text-50">
        {m.comments_list_login_to_reply({ userName })}
      </span>
      <Link to="/login">
        <button className="atelier-btn-primary h-8 rounded-lg px-4 text-sm">
          {m.comments_login()}
        </button>
      </Link>
      {onCancel && (
        <button
          onClick={onCancel}
          className="text-sm atelier-text-50 transition-colors hover:atelier-text-75"
        >
          {m.comments_editor_cancel()}
        </button>
      )}
    </div>
  );
}

function asArticleComment(comment: MusicCommentWithUser): CommentWithUser {
  return {
    ...comment,
    postId: 0,
  };
}

function AtelierMusicCommentSectionSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-24 rounded-lg" />
      <Skeleton className="h-32 w-full rounded-(--atelier-radius-large)" />
      <div className="space-y-0">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-4 border-b border-black/5 py-6 dark:border-white/5"
          >
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-3/4 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
