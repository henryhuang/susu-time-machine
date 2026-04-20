import Image from "next/image";
import Link from "next/link";
import { Images, PenLine, Rows3 } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";
import { getImageUrl } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { listStories } from "@/server/stories";
import { ProtectedAdmin } from "@/components/admin/protected-admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalStories, totalImages, recent] = await Promise.all([
    prisma.story.count(),
    prisma.storyImage.count(),
    listStories({ pageSize: 3 })
  ]);

  return (
    <ProtectedAdmin>
    <div className="grid gap-6">
      <section className="grid gap-5 rounded-lg border border-susu-line bg-white p-5 shadow-card lg:grid-cols-[1fr_260px]">
        <div>
          <p className="font-semibold text-peach-600">欢迎回来</p>
          <h1 className="mt-2 text-2xl font-extrabold">今天也来记录酥酥的成长吧</h1>
          <p className="mt-3 max-w-2xl text-susu-muted">把照片、日期和一句小故事整理好，时间轴会慢慢变成一本温柔的小书。</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/admin/stories/new" variant="primary">
              新增故事
            </ButtonLink>
            <ButtonLink href="/admin/stories">管理故事</ButtonLink>
          </div>
        </div>
        <div className="relative hidden overflow-hidden rounded-lg lg:block">
          <Image src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=640&q=80" alt="亲子成长照片" fill sizes="260px" className="object-cover" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="故事总数" value={totalStories} icon={<Rows3 className="h-5 w-5" />} />
        <Stat label="图片总数" value={totalImages} icon={<Images className="h-5 w-5" />} tone="blue" />
        <Stat label="快捷入口" value="新增" icon={<PenLine className="h-5 w-5" />} tone="green" href="/admin/stories/new" />
      </section>

      <section className="rounded-lg border border-susu-line bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">最近更新</h2>
          <ButtonLink href="/admin/stories" variant="ghost" size="sm">
            查看全部
          </ButtonLink>
        </div>
        <div className="grid gap-3">
          {recent.items.map((story) => (
            <Link key={story.id} href={`/admin/stories/${story.id}/edit`} className="flex items-center gap-3 rounded-lg border border-susu-line p-3 transition hover:bg-peach-50">
              <div className="relative h-16 w-20 flex-none overflow-hidden rounded-lg bg-peach-50">
                <Image src={getImageUrl(story.coverImage)} alt={story.title} fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-bold">{story.title}</div>
                <div className="text-sm text-susu-muted">{formatDate(story.storyDate)}</div>
              </div>
            </Link>
          ))}
          {recent.items.length === 0 ? <div className="rounded-lg border border-dashed border-susu-line p-8 text-center text-susu-muted">还没有故事，先新增一条吧。</div> : null}
        </div>
      </section>
    </div>
    </ProtectedAdmin>
  );
}

function Stat({ label, value, icon, tone = "peach", href }: { label: string; value: number | string; icon: React.ReactNode; tone?: "peach" | "blue" | "green"; href?: string }) {
  const colors = {
    peach: "bg-peach-100 text-peach-600",
    blue: "bg-[#eaf5ff] text-[#3f86ba]",
    green: "bg-[#eaf8f1] text-[#4c9f75]"
  };
  const content = (
    <div className="rounded-lg border border-susu-line bg-white p-5 shadow-card">
      <div className="flex items-center justify-between text-susu-muted">
        <span>{label}</span>
        <span className={`grid h-10 w-10 place-items-center rounded-lg ${colors[tone]}`}>{icon}</span>
      </div>
      <div className="mt-5 text-3xl font-extrabold">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
