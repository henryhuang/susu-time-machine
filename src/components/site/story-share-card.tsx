"use client";

import { Download, LoaderCircle, QrCode, X } from "lucide-react";
import { useEffect, useState } from "react";

export function StoryShareCard({ idOrSlug, title }: { idOrSlug: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imageUrl = `/api/public/stories/${encodeURIComponent(idOrSlug)}/share-card`;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function showCard() {
    setLoaded(false);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={showCard}
        className="mt-8 inline-flex h-11 items-center justify-center gap-2 border border-susu-line bg-white px-5 text-sm font-semibold transition hover:border-peach-500 hover:text-peach-600"
      >
        <QrCode className="h-4 w-4" />
        生成故事分享卡
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${title}分享卡`}>
          <button type="button" className="absolute inset-0 cursor-default" onClick={() => setOpen(false)} aria-label="关闭分享卡" />
          <div className="relative z-10 flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden bg-[#f8f6f1] shadow-popover">
            <div className="flex items-center justify-between border-b border-susu-line px-4 py-3 sm:px-5">
              <div>
                <div className="font-semibold">故事分享卡</div>
                <div className="text-xs text-susu-muted">长按图片保存，或点击下载</div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center transition hover:bg-white" aria-label="关闭">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-auto p-4 sm:p-6">
              {!loaded ? (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex items-center gap-2 text-sm text-susu-muted">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    正在生成分享卡...
                  </div>
                </div>
              ) : null}
              {/* A plain img lets mobile users long-press and save the generated PNG. */}
              <img
                src={imageUrl}
                alt={`${title}二维码分享卡`}
                className={`mx-auto h-auto w-full max-w-[430px] transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setLoaded(true)}
              />
            </div>

            <div className="border-t border-susu-line bg-white px-4 py-3 sm:px-5">
              <a
                href={`${imageUrl}?download=1`}
                download={`${title}-分享卡.png`}
                className="inline-flex h-11 w-full items-center justify-center gap-2 bg-peach-500 px-5 text-sm font-semibold text-white transition hover:bg-peach-600"
              >
                <Download className="h-4 w-4" />
                下载分享卡
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
