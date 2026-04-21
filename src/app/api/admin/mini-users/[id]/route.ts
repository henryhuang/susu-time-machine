import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { miniProgramUserInputSchema } from "@/lib/validators";
import { requireAdmin } from "@/server/auth";
import { serializeMiniProgramUser, updateMiniProgramUser } from "@/server/mini-users";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = miniProgramUserInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "用户数据不正确" }, { status: 400 });
  }

  try {
    const user = await updateMiniProgramUser(id, parsed.data);
    return NextResponse.json({ user: serializeMiniProgramUser(user) });
  } catch {
    return NextResponse.json({ message: "用户不存在或保存失败" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  try {
    await prisma.miniProgramUser.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "用户不存在或删除失败" }, { status: 404 });
  }
}
