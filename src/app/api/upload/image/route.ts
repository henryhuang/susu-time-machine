import { NextRequest, NextResponse } from "next/server";
import { buildObjectKey, getCosClient, getCosConfig, publicUrlForKey } from "@/server/cos";
import { requireAdmin } from "@/server/auth";

export const runtime = "nodejs";

const maxSize = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  await requireAdmin();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "请选择图片文件" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "只支持图片上传" }, { status: 400 });
  }

  if (file.size > maxSize) {
    return NextResponse.json({ message: "图片不能超过 10MB" }, { status: 400 });
  }

  const key = buildObjectKey(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  const cos = getCosClient();
  const { Bucket, Region } = getCosConfig();

  await new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket,
        Region,
        Key: key,
        Body: buffer,
        ContentType: file.type
      },
      (error, data) => {
        if (error) reject(error);
        else resolve(data);
      }
    );
  });

  return NextResponse.json({ key, url: publicUrlForKey(key) });
}
