"use client";
import { useEffect, useRef, useState } from "react";

// التقاط الكلام من المايك: يبدأ التسجيل، ويكتشف نهاية الجملة بالصمت، ثم يحوّلها لنص عبر /api/voice/stt
const SILENCE_MS = 1300; // صمت بعد الكلام يعني انتهاء الجملة
const MAX_MS = 60000; // أقصى طول للجملة الواحدة

function pickMime() {
  if (typeof MediaRecorder === "undefined") return "";
  for (const m of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]) if (MediaRecorder.isTypeSupported?.(m)) return m;
  return "";
}

export function useVoice() {
  const [state, setState] = useState("idle"); // idle | listening | hearing | transcribing | speaking
  const [level, setLevel] = useState(0);
  const r = useRef({});
  const supported = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";

  useEffect(() => () => stop(), []);

  // يُستدعى أول شيء داخل ضغطة المستخدم حتى يسمح المتصفح (خاصة iPhone) بتشغيل الصوت لاحقاً
  function unlock() {
    if (!r.current.ctx || r.current.ctx.state === "closed") r.current.ctx = new (window.AudioContext || window.webkitAudioContext)();
    r.current.ctx.resume?.().catch(() => {});
  }

  async function ensureStream() {
    unlock();
    if (r.current.stream) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    const analyser = r.current.ctx.createAnalyser();
    analyser.fftSize = 1024;
    r.current.ctx.createMediaStreamSource(stream).connect(analyser);
    r.current.stream = stream;
    r.current.analyser = analyser;
  }

  function rms() {
    const a = r.current.analyser;
    const buf = new Uint8Array(a.fftSize);
    a.getByteTimeDomainData(buf);
    let s = 0;
    for (const v of buf) s += ((v - 128) / 128) ** 2;
    return Math.sqrt(s / buf.length);
  }

  // يسمع جملة واحدة ويرجع نصها ("" إذا لم يتكلم)
  async function listenOnce() {
    await ensureStream();
    const mime = pickMime();
    const rec = new MediaRecorder(r.current.stream, mime ? { mimeType: mime } : undefined);
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const started = Date.now();
    let noise = 0.01;
    let calib = 0;
    let spoke = false;
    let lastVoice = 0;
    setState("listening");
    const done = new Promise((ok) => (rec.onstop = ok));
    rec.start(250);
    r.current.rec = rec;
    await new Promise((finish) => {
      r.current.finish = finish;
      const tick = () => {
        if (rec.state !== "recording" || !r.current.analyser) return finish();
        const v = rms();
        setLevel(Math.min(1, v * 8));
        const now = Date.now();
        // أول نصف ثانية لقياس ضجيج المكان
        if (now - started < 500) {
          noise = Math.max(noise, v);
          calib++;
        } else {
          const th = Math.max(0.02, noise * 2.2);
          if (v > th) {
            if (!spoke) setState("hearing");
            spoke = true;
            lastVoice = now;
          }
          if ((spoke && now - lastVoice > SILENCE_MS) || now - started > MAX_MS) {
            rec.stop();
            return finish();
          }
        }
        r.current.raf = requestAnimationFrame(tick);
      };
      tick();
    });
    if (rec.state === "recording") rec.stop();
    await done;
    setLevel(0);
    if (!spoke || r.current.cancelled) return "";
    setState("transcribing");
    const type = rec.mimeType || mime || "audio/webm";
    const fd = new FormData();
    fd.append("file", new Blob(chunks, { type }), `speech.${type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm"}`);
    const res = await fetch("/api/voice/stt", { method: "POST", body: fd });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || "تعذر تحويل الصوت");
    return j.text || "";
  }

  async function speak(text) {
    if (!text) return;
    setState("speaking");
    try {
      const res = await fetch("/api/voice/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      if (!res.ok) return;
      unlock();
      const ctx = r.current.ctx;
      const buf = await ctx.decodeAudioData(await res.arrayBuffer());
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      await new Promise((ok) => {
        src.onended = ok;
        r.current.endSpeech = ok;
        r.current.src = src;
        src.start();
      });
    } finally {
      r.current.src = null;
      setState("idle");
    }
  }

  // إيقاف الكلام الحالي (مقاطعة المساعد)
  function interrupt() {
    try {
      r.current.src?.stop();
    } catch {}
    r.current.endSpeech?.();
  }

  function stop() {
    r.current.cancelled = true;
    cancelAnimationFrame(r.current.raf);
    r.current.finish?.();
    if (r.current.rec?.state === "recording") r.current.rec.stop();
    interrupt();
    r.current.stream?.getTracks().forEach((t) => t.stop());
    r.current.ctx?.close().catch(() => {});
    r.current = { cancelled: true };
    setState("idle");
    setLevel(0);
  }

  function reset() {
    r.current.cancelled = false;
  }

  return { supported, state, level, unlock, listenOnce, speak, interrupt, stop, reset };
}
