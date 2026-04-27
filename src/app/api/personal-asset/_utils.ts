import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requirePersonalAssetIdentity } from "@/server/personal-asset-auth";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function logPersonalAssetError(error: unknown, request?: NextRequest) {
  if (error instanceof Response || error instanceof ZodError) return;

  const url = request ? new URL(request.url) : null;
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(
    JSON.stringify({
      level: "error",
      scope: "personal-asset-api",
      method: request?.method,
      path: url?.pathname,
      message,
      stack
    })
  );
}

export async function readJson(request: NextRequest) {
  return request.json().catch(() => null);
}

export async function getPersonalAssetOwner(request: NextRequest) {
  const identity = await requirePersonalAssetIdentity(request);
  return {
    openId: identity.openId,
    authorized: identity.authorized,
    dataScope: identity.dataScope
  };
}

export function handlePersonalAssetError(
  error: unknown,
  fallbackMessage = "请求处理失败",
  request?: NextRequest
) {
  logPersonalAssetError(error, request);

  if (error instanceof Response) {
    return fail(error.statusText || "Unauthorized", error.status);
  }

  if (error instanceof ZodError) {
    return fail(error.issues[0]?.message || "请求数据不正确", 400);
  }

  if (error instanceof Error && error.message.includes("Record to")) {
    return fail("数据不存在或无权访问", 404);
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return fail(message, 500);
}
