"use client";

import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Toast } from "@/components/ui/toast";
import { parseHeroImageConfig, resolveHeroImage, serializeHeroImageConfig } from "@/lib/hero-image";
import type { HeroImageConfig } from "@/types/hero-image";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function SettingsForm({
  homeHeroImage,
  homeHeroTitle,
  homeHeroDescription,
  fallbackImage
}: {
  homeHeroImage: string;
  homeHeroTitle: string;
  homeHeroDescription: string;
  fallbackImage: string;
}) {
  const initialHero = resolveHeroImage(homeHeroImage);
  const [heroImageValue, setHeroImageValue] = useState(homeHeroImage);
  const [heroImageUrl, setHeroImageUrl] = useState(initialHero.src);
  const [heroImageConfig, setHeroImageConfig] = useState<HeroImageConfig | null>(
    parseHeroImageConfig(homeHeroImage)
  );
  const [previewUrl, setPreviewUrl] = useState(initialHero.src || fallbackImage);
  const [heroTitle, setHeroTitle] = useState(homeHeroTitle);
  const [heroDescription, setHeroDescription] = useState(homeHeroDescription);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function handleUrlChange(url: string) {
    setHeroImageValue(url);
    setHeroImageUrl(url);
    setHeroImageConfig(null);
    setPreviewUrl(url || fallbackImage);
  }

  async function upload(file: FileList | null) {
    if (!file?.length) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file[0]);
      const res = await fetch("/api/upload/hero", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "上传失败");
      const config = data.heroImage as HeroImageConfig;
      setHeroImageConfig(config);
      setHeroImageValue(serializeHeroImageConfig(config));
      setHeroImageUrl(config.variants["1200"]?.url || Object.values(config.variants)[0]?.url || "");
      setPreviewUrl(config.variants["1200"]?.url || Object.values(config.variants)[0]?.url || fallbackImage);
      const warning = Array.isArray(data.warnings) ? data.warnings.join("；") : "";
      setToast(warning ? `上传成功；${warning}` : "上传并优化成功");
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
        body: JSON.stringify({
          home_hero_image: heroImageValue,
          home_hero_title: heroTitle.trim(),
          home_hero_description: heroDescription.trim()
        })
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
          <Field label="Hero 标题" hint="留空则使用首页当前的默认标题，最多 100 个字符。">
            <Textarea
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              maxLength={100}
              rows={3}
              placeholder="把酥酥的每一个小小瞬间，放进一台温柔的时光机。"
            />
          </Field>
          <Field label="Hero 描述" hint="显示在标题下方，留空则使用默认描述，最多 300 个字符。">
            <Textarea
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              maxLength={300}
              rows={4}
              placeholder="第一次认真搭城堡，第一次在草地上追泡泡，普通日常里闪亮的表情，都在这里按日期好好保存。"
            />
          </Field>
          <Field label="首页主图" hint="显示为首页首屏背景，支持输入外部 URL 或上传图片。留空则使用默认图片。">
            <Input
              value={heroImageUrl}
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
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => upload(e.target.files)}
            />
            {heroImageValue ? (
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
            {heroImageConfig ? (
              <div className="mt-4 grid gap-2 text-xs leading-5 text-susu-muted">
                <div>
                  原图：{heroImageConfig.width} × {heroImageConfig.height}，{formatBytes(heroImageConfig.originalSize)}
                </div>
                {Object.values(heroImageConfig.variants)
                  .sort((a, b) => a.width - b.width)
                  .map((variant) => (
                    <div key={variant.width}>
                      WebP：{variant.width} × {variant.height}，{formatBytes(variant.size)}
                    </div>
                  ))}
                <div>分享图：1200 × 630（JPG + WebP）</div>
              </div>
            ) : (
              <p className="mt-4 text-xs leading-5 text-susu-muted">当前为兼容 URL 模式，上传新图片后会自动生成响应式版本。</p>
            )}
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
