import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/server/auth";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "请填写用户名和密码" }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { username: parsed.data.username } });
  if (!admin) {
    return NextResponse.json({ message: "用户名或密码不正确" }, { status: 401 });
  }

  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) {
    return NextResponse.json({ message: "用户名或密码不正确" }, { status: 401 });
  }

  await createSession(admin.id);
  return NextResponse.json({ ok: true });
}
