import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-susu-bg px-6">
      <section className="max-w-md rounded-lg border border-susu-line bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-lg bg-peach-500 font-bold text-white">404</div>
        <h1 className="text-2xl font-bold">这一页还没有故事</h1>
        <p className="mt-3 text-susu-muted">也许它正在某个相册里等着被整理出来。</p>
        <ButtonLink href="/" variant="primary" className="mt-6">
          回到首页
        </ButtonLink>
      </section>
    </main>
  );
}
