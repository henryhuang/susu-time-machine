import type { HeroImageConfig, HeroImageVariant, ResolvedHeroImage } from "@/types/hero-image";

export const defaultHeroImage =
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80";

const defaultAlt = "酥酥的成长照片";
const fallbackWidth = 1200;
const fallbackHeight = 800;

function isVariant(value: unknown): value is HeroImageVariant {
  if (!value || typeof value !== "object") return false;
  const variant = value as Partial<HeroImageVariant>;
  return (
    typeof variant.url === "string" &&
    typeof variant.width === "number" &&
    typeof variant.height === "number" &&
    typeof variant.size === "number"
  );
}

export function parseHeroImageConfig(value?: string | null): HeroImageConfig | null {
  if (!value?.trim().startsWith("{")) return null;

  try {
    const parsed = JSON.parse(value) as Partial<HeroImageConfig>;
    if (
      typeof parsed.original !== "string" ||
      typeof parsed.width !== "number" ||
      typeof parsed.height !== "number" ||
      !parsed.variants ||
      typeof parsed.variants !== "object" ||
      !parsed.shareCard ||
      typeof parsed.shareCard.jpg !== "string"
    ) {
      return null;
    }

    const variants: Record<string, HeroImageVariant> = {};
    for (const [key, variant] of Object.entries(parsed.variants)) {
      if (isVariant(variant)) {
        variants[key] = variant;
        continue;
      }

      const width = Number(key);
      if (typeof variant === "string" && Number.isFinite(width) && width > 0) {
        variants[key] = {
          url: variant,
          width,
          height: Math.round((parsed.height * width) / parsed.width),
          size: 0
        };
      }
    }
    if (Object.keys(variants).length === 0) return null;

    return {
      original: parsed.original,
      alt: typeof parsed.alt === "string" && parsed.alt ? parsed.alt : defaultAlt,
      variants,
      shareCard: {
        jpg: parsed.shareCard.jpg,
        webp: typeof parsed.shareCard.webp === "string" ? parsed.shareCard.webp : undefined
      },
      width: parsed.width,
      height: parsed.height,
      originalSize: typeof parsed.originalSize === "number" ? parsed.originalSize : 0,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : ""
    };
  } catch {
    return null;
  }
}

export function resolveHeroImage(value?: string | null): ResolvedHeroImage {
  const config = parseHeroImageConfig(value);
  if (!config) {
    return {
      alt: defaultAlt,
      src: value?.trim() || defaultHeroImage,
      width: fallbackWidth,
      height: fallbackHeight,
      variants: []
    };
  }

  const variants = Object.values(config.variants).sort((a, b) => a.width - b.width);
  const preferred = config.variants["1200"] || variants.at(-1);

  return {
    alt: config.alt,
    src: preferred.url,
    width: preferred.width,
    height: preferred.height,
    variants,
    shareCard: config.shareCard.jpg,
    config
  };
}

export function serializeHeroImageConfig(config: HeroImageConfig) {
  return JSON.stringify(config);
}
