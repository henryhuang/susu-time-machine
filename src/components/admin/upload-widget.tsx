"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export type EditableImage = {
  imageUrl: string;
  sortOrder: number;
};

export function UploadWidget({
  images,
  coverImage,
  onImagesChange,
  onCoverChange
}: {
  images: EditableImage[];
  coverImage: string;
  onImagesChange: (images: EditableImage[]) => void;
  onCoverChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const next = [...images];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/upload/image", { method: "POST", body: form });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "上传失败");
        next.push({ imageUrl: data.url, sortOrder: next.length });
        if (!coverImage && next.length === 1) onCoverChange(data.url);
      }
      onImagesChange(next.map((image, index) => ({ ...image, sortOrder: index })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(url: string) {
    const next = images.filter((image) => image.imageUrl !== url).map((image, index) => ({ ...image, sortOrder: index }));
    onImagesChange(next);
    if (coverImage === url) onCoverChange(next[0]?.imageUrl || "");
  }

  function move(index: number, delta: number) {
    const next = [...images];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onImagesChange(next.map((image, order) => ({ ...image, sortOrder: order })));
  }

  return (
    <div id="images" className="rounded-lg border border-susu-line bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">故事图片</h3>
          <p className="text-sm text-susu-muted">上传后可预览，也可以设置封面。删除故事不会自动删除 COS 原图。</p>
        </div>
        <Button type="button" variant="primary" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "上传中..." : "上传图片"}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => upload(event.target.files)} />
      </div>
      {error ? <div className="mt-3 rounded-lg bg-[#fdecef] px-3 py-2 text-sm font-semibold text-susu-red">{error}</div> : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image, index) => (
          <div key={image.imageUrl} className="overflow-hidden rounded-lg border border-susu-line bg-white">
            <div className="relative aspect-[4/3] bg-peach-50">
              <Image src={image.imageUrl} alt="故事图片" fill sizes="300px" className="object-cover" />
              {coverImage === image.imageUrl ? (
                <span className="absolute left-2 top-2 rounded-full bg-peach-500 px-3 py-1 text-xs font-bold text-white">封面</span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2 p-3">
              <Button type="button" size="sm" variant="ghost" onClick={() => onCoverChange(image.imageUrl)}>
                设为封面
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => move(index, -1)}>
                上移
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => move(index, 1)}>
                下移
              </Button>
              <Button type="button" size="sm" variant="ghost" className="text-susu-red" onClick={() => remove(image.imageUrl)}>
                删除
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
