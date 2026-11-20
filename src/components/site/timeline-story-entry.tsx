import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatAgeAtDate } from "@/lib/dates";
import { storyHref } from "@/lib/links";
import type { StoryDTO } from "@/types/story";
import home from "./home.module.css";
import styles from "@/app/(site)/stories/timeline.module.css";

export function TimelineStoryEntry({
  story,
  birthday,
  featured,
  eager
}: {
  story: StoryDTO;
  birthday: string;
  featured: boolean;
  eager: boolean;
}) {
  const cover = story.coverImage?.trim() || story.images.find((image) => image.imageUrl.trim())?.imageUrl.trim();
  const date = story.storyDate.slice(0, 10);
  const age = formatAgeAtDate(birthday, story.storyDate);
  const summary = story.summary.trim();
  const titleId = `story-title-${story.id}`;

  return (
    <article className={`${home.story} ${styles.entry} ${featured ? styles.featured : ""}`}>
      <Link href={storyHref(story)} prefetch={false} className={`${home.storyLink} ${styles.storyLink}`} aria-labelledby={titleId}>
        {cover ? (
          <div className={`${home.storyPhoto} ${styles.photo}`}>
            <Image src={cover} alt={story.title} fill loading={eager ? "eager" : "lazy"} />
          </div>
        ) : null}
        <div className={`${home.storyText} ${styles.storyText}`}>
          <time dateTime={date}>{date.replaceAll("-", ".")}</time>
          <h3 id={titleId}>{story.title}</h3>
          {summary && summary !== story.title.trim() ? <p>{summary}</p> : null}
          {age || story.location || story.tags.length ? (
            <ul className={styles.metadata}>
              {age ? <li>{age}</li> : null}
              {story.location ? <li>{story.location}</li> : null}
              {story.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          ) : null}
          {featured ? <ArrowRight className={home.storyArrow} aria-hidden="true" size={18} /> : null}
        </div>
      </Link>
    </article>
  );
}
