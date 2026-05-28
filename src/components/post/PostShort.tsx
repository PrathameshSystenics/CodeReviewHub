"use client";

import { deletePostapi } from "@/api/postcode";
import { highlightCode } from "@/lib/shiki";
import { cn } from "@/lib/utils";
import { CodeStatus } from "@generated/prisma/enums";
import { useQueryClient } from "@tanstack/react-query";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { FiEdit2 } from "react-icons/fi";
import { LuEye, LuMessageSquare } from "react-icons/lu";
import { VscCommentDiscussion } from "react-icons/vsc";
import { toast } from "react-toastify";
import PostDeleteConfirmModal from "./PostDeleteConfirmModal";
import PostStatusBadge from "./PostStatusBadge";
import TagDisplay from "./TagDisplay";
import TimeAgoComponent from "./TimeAgoComponent";
import { useSession } from "next-auth/react";
import { PostAuthor } from "@/types/postCode";
import UserProfileImage from "../auth/UserProfileImage";

interface PostShortProps {
  title: string;
  description: string;
  language: string;
  tag: string[];
  createdTime: Date;
  code: string;
  id: string;
  status: CodeStatus;
  published: boolean;
  reviewCount?: number;
  viewsCount?: number;
  commentsCount?: number;
  requireReview: boolean;
  requireComments: boolean;
  authorId?: string;
  author?: PostAuthor;
}

//#region Font Declaration
const space_grotesk = Space_Grotesk({ subsets: ["latin"] });
const jetbrains_mono = JetBrains_Mono({ subsets: ["latin"], weight: "400" });
const inter = Inter({ subsets: ["latin"] });
//#endregion

const PostShort = ({
  title,
  description,
  code,
  createdTime,
  language,
  tag,
  status,
  id,
  published,
  reviewCount,
  viewsCount,
  requireComments,
  requireReview,
  authorId,
  author,
}: PostShortProps) => {
  //#region State and Hooks
  const [codeHtml, setCodeHtml] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const queryclient = useQueryClient();
  const router = useRouter();
  const user = useSession();
  //#endregion

  const handleDelete = useCallback((postId: string) => {
    deletePostapi(postId).then((res) => {
      if (res.status === "success" && res.data === postId) {
        queryclient.invalidateQueries({
          queryKey: ["recent-posts"],
          exact: false,
        });
        toast.success("Post deleted successfully");
      } else {
        toast.error(res.message || "Failed to delete post");
      }
    });
  }, []);

  const handleEdit = () => {
    router.push(`/post/${id}/edit`);
  };

  const handlePostClick = () => {
    router.push(`/post/${id}`);
  };

  //#region UseEffects
  useEffect(() => {
    if (!code) return;

    startTransition(async () => {
      try {
        const html = await highlightCode(code, language);
        setCodeHtml(html);
      } catch (err) {
        console.error("Shiki highlighting failed:", err);
        setCodeHtml(null);
      }
    });
  }, [code, language]);
  //#endregion

  return (
    <div className="">
      <article
        className="rounded-xl hover:bg-[#293550] transition-colors bg-[#202a40] p-5 backdrop-blur-sm cursor-pointer"
        onClick={handlePostClick}
      >
        <div className="flex flex-items flex-row gap-2 items-center">
          {author && (
            <UserProfileImage
              badgeclassName="px-3 py-3 text-[0.9em]"
              imageclassName="w-10 h-10"
              name={author?.name!}
              image={author?.image}
            />
          )}
          <div className="w-full">
            <div className="flex items-center gap-3 sm:gap-0 flex-wrap justify-between">
              {/* Title and Language */}
              <div className="flex flex-row flex-wrap gap-2 items-center">
                {/* Title */}
                <Link href={`/post/${id}`} onClick={(e) => e.stopPropagation()}>
                  <h3
                    className={`${space_grotesk.className} text-lg font-bold text-slate-200 leading-snug py-1`}
                  >
                    {title}
                  </h3>
                </Link>
                {/* Language */}
                <span
                  className={`${jetbrains_mono.className} border bg-[#1a2746] text-xs border-gray-500/90 text-green-300 px-3`}
                >
                  {language}
                </span>
              </div>
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {status === "OPEN" && user?.data?.user?.id === authorId && (
                  <>
                    <button
                      className="p-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
                      onClick={handleEdit}
                    >
                      <FiEdit2 className="text-sm" />
                    </button>
                    <PostDeleteConfirmModal
                      postId={id}
                      onDelete={() => handleDelete(id)}
                    />
                  </>
                )}
                <PostStatusBadge status={status} isDraft={!published} />
              </div>
            </div>
            {/* time */}
            <div
              className={`${jetbrains_mono.className} mt-2 space-x-1 sm:mt-0 text-[0.7em] text-slate-400`}
            >
              {author && (
                <span className={cn(inter.className)}>
                  Posted by{" "}
                  <Link
                    href={`/browse?user=${author.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary"
                  >
                    {author.id === user.data?.user.id ? "You" : author.name}
                  </Link>{" "}
                  •
                </span>
              )}
              <span>
                Posted <TimeAgoComponent date={createdTime} />
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p
          className={cn(
            `${inter.className} mt-3 text-sm text-slate-300 leading-relaxed`,
            !published && "text-slate-400",
          )}
        >
          {description}
        </p>

        {/* Syntax-highlighted code preview */}
        {code && (
          <div className="mt-4 rounded-lg overflow-hidden border-s-4 border-[#2f4a63]">
            {codeHtml ? (
              <div
                className={cn(
                  "text-sm [&>pre]:p-4 [&>pre]:m-0 [&>pre]:overflow-x-auto transition-opacity duration-300",
                  isPending ? "opacity-50" : "opacity-100",
                )}
                dangerouslySetInnerHTML={{ __html: codeHtml }}
              />
            ) : (
              <pre
                className={cn(
                  jetbrains_mono.className,
                  "p-4 text-sm text-slate-300 bg-[#0d1117] overflow-x-auto max-h-64 transition-opacity duration-300",
                  isPending && "animate-pulse opacity-60",
                )}
              >
                <code>{code}</code>
              </pre>
            )}
          </div>
        )}

        <div className="flex flex-row justify-between items-center flex-wrap gap-3 mt-3">
          {/* tags */}
          <TagDisplay tag={tag} />
          {/* Counts */}
          <div
            className={cn(
              inter.className,
              "flex flex-row flex-wrap gap-3 text-slate-300",
            )}
          >
            {/* Comments */}
            {requireComments && (
              <div className="flex items-center gap-1 flex-row text-[0.7em]">
                <LuMessageSquare size={13} />
                {viewsCount ?? 0} Comments
              </div>
            )}

            {/* Reviews */}
            {requireReview && (
              <div className="flex items-center gap-1 flex-row text-[0.7em]">
                <VscCommentDiscussion size={13} />
                {reviewCount ?? 0} Reviews
              </div>
            )}

            {/* Views */}
            <div className="flex items-center gap-1 flex-row text-[0.7em]">
              <LuEye size={13} />
              {viewsCount ?? 0} Views
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostShort;
