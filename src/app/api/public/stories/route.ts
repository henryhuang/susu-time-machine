import { NextRequest, NextResponse } from "next/server";
import { listStories } from "@/server/stories";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "10");
  const stories = await listStories({ page, pageSize });
  return NextResponse.json(stories);
}
