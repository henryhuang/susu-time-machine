import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolveHeroImage } from "@/lib/hero-image";
import { absoluteUrl, getRequestSiteUrl } from "@/lib/site";
import { getChildProfile } from "@/lib/child-profile";
import { formatAgeAtDate } from "@/lib/dates";
import { storyHref } from "@/lib/links";
import { listStories } from "@/server/stories";
import type { StoryDTO } from "@/types/story";
import styles from "@/components/site/home.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [requestSiteUrl, child] = await Promise.all([getRequestSiteUrl(), getChildProfile()]);
  const siteName = `${child.displayName}时光机`;
  const canonicalUrl = absoluteUrl("/", requestSiteUrl);
  const heroConfig = await prisma.siteConfig.findUnique({ where: { key: "home_hero_image" } }).catch(() => null);
  const heroImage = resolveHeroImage(heroConfig?.value);
  const shareImage = absoluteUrl(heroImage.shareCard || "/share/stories-logo.png", requestSiteUrl);
  const shareImageType = heroImage.shareCard ? "image/jpeg" : "image/png";
  const description = "那些小小的表情、第一次和普通日常，都值得被好好保存。";

  return {
    title: siteName,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: siteName,
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
      title: siteName,
      description,
      images: [shareImage]
    },
    other: {
      "og:image:secure_url": shareImage,
      "og:image:type": shareImageType,
      "og:image:width": "1200",
      "og:image:height": "630"
    }
  };
}

const defaultBirthday = "2021-11-22";

function storyCover(story: StoryDTO) {
  return story.coverImage?.trim() || story.images.find((image) => image.imageUrl.trim())?.imageUrl.trim();
}

function StoryPreview({ story, featured }: { story: StoryDTO; featured: boolean }) {
  const cover = storyCover(story);
  const date = story.storyDate.slice(0, 10);
  const summary = story.summary.trim();

  return (
    <article className={styles.story}>
      <Link href={storyHref(story)} className={styles.storyLink}>
        {cover ? (
          <div className={styles.storyPhoto}>
            <Image src={cover} alt="" fill loading="lazy" />
          </div>
        ) : null}
        <div className={styles.storyText}>
          <time dateTime={date}>{date.replaceAll("-", ".")}</time>
          <h3>{story.title}</h3>
          {featured && summary && summary !== story.title.trim() ? <p>{summary}</p> : null}
          {featured ? <ArrowRight className={styles.storyArrow} size={18} aria-hidden="true" /> : null}
        </div>
      </Link>
    </article>
  );
}

export default async function HomePage() {
  const [configs, child, recent] = await Promise.all([
    prisma.siteConfig
      .findMany({
        where: { key: { in: ["home_hero_image", "home_hero_title", "home_hero_description"] } }
      })
      .catch(() => []),
    getChildProfile(),
    listStories({ page: 1, pageSize: 6 })
  ]);
  const config = Object.fromEntries(configs.map((item) => [item.key, item.value]));
  const heroSource = config.home_hero_image?.trim() || recent.items.map(storyCover).find(Boolean);
  const heroImage = heroSource ? resolveHeroImage(heroSource) : null;
  const heroSrcSet = heroImage?.variants.map((variant) => `${variant.url} ${variant.width}w`).join(", ");
  const heroTitle = config.home_hero_title?.trim() || `记录${child.displayName}的成长`;
  const heroDescription = config.home_hero_description?.trim();
  const birthday = child.birthday || defaultBirthday;
  const currentYear = Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Shanghai" }).format());
  const firstYear = 2021;
  const years = Array.from({ length: currentYear - firstYear + 1 }, (_, index) => firstYear + index);
  const storyRows = [recent.items.slice(0, 1), recent.items.slice(1, 3), recent.items.slice(3)];

  return (
    <main className={styles.main}>
      <section className={styles.hero} aria-labelledby="home-title">
        {heroImage ? (
          <picture className={styles.heroPhoto}>
            {heroSrcSet ? (
              <source type="image/webp" srcSet={heroSrcSet} sizes="100vw" />
            ) : null}
            <img
              src={heroImage.src}
              alt={heroImage.config ? heroImage.alt : `${child.displayName}的成长照片`}
              width={heroImage.width}
              height={heroImage.height}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </picture>
        ) : null}
        <div className={`${styles.container} ${styles.heroInner}`}>
          <div className={styles.heroCaption}>
            <p className={styles.masthead} lang="en">
              Susu<br /> Time<br /> Machine
            </p>
            <h1 id="home-title" className={styles.heroTitle}>{heroTitle}</h1>
            <p className={styles.heroDate}>从 <time dateTime={birthday}>{birthday.replaceAll("-", ".")}</time> 开始</p>
            {heroDescription ? <p className={styles.heroDescription}>{heroDescription}</p> : null}
          </div>
        </div>
      </section>

      <section id="recent-stories" className={`${styles.container} ${styles.recent}`} aria-labelledby="recent-title">
        <div className={styles.sectionHeading}>
          <h2 id="recent-title">最近的故事</h2>
          <Link href="/stories" className={styles.textLink}>
            查看全部 <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
        {recent.items.length ? (
          <div className={styles.storyGrid}>
            {storyRows.filter((row) => row.length).map((row, index) => (
              <div className={styles.storyRow} key={index}>
                {row.map((story) => <StoryPreview key={story.id} story={story} featured={index < 2} />)}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>还没有故事。</p>
        )}
      </section>

      <section className={`${styles.container} ${styles.timeline}`} aria-labelledby="home-timeline">
        <div className={styles.timelineHeading}>
          <h2 id="home-timeline">成长时间轴</h2>
          <p>按年份回顾{child.displayName}的成长足迹</p>
        </div>
        <ul className={styles.yearList}>
          {years.map((year) => {
            // Each tick describes the birthday reached by the end of that calendar year.
            const age = formatAgeAtDate(birthday, `${year}-12-31`).split("岁")[0];
            return (
              <li key={year}>
                <Link
                  href={`/stories?year=${year}#year-${year}`}
                  aria-current={year === currentYear ? "date" : undefined}
                  className={styles.yearLink}
                >
                  <span>{year}</span>
                  {age ? <small>{age}岁</small> : null}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link href="/stories" className={styles.timelineLink} aria-label="查看成长时间轴">
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>
    </main>
  );
}
