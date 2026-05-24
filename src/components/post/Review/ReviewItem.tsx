"use client";

import {
  acceptReviewApi,
  deleteReviewApi,
  updateReviewApi,
} from "@/api/review";
import {
  addCommentOnReviewApi,
  deleteReviewCommentApi,
  getCommentsOnReviewApi,
  replyOnReviewCommentApi,
  updateReviewCommentApi,
} from "@/api/reviewComment";
import UserProfileImage from "@/components/auth/UserProfileImage";
import CommentItem from "@/components/post/Comment/CommentItem";
import ThreeDotsMenu from "@/components/post/ThreeDotsMenu";
import { Spinner } from "@/components/UI/spinner";
import { cn } from "@/lib/utils";
import { type ReviewItem } from "@/types/review";
import { CodeStatus } from "@generated/prisma/enums";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import {
  memo,
  useCallback,
  useState,
} from "react";
import { FaAngleDown, FaAngleUp, FaCheck } from "react-icons/fa";
import { VscLoading, VscSend } from "react-icons/vsc";
import { toast } from "react-toastify";
import TimeAgoComponent from "../TimeAgoComponent";

//#region Font Declaration
const inter = Inter({ subsets: ["latin"] });
const space_grotesk = Space_Grotesk({ subsets: ["latin"] });
const jetbrains_mono = JetBrains_Mono({ subsets: ["latin"], weight: "400" });
//#endregion

//#region Dynamic Imports
const MarkdownPreview = dynamic(
  () => import("@uiw/react-markdown-preview").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <Spinner className="text-sm" />,
  },
);

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => <Spinner className="text-sm" />,
});
//#endregion

interface ReviewItemComponentProps {
  review: ReviewItem;
  currentUserId: string | undefined;
  postOwnerId: string;
  postStatus: CodeStatus;
}

