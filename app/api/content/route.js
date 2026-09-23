import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/auth";
import { getContent, saveContent, dbConnected } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ content: await getContent(), dbConnected: dbConnected() });
}

export async function PUT(req) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const content = await req.json();
    await saveContent(content);
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg =
      e.message === "DB_NOT_CONNECTED"
        ? "قاعدة البيانات غير مربوطة بعد. اربط Upstash Redis من Storage في Vercel."
        : "تعذر الحفظ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
