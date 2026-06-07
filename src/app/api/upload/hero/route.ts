import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth";
import { buildHeroObjectKeys, publicUrlForKey, putCosObject } from "@/server/cos";
import { processHeroImage } from "@/server/hero-image-processor";
import type { HeroImageConfig, HeroImageVariant } from "@/types/hero-image";

export const runtime = "nodejs";

const maxSize = 10 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const sourceExtensions = {
  jpeg: "jpg",
  png: "png",
  webp: "webp"
} as const;

export async function POST(request: NextRequest) {
  await requireAdmin();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "请选择图片文件" }, { status: 400 });
  }
  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ message: "只支持 JPG、PNG 和 WebP 图片" }, { status: 400 });
  }
  if (file.size > maxSize) {
    return NextResponse.json({ message: "图片不能超过 10MB" }, { status: 400 });
  }

  try {
    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const processed = await processHeroImage(originalBuffer);
    const keys = buildHeroObjectKeys(sourceExtensions[processed.sourceFormat]);
    const originalContentType = `image/${processed.sourceFormat}`;
    const originalKey = keys.original;
    const variantEntries = processed.variants.map((variant) => ({
      variant,
      key: keys.processed(variant.suffix)
    }));
    const shareJpgKey = keys.processed(processed.shareJpg.suffix);
    const shareWebpKey = keys.processed(processed.shareWebp.suffix);

    await Promise.all([
      putCosObject(originalKey, originalBuffer, originalContentType),
      ...variantEntries.map(({ variant, key }) => putCosObject(key, variant.buffer, variant.contentType)),
      putCosObject(shareJpgKey, processed.shareJpg.buffer, processed.shareJpg.contentType),
      putCosObject(shareWebpKey, processed.shareWebp.buffer, processed.shareWebp.contentType)
    ]);

    const variants: Record<string, HeroImageVariant> = {};
    for (const { variant, key } of variantEntries) {
      variants[String(variant.width)] = {
        url: publicUrlForKey(key),
        width: variant.width,
        height: variant.height,
        size: variant.buffer.length
      };
    }

    const heroImage: HeroImageConfig = {
      original: publicUrlForKey(originalKey),
      alt: "酥酥的成长照片",
      variants,
      shareCard: {
        jpg: publicUrlForKey(shareJpgKey),
        webp: publicUrlForKey(shareWebpKey)
      },
      width: processed.width,
      height: processed.height,
      originalSize: file.size,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ heroImage, warnings: processed.warnings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "图片处理失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
