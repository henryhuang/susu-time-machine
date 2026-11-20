import type { Metadata } from "next";
import { TimelineStoryEntry } from "@/components/site/timeline-story-entry";
import { TimelineYearNavigation } from "@/components/site/timeline-year-navigation";
import home from "@/components/site/home.module.css";
import { absoluteUrl, getRequestSiteUrl } from "@/lib/site";
import { listStories } from "@/server/stories";
import { getChildProfile } from "@/lib/child-profile";
import { formatAgeAtDate } from "@/lib/dates";
import styles from "./timeline.module.css";

export const dynamic = "force-dynamic";

const defaultBirthday = "2021-11-22";

function yearAgeLabel(birthday: string, year: string) {
  const end = formatAgeAtDate(birthday, `${year}-12-31`).split("岁")[0];
  if (!end) return "";

  const start = formatAgeAtDate(birthday, `${year}-01-01`).split("岁")[0];
  const range = start && start !== end ? `${start}—${end}` : end;
  return `${range} ${range === "1" ? "YEAR" : "YEARS"} OLD`;
}

export async function generateMetadata(): Promise<Metadata> {
  const [requestSiteUrl, child] = await Promise.all([getRequestSiteUrl(), getChildProfile()]);
  const siteName = `${child.displayName}时光机`;
  const canonicalUrl = absoluteUrl("/stories", requestSiteUrl);
  const shareImage = absoluteUrl("/share/stories-logo.png", requestSiteUrl);
  const description = `沿着时间轴，收藏${child.displayName}慢慢长大的每一段故事。`;

  return {
    title: "成长时间轴",
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: `成长时间轴 | ${siteName}`,
      description,
      url: canonicalUrl,
      siteName,
      locale: "zh_CN",
      type: "website",
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: siteName
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `成长时间轴 | ${siteName}`,
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

export default async function StoriesPage({
  searchParams
}: {
  searchParams: Promise<{ year?: string | string[] }>;
}) {
  const [firstPage, child, { year: requestedYear }] = await Promise.all([
    listStories({ page: 1, pageSize: 50 }),
    getChildProfile(),
    searchParams
  ]);
  const allStories = [...firstPage.items];

  for (let page = 2; page <= Math.ceil(firstPage.total / firstPage.pageSize); page += 1) {
    const nextPage = await listStories({ page, pageSize: firstPage.pageSize });
    allStories.push(...nextPage.items);
  }

  const sortedStories = allStories.sort((a, b) => {
    const dateDifference = new Date(b.storyDate).getTime() - new Date(a.storyDate).getTime();
    return dateDifference || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const groups = sortedStories.reduce<Record<string, typeof sortedStories>>((groups, story) => {
    const year = story.storyDate.slice(0, 4);
    (groups[year] ??= []).push(story);
    return groups;
  }, {});
  const initialYear = typeof requestedYear === "string" && /^[1-9]\d{3}$/.test(requestedYear) ? requestedYear : undefined;
  // A homepage year link also needs a destination when that year has no stories.
  if (initialYear) {
    groups[initialYear] ??= [];
  }
  const storyGroups = Object.entries(groups).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA));
  const years = storyGroups.filter(([, stories]) => stories.length).map(([year]) => year);
  const birthday = child.birthday || defaultBirthday;

  return (
    <main className={`${home.main} ${styles.main}`}>
      <header className={`${home.container} ${styles.pageHeader}`}>
        <h1>成长时间轴</h1>
        <div className={styles.masthead} lang="en">
          <p>Growth Timeline</p>
          <p>{birthday.slice(0, 4)} — Present</p>
        </div>
      </header>
      <TimelineYearNavigation years={years} initialYear={initialYear} />
      <div className={`${home.container} ${styles.chapters}`}>
        {storyGroups.map(([year, yearStories]) => {
          const age = yearAgeLabel(birthday, year);
          return (
            <section
              id={`year-${year}`}
              key={year}
              className={styles.chapter}
              data-timeline-year={year}
              aria-labelledby={`heading-${year}`}
            >
              <header className={styles.chapterHeader}>
                <h2 id={`heading-${year}`} tabIndex={-1}>{year}</h2>
                {age ? <p lang="en">{age}</p> : null}
              </header>
              {yearStories.length ? (
                <div className={styles.grid}>
                  {yearStories.map((story, index) => (
                    <TimelineStoryEntry
                      key={story.id}
                      story={story}
                      birthday={birthday}
                      featured={index === 0}
                      eager={index === 0 && year === (initialYear ?? years[0])}
                    />
                  ))}
                </div>
              ) : (
                <p className={home.empty}>这一年还没有故事。</p>
              )}
            </section>
          );
        })}
        {storyGroups.length === 0 ? (
          <p className={`${home.empty} ${styles.empty}`}>时间轴还空着，第一条故事很快就会来到这里。</p>
        ) : null}
      </div>
    </main>
  );
}
