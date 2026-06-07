export type HeroImageVariant = {
  url: string;
  width: number;
  height: number;
  size: number;
};

export type HeroImageConfig = {
  original: string;
  alt: string;
  variants: Record<string, HeroImageVariant>;
  shareCard: {
    jpg: string;
    webp?: string;
  };
  width: number;
  height: number;
  originalSize: number;
  updatedAt: string;
};

export type ResolvedHeroImage = {
  alt: string;
  src: string;
  width: number;
  height: number;
  variants: HeroImageVariant[];
  shareCard?: string;
  config?: HeroImageConfig;
};
