import { NextRequest, NextResponse } from "next/server";
import { miniProgramAccessApplySchema } from "@/lib/validators";
import { applyMiniProgramAccess } from "@/server/mini-users";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = miniProgramAccessApplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "申请信息不正确" }, { status: 400 });
  }

  const result = await applyMiniProgramAccess(parsed.data);
  return NextResponse.json(result);
}
