import { ButtonLink } from "@/components/ui/button";
import { StoryCard } from "@/components/site/story-card";
import { listStories } from "@/server/stories";

export const dynamic = "force-dynamic";

export default async function StoriesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page || "1");
  const stories = await listStories({ page, pageSize: 8 });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="font-semibold text-peach-600">成长时间轴</p>
        <h1 className="mt-2 text-3xl font-extrabold">按时间倒序，收藏酥酥的成长故事</h1>
        <p className="mt-3 max-w-2xl text-susu-muted">新的故事会排在最前面，慢慢往下翻，就是酥酥长大的路。</p>
      </div>

      {stories.items.length > 0 ? (
        <div className="relative grid gap-5 before:absolute before:left-4 before:top-2 before:h-full before:w-px before:bg-peach-100 sm:before:left-6">
          {stories.items.map((story) => (
            <div key={story.id} className="relative pl-10 sm:pl-14">
              <span className="absolute left-[11px] top-8 h-3 w-3 rounded-full bg-peach-500 ring-4 ring-peach-100 sm:left-[19px]" />
              <StoryCard story={story} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-susu-line bg-white p-10 text-center text-susu-muted">时间轴还空着，第一条故事很快就会来到这里。</div>
      )}

      <div className="mt-8 flex justify-center gap-3">
        {page > 1 ? <ButtonLink href={`/stories?page=${page - 1}`}>上一页</ButtonLink> : null}
        {stories.hasMore ? (
          <ButtonLink href={`/stories?page=${page + 1}`} variant="primary">
            加载更多
          </ButtonLink>
        ) : null}
      </div>
    </main>
  );
}
