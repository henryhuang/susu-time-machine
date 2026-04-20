import { NextRequest, NextResponse } from "next/server";
import { storyInputSchema } from "@/lib/validators";
import { createStory, listStories, serializeStory } from "@/server/stories";
import { requireAdmin } from "@/server/auth";

export async function GET(request: NextRequest) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const stories = await listStories({
    page: Number(searchParams.get("page") || "1"),
    pageSize: Number(searchParams.get("pageSize") || "10"),
    query: searchParams.get("q") || undefined,
    tag: searchParams.get("tag") || undefined
  });
  return NextResponse.json(stories);
}

export async function POST(request: NextRequest) {
  await requireAdmin();
  const body = await request.json().catch(() => null);
  const parsed = storyInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "表单数据不正确" }, { status: 400 });
  }
  const story = await createStory(parsed.data);
  return NextResponse.json({ story: serializeStory(story) }, { status: 201 });
}
