import { createHash, randomBytes } from "node:crypto";

const WECHAT_API_BASE_URL = "https://api.weixin.qq.com/cgi-bin";
const CACHE_SAFETY_WINDOW_MS = 5 * 60 * 1000;

type WechatApiResponse = {
  errcode?: number;
  errmsg?: string;
};

type AccessTokenResponse = WechatApiResponse & {
  access_token?: string;
  expires_in?: number;
};

type JsapiTicketResponse = WechatApiResponse & {
  ticket?: string;
  expires_in?: number;
};

type CachedValue = {
  value: string;
  expiresAt: number;
};

let accessTokenCache: CachedValue | null = null;
let accessTokenRequest: Promise<string> | null = null;
let jsapiTicketCache: CachedValue | null = null;
let jsapiTicketRequest: Promise<string> | null = null;

function getOfficialAccountConfig() {
  const appId = process.env.WECHAT_OFFICIAL_ACCOUNT_APP_ID?.trim();
  const appSecret = process.env.WECHAT_OFFICIAL_ACCOUNT_APP_SECRET?.trim();

  if (!appId || !appSecret) {
    throw new Error("请先配置 WECHAT_OFFICIAL_ACCOUNT_APP_ID 和 WECHAT_OFFICIAL_ACCOUNT_APP_SECRET");
  }

  return { appId, appSecret };
}

function getCacheExpiration(expiresIn = 7200) {
  return Date.now() + expiresIn * 1000 - CACHE_SAFETY_WINDOW_MS;
}

function assertWechatResponse(response: WechatApiResponse, fallbackMessage: string) {
  if (response.errcode) {
    throw new Error(`${fallbackMessage}：${response.errmsg || response.errcode}`);
  }
}

async function getAccessToken() {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.value;
  }

  if (accessTokenRequest) return accessTokenRequest;

  accessTokenRequest = (async () => {
    const { appId, appSecret } = getOfficialAccountConfig();
    const params = new URLSearchParams({
      grant_type: "client_credential",
      appid: appId,
      secret: appSecret
    });
    const response = await fetch(`${WECHAT_API_BASE_URL}/token?${params.toString()}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`获取微信公众号 access_token 失败：${response.status}`);
    }

    const data = (await response.json()) as AccessTokenResponse;
    assertWechatResponse(data, "获取微信公众号 access_token 失败");
    if (!data.access_token) {
      throw new Error("微信公众号 access_token 响应不完整");
    }

    accessTokenCache = {
      value: data.access_token,
      expiresAt: getCacheExpiration(data.expires_in)
    };
    return data.access_token;
  })().finally(() => {
    accessTokenRequest = null;
  });

  return accessTokenRequest;
}

async function getJsapiTicket() {
  if (jsapiTicketCache && jsapiTicketCache.expiresAt > Date.now()) {
    return jsapiTicketCache.value;
  }

  if (jsapiTicketRequest) return jsapiTicketRequest;

  jsapiTicketRequest = (async () => {
    const accessToken = await getAccessToken();
    const params = new URLSearchParams({
      access_token: accessToken,
      type: "jsapi"
    });
    const response = await fetch(`${WECHAT_API_BASE_URL}/ticket/getticket?${params.toString()}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`获取微信公众号 jsapi_ticket 失败：${response.status}`);
    }

    const data = (await response.json()) as JsapiTicketResponse;
    assertWechatResponse(data, "获取微信公众号 jsapi_ticket 失败");
    if (!data.ticket) {
      throw new Error("微信公众号 jsapi_ticket 响应不完整");
    }

    jsapiTicketCache = {
      value: data.ticket,
      expiresAt: getCacheExpiration(data.expires_in)
    };
    return data.ticket;
  })().finally(() => {
    jsapiTicketRequest = null;
  });

  return jsapiTicketRequest;
}

export async function createWechatJsSdkSignature(url: string) {
  const { appId } = getOfficialAccountConfig();
  const ticket = await getJsapiTicket();
  const nonceStr = randomBytes(16).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureSource = [
    `jsapi_ticket=${ticket}`,
    `noncestr=${nonceStr}`,
    `timestamp=${timestamp}`,
    `url=${url}`
  ].join("&");
  const signature = createHash("sha1").update(signatureSource).digest("hex");

  return {
    appId,
    timestamp,
    nonceStr,
    signature
  };
}
