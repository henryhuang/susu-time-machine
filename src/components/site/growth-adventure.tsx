"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Camera, Check, Compass, Shuffle, Sparkles, Star, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type PointerEvent } from "react";
import type { ResolvedHeroImage } from "@/types/hero-image";

type Props = {
  displayName: string;
  title: string;
  heroImage: ResolvedHeroImage;
  memories: { href: string; title: string }[];
  photoCount: number;
  available: boolean;
};

export function GrowthAdventure({ displayName, title, heroImage, memories, photoCount, available }: Props) {
  const router = useRouter();
  const scene = useRef<HTMLDivElement>(null);
  const [greeting, setGreeting] = useState(0);
  const [collected, setCollected] = useState<number[]>([]);
  const [travelling, startTravel] = useTransition();
  const milestone = memories.length < 10 ? 10 : memories.length < 50 ? 50 : Math.ceil((memories.length + 1) / 100) * 100;

  function moveScene(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--scene-x", `${((event.clientX - rect.left) / rect.width - 0.5) * 9}deg`);
    event.currentTarget.style.setProperty("--scene-y", `${((event.clientY - rect.top) / rect.height - 0.5) * -7}deg`);
  }

  function randomMemory() {
    if (!memories.length || travelling) return;
    startTravel(() => router.push(memories[Math.floor(Math.random() * memories.length)].href));
  }

  return (
    <main className="adventure-home">
      <section className="adventure-hero" aria-labelledby="adventure-title">
        <div className="adventure-copy">
          <h1 id="adventure-title">{title}</h1>
          <div className="adventure-actions">
            <Link className="adventure-button primary" href="/stories"><Compass size={19} /> 成长时间轴 <ArrowUpRight size={19} /></Link>
            <button className="adventure-button secondary" onClick={randomMemory} disabled={!memories.length || travelling}><Shuffle size={17} /> {travelling ? "正在打开…" : "随机故事"}</button>
          </div>
          {!available ? <p className="adventure-helper">故事加载失败，请刷新重试。</p> : !memories.length ? <p className="adventure-helper">暂无故事。</p> : null}
          {memories[0] ? <Link className="latest-memory" href={memories[0].href}><span>最新故事</span><strong>{memories[0].title}</strong><ArrowUpRight size={17} /></Link> : null}
        </div>

        <div className="adventure-scene" ref={scene} onPointerMove={moveScene} onPointerLeave={() => { scene.current?.style.setProperty("--scene-x", "0deg"); scene.current?.style.setProperty("--scene-y", "0deg"); }}>
          <div className="scene-orbit orbit-one" aria-hidden="true" /><div className="scene-orbit orbit-two" aria-hidden="true" />
          <div className="photo-portal">
            <picture>
              {heroImage.variants.length ? <source type="image/webp" srcSet={heroImage.variants.map(v => `${v.url} ${v.width}w`).join(", ")} sizes="(max-width: 760px) 90vw, 50vw" /> : null}
              <img src={heroImage.src} alt={`${displayName}的成长照片`} width={heroImage.width} height={heroImage.height} loading="eager" fetchPriority="high" decoding="async" />
            </picture>
          </div>
          <div className="story-cloud" aria-hidden="true" />
          <div className="star-collection" aria-label="收集三颗小星星">
            {[0, 1, 2].map(index => <button key={index} className={`collectible star-${index} ${collected.includes(index) ? "is-collected" : ""}`} aria-label={`收集第${index + 1}颗星星`} aria-pressed={collected.includes(index)} disabled={collected.includes(index)} onClick={() => setCollected(previous => [...previous, index])}><Star fill="currentColor" /></button>)}
          </div>
          <div className="companion-area">
            {greeting > 0 ? <span key={greeting} className="companion-wave" role="status" aria-label="小雅向你挥手">👋</span> : null}
            <button className="companion-button" aria-label="和小雅打招呼" onClick={() => setGreeting(value => value + 1)}><img className="companion-animated" src="/characters/xiaoya-loop.gif" alt="小雅" width="360" height="450" /><img className="companion-still" src="/characters/xiaoya-avatar.webp" alt="小雅" width="150" height="150" /></button>
          </div>
          <span className="scene-footnote" aria-live="polite"><Sparkles size={13} /> {collected.length} / 3</span>
        </div>
      </section>

      <section className="adventure-log" aria-labelledby="log-title">
        <div className="log-heading"><h2 id="log-title">成长记录</h2></div>
        <div id="growth-passport" className="passport-grid">
          <Link href="/stories" className="passport-card memories-card"><span className="passport-icon"><BookOpen size={22} /></span><span className="passport-label">故事</span><div className="passport-number">{available ? String(memories.length).padStart(2, "0") : "—"}<span>篇故事</span></div><ArrowUpRight className="passport-arrow" size={20} /></Link>
          <Link href="/stories" className="passport-card photos-card"><span className="passport-icon"><Camera size={22} /></span><span className="passport-label">照片</span><div className="passport-number">{available ? String(photoCount).padStart(2, "0") : "—"}<span>张照片</span></div><ArrowUpRight className="passport-arrow" size={20} /></Link>
          <div className="passport-card milestone-card"><div className="milestone-heading"><span className="passport-icon"><Trophy size={22} /></span><span className="passport-label">记录进度</span><span className="milestone-target">{milestone} 篇</span></div><h3>{milestone} 篇故事</h3><p>{available ? `还差 ${milestone - memories.length} 篇` : "暂不可用"}</p><div className="milestone-track" role="progressbar" aria-label="故事记录里程碑" aria-valuenow={memories.length} aria-valuemin={0} aria-valuemax={milestone}><span style={{ width: `${memories.length / milestone * 100}%` }} /></div><div className="milestone-bottom"><span>{memories.length >= 1 ? <><Check size={12} /> 已开始记录</> : "暂无记录"}</span><span>{available ? memories.length : "—"} / {milestone}</span></div></div>
        </div>

      </section>
    </main>
  );
}
