"use client";

import { Check, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

type ShareState = "idle" | "wechat" | "copied";

export function WechatShareButton({ title, summary }: { title: string; summary: string }) {
  const [state, setState] = useState<ShareState>("idle");

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
          url: window.location.href
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
