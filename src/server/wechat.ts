import { MiniProgramLoginInput } from "@/lib/validators";

type WechatCodeSessionResponse = {
  openid?: string;
  unionid?: string;
  session_key?: string;
  errcode?: number;
  errmsg?: string;
};

const WECHAT_CODE_SESSION_URL = "https://api.weixin.qq.com/sns/jscode2session";

function getWechatMiniProgramConfig() {
  const appId = process.env.WECHAT_MINI_APP_ID;
  const appSecret = process.env.WECHAT_MINI_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("请先配置 WECHAT_MINI_APP_ID 和 WECHAT_MINI_APP_SECRET");
  }

  return { appId, appSecret };
}

export async function loginWechatMiniProgram(input: MiniProgramLoginInput) {
  const { appId, appSecret } = getWechatMiniProgramConfig();
  const params = new URLSearchParams({
    appid: appId,
    secret: appSecret,
    js_code: input.code,
    grant_type: "authorization_code"
  });

  const response = await fetch(`${WECHAT_CODE_SESSION_URL}?${params.toString()}`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`微信登录请求失败：${response.status}`);
  }

  const data = (await response.json()) as WechatCodeSessionResponse;

  if (data.errcode || !data.openid) {
    throw new Error(data.errmsg || "微信登录凭证无效");
  }

  return {
    openId: data.openid,
    unionId: data.unionid ?? null
  };
}
