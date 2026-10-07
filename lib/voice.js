import { redis } from "./content";

// المحادثة الصوتية عبر ElevenLabs: تحويل الكلام لنص (Scribe) والرد بصوت (Text to Speech)
export const voiceEnabled = () => !!process.env.ELEVENLABS_API_KEY;
const API = "https://api.elevenlabs.io/v1";
const KEY = "assistant:settings";
// صوت افتراضي من أصوات ElevenLabs الجاهزة (يتغير من إعدادات المساعد)
const DEFAULT_VOICE = "JBFqnCBsd6RMkjVDRZzb";

export const DEFAULT_ASSISTANT = { voiceId: "", vocabulary: "", speak: true, language: "ar" };

export async function getAssistantSettings() {
  const r = redis();
  const s = r ? await r.get(KEY) : null;
  return { ...DEFAULT_ASSISTANT, ...(s && typeof s === "object" ? s : {}) };
}

export async function saveAssistantSettings(b = {}) {
  const r = redis();
  if (!r) throw new Error("DB_NOT_CONNECTED");
  const s = {
    voiceId: String(b.voiceId || "").replace(/[^\w-]/g, "").slice(0, 60),
    vocabulary: String(b.vocabulary || "").slice(0, 8000),
    speak: b.speak !== false,
    language: ["ar", "auto"].includes(b.language) ? b.language : "ar",
  };
  await r.set(KEY, s);
  return s;
}

// كلمات تساعد التعرّف على الكلام: أسماء العملاء والمصطلحات (كل سطر أو فاصلة كلمة، حتى 5 كلمات)
export function keyterms(vocabulary, extra = []) {
  const bad = /[<>{}[\]\\]/g;
  const terms = [...String(vocabulary || "").split(/[\n,،]+/), ...extra]
    .map((t) => t.replace(bad, "").trim())
    .filter((t) => t && t.length < 50 && t.split(/\s+/).length <= 5);
  return [...new Set(terms)].slice(0, 300);
}

export async function transcribe(file, { language = "ar", terms = [] } = {}) {
  const send = async (withTerms) => {
    const fd = new FormData();
    fd.append("model_id", "scribe_v2");
    fd.append("file", file, file.name || "speech.webm");
    if (language !== "auto") fd.append("language_code", language);
    fd.append("tag_audio_events", "false");
    if (withTerms) for (const t of terms) fd.append("keyterms", t);
    return fetch(`${API}/speech-to-text`, { method: "POST", headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY }, body: fd });
  };
  let res = await send(terms.length > 0);
  // لو رُفضت قائمة الكلمات لأي سبب نعيد المحاولة بدونها
  if (res.status === 422 && terms.length) res = await send(false);
  if (!res.ok) throw new Error(`STT ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const j = await res.json();
  return String(j.text || "").trim();
}

export async function speak(text, voiceId) {
  const id = voiceId || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;
  const res = await fetch(`${API}/text-to-speech/${encodeURIComponent(id)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res;
}

export async function listVoices() {
  const res = await fetch(`${API}/voices`, { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY } });
  if (!res.ok) throw new Error(`Voices ${res.status}`);
  const j = await res.json();
  return (j.voices || []).map((v) => ({ id: v.voice_id, name: v.name, labels: v.labels || {} }));
}

// نص مناسب للنطق: بدون رموز التنسيق، ومختصر
export function speakable(text) {
  return String(text || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_#>`|]/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\n{2,}/g, "\n")
    .trim()
    .slice(0, 1500);
}
