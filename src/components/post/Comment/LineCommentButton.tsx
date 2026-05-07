"use client";

import { VscComment } from "react-icons/vsc";
import { cn } from "@/lib/utils";

interface LineCommentButtonProps {
  count: number;
  onClick: () => void;
}

const LineCommentButton = ({ count, onClick }: LineCommentButtonProps) => {
  if (count === 0) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer",
        "bg-primary/10 text-primary/80 hover:bg-primary/20 hover:text-primary",
        "border border-primary/15 hover:border-primary/30",
        "shadow-sm shadow-primary/5",
      )}
      title={`${count} comment${count !== 1 ? "s" : ""} on this line`}
    >
      <VscComment size={15} />
      <span>{count}</span>
    </button>
  );
};

export default LineCommentButton;
