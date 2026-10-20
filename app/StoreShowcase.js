"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_SHOTS, DEMO_VIDEO, DEMO_URL } from "@/lib/demo-media";

export function DemoCarousel({ lang = "ar" }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = DEMO_SHOTS.length;
  const en = lang === "en";

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 4200);
    return () => clearInterval(t);
  }, [paused, n]);

  const shot = DEMO_SHOTS[i];
  const go = (dir) => setI((x) => (x + dir + n) % n);

  return (
    <div className="demo-carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <img
        key={shot.src}
        src={shot.src}
        srcSet={shot.srcSet}
        sizes="(max-width: 860px) 92vw, 720px"
        alt={en ? shot.altEn : shot.alt}
        width={shot.width}
        height={shot.height}
        loading="lazy"
        decoding="async"
      />
      <p className="demo-cap">{en ? shot.captionEn : shot.caption}</p>
      <div className="demo-nav">
        <button type="button" onClick={() => go(-1)} aria-label={en ? "Previous slide" : "الشريحة السابقة"}>
          ‹
        </button>
        <div className="demo-dots">
          {DEMO_SHOTS.map((s, idx) => (
            <button
              key={s.src}
              type="button"
              aria-label={(en ? s.captionEn : s.caption) || String(idx + 1)}
              aria-current={idx === i ? "true" : undefined}
              onClick={() => setI(idx)}
            />
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label={en ? "Next slide" : "الشريحة التالية"}>
          ›
        </button>
      </div>
    </div>
  );
}

export function LazyDemoVideo({ lang = "ar" }) {
  const box = useRef(null);
  const video = useRef(null);
  const [on, setOn] = useState(false);
  const en = lang === "en";

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { rootMargin: "160px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = video.current;
    if (!on || !el) return;
    el.load();
    el.play().catch(() => {});
  }, [on]);

  return (
    <div className="demo-video-wrap" ref={box}>
      <video
        ref={video}
        className="pk-video"
        poster={DEMO_VIDEO.poster}
        muted
        loop
        playsInline
        controls
        preload="none"
        width={DEMO_VIDEO.width}
        height={DEMO_VIDEO.height}
        aria-label={en ? "Muted demo of the store and dashboard" : "عرض صامت للمتجر ولوحة التحكم"}
      >
        {on && (
          <>
            <source src={DEMO_VIDEO.webm} type="video/webm" />
            <source src={DEMO_VIDEO.mp4} type="video/mp4" />
          </>
        )}
      </video>
      <p className="demo-live">
        <a href={DEMO_URL} target="_blank" rel="noopener">
          {en ? "Open the live demo store" : "افتح المتجر التجريبي"}
        </a>
      </p>
    </div>
  );
}

export function DemoGallery({ lang = "ar" }) {
  return (
    <div className="pk-showcase" id="store-demo">
      <DemoCarousel lang={lang} />
      <LazyDemoVideo lang={lang} />
    </div>
  );
}

export function StoreShowcase({ data, lang = "ar" }) {
  if (!data?.shots?.length && !data?.video?.mp4) return null;
  const en = lang === "en";
  const post = data.post?.href && data.post?.title ? data.post : null;
  return (
    <>
      <DemoGallery lang={lang} />
      {post && (
        <a className="pk-post" href={post.href}>
          <span>{en ? "From the blog" : "من المدونة"}</span>
          <strong>{post.title}</strong>
          {post.excerpt && <p>{post.excerpt}</p>}
        </a>
      )}
    </>
  );
}
