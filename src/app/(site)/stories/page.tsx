import { ButtonLink } from "@/components/ui/button";
import { TimelineStoryEntry } from "@/components/site/timeline-story-entry";
import { listStories } from "@/server/stories";

export const dynamic = "force-dynamic";

export default async function StoriesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page || "1");
  const stories = await listStories({ page, pageSize: 8 });
  const storyGroups = Object.entries(
    stories.items.reduce<Record<string, typeof stories.items>>((groups, story) => {
      const year = String(new Date(story.storyDate).getFullYear());
      groups[year] = [...(groups[year] || []), story];
      return groups;
    }, {})
  );

  return (
    <main className="bg-[#fffdfa]">
      <div className="mx-auto grid max-w-[1440px] md:grid-cols-[112px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#eee4df] md:block">
          <nav className="sticky top-28 flex flex-col gap-6 px-5 py-14 text-sm" aria-label="时间轴年份">
            {storyGroups.map(([year], index) => (
              <a
                key={year}
                href={`#year-${year}`}
                className={`relative pl-5 transition hover:text-peach-600 ${index === 0 ? "font-semibold text-peach-500" : "text-susu-muted"}`}
              >
                <span className={`absolute left-0 top-1.5 h-2 w-2 rounded-full ${index === 0 ? "bg-peach-500" : "border border-[#c9bbb5] bg-[#fffdfa]"}`} />
                {year}
              </a>
            ))}
            {storyGroups.length > 0 ? <span className="pl-5 text-susu-muted">更早</span> : null}
          </nav>
        </aside>

        <section className="min-w-0 px-5 pb-10 pt-10 sm:px-8 sm:pt-14 lg:px-12 xl:px-16">
          <div className="mb-12 flex items-end justify-between gap-5 border-b border-[#eee4df] pb-8 lg:mb-16">
            <div>
              <h1 className="display-serif text-4xl font-semibold tracking-[0.08em] sm:text-5xl">成长时间轴</h1>
              <p className="mt-3 text-sm tracking-[0.08em] text-susu-muted">沿着日期，收藏酥酥慢慢长大的每一段故事</p>
            </div>
            <div className="hidden text-right text-xs leading-6 tracking-[0.14em] text-[#ac9c96] sm:block">
              NEWEST
              <br />
              TO OLDEST
            </div>
          </div>

          {storyGroups.length > 0 ? (
            <div>
              {storyGroups.map(([year, yearStories], groupIndex) => (
                <section id={`year-${year}`} key={year} className="scroll-mt-32">
                  <div className="relative mb-10 flex items-center gap-4 sm:mb-12">
                    <span className="h-px w-6 bg-peach-500" />
                    <h2 className="display-serif text-2xl tracking-[0.12em] text-peach-500">{year}</h2>
                    <span className="h-px flex-1 bg-[#e8c9c0]" />
                  </div>
                  <div className="relative lg:pl-1">
                    <div className="absolute bottom-10 left-0 top-0 w-px bg-[#e7c4ba] lg:left-[112px]" />
                    {yearStories.map((story, storyIndex) => (
                      <TimelineStoryEntry
                        key={story.id}
                        story={story}
                        index={groupIndex * 3 + storyIndex}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="border-y border-[#eee4df] py-20 text-center text-susu-muted">
              时间轴还空着，第一条故事很快就会来到这里。
            </div>
          )}

          <div className="flex justify-center gap-3 border-t border-[#eee4df] pt-10">
            {page > 1 ? <ButtonLink href={`/stories?page=${page - 1}`}>上一页</ButtonLink> : null}
            {stories.hasMore ? <ButtonLink href={`/stories?page=${page + 1}`} variant="primary">下一页</ButtonLink> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
