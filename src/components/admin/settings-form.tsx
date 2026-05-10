"use client";

import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Toast } from "@/components/ui/toast";

export function SettingsForm({
  homeHeroImage,
  fallbackImage
}: {
  homeHeroImage: string;
  fallbackImage: string;
}) {
  const [heroImage, setHeroImage] = useState(homeHeroImage);
  const [previewUrl, setPreviewUrl] = useState(homeHeroImage || fallbackImage);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function handleUrlChange(url: string) {
    setHeroImage(url);
    setPreviewUrl(url || fallbackImage);
  }

  async function upload(file: FileList | null) {
    if (!file?.length) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file[0]);
      const res = await fetch("/api/upload/image", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "上传失败");
      handleUrlChange(data.url);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home_hero_image: heroImage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "保存失败");
      setToast("保存成功");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {toast ? (
        <Toast
          message={toast}
          tone={toast.includes("成功") ? "success" : "error"}
          onClose={() => setToast("")}
        />
      ) : null}
      <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-4 rounded-lg border border-susu-line bg-white p-4 shadow-card">
          <Field label="首页主图" hint="显示在首页右侧的大图，支持输入外部 URL 或上传图片。留空则使用默认图片。">
            <Input
              value={heroImage}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="输入图片 URL 或点击下方按钮上传"
            />
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "上传中..." : "上传图片"}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => upload(e.target.files)}
            />
            {heroImage ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleUrlChange("")}
              >
                恢复默认
              </Button>
            ) : null}
          </div>
        </section>

        <aside className="grid content-start gap-5">
          <section className="rounded-lg border border-susu-line bg-white p-4 shadow-card">
            <h3 className="mb-3 font-bold">预览</h3>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-susu-line bg-peach-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="首页主图预览"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4">
              <Button variant="primary" className="w-full" disabled={saving}>
                {saving ? "保存中..." : "保存设置"}
              </Button>
            </div>
          </section>
        </aside>
      </form>
    </>
  );
}
