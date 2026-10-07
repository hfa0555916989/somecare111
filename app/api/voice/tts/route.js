import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { voiceEnabled, speak, speakable, listVoices, getAssistantSettings, saveAssistantSettings } from "@/lib/voice";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// إعدادات المساعد الصوتي وقائمة الأصوات المتاحة
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const settings = await getAssistantSettings();
  let voices = [];
  if (voiceEnabled()) voices = await listVoices().catch(() => []);
  return NextResponse.json({ settings, voices, enabled: voiceEnabled() });
}

export async function PUT(req) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ settings: await saveAssistantSettings(await req.json().catch(() => ({}))) });
  } catch {
    return NextResponse.json({ error: "قاعدة البيانات غير مربوطة." }, { status: 500 });
  }
}

// قراءة رد المساعد بصوت
export async function POST(req) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!voiceEnabled()) return NextResponse.json({ error: "أضف ELEVENLABS_API_KEY في Vercel." }, { status: 503 });
  const { text } = await req.json().catch(() => ({}));
  const t = speakable(text);
  if (!t) return NextResponse.json({ error: "لا يوجد نص" }, { status: 400 });
  try {
    const s = await getAssistantSettings();
    const res = await speak(t, s.voiceId);
    return new NextResponse(res.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("TTS failed", e);
    return NextResponse.json({ error: "تعذر توليد الصوت" }, { status: 502 });
  }
}
