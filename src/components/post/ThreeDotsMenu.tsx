"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { VscEdit, VscTrash } from "react-icons/vsc";

interface ThreeDotsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  groupHoverClass?: string;
}

const ThreeDotsMenu = ({
  onEdit,
  onDelete,
  groupHoverClass = "group-hover/comment:opacity-100",
}: ThreeDotsMenuProps) => {
  //#region State Hooks
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  //#endregion

  const handleMouseDown = useEffectEvent((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setMenuOpen(false);
    }
  });

  //#region UseEffects Hooks
  useEffect(() => {
    if (!menuOpen) return;
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [menuOpen]);
  //#endregion

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className={`opacity-0 ${groupHoverClass} text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-700/40 transition-all cursor-pointer`}
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
              onEdit();
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700/40 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <VscEdit className="text-sm text-primary/70" />
            Edit
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              onDelete();
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
          >
            <VscTrash className="text-sm" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ThreeDotsMenu;
