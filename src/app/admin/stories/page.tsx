import Image from "next/image";
import Link from "next/link";
import { DeleteStoryButton } from "@/components/admin/delete-story-button";
import { ProtectedAdmin } from "@/components/admin/protected-admin";
import { ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { formatDate } from "@/lib/dates";
import { getImageUrl } from "@/lib/images";
import { listStories } from "@/server/stories";

export const dynamic = "force-dynamic";

export default async function AdminStoriesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; tag?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page || "1");
  const stories = await listStories({ page, pageSize: 10, query: params.q, tag: params.tag });

  return (
    <ProtectedAdmin>
      <div className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-semibold text-peach-600">故事管理</p>
            <h1 className="mt-2 text-2xl font-extrabold">管理酥酥的成长故事和照片</h1>
            <p className="mt-2 text-susu-muted">支持搜索、编辑与删除。删除默认只删除数据库记录，不删除 COS 原图。</p>
          </div>
          <ButtonLink href="/admin/stories/new" variant="primary">
            新增故事
          </ButtonLink>
        </div>

        <form className="flex flex-wrap gap-3 rounded-lg border border-susu-line bg-white p-4 shadow-soft">
          <input
            name="q"
            defaultValue={params.q || ""}
            placeholder="按标题搜索"
            className="h-10 min-w-64 rounded-lg border border-susu-line px-3 text-sm outline-none focus:border-peach-500"
          />
          <input
            name="tag"
            defaultValue={params.tag || ""}
            placeholder="按标签筛选"
            className="h-10 min-w-44 rounded-lg border border-susu-line px-3 text-sm outline-none focus:border-peach-500"
          />
          <button className="h-10 rounded-lg bg-peach-500 px-4 text-sm font-semibold text-white">筛选</button>
          <Link href="/admin/stories" className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-peach-600">
            清空
          </Link>
        </form>

        <div className="overflow-hidden rounded-lg border border-susu-line bg-white shadow-card">
          <div className="hidden grid-cols-[96px_1fr_130px_160px_170px] gap-4 border-b border-susu-line px-4 py-3 text-sm font-semibold text-susu-muted lg:grid">
            <span>封面</span>
            <span>标题 / 摘要</span>
            <span>日期</span>
            <span>标签</span>
            <span>操作</span>
          </div>
          <div className="grid">
            {stories.items.map((story) => (
              <article key={story.id} className="grid gap-4 border-b border-susu-line p-4 last:border-b-0 lg:grid-cols-[96px_1fr_130px_160px_170px]">
                <div className="relative h-24 overflow-hidden rounded-lg bg-peach-50 lg:h-20">
                  <Image src={getImageUrl(story.coverImage)} alt={story.title} fill sizes="120px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold">{story.title}</div>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-susu-muted">{story.summary}</p>
                  <p className="mt-2 text-xs text-susu-muted">
                    创建：{formatDate(story.createdAt)} · 更新：{formatDate(story.updatedAt)}
                  </p>
                </div>
                <div className="text-sm text-susu-muted">{formatDate(story.storyDate)}</div>
                <div className="flex flex-wrap content-start gap-2">
                  {story.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
                <div className="flex flex-wrap content-start gap-2">
                  <ButtonLink href={`/stories/${story.id}`} size="sm" variant="secondary">
                    查看
                  </ButtonLink>
                  <ButtonLink href={`/admin/stories/${story.id}/edit`} size="sm" variant="ghost">
                    编辑
                  </ButtonLink>
                  <DeleteStoryButton id={story.id} title={story.title} />
                </div>
              </article>
            ))}
            {stories.items.length === 0 ? <div className="p-10 text-center text-susu-muted">没有找到故事。</div> : null}
          </div>
        </div>

        <div className="flex justify-center gap-3">
          {page > 1 ? <ButtonLink href={`/admin/stories?page=${page - 1}`}>上一页</ButtonLink> : null}
          {stories.hasMore ? (
            <ButtonLink href={`/admin/stories?page=${page + 1}`} variant="primary">
              下一页
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </ProtectedAdmin>
  );
}
