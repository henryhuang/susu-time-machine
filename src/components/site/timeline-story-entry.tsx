import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { getImageUrl } from "@/lib/images";
import { storyHref } from "@/lib/links";
import { StoryDTO } from "@/types/story";

export function TimelineStoryEntry({ story, index }: { story: StoryDTO; index: number }) {
  const date = new Date(story.storyDate);
  const href = storyHref(story);
  const dateLabel = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join(" / ");
  const isRight = index % 2 === 0;

  return (
    <article className="group relative grid pb-16 sm:pb-20 lg:grid-cols-2 lg:pb-24">
      <span className="absolute left-[-5px] top-12 z-10 h-3 w-3 rounded-full border-2 border-[#fffaf5] bg-peach-500 ring-1 ring-peach-500 lg:left-1/2 lg:-translate-x-1/2" />
      <div
        className={`ml-7 border border-[#eedfd9] bg-[#fffdf9] p-4 shadow-soft sm:p-5 lg:ml-0 lg:w-[calc(100%-52px)] ${
          isRight ? "lg:col-start-2 lg:justify-self-end" : "lg:col-start-1 lg:justify-self-start"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-dashed border-[#e8c8be] pb-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9b7e75]">
            <span className="font-mono tracking-[0.12em]">{dateLabel}</span>
            {story.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {story.location}
              </span>
            ) : null}
          </div>
          <span className="display-serif text-3xl leading-none text-peach-500">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className={`grid gap-5 ${isRight ? "sm:grid-cols-[180px_1fr]" : "sm:grid-cols-[1fr_180px]"}`}>
          <Link
            href={href}
            className={`relative block aspect-[4/3] overflow-hidden border-[8px] border-white bg-[#ebe7df] shadow-soft ${
              isRight ? "" : "sm:order-2"
            }`}
            aria-label={`阅读${story.title}`}
          >
            <Image
              src={getImageUrl(story.coverImage)}
              alt={story.title}
              fill
              sizes="(max-width: 640px) 100vw, 220px"
              className="object-cover transition duration-700 group-hover:scale-[1.035]"
            />
          </Link>

          <div className="flex min-w-0 flex-col justify-center">
            <Link
              href={href}
              className="display-serif text-2xl font-semibold leading-snug tracking-wide transition group-hover:text-peach-600"
            >
              {story.title}
            </Link>
            {story.summary ? <p className="mt-3 line-clamp-3 text-sm leading-7 text-susu-muted">{story.summary}</p> : null}
            {story.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {story.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span
                    key={tag}
                    className={`px-2.5 py-1 text-[11px] font-semibold ${
                      tagIndex % 3 === 0
                        ? "bg-[#f9d8d2] text-peach-600"
                        : tagIndex % 3 === 1
                          ? "bg-[#eaf5ff] text-[#5689ad]"
                          : "bg-[#edf4e8] text-[#6f8b5b]"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <Link
              href={href}
              className="mt-5 inline-flex w-fit items-center gap-2 text-xs font-semibold tracking-[0.14em] text-peach-500 transition group-hover:gap-3"
            >
              阅读故事
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
