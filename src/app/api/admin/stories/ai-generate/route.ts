import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { generateStoryContent } from "@/server/ai";

const schema = z.object({
  title: z.string().max(80).optional().default(""),
  summary: z.string().max(240).optional().default(""),
  storyDate: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  content: z.string().optional().default(""),
  imageUrls: z.array(z.string().url()).optional().default([])
});

export async function POST(request: NextRequest) {
  await requireAdmin();

  const body = await request.json().catch(() => null);
  console.log("[AI API] /api/admin/stories/ai-generate:received");
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.warn("[AI API] invalid payload");
    return NextResponse.json({ message: "生成请求参数不正确" }, { status: 400 });
  }

  const payload = parsed.data;

  console.log("[AI API] payload summary", {
    titleLength: payload.title.length,
    summaryLength: payload.summary.length,
    contentLength: payload.content.length,
    storyDate: payload.storyDate,
    tagCount: payload.tags.length,
    imageCount: payload.imageUrls.length
  });

  if (!payload.title && !payload.summary && !payload.content) {
    console.warn("[AI API] empty text fields");
    return NextResponse.json({ message: "请至少填写标题、摘要或已有正文后再生成。" }, { status: 400 });
  }

  try {
    const content = await generateStoryContent(payload);
    console.log("[AI API] generation success", { contentLength: content.length });
    return NextResponse.json({ content });
  } catch (error) {
    console.error("AI story generation failed:", error);
    let message = "正文生成失败，请稍后再试。";

    if (error instanceof Error) {
      if (error.message === "DASHSCOPE_API_KEY is not configured.") {
        message = "服务器还没有配置阿里云百炼 API Key。";
      } else if (error.message.toLowerCase().includes("timeout")) {
        message = "正文生成超时了，请稍后重试。";
      }
    }

    return NextResponse.json({ message }, { status: 500 });
  }
}
