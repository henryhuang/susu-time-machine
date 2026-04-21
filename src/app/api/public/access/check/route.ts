import { NextRequest, NextResponse } from "next/server";
import { miniProgramAccessCheckSchema } from "@/lib/validators";
import { checkMiniProgramAccess } from "@/server/mini-users";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = miniProgramAccessCheckSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "用户信息不正确" }, { status: 400 });
  }

  const result = await checkMiniProgramAccess(parsed.data);
  return NextResponse.json(result);
}
