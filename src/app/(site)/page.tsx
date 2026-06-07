import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { formatShortDate, StoryCard } from "@/components/site/story-card";
import { listStories } from "@/server/stories";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/dates";
import { getImageUrl } from "@/lib/images";
import { storyHref } from "@/lib/links";

export const dynamic = "force-dynamic";

const defaultHeroImage = "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80";

export default async function HomePage() {
  const [stories, heroConfig] = await Promise.all([
    listStories({ pageSize: 3 }),
    prisma.siteConfig.findUnique({ where: { key: "home_hero_image" } }).catch(() => null)
  ]);
  const heroImage = heroConfig?.value || defaultHeroImage;
  const [featuredStory, ...otherStories] = stories.items;

  return (
    <main className="bg-white">
      <section className="relative flex min-h-[680px] items-end overflow-hidden bg-[#25221d] sm:min-h-[760px] lg:min-h-[560px]">
        <Image
          src={heroImage}
          alt="酥酥的成长照片"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-14 text-white sm:px-8 sm:pb-20 lg:px-14 lg:pb-24">
          <div className="relative z-10 max-w-[calc(100%-5.5rem)] sm:max-w-[calc(100%-8rem)] lg:max-w-3xl">
            <h1 className="display-serif text-balance text-4xl font-semibold leading-[1.35] tracking-[0.03em] sm:text-5xl lg:text-6xl">
              把酥酥的每一个小小瞬间，放进一台温柔的时光机。
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
              第一次认真搭城堡，第一次在草地上追泡泡，普通日常里闪亮的表情，都在这里按日期好好保存。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/stories" variant="primary" size="lg" className="min-w-44">
                打开成长时间轴
              </ButtonLink>
              <ButtonLink href="/admin/stories/new" variant="outlineLight" size="lg" className="min-w-40">
                记录新故事
              </ButtonLink>
            </div>
          </div>
          <div className="xiaoya-companion pointer-events-none absolute bottom-0 right-1 z-0 w-[116px] sm:right-6 sm:w-[150px] lg:right-12 lg:w-[188px]" aria-hidden="true">
            <div className="absolute bottom-2 left-1/2 h-8 w-[82%] -translate-x-1/2 rounded-full bg-[#f7c8c2]/45 blur-xl" />
            <img
              src="/characters/xiaoya-loop.gif"
              alt=""
              width="360"
              height="450"
              className="relative h-auto w-full drop-shadow-[0_12px_18px_rgba(0,0,0,0.28)]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-14">
        <div className="mb-10 flex items-end justify-between border-b border-susu-line pb-5">
          <h2 className="display-serif text-2xl font-semibold tracking-[0.08em] sm:text-3xl">最近故事</h2>
          <Link href="/stories" className="hidden items-center gap-2 text-sm font-semibold transition hover:text-peach-600 sm:flex">
            查看全部 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featuredStory ? (
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
            <div className="flex flex-col justify-center lg:pr-8">
              <div className="flex items-start gap-4">
                <div className="display-serif text-5xl leading-none text-peach-500 sm:text-6xl">{formatShortDate(featuredStory.storyDate)}</div>
                <div className="pt-1 text-xs leading-5 text-susu-muted">{formatDate(featuredStory.storyDate)}</div>
              </div>
              <Link href={storyHref(featuredStory)} className="display-serif mt-7 text-3xl font-semibold leading-tight transition hover:text-peach-600 sm:text-4xl">
                {featuredStory.title}
              </Link>
              <p className="mt-4 max-w-md text-sm leading-7 text-susu-muted">{featuredStory.summary}</p>
              <Link href={storyHref(featuredStory)} className="mt-8 inline-flex text-peach-500 transition hover:translate-x-1" aria-label={`阅读${featuredStory.title}`}>
                <ArrowRight className="h-7 w-7" />
              </Link>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden bg-[#ebe7df]">
              <Image src={getImageUrl(featuredStory.coverImage)} alt={featuredStory.title} fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" />
            </div>
          </div>
        ) : (
          <div className="border-y border-susu-line py-16 text-center text-susu-muted">还没有故事。先去后台记录一条今天的成长瞬间吧。</div>
        )}
        {otherStories.length > 0 ? (
          <div className="mt-12 grid gap-8 border-t border-susu-line pt-10 md:grid-cols-2">
            {otherStories.map((story) => <StoryCard key={story.id} story={story} compact />)}
          </div>
        ) : null}
        <Link href="/stories" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold sm:hidden">
          查看全部 <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
