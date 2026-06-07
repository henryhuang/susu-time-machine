import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-[#211f1c] text-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:px-14">
        <div className="flex items-center gap-3">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/70 shadow-[0_5px_18px_rgba(0,0,0,0.25)]">
            <Image
              src="/characters/xiaoya-avatar.webp"
              alt="小雅卡通头像"
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
          <div>
            <div className="display-serif text-xl tracking-[0.08em]">酥酥时光机</div>
            <div className="mt-1 text-xs tracking-[0.2em] text-white/55">成长故事小书</div>
          </div>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <div className="text-white/60">慢慢记录，慢慢长大。</div>
          <Link href="/admin" className="border border-white/30 px-4 py-2 text-white/75 transition hover:border-white/70 hover:text-white">
            后台
          </Link>
        </div>
      </div>
    </footer>
  );
}
