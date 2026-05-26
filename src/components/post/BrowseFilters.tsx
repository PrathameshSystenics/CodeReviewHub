"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { CodeStatus, Sort } from "@/types/browse";

const SORT_OPTIONS: { label: string; value: Sort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

const STATUS_OPTIONS: { label: string; value: CodeStatus }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Accepted", value: "accepted" },
];

export default function BrowseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("sort") as Sort) ?? "newest";
  const currentStatus = (searchParams.get("codestatus") as CodeStatus) ?? "all";

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`/browse?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Sort group */}
      <div className="flex items-center rounded-lg bg-slate-900/60 p-1 gap-1">
        {SORT_OPTIONS.map(({ label, value }) => {
          const active = currentSort === value;
          return (
            <button
              key={value}
              id={`browse-sort-${value}`}
              onClick={() => setParam("sort", value)}
              className={cn(
                "rounded-sm px-3 py-1.5 text-xs font-medium transition-all duration-200",
                active
                  ? "bg-[#2d3449] text-primary"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-slate-700/60" />

      {/* Status group */}
      <div className="flex items-center rounded-lg bg-slate-900/60 p-1 gap-1">
        {STATUS_OPTIONS.map(({ label, value }) => {
          const active = currentStatus === value;
          return (
            <button
              key={value}
              id={`browse-status-${value}`}
              onClick={() => setParam("codestatus", value)}
              className={cn(
                "rounded-sm px-3 py-1.5 text-xs font-medium transition-all duration-200",
                active
                  ? "bg-[#2d3449] text-primary"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
