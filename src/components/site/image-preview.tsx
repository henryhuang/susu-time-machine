"use client";

import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import styles from "@/app/(site)/stories/[idOrSlug]/story-detail.module.css";

const photoSizes = {
  hero: "(max-width: 600px) calc(100vw - 40px), (max-width: 1440px) 87vw, 1280px",
  single: "(max-width: 600px) calc(100vw - 40px), (max-width: 1040px) 87vw, 900px",
  pair: "(max-width: 600px) calc(100vw - 40px), (max-width: 1440px) 44vw, 640px",
  trio: "(max-width: 600px) calc(100vw - 40px), (max-width: 950px) 44vw, 29vw",
  asymmetric: "(max-width: 600px) calc(100vw - 40px), (max-width: 1440px) 54vw, 800px"
};

function thumbnailSet(src: string, wide: boolean) {
  // Story uploads have no stored variants. Request smaller versions only from the site's photo CDN.
  if (!/^https:\/\/susu-img-wx\.cnhalo\.com\/[^?#]+\.(?:jpe?g|png|webp)$/i.test(src)) return undefined;
  const widths = wide ? [480, 800, 1200, 1600, 2048] : [400, 640, 960, 1280];
  return widths.map((width) => `${src}?imageMogr2/auto-orient/thumbnail/${width}x/format/webp/quality/83 ${width}w`).join(", ");
}

function Photo({ src, alt, layout, onOpen }: {
  src: string;
  alt: string;
  layout: keyof typeof photoSizes;
  onOpen: (button: HTMLButtonElement) => void;
}) {
  const [retryOriginal, setRetryOriginal] = useState(false);
  const [failed, setFailed] = useState(false);
  const hero = layout === "hero";
  const srcSet = retryOriginal ? undefined : thumbnailSet(src, hero || layout === "single");

  function applyDimensions(image: HTMLImageElement) {
    image.parentElement?.style.setProperty("--photo-ratio", String(image.naturalWidth / image.naturalHeight));
    if (image.naturalWidth < image.naturalHeight) image.dataset.portrait = "true";
  }

  function handleError() {
    if (srcSet) setRetryOriginal(true);
    else setFailed(true);
  }

  return (
    <button
      type="button"
      className={`${styles.photo} ${hero ? styles.hero : ""}`}
      aria-label={`放大${alt}`}
      onClick={(event) => onOpen(event.currentTarget)}
    >
      {failed ? <span className={styles.photoError}>照片暂时无法加载</span> : (
        // eslint-disable-next-line @next/next/no-img-element -- The photo CDN provides the responsive sources.
        <img
          key={retryOriginal ? "original" : "thumbnail"}
          ref={(image) => {
            // A cached image or a failed request can finish before React attaches its handlers.
            if (!image?.complete) return;
            if (image.naturalWidth > 0) applyDimensions(image);
            else handleError();
          }}
          src={src}
          srcSet={srcSet}
          sizes={srcSet ? photoSizes[layout] : undefined}
          loading={hero ? "eager" : "lazy"}
          fetchPriority={hero ? "high" : "auto"}
          decoding="async"
          alt={alt}
          onLoad={(event) => applyDimensions(event.currentTarget)}
          onError={handleError}
        />
      )}
    </button>
  );
}

function PreviewPhoto({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <p role="status">照片暂时无法加载</p> : (
    // eslint-disable-next-line @next/next/no-img-element -- The preview displays the original photo.
    <img src={src} alt={alt} onError={() => setFailed(true)} />
  );
}

const sequence = ["asymmetric", "trio", "pair", "single"] as const;
const rowSizes = { asymmetric: 2, trio: 3, pair: 2, single: 1 };

export function ImagePreview({ photos, heroIndex, title, children }: {
  photos: string[];
  heroIndex: number;
  title: string;
  children: ReactNode;
}) {
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const indexes = photos.map((_, index) => index).filter((index) => index !== heroIndex);
  const rows: { layout: keyof typeof rowSizes; indexes: number[] }[] = [];

  for (let start = 0; start < indexes.length;) {
    const remaining = indexes.length - start;
    // Read left to right, top to bottom, with a wider lead photo every few rows.
    const planned = sequence[rows.length % sequence.length];
    const layout = remaining === 1 ? "single" : remaining === 2 ? "pair" : planned;
    const end = start + rowSizes[layout];
    rows.push({ layout, indexes: indexes.slice(start, end) });
    start = end;
  }

  function alt(index: number) {
    return index === heroIndex ? `《${title}》的封面照片` : `《${title}》的第 ${index + 1} 张照片`;
  }

  function show(index: number, button: HTMLButtonElement) {
    opener.current = button;
    setActive(index);
    dialog.current?.showModal();
  }

  function move(offset: number) {
    setActive((index) => index === null ? null : Math.min(Math.max(index + offset, 0), photos.length - 1));
  }

  return (
    <>
      {heroIndex >= 0 ? (
        <Photo src={photos[heroIndex]} alt={alt(heroIndex)} layout="hero" onOpen={(button) => show(heroIndex, button)} />
      ) : null}
      {children}
      {rows.length ? (
        <div className={styles.gallery} role="group" aria-label="故事照片">
          {rows.map(({ layout, indexes: row }) => (
            <div key={row[0]} className={`${styles.row} ${styles[layout]}`}>
              {row.map((index) => (
                <Photo key={index} src={photos[index]} alt={alt(index)} layout={layout} onOpen={(button) => show(index, button)} />
              ))}
            </div>
          ))}
        </div>
      ) : null}
      {photos.length ? (
        <dialog
          ref={dialog}
          className={styles.viewer}
          aria-label="照片预览"
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
          onClose={() => {
            setActive(null);
            touchStart.current = null;
            opener.current?.focus({ preventScroll: true });
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              move(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
        >
          <div className={styles.viewerContent}>
            <div className={styles.viewerBar}>
              <span aria-live="polite">{active === null ? "" : `${active + 1} / ${photos.length}`}</span>
              <button type="button" aria-label="关闭图片预览" autoFocus onClick={() => dialog.current?.close()}>
                <X size={23} aria-hidden="true" />
              </button>
            </div>
            <div
              className={styles.viewerStage}
              onPointerDown={(event) => {
                if (event.pointerType === "touch" && event.isPrimary) touchStart.current = { x: event.clientX, y: event.clientY };
              }}
              onPointerCancel={() => { touchStart.current = null; }}
              onPointerUp={(event) => {
                const start = touchStart.current;
                touchStart.current = null;
                if (!start) return;
                const dx = event.clientX - start.x;
                const dy = event.clientY - start.y;
                if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
              }}
            >
              {active !== null ? <PreviewPhoto key={active} src={photos[active]} alt={alt(active)} /> : null}
            </div>
            {photos.length > 1 ? (
              <div className={styles.viewerControls}>
                <button type="button" aria-label="上一张" aria-disabled={active === 0} onClick={() => move(-1)}>
                  <ArrowLeft size={24} aria-hidden="true" />
                </button>
                <button type="button" aria-label="下一张" aria-disabled={active === photos.length - 1} onClick={() => move(1)}>
                  <ArrowRight size={24} aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        </dialog>
      ) : null}
    </>
  );
}
