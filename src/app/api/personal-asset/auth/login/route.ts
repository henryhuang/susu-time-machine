import { NextRequest } from "next/server";
import { miniProgramLoginSchema } from "@/lib/validators";
import { checkMiniProgramAccess } from "@/server/mini-users";
import { createPersonalAssetSession } from "@/server/personal-asset-auth";
import { isPersonalAssetOpenIdAuthorized } from "@/server/personal-asset-config";
import { loginWechatPersonalAsset } from "@/server/wechat";
import { fail, handlePersonalAssetError, ok, readJson } from "../../_utils";

export async function POST(request: NextRequest) {
  const body = await readJson(request);
  const parsed = miniProgramLoginSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "登录信息不正确", 400);
  }

  try {
    const { openId } = await loginWechatPersonalAsset(parsed.data);
    await checkMiniProgramAccess({ openId });
    const [authorized, token] = await Promise.all([
      isPersonalAssetOpenIdAuthorized(openId),
      createPersonalAssetSession(openId)
    ]);

    return ok({
      openid: openId,
      openId,
      authorized,
      token
    });
  } catch (error) {
    return handlePersonalAssetError(error, "微信登录失败");
  }
}
