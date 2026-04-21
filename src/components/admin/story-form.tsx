"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Toast } from "@/components/ui/toast";
import { StoryDTO } from "@/types/story";
import { inputDate } from "@/lib/dates";
import { generateStoryDraft } from "@/lib/admin-api";
import { EditableImage, UploadWidget } from "@/components/admin/upload-widget";

export function StoryForm({ story }: { story?: StoryDTO }) {
  const router = useRouter();
  const initialImages = useMemo<EditableImage[]>(
    () => story?.images.map((image, index) => ({ imageUrl: image.imageUrl, sortOrder: image.sortOrder ?? index })) || [],
    [story]
  );
  const [title, setTitle] = useState(story?.title || "");
  const [summary, setSummary] = useState(story?.summary || "");
  const [content, setContent] = useState(story?.content || "");
  const [storyDate, setStoryDate] = useState(story ? inputDate(story.storyDate) : inputDate(new Date()));
  const [tags, setTags] = useState(story?.tags.join("，") || "");
  const [coverImage, setCoverImage] = useState(story?.coverImage || "");
  const [images, setImages] = useState(initialImages);
  const [aiPrompt, setAiPrompt] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      title,
      summary,
      content,
      storyDate,
      tags: tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
      coverImage,
      images
    };

    try {
      const response = await fetch(story ? `/api/admin/stories/${story.id}` : "/api/admin/stories", {
        method: story ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "保存失败");
      router.push("/admin/stories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    const shouldGenerateSummary = !summary.trim();
    const shouldGenerateContent = !content.trim();

    if (!shouldGenerateSummary && !shouldGenerateContent) {
      setToast("摘要和正文都已有内容，无需生成。");
      return;
    }

    setGenerating(true);
    setToast("");

    try {
      const data = await generateStoryDraft({
        title,
        summary,
        storyDate,
        tags: tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
        content,
        aiPrompt,
        imageUrls: images.map((image) => image.imageUrl)
      });
      if (shouldGenerateContent && data.content?.trim()) {
        setContent(data.content.trim());
      }
      if (shouldGenerateSummary && data.summary?.trim()) {
        setSummary(data.summary.trim());
      }
    } catch (err) {
      setToast(err instanceof Error ? err.message : "正文生成失败");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
      <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-5">
        {error ? <div className="rounded-lg bg-[#fdecef] px-4 py-3 text-sm font-semibold text-susu-red">{error}</div> : null}
        <section className="grid gap-4 rounded-lg border border-susu-line bg-white p-4 shadow-card">
          <Field label="标题">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={80} placeholder="例如：酥酥搭了一座小城堡" />
          </Field>
          <Field label="摘要">
            <Textarea value={summary} onChange={(event) => setSummary(event.target.value)} required maxLength={240} placeholder="用一两句话记住这个瞬间" />
          </Field>
          <Field label="正文" hint="首版使用多行文本保存，前台会按段落展示。">
            <Textarea value={content} onChange={(event) => setContent(event.target.value)} required className="min-h-64" placeholder="记录今天发生了什么，酥酥说了什么，或者这一刻为什么值得留下。" />
          </Field>
          <Field label="想表达的关键语句" hint="不会保存到数据库，只会在本次 AI 生成时作为写作方向。">
            <Textarea
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              maxLength={500}
              className="min-h-24"
              placeholder="例如：想写出她第一次主动分享玩具时的认真和开心，不要写得太夸张。"
            />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" onClick={handleGenerate} disabled={generating}>
              {generating ? "生成中..." : "让 AI 生成"}
            </Button>
            <p className="text-sm text-susu-muted">会根据标题、摘要、日期、标签和已有正文生成，不会自动保存。</p>
          </div>
        </section>
        <UploadWidget images={images} coverImage={coverImage} onImagesChange={setImages} onCoverChange={setCoverImage} />
        </div>
        <aside className="grid content-start gap-5">
          <section className="grid gap-4 rounded-lg border border-susu-line bg-white p-4 shadow-card">
            <Field label="故事日期">
              <Input type="date" value={storyDate} onChange={(event) => setStoryDate(event.target.value)} required />
            </Field>
            <Field label="标签" hint="用中文逗号或英文逗号分隔。">
              <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="日常，成长，生日" />
            </Field>
            <div className="rounded-lg bg-peach-50 p-3 text-sm text-susu-muted">
              <div className="flex justify-between">
                <span>封面图</span>
                <strong className={coverImage ? "text-[#4c9f75]" : "text-susu-orange"}>{coverImage ? "已设置" : "未设置"}</strong>
              </div>
              <div className="mt-2 break-all text-xs">{coverImage || "上传图片后可设置封面"}</div>
            </div>
            <Button variant="primary" disabled={saving}>
              {saving ? "保存中..." : story ? "保存修改" : "发布故事"}
            </Button>
          </section>
        </aside>
      </form>
    </>
  );
}
