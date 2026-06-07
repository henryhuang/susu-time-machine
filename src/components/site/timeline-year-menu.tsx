"use client";

import { CalendarDays, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function TimelineYearMenu({ years }: { years: string[] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function jumpToYear(year: string) {
    document.getElementById(`year-${year}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    window.history.replaceState(null, "", `#year-${year}`);
    setOpen(false);
  }

  if (years.length === 0) return null;

  return (
    <div ref={menuRef} className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
      {open ? (
        <div
          id="timeline-year-menu"
          className="w-40 border border-[#ead6cf] bg-[#fffdf9] p-2 shadow-popover"
          role="menu"
          aria-label="选择故事年份"
        >
          <div className="border-b border-dashed border-[#e8c8be] px-3 pb-2 pt-1 text-xs font-semibold tracking-[0.16em] text-[#9b7e75]">
            跳到哪一年
          </div>
          <div className="mt-1 grid">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                role="menuitem"
                className="display-serif px-3 py-2 text-left text-lg tracking-[0.08em] transition hover:bg-peach-50 hover:text-peach-600 focus-visible:bg-peach-50 focus-visible:text-peach-600 focus-visible:outline-none"
                onClick={() => jumpToYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="flex h-[52px] items-center gap-2 border border-peach-500 bg-peach-500 px-4 text-sm font-semibold text-white shadow-popover transition hover:bg-peach-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach-500 focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-controls="timeline-year-menu"
        aria-label={open ? "关闭年份选择" : "打开年份选择"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
        <span>{open ? "收起" : "选择年份"}</span>
      </button>
    </div>
  );
}
