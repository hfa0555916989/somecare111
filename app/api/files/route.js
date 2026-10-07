import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { dbConnected, getContent } from "@/lib/content";
import { listDocs, liveProvider } from "@/lib/docs";
import { archivePending } from "@/lib/doc-archive";
import { listFiles, addFile, updateFile, deleteFile, imageHistory, storageStatus, FILE_CATS } from "@/lib/storage";

export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });
const fail = (e) =>
  NextResponse.json(
    {
      error:
        e.message === "DB_NOT_CONNECTED"
          ? "قاعدة البيانات غير مربوطة."
          : e.message === "LOCKED"
            ? "هذا عقد موقّع مؤرشف إجبارياً ولا يمكن حذفه."
            : "تعذر الحفظ",
    },
    { status: e.message === "LOCKED" ? 409 : 500 }
  );

export async function GET() {
  if (!isAuthed()) return deny();
  const [items, history] = await Promise.all([listFiles(), imageHistory()]);
  return NextResponse.json({ items, history, cats: FILE_CATS, db: dbConnected(), ...storageStatus(), ai: !!process.env.ANTHROPIC_API_KEY });
}

// تسجيل ملف بعد رفعه للمخزن الخاص من المتصفح
export async function POST(req) {
  if (!isAuthed()) return deny();
  const b = await req.json().catch(() => ({}));
  const blob = b.blob || {};
  let host = "";
  try {
    host = new URL(blob.url).hostname;
  } catch {}
  if (!host.endsWith(".private.blob.vercel-storage.com")) return NextResponse.json({ error: "رابط الملف غير صالح" }, { status: 400 });
  try {
    return NextResponse.json({ item: await addFile(blob, b.meta || {}) });
  } catch (e) {
    return fail(e);
  }
}

export async function PUT(req) {
  if (!isAuthed()) return deny();
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ error: "id" }, { status: 400 });
  try {
    const item = await updateFile(String(b.id), b);
    return item ? NextResponse.json({ item }) : NextResponse.json({ error: "غير موجود" }, { status: 404 });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req) {
  if (!isAuthed()) return deny();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  try {
    await deleteFile(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

// أرشفة العروض والعقود الموافق عليها سابقاً (قبل ربط المخزن الخاص)
export async function PATCH() {
  if (!isAuthed()) return deny();
  if (!storageStatus().privateBlob) return NextResponse.json({ error: "اربط المخزن الخاص أولاً" }, { status: 400 });
  const c = await getContent();
  return NextResponse.json(await archivePending(await listDocs(), liveProvider(c).site));
}
