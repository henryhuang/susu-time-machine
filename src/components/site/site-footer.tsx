export function SiteFooter() {
  return (
    <footer className="bg-[#211f1c] text-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:px-14">
        <div>
          <div className="display-serif text-xl tracking-[0.08em]">酥酥时光机</div>
          <div className="mt-1 text-xs tracking-[0.2em] text-white/55">成长故事小书</div>
        </div>
        <div className="text-sm text-white/60">慢慢记录，慢慢长大。</div>
      </div>
    </footer>
  );
}
