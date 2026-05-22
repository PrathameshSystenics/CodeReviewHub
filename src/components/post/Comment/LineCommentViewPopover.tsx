"use client";

import {
  deleteCommentReplyApi,
  replyOnCommentApi,
  updateCommentReplyApi,
} from "@/api/comment";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/UI/popover";
import { CommentWithAuthorAndReplyCount } from "@/types/comment";
import { useQueryClient } from "@tanstack/react-query";
import { Inter, JetBrains_Mono } from "next/font/google";
import { useCallback } from "react";
import { VscClose, VscComment, VscLoading } from "react-icons/vsc";
import { toast } from "react-toastify";
import CommentItem from "./CommentItem";
import { CodeStatus } from "@generated/prisma/enums";

//#region Font Declaration
const inter = Inter({ subsets: ["latin"] });
const jetbrains_mono = JetBrains_Mono({ subsets: ["latin"], weight: "400" });
//#endregion

interface LineCommentViewPopoverProps {
  postId: string;
  lineNumber: number;
  postStatus: CodeStatus;
  comments: CommentWithAuthorAndReplyCount[];
  currentUserId: string | undefined;
  loading: boolean;
  onClose: () => void;
}

const LineCommentViewPopover = ({
  postId,
  lineNumber,
  comments,
  currentUserId,
  postStatus,
  loading,
  onClose,
}: LineCommentViewPopoverProps) => {
  const queryclient = useQueryClient();

  //#region Handlers passed down to CommentItem
  const handleDelete = useCallback(
    async (commentId: string) => {
      const response = await deleteCommentReplyApi(commentId, postId);
      if (response.status === "success") {
        toast.info("Deleted the Comment Successfully");
        queryclient.invalidateQueries({
          queryKey: ["view-comments", postId, lineNumber],
        });
        queryclient.invalidateQueries({
          queryKey: ["comments", postId],
        });
      } else {
        toast.error(response.message || "Failed to delete the comment");
      }
    },
    [postId, lineNumber, queryclient],
  );

  const handleUpdate = useCallback(
    async (commentId: string, content: string) => {
      const response = await updateCommentReplyApi(commentId, postId, {
        content,
      });
      if (response.status === "success") {
        toast.info("Updated the Comment");
        queryclient.invalidateQueries({
          queryKey: ["view-comments", postId, lineNumber],
        });
      } else {
        toast.error(response.message || "Failed to update the comment");
      }
    },
    [postId, lineNumber, queryclient],
  );

  const handleSubmitReply = useCallback(
    async (commentId: string, content: string) => {
      const response = await replyOnCommentApi(postId, commentId, { content });
      if (response.status === "success") {
        queryclient.invalidateQueries({
          queryKey: ["replies", postId, commentId],
        });
        queryclient.invalidateQueries({
          queryKey: ["view-comments", postId, lineNumber],
        });
      } else {
        toast.error(response.message || "Failed to add reply");
      }
    },
    [postId, lineNumber, queryclient],
  );
  //#endregion

  return (
    <Popover open onOpenChange={(open) => !open && onClose()}>
      <PopoverAnchor asChild>
        <div className="h-0 w-full" />
      </PopoverAnchor>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className={`${inter.className} w-105 p-0 bg-[#131c2e] border-slate-700/50 shadow-2xl shadow-black/40`}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/30 bg-[#0f1825] rounded-t-xl">
          <div className="flex items-center gap-2">
            <VscComment className="text-primary text-sm" />
            <span className="text-slate-300 text-xs font-medium">Comments</span>
            <span
              className={`${jetbrains_mono.className} text-[10px] text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded`}
            >
              Line {lineNumber}
            </span>
            <span className="text-[10px] text-slate-600">
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded hover:bg-slate-700/40 cursor-pointer"
          >
            <VscClose className="text-sm" />
          </button>
        </div>

        {/* Comments list */}
        <div className="p-3 flex flex-col gap-2 max-h-96 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <VscLoading className="text-primary text-lg animate-spin" />
              <span className="text-xs text-slate-500">Loading comments…</span>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-4">
              No comments on this line.
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postStatus={postStatus}
                isOwner={currentUserId === comment.authorId}
                currentUserId={currentUserId}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onSubmitReply={handleSubmitReply}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LineCommentViewPopover;
