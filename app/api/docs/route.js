import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { dbConnected } from "@/lib/content";
import { listDocs, createDoc, updateDoc, deleteDoc, cleanDoc } from "@/lib/docs";

export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });
const fail = (e) =>
  NextResponse.json(
    {
      error:
        e.message === "DB_NOT_CONNECTED"
          ? "قاعدة البيانات غير مربوطة، لذلك لا يمكن حفظ الوثائق."
          : e.message === "LOCKED"
            ? "وافق العميل على هذه الوثيقة، لذلك لا يمكن تعديلها. أنشئ نسخة جديدة بدلاً منها."
            : e.message === "DUPLICATE"
              ? "رقم الوثيقة مستخدم في وثيقة أخرى. لتحديث نفس العرض استخدم «تحديث العرض الموجود» (يبقى نفس الرابط)، أو غيّر الرقم."
              : "تعذر الحفظ",
    },
    { status: e.message === "LOCKED" || e.message === "DUPLICATE" ? 409 : 500 }
  );

export async function GET() {
  if (!isAuthed()) return deny();
  return NextResponse.json({ items: await listDocs(), db: dbConnected(), ai: !!process.env.ANTHROPIC_API_KEY });
}

export async function POST(req) {
  if (!isAuthed()) return deny();
  try {
    const item = await createDoc(cleanDoc(await req.json().catch(() => ({}))));
    return NextResponse.json({ item });
  } catch (e) {
    return fail(e);
  }
}

export async function PUT(req) {
  if (!isAuthed()) return deny();
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ error: "id" }, { status: 400 });
  try {
    // تغيير الحالة فقط (مثل الإلغاء) بدون إرسال بقية الحقول
    const data = b.statusOnly ? { status: ["draft", "sent", "cancelled"].includes(b.status) ? b.status : "draft" } : cleanDoc(b);
    const item = await updateDoc(String(b.id), data);
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
    await deleteDoc(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
