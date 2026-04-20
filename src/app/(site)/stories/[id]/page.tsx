import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ImagePreview } from "@/components/site/image-preview";
import { Tag } from "@/components/ui/tag";
import { formatDate } from "@/lib/dates";
import { getImageUrl } from "@/lib/images";
import { getStory } from "@/server/stories";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const story = await getStory(id);
  if (!story) return {};
  return {
    title: story.title,
    description: story.summary,
    openGraph: {
      title: story.title,
      description: story.summary,
      images: story.coverImage ? [story.coverImage] : []
    }
  };
}

export default async function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = await getStory(id);
  if (!story) notFound();

  const paragraphs = story.content.split(/\n+/).filter(Boolean);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <article className="rounded-lg border border-susu-line bg-white p-4 shadow-card sm:p-8">
        <div className="text-sm font-semibold text-peach-600">{formatDate(story.storyDate)}</div>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{story.title}</h1>
        <p className="mt-4 text-base leading-8 text-susu-muted">{story.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {story.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-lg bg-peach-50">
          <Image src={getImageUrl(story.coverImage)} alt={story.title} fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
        </div>
        <div className="story-content mt-8 text-[16px] leading-8 text-susu-text">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {story.images.length > 0 ? (
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold">照片</h2>
            <ImagePreview images={story.images} />
          </section>
        ) : null}
      </article>
    </main>
  );
}
