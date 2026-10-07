import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { voiceEnabled, transcribe, keyterms, getAssistantSettings } from "@/lib/voice";
import { listProjects } from "@/lib/projects";
import { listDocs } from "@/lib/docs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// تحويل تسجيل صوتي قصير إلى نص (عربي، مع أسماء العملاء والمصطلحات لتحسين الدقة)
export async function POST(req) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!voiceEnabled()) return NextResponse.json({ error: "أضف ELEVENLABS_API_KEY في Vercel لتفعيل المحادثة الصوتية." }, { status: 503 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string" || !file.size) return NextResponse.json({ error: "لا يوجد تسجيل" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "التسجيل طويل، تكلّم بجمل أقصر" }, { status: 413 });
  try {
    const [s, projects, docs] = await Promise.all([getAssistantSettings(), listProjects().catch(() => []), listDocs().catch(() => [])]);
    const names = [...projects.flatMap((p) => [p.name, p.client]), ...docs.flatMap((d) => [d.client?.name, d.client?.company])].filter(Boolean);
    const text = await transcribe(file, { language: s.language, terms: keyterms(s.vocabulary, names) });
    return NextResponse.json({ text });
  } catch (e) {
    console.error("STT failed", e);
    return NextResponse.json({ error: "تعذر تحويل الصوت إلى نص، حاول مرة أخرى" }, { status: 502 });
  }
}
