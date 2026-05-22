"use client";

import type { Token } from "@/lib/shiki";
import { cn } from "@/lib/utils";
import { JetBrains_Mono } from "next/font/google";
import { GoPlus } from "react-icons/go";
import LineCommentButton from "./Comment/LineCommentButton";
import { memo } from "react";

//#region Font Declaration
const jetbrains_mono = JetBrains_Mono({ subsets: ["latin"], weight: "400" });
//#endregion

interface CodeLineProps {
  lineNumber: number;
  owner: boolean;
  tokens: Token[];
  isSelected: boolean;
  isHighlighted: boolean;
  commentCount: number;
  showCommentButton: boolean;
  onLineMouseDown: (line: number) => void;
  onLineMouseEnter: (line: number) => void;
  onAddComment: (line: number) => void;
  onViewComments: (line: number) => void;
}

const CodeLine = ({
  lineNumber,
  tokens,
  isSelected,
  isHighlighted,
  owner,
  commentCount,
  showCommentButton,
  onLineMouseDown,
  onLineMouseEnter,
  onAddComment,
  onViewComments,
}: CodeLineProps) => {
  return (
    <div
      className={cn(
        jetbrains_mono.className,
        "group flex items-stretch transition-colors border-l-2 ps-2",
        isSelected
          ? "bg-primary/8 border-l-primary/60"
          : isHighlighted
            ? "bg-amber-500/6 border-l-amber-400/50"
            : "hover:bg-[#1a2744]/60 border-l-transparent",
      )}
    >
      {/* Comment count button — at the very start */}
      {showCommentButton && (
        <div className="w-8 shrink-0 flex items-center justify-center">
          <LineCommentButton
            count={commentCount}
            onClick={() => onViewComments(lineNumber)}
          />
        </div>
      )}

      {/* Line Number - click & drag on this to select lines */}
      <div
        className={cn(
          "w-10 shrink-0 flex items-center justify-end pr-2 select-none text-xs transition-colors",
          isSelected
            ? "text-primary/80 bg-primary/5"
            : isHighlighted
              ? "text-amber-400/70"
              : "text-slate-600 group-hover:text-slate-400",
          !owner && showCommentButton && "cursor-pointer",
        )}
        onMouseDown={(e) => {
          e.preventDefault();
          onLineMouseDown(lineNumber);
        }}
        onMouseEnter={() => onLineMouseEnter(lineNumber)}
      >
        {lineNumber}
      </div>

      {showCommentButton && !owner && (
        <div className="w-9 shrink-0 flex items-center justify-center">
          <button
            onClick={() => onAddComment(lineNumber)}
            className={cn(
              "text-primary/70 hover:text-primary hover:bg-primary/10 rounded p-0.5 transition-all cursor-pointer",
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
            title={`Add comment on line ${lineNumber}`}
          >
            <GoPlus className="text-sm" />
          </button>
        </div>
      )}

      {/* Code Content - syntax highlighted tokens */}
      <div className="flex-1 px-3 py-px whitespace-pre">
        <span className="text-sm leading-6">
          {tokens.length === 0
            ? "\n"
            : tokens.map((token, i) => (
                <span key={i} style={{ color: token.color }}>
                  {token.content}
                </span>
              ))}
        </span>
      </div>
    </div>
  );
};

export default memo(CodeLine);
