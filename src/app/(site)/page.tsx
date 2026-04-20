import Image from "next/image";
import { Baby, BookOpen, CalendarHeart } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { StoryCard } from "@/components/site/story-card";
import { listStories } from "@/server/stories";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stories = await listStories({ pageSize: 3 });

  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-peach-600 shadow-soft">
            <CalendarHeart className="h-4 w-4" />
            成长故事慢慢收藏
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            把酥酥的每一个小小瞬间，放进一台温柔的时光机。
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-susu-muted">
            第一次认真搭城堡，第一次在草地上追泡泡，普通日常里闪亮的表情，都在这里按日期好好保存。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/stories" variant="primary" size="lg">
              打开成长时间轴
            </ButtonLink>
            <ButtonLink href="/admin/stories/new" variant="secondary" size="lg">
              记录新故事
            </ButtonLink>
          </div>
        </div>
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-susu-line bg-white shadow-card">
            <Image
              src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80"
              alt="亲子成长照片"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 520px"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-5 right-5 rounded-lg border border-susu-line bg-white p-4 shadow-popover">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-peach-100 text-peach-600">
                <Baby className="h-5 w-5" />
              </span>
              <div>
                <div className="font-bold">今天也有新的可爱</div>
                <div className="text-sm text-susu-muted">照片、日期和一句小故事，都会变成以后很珍贵的回看。</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-peach-600">
                <BookOpen className="h-4 w-4" />
                最近故事
              </div>
              <h2 className="mt-2 text-2xl font-bold">刚刚装进时光机的小片段</h2>
            </div>
            <ButtonLink href="/stories" variant="ghost">
              查看全部
            </ButtonLink>
          </div>
          {stories.items.length > 0 ? (
            <div className="grid gap-4">
              {stories.items.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-susu-line bg-white p-10 text-center text-susu-muted">
              还没有故事。先去后台记录一条今天的成长瞬间吧。
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
