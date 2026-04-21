import { NextRequest, NextResponse } from "next/server";
import { miniProgramUserInputSchema } from "@/lib/validators";
import { requireAdmin } from "@/server/auth";
import { createMiniProgramUser, listMiniProgramUsers, serializeMiniProgramUser } from "@/server/mini-users";

export async function GET(request: NextRequest) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const allowedParam = searchParams.get("allowed");
  const users = await listMiniProgramUsers({
    page: Number(searchParams.get("page") || "1"),
    pageSize: Number(searchParams.get("pageSize") || "20"),
    query: searchParams.get("q") || undefined,
    allowed: allowedParam === "true" ? true : allowedParam === "false" ? false : undefined
  });
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  await requireAdmin();
  const body = await request.json().catch(() => null);
  const parsed = miniProgramUserInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "用户数据不正确" }, { status: 400 });
  }

  try {
    const user = await createMiniProgramUser(parsed.data);
    return NextResponse.json({ user: serializeMiniProgramUser(user) }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "用户已存在或保存失败" }, { status: 409 });
  }
}
