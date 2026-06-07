import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getImageUrl } from "@/lib/images";
import { storyHref } from "@/lib/links";
import { StoryDTO } from "@/types/story";

const imageLayouts = [
  "aspect-[16/10]",
  "aspect-[4/3] lg:max-w-[570px]",
  "aspect-[16/9]",
  "aspect-[3/2] lg:max-w-[620px]"
];

export function TimelineStoryEntry({ story, index }: { story: StoryDTO; index: number }) {
  const date = new Date(story.storyDate);
  const href = storyHref(story);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(date);
  const imageLayout = imageLayouts[index % imageLayouts.length];

  return (
    <article className="group relative grid gap-5 pb-16 pl-8 sm:pb-20 lg:grid-cols-[112px_minmax(0,1fr)_240px] lg:gap-8 lg:pb-24 lg:pl-0">
      <div className="relative">
        <div className="absolute left-[-32px] top-3 h-px w-6 bg-peach-500 lg:left-auto lg:right-[-33px] lg:w-8" />
        <span className="absolute left-[-36px] top-[9px] h-2 w-2 rounded-full border-2 border-[#fffdfa] bg-peach-500 ring-1 ring-peach-500 lg:left-auto lg:right-[-37px]" />
        <div className="display-serif text-[2rem] leading-none tracking-[0.08em] text-peach-500 sm:text-4xl">
          {month} <span className="text-xl text-[#bfafa9]">/</span> {day}
        </div>
        <div className="mt-2 text-xs tracking-[0.18em] text-susu-muted">{weekday}</div>
      </div>

      <Link
        href={href}
        className={`relative block w-full overflow-hidden bg-[#ebe7df] ${imageLayout}`}
        aria-label={`阅读${story.title}`}
      >
        <Image
          src={getImageUrl(story.coverImage)}
          alt={story.title}
          fill
          sizes="(max-width: 1024px) 100vw, 720px"
          className="object-cover transition duration-700 group-hover:scale-[1.025]"
        />
      </Link>

      <div className="flex flex-col justify-center border-b border-[#eadfda] pb-7 lg:border-b-0 lg:pb-0">
        <Link
          href={href}
          className="display-serif text-2xl font-semibold leading-snug tracking-wide transition group-hover:text-peach-600 sm:text-3xl"
        >
          {story.title}
        </Link>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-susu-muted">{story.summary}</p>
        {story.tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold tracking-[0.12em] text-[#a78e86]">
            {story.tags.slice(0, 3).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        ) : null}
        <Link
          href={href}
          className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-semibold tracking-[0.16em] text-peach-500 transition group-hover:gap-3"
        >
          阅读故事
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
