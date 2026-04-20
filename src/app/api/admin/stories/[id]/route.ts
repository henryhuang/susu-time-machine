import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { storyInputSchema } from "@/lib/validators";
import { requireAdmin } from "@/server/auth";
import { getStory, serializeStory, updateStory } from "@/server/stories";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const story = await getStory(id);
  if (!story) {
    return NextResponse.json({ message: "故事不存在" }, { status: 404 });
  }
  return NextResponse.json({ story });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = storyInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "表单数据不正确" }, { status: 400 });
  }

  try {
    const story = await updateStory(id, parsed.data);
    return NextResponse.json({ story: serializeStory(story) });
  } catch {
    return NextResponse.json({ message: "故事不存在或保存失败" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  try {
    await prisma.story.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "故事已删除，COS 原图文件未自动删除。" });
  } catch {
    return NextResponse.json({ message: "故事不存在或删除失败" }, { status: 404 });
  }
}
