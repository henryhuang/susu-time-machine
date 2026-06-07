import sharp from "sharp";

const supportedFormats = new Set(["jpeg", "png", "webp"]);
const heroWidths = [800, 1200];

export type ProcessedImageFile = {
  suffix: string;
  buffer: Buffer;
  contentType: string;
  width: number;
  height: number;
};

export type ProcessedHeroImage = {
  sourceFormat: "jpeg" | "png" | "webp";
  width: number;
  height: number;
  variants: ProcessedImageFile[];
  shareJpg: ProcessedImageFile;
  shareWebp: ProcessedImageFile;
  warnings: string[];
};

export async function processHeroImage(input: Buffer): Promise<ProcessedHeroImage> {
  const metadata = await sharp(input).metadata();
  if (!metadata.format || !supportedFormats.has(metadata.format) || !metadata.width || !metadata.height) {
    throw new Error("无法识别图片，请上传 JPG、PNG 或 WebP 文件");
  }

  const shouldSwapDimensions = metadata.orientation !== undefined && metadata.orientation >= 5;
  const sourceWidth = shouldSwapDimensions ? metadata.height : metadata.width;
  const sourceHeight = shouldSwapDimensions ? metadata.width : metadata.height;
  const widths = sourceWidth >= 1600 ? [...heroWidths, 1600] : heroWidths;
  const variants = await Promise.all(
    widths.map(async (width) => {
      const buffer = await sharp(input)
        .rotate()
        .resize({ width })
        .webp({ quality: 80 })
        .toBuffer();
      const height = Math.round((sourceHeight * width) / sourceWidth);

      return {
        suffix: `${width}.webp`,
        buffer,
        contentType: "image/webp",
        width,
        height
      };
    })
  );

  const [shareJpgBuffer, shareWebpBuffer] = await Promise.all([
    sharp(input).rotate().resize(1200, 630, { fit: "cover", position: "centre" }).jpeg({ quality: 82 }).toBuffer(),
    sharp(input).rotate().resize(1200, 630, { fit: "cover", position: "centre" }).webp({ quality: 80 }).toBuffer()
  ]);

  return {
    sourceFormat: metadata.format as ProcessedHeroImage["sourceFormat"],
    width: sourceWidth,
    height: sourceHeight,
    variants,
    shareJpg: {
      suffix: "share-1200x630.jpg",
      buffer: shareJpgBuffer,
      contentType: "image/jpeg",
      width: 1200,
      height: 630
    },
    shareWebp: {
      suffix: "share-1200x630.webp",
      buffer: shareWebpBuffer,
      contentType: "image/webp",
      width: 1200,
      height: 630
    },
    warnings: sourceWidth < 800 ? ["原图宽度小于 800px，生成的网页图片可能不够清晰"] : []
  };
}
