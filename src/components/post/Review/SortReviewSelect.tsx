"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { cn } from "@/lib/utils";
import { SortReview } from "@/types/review";
import { Space_Grotesk } from "next/font/google";

const space_grotesk = Space_Grotesk({ subsets: ["latin"] });

interface SortReviewSelectProps {
  value: SortReview;
  onValueChange: (value: SortReview) => void;
}

const SortReviewSelect = ({ value, onValueChange }: SortReviewSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          space_grotesk.className,
          " max-w-52 text-slate-300 text-sm tracking-wide border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/60 transition-colors cursor-pointer",
        )}
      >
        <span className="flex items-center gap-1">
          <span className="text-slate-500 font-medium">Sort By:</span>
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent
        className={cn(
          space_grotesk.className,
          "text-slate-300 border-slate-700/60 bg-slate-900/95 backdrop-blur-sm",
        )}
      >
        <SelectGroup>
          <SelectItem
            value="newest"
            className="text-slate-300 text-xs tracking-wide cursor-pointer"
          >
            Newest
          </SelectItem>
          <SelectItem
            value="oldest"
            className="text-slate-300 text-xs tracking-wide cursor-pointer"
          >
            Oldest
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SortReviewSelect;
