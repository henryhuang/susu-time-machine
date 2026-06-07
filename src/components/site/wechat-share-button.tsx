"use client";

import { Check, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

type ShareState = "idle" | "wechat" | "copied";

type WechatShareButtonProps = {
  title: string;
  summary: string;
  imageUrl: string;
  shareUrl: string;
};

type WechatJsSdkConfig = {
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
};

type WechatShareData = {
  title: string;
  desc?: string;
  link: string;
  imgUrl: string;
};

type WechatJsSdk = {
  config(config: WechatJsSdkConfig & { debug: boolean; jsApiList: string[] }): void;
  ready(callback: () => void): void;
  error(callback: (error: unknown) => void): void;
  updateAppMessageShareData(data: WechatShareData): void;
  updateTimelineShareData(data: WechatShareData): void;
};

declare global {
  interface Window {
    wx?: WechatJsSdk;
  }
}

const WECHAT_JS_SDK_URL = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js";

function loadWechatJsSdk() {
  if (window.wx) return Promise.resolve(window.wx);

  return new Promise<WechatJsSdk>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${WECHAT_JS_SDK_URL}"]`);
    const script = existingScript || document.createElement("script");

    const handleLoad = () => {
      if (window.wx) resolve(window.wx);
      else reject(new Error("微信 JS-SDK 加载失败"));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", () => reject(new Error("微信 JS-SDK 加载失败")), { once: true });

    if (!existingScript) {
      script.src = WECHAT_JS_SDK_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

export function WechatShareButton({ title, summary, imageUrl, shareUrl }: WechatShareButtonProps) {
  const [state, setState] = useState<ShareState>("idle");

  useEffect(() => {
    if (!/MicroMessenger/i.test(navigator.userAgent)) return;

    let cancelled = false;
    const signedUrl = window.location.href.split("#")[0];

    async function configureWechatShare() {
      try {
        const [wx, response] = await Promise.all([
          loadWechatJsSdk(),
          fetch(`/api/public/wechat/jssdk?url=${encodeURIComponent(signedUrl)}`, {
            cache: "no-store"
          })
        ]);

        const data = (await response.json()) as WechatJsSdkConfig & { message?: string };
        if (!response.ok) {
          throw new Error(data.message || "获取微信分享配置失败");
        }
        if (cancelled) return;

        wx.config({
          debug: false,
          appId: data.appId,
          timestamp: data.timestamp,
          nonceStr: data.nonceStr,
          signature: data.signature,
          jsApiList: ["updateAppMessageShareData", "updateTimelineShareData"]
        });

        wx.ready(() => {
          if (cancelled) return;

          wx.updateAppMessageShareData({
            title,
            desc: summary,
            link: shareUrl,
            imgUrl: imageUrl
          });
          wx.updateTimelineShareData({
            title,
            link: shareUrl,
            imgUrl: imageUrl
          });
        });
        wx.error((error) => {
          console.error("[wechat-share] JS-SDK 配置失败", error);
        });
      } catch (error) {
        console.error("[wechat-share] 初始化失败", error);
      }
    }

    void configureWechatShare();
    return () => {
      cancelled = true;
    };
  }, [imageUrl, shareUrl, summary, title]);

  useEffect(() => {
    if (state === "idle") return;

    const timer = window.setTimeout(() => setState("idle"), state === "copied" ? 2400 : 6000);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function copyCurrentUrl() {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }

    setState("copied");
  }

  async function shareToWechat() {
    const isWechat = /MicroMessenger/i.test(navigator.userAgent);

    if (isWechat) {
      setState("wechat");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary,
          url: shareUrl
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await copyCurrentUrl();
  }

  return (
    <>
      <button
        type="button"
        onClick={shareToWechat}
        className="mt-8 inline-flex h-11 items-center justify-center gap-2 border border-[#86c96f] bg-[#f4fbf1] px-5 text-sm font-semibold text-[#377d2d] transition hover:border-[#5daf48] hover:bg-[#eaf7e5]"
      >
        <MessageCircle className="h-4 w-4" />
        微信分享
      </button>

      {state !== "idle" ? (
        <div className="fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 border border-susu-line bg-white px-4 py-3 shadow-popover" role="status">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eaf7e5] text-[#377d2d]">
            {state === "copied" ? <Check className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{state === "copied" ? "故事链接已复制" : "分享到微信"}</div>
            <div className="mt-0.5 text-sm leading-6 text-susu-muted">
              {state === "copied" ? "打开微信，粘贴链接即可分享给朋友。" : "请点击微信右上角的“…”菜单，选择“发送给朋友”或“分享到朋友圈”。"}
            </div>
          </div>
          <button type="button" onClick={() => setState("idle")} className="p-1 text-susu-muted transition hover:text-susu-text" aria-label="关闭提示">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </>
  );
}
