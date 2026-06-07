import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/dates";
import { getImageUrl } from "@/lib/images";
import { storyHref } from "@/lib/links";
import { StoryDTO } from "@/types/story";
import { Tag } from "@/components/ui/tag";

export function StoryCard({ story, compact = false }: { story: StoryDTO; compact?: boolean }) {
  const href = storyHref(story);

  if (compact) {
    return (
      <article className="group">
        <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-[#ebe7df]">
          <Image
            src={getImageUrl(story.coverImage)}
            alt={story.title}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        </Link>
        <div className="mt-4 border-b border-susu-line pb-5">
          <div className="display-serif text-2xl tracking-wide">{formatShortDate(story.storyDate)}</div>
          <Link href={href} className="mt-2 block text-lg font-semibold transition hover:text-peach-600">
            {story.title}
          </Link>
          {story.summary ? <p className="mt-1 line-clamp-2 text-sm leading-6 text-susu-muted">{story.summary}</p> : null}
          <Link href={href} className="mt-4 inline-flex text-peach-500 transition group-hover:translate-x-1" aria-label={`阅读${story.title}`}>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group grid gap-5 border-b border-susu-line pb-8 sm:grid-cols-[220px_1fr]">
      <Link href={href} className="relative aspect-[4/3] overflow-hidden bg-[#ebe7df]">
        <Image
          src={getImageUrl(story.coverImage)}
          alt={story.title}
          fill
          sizes="(max-width: 640px) 100vw, 220px"
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex min-w-0 flex-col justify-center">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-peach-600">{formatDate(story.storyDate)}</div>
        <Link href={href} className="display-serif mt-2 text-2xl font-semibold leading-tight transition hover:text-peach-600 sm:text-3xl">
          {story.title}
        </Link>
        {story.summary ? <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-7 text-susu-muted">{story.summary}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {story.tags.length > 0 ? story.tags.map((tag) => <Tag key={tag}>{tag}</Tag>) : <Tag tone="gray">成长</Tag>}
        </div>
      </div>
    </article>
  );
}

export function formatShortDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${String(date.getMonth() + 1).padStart(2, "0")} / ${String(date.getDate()).padStart(2, "0")}`;
}
