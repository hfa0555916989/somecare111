import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/auth";
import { getContent, saveContent, storageMode } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const storage = storageMode();
  return NextResponse.json({ content: await getContent(), dbConnected: !!storage, storage });
}

export async function PUT(req) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const content = await req.json();
    await saveContent(content);
    revalidatePath("/");
    return NextResponse.json({ ok: true, storage: storageMode() });
  } catch (e) {
    const msg =
      e.message === "DB_NOT_CONNECTED"
        ? "قاعدة البيانات غير مربوطة بعد. اربط Upstash Redis من Storage في Vercel."
        : "تعذر الحفظ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
