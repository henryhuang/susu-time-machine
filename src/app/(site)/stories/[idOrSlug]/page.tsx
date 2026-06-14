import type { Metadata } from "next";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { ImagePreview } from "@/components/site/image-preview";
import { Tag } from "@/components/ui/tag";
import { WechatShareButton } from "@/components/site/wechat-share-button";
import { formatAgeAtDate, formatDate } from "@/lib/dates";
import { getChildProfile } from "@/lib/child-profile";
import { getImageUrl } from "@/lib/images";
import { storyHref } from "@/lib/links";
import { absoluteUrl, getRequestSiteUrl } from "@/lib/site";
import { getStory } from "@/server/stories";

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

export default async function StoryDetailPage({ params }: { params: Promise<{ idOrSlug: string }> }) {
  const { idOrSlug } = await params;
  const [story, child] = await Promise.all([getStory(idOrSlug), getChildProfile()]);
  if (!story) notFound();

  const requestSiteUrl = await getRequestSiteUrl();
  const shareUrl = absoluteUrl(storyHref(story), requestSiteUrl);
  const shareImage = absoluteUrl(getImageUrl(story.coverImage), requestSiteUrl);
  const paragraphs = story.content.split(/\n+/).filter(Boolean);
  const age = child.birthday ? formatAgeAtDate(child.birthday, story.storyDate) : "";

  return (
    <main className="bg-white pb-20">
      <article>
        <header className="mx-auto max-w-4xl px-5 pb-10 pt-14 text-center sm:px-8 sm:pb-14 sm:pt-20">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-peach-600">
            <span>{formatDate(story.storyDate)}</span>
            {age ? <span>{age}</span> : null}
            {story.location ? (
              <span className="inline-flex items-center gap-1 normal-case tracking-normal text-susu-muted">
                <MapPin className="h-3.5 w-3.5" />
                {story.location}
              </span>
            ) : null}
          </div>
          <h1 className="display-serif mt-5 text-balance text-4xl font-semibold leading-tight sm:text-6xl">{story.title}</h1>
          {story.summary ? <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-susu-muted">{story.summary}</p> : null}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {story.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          <WechatShareButton
            title={story.title}
            summary={story.summary || `${story.title} - ${child.displayName}的成长故事`}
            imageUrl={shareImage}
            shareUrl={shareUrl}
          />
        </header>
        <div className="relative mx-auto aspect-[16/9] max-h-[760px] max-w-[1440px] overflow-hidden bg-[#ebe7df]">
          <Image src={getImageUrl(story.coverImage)} alt={story.title} fill priority sizes="100vw" className="object-cover" />
        </div>
        {paragraphs.length > 0 ? (
          <div className="story-content mx-auto mt-12 max-w-2xl px-5 text-[16px] leading-9 text-susu-text sm:mt-16 sm:px-8">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : null}
        {story.images.length > 0 ? (
          <section className="mx-auto mt-16 max-w-6xl px-5 sm:px-8">
            <h2 className="display-serif mb-6 border-b border-susu-line pb-4 text-2xl font-semibold">照片</h2>
            <ImagePreview images={story.images} />
          </section>
        ) : null}
      </article>
    </main>
  );
}
