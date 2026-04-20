"use client";

import Image from "next/image";
import { useState } from "react";
import { getImageUrl } from "@/lib/images";

export function ImagePreview({ images }: { images: { imageUrl: string; sortOrder: number }[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {images.map((image) => (
          <button
            key={`${image.imageUrl}-${image.sortOrder}`}
            type="button"
            onClick={() => setActive(image.imageUrl)}
            className="relative aspect-[4/3] overflow-hidden rounded-lg border border-susu-line bg-peach-50"
          >
            <Image src={getImageUrl(image.imageUrl)} alt="故事配图" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
          </button>
        ))}
      </div>
      {active ? (
        <button
          type="button"
          onClick={() => setActive(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
          aria-label="关闭图片预览"
        >
          <span className="relative block h-[82vh] w-full max-w-5xl">
            <Image src={getImageUrl(active)} alt="图片预览" fill sizes="100vw" className="object-contain" />
          </span>
        </button>
      ) : null}
    </>
  );
}
