import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/lib/prisma";

const VALID_KEYS = new Set([
  "home_hero_image",
  "home_hero_title",
  "home_hero_description",
  "default_story_location",
  "child_name",
  "child_nickname",
  "child_display_name",
  "child_birthday",
  "child_gender"
]);
const MAX_LENGTHS: Record<string, number> = {
  home_hero_title: 100,
  home_hero_description: 300,
  default_story_location: 120,
  child_name: 50,
  child_nickname: 50,
  child_display_name: 30,
  child_birthday: 10,
  child_gender: 10
};

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
    const maxLength = MAX_LENGTHS[key];
    if (maxLength && value.length > maxLength) {
      return NextResponse.json({ message: `${key} 不能超过 ${maxLength} 个字符` }, { status: 400 });
    }
    if (key === "child_birthday" && value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return NextResponse.json({ message: "生日格式不正确" }, { status: 400 });
    }
    if (key === "child_gender" && !["", "female", "male", "other"].includes(value)) {
      return NextResponse.json({ message: "性别选项不正确" }, { status: 400 });
    }
    if (key === "child_display_name" && !value.trim()) {
      return NextResponse.json({ message: "全站点称呼不能为空" }, { status: 400 });
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
