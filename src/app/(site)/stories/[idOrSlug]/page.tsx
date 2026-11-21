import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { ImagePreview } from "@/components/site/image-preview";
import { WechatShareButton } from "@/components/site/wechat-share-button";
import { formatAgeAtDate } from "@/lib/dates";
import { getChildProfile } from "@/lib/child-profile";
import { getImageUrl } from "@/lib/images";
import { storyHref } from "@/lib/links";
import { absoluteUrl, getRequestSiteUrl } from "@/lib/site";
import { getStory, getStoryNeighbors } from "@/server/stories";
import home from "@/components/site/home.module.css";
import styles from "./story-detail.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ idOrSlug: string }> }): Promise<Metadata> {
  const { idOrSlug } = await params;
  const [story, child] = await Promise.all([getStory(idOrSlug), getChildProfile()]);
  if (!story) return {};

  const requestSiteUrl = await getRequestSiteUrl();
  const canonicalPath = storyHref(story);
  const canonicalUrl = absoluteUrl(canonicalPath, requestSiteUrl);
  const coverImage = absoluteUrl(getImageUrl(story.coverImage), requestSiteUrl);
  const siteName = `${child.displayName}时光机`;
  const description = story.summary || `${story.title} - ${child.displayName}的成长故事`;

  return {
    title: story.title,
    description,
    authors: [{ name: siteName, url: absoluteUrl("/", requestSiteUrl) }],
    category: "成长故事",
    keywords: [siteName, "成长故事", ...story.tags],
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: story.title,
      description,
      url: canonicalUrl,
      siteName,
      locale: "zh_CN",
      type: "article",
      publishedTime: story.createdAt,
      modifiedTime: story.updatedAt,
      tags: story.tags,
      images: [
        {
          url: coverImage,
          alt: `${story.title} - ${siteName}`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
      images: [coverImage]
    },
    other: {
      "og:image:secure_url": coverImage
    }
  };
}

const months = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

export default async function StoryDetailPage({ params }: { params: Promise<{ idOrSlug: string }> }) {
  const { idOrSlug } = await params;
  const [story, child] = await Promise.all([getStory(idOrSlug), getChildProfile()]);
  if (!story) notFound();

  const [{ previous, next }, requestSiteUrl] = await Promise.all([
    getStoryNeighbors(story.id),
    getRequestSiteUrl()
  ]);
  const shareUrl = absoluteUrl(storyHref(story), requestSiteUrl);
  const shareImage = absoluteUrl(getImageUrl(story.coverImage), requestSiteUrl);
  const paragraphs = story.content.split(/\r\n|[\n\r]/).filter((paragraph) => paragraph.trim());
  const date = story.storyDate.slice(0, 10);
  const [year, month] = date.split("-");
  const age = child.birthday ? formatAgeAtDate(child.birthday, date).replace(/\d+天$/, "") : "";
  const summary = story.summary.trim();
  const cover = story.coverImage?.trim();
  const photos = story.images.map((image) => image.imageUrl.trim()).filter(Boolean);
  // A cover chosen from the story keeps its original position in the preview sequence.
  const matchingCover = cover ? photos.indexOf(cover) : -1;
  const heroIndex = cover ? Math.max(0, matchingCover) : -1;
  if (cover && matchingCover === -1) photos.unshift(cover);

  return (
    <main className={`${home.main} ${styles.main}`}>
      <article className={home.container}>
        <header className={styles.header}>
          <nav className={styles.breadcrumb} aria-label="面包屑">
            <Link href="/stories">成长故事</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/stories?year=${year}#year-${year}`}>{year}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{months[Number(month) - 1]}月</span>
          </nav>
          <h1>{story.title}</h1>
          <ul className={styles.metadata}>
            <li><time dateTime={date}>{date.replaceAll("-", ".")}</time></li>
            {age ? <li>{age}</li> : null}
            {story.location ? <li>{story.location}</li> : null}
          </ul>
          {summary && summary !== story.title.trim() ? <p className={styles.summary}>{story.summary}</p> : null}
        </header>
        <ImagePreview key={story.id} photos={photos} heroIndex={heroIndex} title={story.title}>
          {paragraphs.length > 0 ? (
            <div className={styles.body}>
              {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          ) : null}
        </ImagePreview>
        <div className={styles.articleEnd}>
          {story.tags.length > 0 ? (
            <ul className={styles.tags} aria-label="故事标签">
              {story.tags.map((tag, index) => <li key={index}>{tag}</li>)}
            </ul>
          ) : null}
          <WechatShareButton
            title={story.title}
            summary={story.summary || `${story.title} - ${child.displayName}的成长故事`}
            imageUrl={shareImage}
            shareUrl={shareUrl}
            className={styles.share}
          />
        </div>
        {previous || next ? (
          <nav className={styles.neighbors} aria-label="相邻故事">
            {previous ? (
              <Link href={storyHref(previous)} prefetch={false} rel="prev">
                <span><ArrowLeft size={15} aria-hidden="true" /> 上一篇</span>
                <strong>{previous.title}</strong>
              </Link>
            ) : null}
            {next ? (
              <Link href={storyHref(next)} prefetch={false} rel="next">
                <span>下一篇 <ArrowRight size={15} aria-hidden="true" /></span>
                <strong>{next.title}</strong>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </article>
    </main>
  );
}
