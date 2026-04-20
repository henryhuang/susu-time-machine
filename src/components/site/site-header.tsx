import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-susu-line/80 bg-susu-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-peach-500 font-bold text-white shadow-soft">酥</span>
          <span>
            <span className="block font-bold leading-tight">酥酥时光机</span>
            <span className="text-xs text-susu-muted">成长故事小书</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <ButtonLink href="/stories" variant="ghost" size="sm">
            成长时间轴
          </ButtonLink>
          <ButtonLink href="/admin" variant="secondary" size="sm" className="hidden sm:inline-flex">
            后台
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
