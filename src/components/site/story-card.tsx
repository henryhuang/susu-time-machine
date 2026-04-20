import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/dates";
import { getImageUrl } from "@/lib/images";
import { StoryDTO } from "@/types/story";
import { Tag } from "@/components/ui/tag";

export function StoryCard({ story }: { story: StoryDTO }) {
  return (
    <article className="group grid gap-4 rounded-lg border border-susu-line bg-white p-3 shadow-card transition hover:-translate-y-0.5 hover:bg-[#fffafb] sm:grid-cols-[180px_1fr]">
      <Link href={`/stories/${story.id}`} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-peach-50">
        <Image
          src={getImageUrl(story.coverImage)}
          alt={story.title}
          fill
          sizes="(max-width: 640px) 100vw, 180px"
          className="object-cover transition group-hover:scale-105"
        />
      </Link>
      <div className="flex min-w-0 flex-col justify-center">
        <div className="text-sm text-susu-muted">{formatDate(story.storyDate)}</div>
        <Link href={`/stories/${story.id}`} className="mt-1 text-xl font-bold hover:text-peach-600">
          {story.title}
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-susu-muted">{story.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {story.tags.length > 0 ? story.tags.map((tag) => <Tag key={tag}>{tag}</Tag>) : <Tag tone="gray">成长</Tag>}
        </div>
      </div>
    </article>
  );
}
