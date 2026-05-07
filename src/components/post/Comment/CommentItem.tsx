"use client";

import { useEffect, useRef, useState } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { BsThreeDots } from "react-icons/bs";
import { VscEdit, VscTrash } from "react-icons/vsc";
import { Comment } from "@generated/prisma/client";

//#region Font Declaration
const inter = Inter({ subsets: ["latin"] });
const jetbrains_mono = JetBrains_Mono({ subsets: ["latin"], weight: "400" });
//#endregion

interface CommentItemProps {
  comment: Comment;
  isOwner: boolean;
  // onEdit: (commentId: string, newContent: string) => void;
  // onDelete: (commentId: string) => void;
}

const CommentItem = ({
  comment,
  isOwner,
  // onEdit,
  // onDelete,
}: CommentItemProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (editing) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [editing]);

  const lineLabel =
    comment.endlineno && comment.endlineno !== comment.startlineno
      ? `L${comment.startlineno}–${comment.endlineno}`
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

  const formattedDate = new Date(comment.createdAt).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
  );

  return (
    <div className={`${inter.className} group/comment relative rounded-lg border border-slate-700/30 bg-[#0f1825]/80 p-3 transition-colors hover:border-slate-600/40`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
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
        <p className={`${jetbrains_mono.className} text-sm text-slate-300 leading-relaxed whitespace-pre-wrap`}>
          {comment.content}
        </p>
      )}
    </div>
  );
};

export default CommentItem;
