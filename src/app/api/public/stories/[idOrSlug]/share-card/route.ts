import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import sharp from "sharp";
import { formatDate } from "@/lib/dates";
import { getImageUrl } from "@/lib/images";
import { getStory } from "@/server/stories";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WIDTH = 1080;
const HEIGHT = 1440;

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;"
    };
    return entities[character];
  });
}

function titleSize(title: string) {
  if (title.length > 16) return 38;
  if (title.length > 10) return 46;
  return 54;
}

async function fetchImage(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to fetch story image: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ idOrSlug: string }> }) {
  const { idOrSlug } = await params;
  const story = await getStory(idOrSlug);

  if (!story) {
    return NextResponse.json({ message: "故事不存在" }, { status: 404 });
  }

  try {
    const publicId = story.slug || story.id;
    const storyUrl = new URL(`/stories/${publicId}`, request.nextUrl.origin).toString();
    const templatePath = path.join(process.cwd(), "public", "share", "story-share-template.png");
    const [template, photoSource, qrCode] = await Promise.all([
      readFile(templatePath),
      fetchImage(getImageUrl(story.coverImage)),
      QRCode.toBuffer(storyUrl, {
        type: "png",
        width: 292,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#211f1c", light: "#ffffff" }
      })
    ]);

    const roundedMask = Buffer.from(`
      <svg width="910" height="520" xmlns="http://www.w3.org/2000/svg">
        <rect width="910" height="520" rx="58" fill="#fff"/>
      </svg>
    `);
    const photo = await sharp(photoSource)
      .resize(910, 520, { fit: "cover", position: "centre" })
      .composite([{ input: roundedMask, blend: "dest-in" }])
      .png()
      .toBuffer();

    const safeTitle = escapeXml(story.title);
    const safeDate = escapeXml(formatDate(story.storyDate));
    const typography = Buffer.from(`
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .title {
            font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
            font-size: ${titleSize(story.title)}px;
            font-weight: 700;
            fill: #d95b72;
          }
          .meta, .scan, .brand {
            font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
          }
        </style>
        <text class="title" x="540" y="207" text-anchor="middle">${safeTitle}</text>
        <text class="meta" x="540" y="254" text-anchor="middle" font-size="22" font-weight="600" fill="#9f5b62">${safeDate} · 成长记录</text>
        <text class="scan" x="224" y="1080" text-anchor="middle" font-size="31" font-weight="700" fill="#c85e70">扫一扫</text>
        <text class="brand" x="540" y="1390" text-anchor="middle" font-size="21" letter-spacing="5" fill="#bd6f75">酥酥时光机</text>
      </svg>
    `);

    const output = await sharp(template)
      .resize(WIDTH, HEIGHT)
      .composite([
        { input: photo, left: 85, top: 284 },
        { input: qrCode, left: 394, top: 938 },
        { input: typography, left: 0, top: 0 }
      ])
      .png({ compressionLevel: 9 })
      .toBuffer();

    const shouldDownload = request.nextUrl.searchParams.get("download") === "1";
    const filename = encodeURIComponent(`${story.title}-分享卡.png`);

    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
        "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename*=UTF-8''${filename}`
      }
    });
  } catch (error) {
    console.error("Failed to generate story share card", error);
    return NextResponse.json({ message: "分享卡生成失败" }, { status: 500 });
  }
}
