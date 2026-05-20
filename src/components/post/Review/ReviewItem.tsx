"use client";

import {
    acceptReviewApi,
    deleteReviewApi,
    updateReviewApi,
} from "@/api/review";
import UserProfileImage from "@/components/auth/UserProfileImage";
import { Spinner } from "@/components/UI/spinner";
import { cn } from "@/lib/utils";
import { type ReviewItem } from "@/types/review";
import { useQueryClient } from "@tanstack/react-query";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { Inter, Space_Grotesk } from "next/font/google";
import {
    memo,
    useCallback,
    useEffect,
    useEffectEvent,
    useRef,
    useState,
} from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaCheck } from "react-icons/fa";
import { VscEdit, VscTrash } from "react-icons/vsc";
import { toast } from "react-toastify";
import TimeAgoComponent from "../TimeAgoComponent";

//#region Font Declaration
const inter = Inter({ subsets: ["latin"] });
const space_grotesk = Space_Grotesk({ subsets: ["latin"] });
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
}

const ReviewItemComponent = ({
  review,
  currentUserId,
  postOwnerId,
}: ReviewItemComponentProps) => {
  //#region State Hooks
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content);
  const [saving, setSaving] = useState(false);
  const [accepting, setAccepting] = useState(false);
  //#endregion

  const queryclient = useQueryClient();
  const menuRef = useRef<HTMLDivElement>(null);

  const isReviewOwner = currentUserId === review.reviewerId;
  const isPostOwner = currentUserId === postOwnerId;

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
  //#endregion

  //#region Handlers
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
            {isReviewOwner && !editing && (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="opacity-0 group-hover/review:opacity-100 text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-700/40 transition-all cursor-pointer"
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
                        handleDelete();
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

        {/* Comment count */}
        {review.commentCount > 0 && (
          <div className="mt-3 pt-2 border-t border-slate-700/20">
            <span
              className={cn(inter.className, "text-[0.65em] text-slate-500")}
            >
              {review.commentCount}{" "}
              {review.commentCount === 1 ? "comment" : "comments"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ReviewItemComponent);
