import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/lib/prisma";

const VALID_KEYS = new Set(["home_hero_image"]);

export async function GET() {
  await requireAdmin();
  const configs = await prisma.siteConfig.findMany({ where: { key: { in: Array.from(VALID_KEYS) } } });
  const result: Record<string, string> = {};
  for (const c of configs) {
    result[c.key] = c.value;
  }
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  await requireAdmin();
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "请求数据不正确" }, { status: 400 });
  }

  const entries = Object.entries(body).filter(([key]) => VALID_KEYS.has(key)) as [string, string][];
  if (entries.length === 0) {
    return NextResponse.json({ message: "没有有效的配置项" }, { status: 400 });
  }

  for (const [key, value] of entries) {
    if (typeof value !== "string") {
      return NextResponse.json({ message: `${key} 的值必须是字符串` }, { status: 400 });
    }
  }

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    )
  );

  const updated = await prisma.siteConfig.findMany({ where: { key: { in: entries.map(([k]) => k) } } });
  const result: Record<string, string> = {};
  for (const c of updated) {
    result[c.key] = c.value;
  }
  return NextResponse.json(result);
}
