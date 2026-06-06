import { ButtonLink } from "@/components/ui/button";
import { StoryCard } from "@/components/site/story-card";
import { listStories } from "@/server/stories";

export const dynamic = "force-dynamic";

export default async function StoriesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page || "1");
  const stories = await listStories({ page, pageSize: 8 });

  return (
    <main className="bg-white">
      <section className="border-b border-susu-line bg-susu-bg">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-peach-600">成长时间轴</p>
          <h1 className="display-serif mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">按时间倒序，收藏酥酥的成长故事</h1>
          <p className="mt-5 max-w-2xl leading-8 text-susu-muted">新的故事会排在最前面，慢慢往下翻，就是酥酥长大的路。</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        {stories.items.length > 0 ? (
          <div className="grid gap-10">
            {stories.items.map((story) => <StoryCard key={story.id} story={story} />)}
          </div>
        ) : (
          <div className="border-y border-susu-line py-16 text-center text-susu-muted">时间轴还空着，第一条故事很快就会来到这里。</div>
        )}

        <div className="mt-12 flex justify-center gap-3">
          {page > 1 ? <ButtonLink href={`/stories?page=${page - 1}`}>上一页</ButtonLink> : null}
          {stories.hasMore ? <ButtonLink href={`/stories?page=${page + 1}`} variant="primary">加载更多</ButtonLink> : null}
        </div>
      </section>
    </main>
  );
}