const ReviewItemComponent = ({
  review,
  currentUserId,
  postOwnerId,
  postStatus,
}: ReviewItemComponentProps) => {
  //#region State Hooks
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content);
  const [saving, setSaving] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  //#endregion

  const queryclient = useQueryClient();

  const isReviewOwner = currentUserId === review.reviewerId;
  const isPostOwner = currentUserId === postOwnerId;

  //#region Review comments query
  const {
    data: commentsResponse,
    isLoading: commentsLoading,
    isFetching: commentsFetching,
  } = useQuery({
    queryKey: ["review-comments", review.postId, review.id],
    queryFn: () => getCommentsOnReviewApi(review.postId, review.id),
    enabled: showComments,
    staleTime: 30 * 1000,
  });

  const reviewComments = commentsResponse?.data ?? [];
  //#endregion


  //#region Review Handlers
  const handleSaveEdit = useCallback(async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    const response = await updateReviewApi(review.postId, review.id, {
      content: editContent.trim(),
    });
    if (response.status === "success") {
      toast.success("Updated the Review");
      queryclient.invalidateQueries({
        queryKey: ["reviews", review.postId],
      });
      setEditing(false);
    } else {
      toast.error(response.message || "Failed to update the Review");
    }
    setSaving(false);
  }, [editContent, review.postId, review.id, queryclient]);

  const handleDelete = useCallback(async () => {
    const deletedResponse = await deleteReviewApi(review.postId, review.id);
    if (deletedResponse.status === "success") {
      toast.success("Deleted the Review Successfully");
      queryclient.invalidateQueries({
        queryKey: ["reviews", review.postId],
      });
    } else {
      toast.error(deletedResponse.message || "Failed to delete the Review");
    }
  }, [review.postId, review.id, queryclient]);

  const handleAccept = useCallback(async () => {
    setAccepting(true);
    const response = await acceptReviewApi(review.postId, review.id);
    if (response.status === "success") {
      toast.success("Review Accepted!");
      queryclient.invalidateQueries({
        queryKey: ["reviews", review.postId],
      });
    } else {
      toast.error(response.message || "Failed to accept the Review");
    }
    setAccepting(false);
  }, [review.postId, review.id, queryclient]);
  //#endregion

  //#region Review Comment Handlers
  const handleSubmitComment = useCallback(async () => {
    if (!commentInput.trim()) return;
    setSubmittingComment(true);
    const response = await addCommentOnReviewApi(review.postId, review.id, {
      content: commentInput.trim(),
    });
    if (response.status === "success") {
      setCommentInput("");
      setShowComments(true);
      queryclient.invalidateQueries({
        queryKey: ["review-comments", review.postId, review.id],
      });
      queryclient.invalidateQueries({
        queryKey: ["reviews", review.postId],
      });
    } else {
      toast.error(response.message || "Failed to add comment");
    }
    setSubmittingComment(false);
  }, [commentInput, review.postId, review.id, queryclient]);

  const handleCommentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmitComment();
    }
    if (e.key === "Escape") {
      setCommentInput("");
    }
  };

  const handleDeleteReviewComment = useCallback(
    async (commentId: string) => {
      const response = await deleteReviewCommentApi(
        review.postId,
        review.id,
        commentId,
      );
      if (response.status === "success") {
        toast.info("Deleted the Comment Successfully");
        queryclient.invalidateQueries({
          queryKey: ["review-comments", review.postId, review.id],
        });
        queryclient.invalidateQueries({
          queryKey: ["reviews", review.postId],
        });
      } else {
        toast.error(response.message || "Failed to delete the comment");
      }
    },
    [review.postId, review.id, queryclient],
  );

  const handleUpdateReviewComment = useCallback(
    async (commentId: string, content: string) => {
      const response = await updateReviewCommentApi(
        review.postId,
        review.id,
        commentId,
        { content },
      );
      if (response.status === "success") {
        toast.info("Updated the Comment");
        queryclient.invalidateQueries({
          queryKey: ["review-comments", review.postId, review.id],
        });
      } else {
        toast.error(response.message || "Failed to update the comment");
      }
    },
    [review.postId, review.id, queryclient],
  );

  const handleReplyOnReviewComment = useCallback(
    async (commentId: string, content: string) => {
      const response = await replyOnReviewCommentApi(
        review.postId,
        review.id,
        commentId,
        { content },
      );
      if (response.status === "success") {
        queryclient.invalidateQueries({
          queryKey: ["replies", review.postId, commentId],
        });
        queryclient.invalidateQueries({
          queryKey: ["review-comments", review.postId, review.id],
        });
      } else {
        toast.error(response.message || "Failed to add reply");
      }
    },
    [review.postId, review.id, queryclient],
  );
  //#endregion

  return (
    <div className={cn(inter.className, "flex flex-col")}>
      {/* Review card */}
      <div
        className={cn(
          "group/review relative rounded-lg border border-slate-700/30 bg-[#0f1825]/80 p-4 transition-colors hover:border-slate-600/40",
          review.isAccepted &&
            "border-primary/30 bg-primary/5 hover:border-primary/40",
        )}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* User Profile Image */}
            <div className="flex flex-row items-center gap-1.5">
              <UserProfileImage
                badgeclassName="px-2 py-1.5 text-[0.6em]"
                imageclassName="w-6 h-6"
                name={review.reviewer.name!}
                image={review.reviewer.image}
              />
              <span
                className={cn(
                  space_grotesk.className,
                  "text-xs text-slate-300 font-medium",
                )}
              >
                {isReviewOwner ? "You" : review.reviewer.name}
              </span>
            </div>

            {/* Accepted badge */}
            {review.isAccepted && (
              <span className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                <FaCheck className="text-[8px]" />
                Accepted
              </span>
            )}

            <span className="text-[10px] text-slate-600">
              <TimeAgoComponent date={review.createdAt} />
            </span>
          </div>

          {/* Action Menu */}
          <div className="flex items-center gap-2">
            {/* Accept button for post owner (only if not already accepted) */}
            {isPostOwner && !review.isAccepted && !editing && (
              <button
                onClick={handleAccept}
                disabled={accepting}
                className={cn(
                  space_grotesk.className,
                  "flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer",
                  "bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20 hover:border-primary/40",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                )}
                title="Accept this review"
              >
                {accepting ? (
                  <Spinner className="text-primary text-xs" />
                ) : (
                  <>
                    <FaCheck className="text-[10px]" />
                    Accept
                  </>
                )}
              </button>
            )}

            {/* Triple-dot menu for the review owner */}
            {isReviewOwner && !editing && postStatus === "OPEN" && (
              <ThreeDotsMenu
                groupHoverClass="group-hover/review:opacity-100"
                onEdit={() => setEditing(true)}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>

        {/* Content or edit mode */}
        {editing ? (
          <div className="mt-2">
            <MDEditor
              value={editContent}
              onChange={(val) => setEditContent(val ?? "")}
              preview="edit"
              hideToolbar={false}
              visibleDragbar={false}
              height={200}
              fullscreen={false}
              extraCommands={[]}
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setEditing(false);
                  setEditContent(review.content);
                }}
                className={cn(
                  inter.className,
                  "px-3 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 rounded hover:bg-slate-700/40 transition-colors cursor-pointer",
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || saving}
                className={cn(
                  inter.className,
                  "px-3 py-1.5 text-[11px] font-medium bg-primary/90 hover:bg-primary text-slate-900 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
                )}
              >
                {saving ? <Spinner className="text-xs" /> : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1" data-color-mode="dark">
            <MarkdownPreview
              source={review.content}
              style={{
                backgroundColor: "transparent",
                fontSize: "0.85em",
                lineHeight: "1.7",
                color: "#cbd5e1",
              }}
            />
          </div>
        )}

        {/* Comment input — only for non-review-owner users when not editing */}
        {postStatus === "OPEN" &&
          !isReviewOwner &&
          !editing &&
          currentUserId && (
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-700/20">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={handleCommentKeyDown}
                placeholder="Add a comment on this review… (Ctrl+Enter)"
                className={cn(
                  jetbrains_mono.className,
                  "flex-1 bg-[#0a1220] border border-slate-700/40 rounded-lg px-2.5 py-1.5 text-[0.75em] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all",
                )}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentInput.trim() || submittingComment}
                title="Send comment (Ctrl+Enter)"
                className="shrink-0 p-1.5 rounded-lg bg-primary/90 hover:bg-primary text-slate-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {submittingComment ? (
                  <VscLoading className="text-sm animate-spin" />
                ) : (
                  <VscSend className="text-sm" />
                )}
              </button>
            </div>
          )}

        {/* View comments toggle */}
        {review.commentCount > 0 && (
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="flex flex-row gap-1 items-center mt-2 cursor-pointer group/comments"
          >
            {showComments ? (
              <FaAngleUp
                size={13}
                className="text-primary transition-transform"
              />
            ) : (
              <FaAngleDown
                size={13}
                className="text-primary transition-transform group-hover/comments:translate-y-0.5"
              />
            )}
            <span
              className={cn(
                inter.className,
                "text-[0.6em] text-primary group-hover/comments:underline",
              )}
            >
              {showComments ? "Hide" : "View"} {review.commentCount}{" "}
              {review.commentCount === 1 ? "comment" : "comments"}
            </span>
            {commentsFetching && (
              <VscLoading className="text-primary text-xs animate-spin ml-1" />
            )}
          </button>
        )}
      </div>

      {/* Nested comments (Reddit-style thread) */}
      {showComments && (
        <div className="flex flex-row mt-1">
          {/* Thread line */}
          <div className="flex flex-col items-center w-5 shrink-0">
            <div className="w-px flex-1 bg-slate-700/40" />
          </div>

          {/* Comments list */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            {commentsLoading ? (
              <div className="flex items-center gap-2 py-3 pl-2">
                <VscLoading className="text-primary text-sm animate-spin" />
                <span
                  className={cn(
                    inter.className,
                    "text-[0.65em] text-slate-500",
                  )}
                >
                  Loading comments…
                </span>
              </div>
            ) : reviewComments.length === 0 ? (
              <p
                className={cn(
                  inter.className,
                  "text-[0.65em] text-slate-600 pl-2 py-2",
                )}
              >
                No comments yet.
              </p>
            ) : (
              reviewComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  postStatus={postStatus}
                  comment={comment}
                  isOwner={currentUserId === comment.authorId}
                  currentUserId={currentUserId}
                  depth={0}
                  onDelete={handleDeleteReviewComment}
                  onUpdate={handleUpdateReviewComment}
                  onSubmitReply={handleReplyOnReviewComment}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ReviewItemComponent);
