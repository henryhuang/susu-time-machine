import { redirect } from "next/navigation";
import Image from "next/image";
import { getCurrentAdmin } from "@/server/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <main className="grid min-h-screen place-items-center bg-susu-bg px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-susu-line bg-white shadow-card lg:grid-cols-[1fr_420px]">
        <div className="relative hidden min-h-[560px] bg-peach-50 lg:block">
          <Image
            src="https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1200&q=80"
            alt="登录页成长照片"
            fill
            priority
            sizes="580px"
            className="object-cover"
          />
          <div className="absolute inset-x-6 bottom-6 rounded-lg bg-white/90 p-5 shadow-popover">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-peach-500 font-bold text-white">酥</span>
              <div>
                <div className="font-bold">酥酥时光机后台</div>
                <div className="text-sm text-susu-muted">成长故事管理端</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-susu-muted">那些小小的表情、第一次和普通日常，都值得被好好保存。</p>
          </div>
        </div>
        <div className="grid content-center p-6 sm:p-10">
          <div className="mb-7">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-peach-500 font-bold text-white shadow-soft">酥</div>
            <h1 className="text-3xl font-extrabold">登录后台</h1>
            <p className="mt-2 text-susu-muted">管理酥酥的成长故事</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
