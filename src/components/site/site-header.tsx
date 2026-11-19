"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useId, useRef, useState } from "react";
import styles from "./home.module.css";

const navigation = [
  { href: "/", label: "首页" },
  { href: "/stories", label: "成长时间轴" }
];

export function SiteHeader({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";
  const menuId = useId();
  const menuButton = useRef<HTMLButtonElement>(null);

  if (isHome) {
    const navLinks = [
      navigation[0],
      { href: "/stories", label: "时间轴" },
      { href: "/#recent-stories", label: "故事" }
    ].map(({ href, label }) => (
      <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>
        {label}
      </Link>
    ));

    return (
      <header
        className={styles.header}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false);
            menuButton.current?.focus();
          }
        }}
      >
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
            {displayName}时光机
            <span lang="en">Susu Time Machine</span>
          </Link>
          <nav className={styles.nav} aria-label="主导航">{navLinks}</nav>
          <button
            type="button"
            ref={menuButton}
            className={styles.menuToggle}
            aria-label={open ? "关闭导航" : "打开导航"}
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
          </button>
        </div>
        {open ? (
          <nav id={menuId} className={styles.menuPanel} aria-label="菜单导航">
            <div className={styles.compactNav}>{navLinks}</div>
            <Link href="/admin/stories/new" onClick={() => setOpen(false)}>记录新故事</Link>
          </nav>
        ) : null}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-susu-line bg-susu-bg/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-soft">
            <Image
              src="/characters/xiaoya-avatar.webp"
              alt="小雅卡通头像"
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </span>
          <span className="text-susu-text">
            <span className="display-serif block text-xl font-semibold leading-tight tracking-[0.08em] sm:text-2xl">{displayName}时光机</span>
            <span className="mt-1 block text-xs tracking-[0.2em] text-susu-muted">成长故事小书</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-susu-text sm:flex">
          {navigation.map(({ href, label }) => (
            <Link key={href} href={href} className="transition hover:text-peach-500">{label}</Link>
          ))}
        </nav>
        <button type="button" className="p-2 text-susu-text sm:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? "关闭导航" : "打开导航"}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open ? (
        <nav className="mx-5 mb-4 grid gap-1 border border-susu-line bg-white p-2 text-sm font-semibold text-susu-text sm:hidden">
          {navigation.map(({ href, label }) => (
            <Link key={href} href={href} className="px-4 py-3" onClick={() => setOpen(false)}>{label}</Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
