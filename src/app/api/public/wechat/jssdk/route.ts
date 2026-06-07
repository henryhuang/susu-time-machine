import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { createWechatJsSdkSignature } from "@/server/wechat-official-account";

export const dynamic = "force-dynamic";

function normalizePageUrl(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("只支持 HTTP 或 HTTPS 页面");
  }

  url.hash = "";
  return url;
}

export async function GET(request: NextRequest) {
  const pageUrlValue = request.nextUrl.searchParams.get("url");
  if (!pageUrlValue) {
    return NextResponse.json({ message: "缺少待签名页面 URL" }, { status: 400 });
  }

  try {
    const pageUrl = normalizePageUrl(pageUrlValue);
    const configuredSiteUrl = getSiteUrl();
    const allowedHosts = new Set([configuredSiteUrl.host, request.nextUrl.host]);

    if (!allowedHosts.has(pageUrl.host)) {
      return NextResponse.json({ message: "不能为其他域名生成微信签名" }, { status: 400 });
    }

    const signature = await createWechatJsSdkSignature(pageUrl.toString());
    return NextResponse.json(signature, {
      headers: {
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成微信 JS-SDK 签名失败";
    console.error("[wechat-jssdk]", error);
    return NextResponse.json({ message }, { status: 503 });
  }
}
