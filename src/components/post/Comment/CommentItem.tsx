"use client";

import {
  deleteCommentReplyApi,
  getRepliesOnCommentApi,
  replyOnCommentApi,
  updateCommentReplyApi,
} from "@/api/comment";
import UserProfileImage from "@/components/auth/UserProfileImage";
import { cn } from "@/lib/utils";
import { CommentWithAuthorAndReplyCount } from "@/types/comment";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Inter, JetBrains_Mono } from "next/font/google";
import {
  memo,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { VscEdit, VscLoading, VscSend, VscTrash } from "react-icons/vsc";
import { toast } from "react-toastify";
import TimeAgoComponent from "../TimeAgoComponent";

//#region Font Declaration
const inter = Inter({ subsets: ["latin"] });
const jetbrains_mono = JetBrains_Mono({ subsets: ["latin"], weight: "400" });
//#endregion

interface CommentItemProps {
  comment: CommentWithAuthorAndReplyCount;
  isOwner: boolean;
  currentUserId: string | undefined;
  depth?: number;
}

const CommentItem = ({
  comment,
  isOwner,
  currentUserId,
  depth = 0,
}: CommentItemProps) => {
  //#region State Hooks
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  //#endregion

  const queryclient = useQueryClient();
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  //#region React Query for fetching replies
  const {
    data: repliesResponse,
    isLoading: repliesLoading,
    isFetching: repliesFetching,
  } = useQuery({
    queryKey: ["replies", comment.postId, comment.id],
    queryFn: () => getRepliesOnCommentApi(comment.postId, comment.id),
    enabled: showReplies,
    staleTime: 30 * 1000,
  });

  const replies = repliesResponse?.data ?? [];
  //#endregion

  const handleMouseDown = useEffectEvent((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setMenuOpen(false);
    }
  });

  //#region UseEffect Hooks
  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [menuOpen]);

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (editing) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [editing]);
  //#endregion

  const lineLabel =
    comment.endlineno && comment.endlineno !== comment.startlineno
      ? `L${comment.startlineno}-${comment.endlineno}`
      : comment.startlineno != null
        ? `L${comment.startlineno}`
        : null;

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    const updatedComment = await updateCommentReplyApi(
      comment.id,
      comment.postId,
      {
        content: editContent.trim(),
      },
    );
    if (updatedComment.status === "success") {
      toast.info("Updated the Comment/Reply");
      queryclient.invalidateQueries({
        queryKey: ["replies", comment.postId, comment.id],
      });
      queryclient.invalidateQueries({
        queryKey: ["view-comments", comment.postId, comment.startlineno],
      });
      setEditing(false);
    } else {
      toast.error("Failed to Edit the Comment");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      setEditing(false);
      setEditContent(comment.content);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    const reply = await replyOnCommentApi(comment.postId, comment.id, {
      content: replyContent,
    });
    if (reply.status === "success") {
      queryclient.invalidateQueries({
        queryKey: ["replies", comment.postId, comment.id],
      });
      queryclient.invalidateQueries({
        queryKey: ["view-comments", comment.postId, comment.startlineno],
      });
    }
    setReplyContent("");
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmitReply();
    }
    if (e.key === "Escape") {
      setReplyContent("");
    }
  };

  const handleToggleReplies = () => {
    setShowReplies((prev) => !prev);
  };

  const handleDelete = useCallback(async (commentId: string) => {
    const deletedResponse = await deleteCommentReplyApi(
      commentId,
      comment.postId,
    );
    if (deletedResponse.status === "success") {
      toast.info("Deleted the Comment Successfully");
      queryclient.invalidateQueries({
        queryKey: ["replies", comment.postId, comment.id],
      });
      queryclient.invalidateQueries({
        queryKey: ["view-comments", comment.postId, comment.startlineno],
      });
      queryclient.invalidateQueries({
        queryKey: ["comments", comment.postId],
      });
    }
  }, []);

  return (
    <div className={cn(inter.className, "flex flex-col")}>
      {/* Comment card */}
      <div
        className={cn(
          "group/comment relative rounded-lg border border-slate-700/30 bg-[#0f1825]/80 p-3 transition-colors hover:border-slate-600/40",
          depth > 0 && "bg-[#0a1220]/60",
        )}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            {/* User Comment Profile Image */}
            <div className="flex flex-row items-center gap-1">
              <UserProfileImage
                badgeclassName="px-2 py-1.5 text-[0.6em]"
                imageclassName="w-5 h-5"
                name={comment.author.name!}
                image={comment.author.image}
              />
              <span
                className={cn(inter.className, "text-[0.7em] text-slate-300")}
              >
                {isOwner ? "You" : comment.author.name}
              </span>
            </div>
            {lineLabel && (
              <span
                className={`${jetbrains_mono.className} text-[10px] text-primary/70 bg-primary/8 px-1.5 py-0.5 rounded font-medium`}
              >
                {lineLabel}
              </span>
            )}
            <span className="text-[10px] text-slate-600">
              <TimeAgoComponent date={comment.createdAt} />
            </span>
          </div>

          {/* Triple-dot menu for the comment owner */}
          {isOwner && !editing && (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="opacity-0 group-hover/comment:opacity-100 text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-700/40 transition-all cursor-pointer"
                title="More options"
              >
                <BsThreeDots className="text-sm" />
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 min-w-30 rounded-lg border border-slate-700/50 bg-[#131c2e] shadow-xl shadow-black/40 py-1 animate-in fade-in-0 zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setEditing(true);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700/40 hover:text-slate-100 transition-colors cursor-pointer"
                  >
                    <VscEdit className="text-sm text-primary/70" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleDelete(comment.id);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <VscTrash className="text-sm" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content or edit mode */}
        {editing ? (
          <div>
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className={`${jetbrains_mono.className} w-full bg-[#0a1220] border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all`}
            />
            <div className="flex items-center justify-end gap-2 mt-1.5">
              <button
                onClick={() => {
                  setEditing(false);
                  setEditContent(comment.content);
                }}
                className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-200 rounded hover:bg-slate-700/40 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim()}
                className="px-2.5 py-1 text-[11px] font-medium bg-primary/90 hover:bg-primary text-slate-900 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`${jetbrains_mono.className} text-[0.8em] text-slate-300 leading-relaxed whitespace-pre-wrap`}
          >
            {comment.content}
          </p>
        )}

        {/* Reply input */}
        {!isOwner && !editing && (
          <div className="flex items-center gap-1.5 mt-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={handleReplyKeyDown}
              placeholder="Write a reply…"
              className={`${jetbrains_mono.className} flex-1 bg-[#0a1220] border border-slate-700/40 rounded-lg px-2.5 py-1.5 text-[0.75em] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all`}
            />
            <button
              onClick={handleSubmitReply}
              disabled={!replyContent.trim()}
              title="Send reply (Ctrl+Enter)"
              className="shrink-0 p-1.5 rounded-lg bg-primary/90 hover:bg-primary text-slate-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <VscSend className="text-sm" />
            </button>
          </div>
        )}

        {/* View Replies toggle */}
        {comment.replyCount > 0 && (
          <button
            onClick={handleToggleReplies}
            className="flex flex-row gap-1 items-center mt-2 cursor-pointer group/replies"
          >
            {showReplies ? (
              <FaAngleUp
                size={13}
                className="text-primary transition-transform"
              />
            ) : (
              <FaAngleDown
                size={13}
                className="text-primary transition-transform group-hover/replies:translate-y-0.5"
              />
            )}
            <span
              className={cn(
                inter.className,
                "text-[0.6em] text-primary group-hover/replies:underline",
              )}
            >
              {showReplies ? "Hide" : "View"} {comment.replyCount}{" "}
              {comment.replyCount === 1 ? "reply" : "replies"}
            </span>
            {repliesFetching && (
              <VscLoading className="text-primary text-xs animate-spin ml-1" />
            )}
          </button>
        )}
      </div>

      {/* Nested replies (Reddit-style thread) */}
      {showReplies && (
        <div className="flex flex-row mt-1">
          {/* Thread line */}
          <div className="flex flex-col items-center w-5 shrink-0">
            <div className="w-px flex-1 bg-slate-700/40" />
          </div>

          {/* Replies list */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            {repliesLoading ? (
              <div className="flex items-center gap-2 py-3 pl-2">
                <VscLoading className="text-primary text-sm animate-spin" />
                <span
                  className={cn(
                    inter.className,
                    "text-[0.65em] text-slate-500",
                  )}
                >
                  Loading replies…
                </span>
              </div>
            ) : replies.length === 0 ? (
              <p
                className={cn(
                  inter.className,
                  "text-[0.65em] text-slate-600 pl-2 py-2",
                )}
              >
                No replies yet.
              </p>
            ) : (
              replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isOwner={currentUserId === reply.authorId}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(CommentItem);
