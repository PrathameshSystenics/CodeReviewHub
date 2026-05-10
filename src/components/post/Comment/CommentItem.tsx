"use client";

import { replyOnCommentApi } from "@/api/comment";
import UserProfileImage from "@/components/auth/UserProfileImage";
import { cn } from "@/lib/utils";
import { CommentWithAuthor } from "@/types/comment";
import { Inter, JetBrains_Mono } from "next/font/google";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { VscEdit, VscSend, VscTrash } from "react-icons/vsc";

//#region Font Declaration
const inter = Inter({ subsets: ["latin"] });
const jetbrains_mono = JetBrains_Mono({ subsets: ["latin"], weight: "400" });
//#endregion

interface CommentItemProps {
  comment: CommentWithAuthor;
  isOwner: boolean;
  // TODO: Handle Edit and Delete Comment
  // onEdit: (commentId: string, newContent: string) => void;
  // onDelete: (commentId: string) => void;
}

const CommentItem = ({
  comment,
  isOwner,
  // onEdit,
  // onDelete,
}: CommentItemProps) => {
  //#region State Hooks
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState("");
  //#endregion

  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      : `L${comment.startlineno}`;

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    // onEdit(comment.id, editContent.trim());
    setEditing(false);
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
    if(reply.status==="success"){
      // TODO: Show the newly added reply comment
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

  const formattedDate = new Date(comment.createdAt).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
  );

  return (
    <div
      className={`${inter.className} group/comment relative rounded-lg border border-slate-700/30 bg-[#0f1825]/80 p-3 transition-colors hover:border-slate-600/40`}
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
              {comment.author.name}
            </span>
          </div>
          <span
            className={`${jetbrains_mono.className} text-[10px] text-primary/70 bg-primary/8 px-1.5 py-0.5 rounded font-medium`}
          >
            {lineLabel}
          </span>
          <span className="text-[10px] text-slate-600">{formattedDate}</span>
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
                    // onDelete(comment.id);
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
    </div>
  );
};

export default CommentItem;
