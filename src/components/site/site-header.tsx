"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";
  const lightText = isHome ? "text-white" : "text-susu-text";

  return (
    <header
      className={`z-30 w-full ${isHome ? "absolute top-0 bg-gradient-to-b from-black/45 to-transparent" : "sticky top-0 border-b border-susu-line bg-susu-bg/95 backdrop-blur"}`}
    >
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
        <Link href="/" className="flex items-center gap-3">
          <span className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 ${isHome ? "border-white/75 shadow-[0_5px_18px_rgba(0,0,0,0.22)]" : "border-white shadow-soft"}`}>
            <Image
              src="/characters/xiaoya-avatar.webp"
              alt="小雅卡通头像"
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </span>
          <span className={lightText}>
            <span className="display-serif block text-xl font-semibold leading-tight tracking-[0.08em] sm:text-2xl">酥酥时光机</span>
            <span className={`mt-1 block text-xs tracking-[0.2em] ${isHome ? "text-white/75" : "text-susu-muted"}`}>成长故事小书</span>
          </span>
        </Link>
        <nav className={`hidden items-center gap-8 text-sm font-semibold sm:flex ${lightText}`}>
          <Link href="/stories" className="transition hover:text-peach-500">
            成长时间轴
          </Link>
        </nav>
        <button type="button" className={`p-2 sm:hidden ${lightText}`} onClick={() => setOpen((value) => !value)} aria-label={open ? "关闭导航" : "打开导航"}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open ? (
        <nav className={`mx-5 mb-4 grid gap-1 border p-2 text-sm font-semibold sm:hidden ${isHome ? "border-white/25 bg-black/70 text-white backdrop-blur" : "border-susu-line bg-white text-susu-text"}`}>
          <Link href="/stories" className="px-4 py-3" onClick={() => setOpen(false)}>成长时间轴</Link>
        </nav>
      ) : null}
    </header>
  );
}
