import { NextRequest, NextResponse } from "next/server";
import { miniProgramLoginSchema } from "@/lib/validators";
import { loginWechatMiniProgram } from "@/server/wechat";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = miniProgramLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "登录信息不正确" }, { status: 400 });
  }

  try {
    const result = await loginWechatMiniProgram(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "微信登录失败";
    return NextResponse.json({ message }, { status: 502 });
  }
}
