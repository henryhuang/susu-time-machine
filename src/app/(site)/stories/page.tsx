import type { Metadata } from "next";
import { TimelineStoryEntry } from "@/components/site/timeline-story-entry";
import { TimelineYearMenu } from "@/components/site/timeline-year-menu";
import { absoluteUrl, getRequestSiteUrl } from "@/lib/site";
import { listStories } from "@/server/stories";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const requestSiteUrl = await getRequestSiteUrl();
  const canonicalUrl = absoluteUrl("/stories", requestSiteUrl);
  const shareImage = absoluteUrl("/share/stories-logo.png", requestSiteUrl);
  const description = "沿着时间轴，收藏酥酥慢慢长大的每一段故事。";

  return {
    title: "成长时间轴",
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: "成长时间轴 | 酥酥时光机",
      description,
      url: canonicalUrl,
      siteName: "酥酥时光机",
      locale: "zh_CN",
      type: "website",
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: "酥酥时光机"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "成长时间轴 | 酥酥时光机",
      description,
      images: [shareImage]
    },
    other: {
      "og:image:secure_url": shareImage,
      "og:image:type": "image/png",
      "og:image:width": "1200",
      "og:image:height": "630"
    }
  };
}

export default async function StoriesPage() {
  const firstPage = await listStories({ page: 1, pageSize: 50 });
  const allStories = [...firstPage.items];

  for (let page = 2; page <= Math.ceil(firstPage.total / firstPage.pageSize); page += 1) {
    const nextPage = await listStories({ page, pageSize: firstPage.pageSize });
    allStories.push(...nextPage.items);
  }

  const sortedStories = allStories.sort((a, b) => {
    const dateDifference = new Date(b.storyDate).getTime() - new Date(a.storyDate).getTime();
    return dateDifference || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const storyGroups = Object.entries(
    sortedStories.reduce<Record<string, typeof sortedStories>>((groups, story) => {
      const year = String(new Date(story.storyDate).getFullYear());
      groups[year] = [...(groups[year] || []), story];
      return groups;
    }, {})
  ).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA));
  const years = storyGroups.map(([year]) => year);

  return (
    <main className="bg-[#fffaf5]">
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
        <div className="relative">
          <div className="mb-12 max-w-sm lg:absolute lg:left-0 lg:top-2 lg:mb-0">
            <div>
              <h1 className="display-serif text-4xl font-semibold tracking-[0.08em] sm:text-5xl">成长时间轴</h1>
              <p className="display-serif mt-2 text-xl italic tracking-wide text-peach-500">Growth Timeline</p>
              <div className="my-5 w-44 border-t border-dashed border-peach-500" />
              <p className="text-sm leading-7 text-susu-muted">新的故事在前，旧的故事在后。每一步，都是酥酥长大的脚印。</p>
            </div>
          </div>

          {storyGroups.length > 0 ? (
            <div className="relative lg:pt-6">
              <div className="absolute bottom-0 left-0 top-0 w-px bg-peach-500 lg:left-1/2 lg:-translate-x-1/2" />
              {storyGroups.map(([year, yearStories], groupIndex) => (
                <section id={`year-${year}`} key={year} className="scroll-mt-28">
                  <div className="relative z-10 mb-10 flex lg:justify-center">
                    <h2 className="display-serif ml-6 border border-[#e7d5c7] bg-[#f6ead9] px-5 py-1.5 text-2xl tracking-[0.1em] text-[#6d4e43] shadow-soft lg:ml-0">
                      {year}
                    </h2>
                  </div>
                  <div>
                    {yearStories.map((story, storyIndex) => (
                      <TimelineStoryEntry
                        key={story.id}
                        story={story}
                        index={storyGroups
                          .slice(0, groupIndex)
                          .reduce((count, [, groupStories]) => count + groupStories.length, storyIndex)}
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
        </div>
      </section>
      <TimelineYearMenu years={years} />
    </main>
  );
}
