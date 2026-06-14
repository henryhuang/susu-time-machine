import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { defaultHeroImage, resolveHeroImage } from "@/lib/hero-image";
import { absoluteUrl, getRequestSiteUrl } from "@/lib/site";
import { getChildProfile } from "@/lib/child-profile";

export const dynamic = "force-dynamic";

const defaultHeroDescription = "第一次认真搭城堡，第一次在草地上追泡泡，普通日常里闪亮的表情，都在这里按日期好好保存。";

export async function generateMetadata(): Promise<Metadata> {
  const [requestSiteUrl, child] = await Promise.all([getRequestSiteUrl(), getChildProfile()]);
  const siteName = `${child.displayName}时光机`;
  const canonicalUrl = absoluteUrl("/", requestSiteUrl);
  const heroConfig = await prisma.siteConfig.findUnique({ where: { key: "home_hero_image" } }).catch(() => null);
  const heroImage = resolveHeroImage(heroConfig?.value);
  const shareImage = absoluteUrl(heroImage.shareCard || "/share/stories-logo.png", requestSiteUrl);
  const shareImageType = heroImage.shareCard ? "image/jpeg" : "image/png";
  const description = "那些小小的表情、第一次和普通日常，都值得被好好保存。";

  return {
    title: siteName,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: siteName,
      description,
      url: canonicalUrl,
      siteName,
      locale: "zh_CN",
      type: "website",
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: siteName
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: [shareImage]
    },
    other: {
      "og:image:secure_url": shareImage,
      "og:image:type": shareImageType,
      "og:image:width": "1200",
      "og:image:height": "630"
    }
  };
}

export default async function HomePage() {
  const [configs, child] = await Promise.all([
    prisma.siteConfig
      .findMany({
        where: { key: { in: ["home_hero_image", "home_hero_title", "home_hero_description"] } }
      })
      .catch(() => []),
    getChildProfile()
  ]);
  const config = Object.fromEntries(configs.map((item) => [item.key, item.value]));
  const heroImage = resolveHeroImage(config.home_hero_image || defaultHeroImage);
  const heroTitle = config.home_hero_title?.trim() || `把${child.displayName}的每一个小小瞬间，放进一台温柔的时光机。`;
  const heroDescription = config.home_hero_description?.trim() || defaultHeroDescription;
  const heroSrcSet = heroImage.variants.map((variant) => `${variant.url} ${variant.width}w`).join(", ");

  return (
    <main className="bg-white">
      <section className="relative flex min-h-screen min-h-[100svh] items-end overflow-hidden bg-[#25221d]">
        <picture className="absolute inset-0">
          {heroSrcSet ? <source type="image/webp" srcSet={heroSrcSet} sizes="100vw" /> : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage.src}
            alt={`${child.displayName}的成长照片`}
            width={heroImage.width}
            height={heroImage.height}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-14 text-white sm:px-8 sm:pb-20 lg:px-14 lg:pb-24">
          <div className="relative z-10 max-w-[calc(100%-5.5rem)] sm:max-w-[calc(100%-8rem)] lg:max-w-3xl">
            <h1 className="display-serif text-balance text-4xl font-semibold leading-[1.35] tracking-[0.03em] sm:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
              {heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/stories" variant="primary" size="lg" className="min-w-44">
                成长时间轴
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
    </main>
  );
}
