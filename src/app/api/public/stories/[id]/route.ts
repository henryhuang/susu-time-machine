import { NextRequest, NextResponse } from "next/server";
import { getStory } from "@/server/stories";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = await getStory(id);
  if (!story) {
    return NextResponse.json({ message: "故事不存在" }, { status: 404 });
  }
  return NextResponse.json({ story });
}
