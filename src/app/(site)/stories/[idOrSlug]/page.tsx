import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ImagePreview } from "@/components/site/image-preview";
import { Tag } from "@/components/ui/tag";
import { WechatShareButton } from "@/components/site/wechat-share-button";
import { formatDate } from "@/lib/dates";
import { getImageUrl } from "@/lib/images";
import { storyHref } from "@/lib/links";
import { absoluteUrl, getRequestSiteUrl } from "@/lib/site";
import { getStory } from "@/server/stories";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ idOrSlug: string }> }): Promise<Metadata> {
  const { idOrSlug } = await params;
  const story = await getStory(idOrSlug);
  if (!story) return {};

  const requestSiteUrl = await getRequestSiteUrl();
  const canonicalPath = storyHref(story);
  const canonicalUrl = absoluteUrl(canonicalPath, requestSiteUrl);
  const coverImage = absoluteUrl(getImageUrl(story.coverImage), requestSiteUrl);
  const description = story.summary || `${story.title} - 酥酥的成长故事`;

  return {
    title: story.title,
    description,
    authors: [{ name: "酥酥时光机", url: absoluteUrl("/", requestSiteUrl) }],
    category: "成长故事",
    keywords: ["酥酥时光机", "成长故事", ...story.tags],
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: story.title,
      description,
      url: canonicalUrl,
      siteName: "酥酥时光机",
      locale: "zh_CN",
      type: "article",
      publishedTime: story.createdAt,
      modifiedTime: story.updatedAt,
      tags: story.tags,
      images: [
        {
          url: coverImage,
          alt: `${story.title} - 酥酥时光机`
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
  const story = await getStory(idOrSlug);
  if (!story) notFound();

  const paragraphs = story.content.split(/\n+/).filter(Boolean);

  return (
    <main className="bg-white pb-20">
      <article>
        <header className="mx-auto max-w-4xl px-5 pb-10 pt-14 text-center sm:px-8 sm:pb-14 sm:pt-20">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-peach-600">{formatDate(story.storyDate)}</div>
          <h1 className="display-serif mt-5 text-balance text-4xl font-semibold leading-tight sm:text-6xl">{story.title}</h1>
          {story.summary ? <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-susu-muted">{story.summary}</p> : null}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {story.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          <WechatShareButton title={story.title} summary={story.summary || story.title} />
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
