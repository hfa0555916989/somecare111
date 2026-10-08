import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { dbConnected } from "@/lib/content";
import { listDocs, createDoc, updateDoc, deleteDoc, cleanDoc, getDoc, markInvoicePaid, totals } from "@/lib/docs";
import { createEntries } from "@/lib/accounting";
import { cleanEntry, INCOME_CATS } from "@/lib/finance";

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
            : e.message === "PAID"
              ? "هذه الفاتورة مدفوعة ومسجّلة في المحاسبة، لذلك لا تُعدّل ولا تُحذف. يمكنك إلغاؤها فقط."
            : e.message === "DUPLICATE"
              ? "رقم الوثيقة مستخدم في وثيقة أخرى. لتحديث نفس العرض استخدم «تحديث العرض الموجود» (يبقى نفس الرابط)، أو غيّر الرقم."
              : "تعذر الحفظ",
    },
    { status: ["LOCKED", "DUPLICATE", "PAID"].includes(e.message) ? 409 : 500 }
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
    // تعليم الفاتورة كمدفوعة: تُسجَّل إيراداً في المحاسبة وتُربط بالعقد الذي بُنيت عليه
    if (b.markPaid) {
      const d = await getDoc(String(b.id));
      if (!d || d.type !== "invoice") return NextResponse.json({ error: "ليست فاتورة" }, { status: 400 });
      if (d.payment?.paid) throw new Error("PAID");
      const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b.date || "")) ? b.date : undefined;
      const [entry] = await createEntries([
        cleanEntry({
          kind: "income",
          cat: INCOME_CATS[b.cat] ? b.cat : "project",
          amount: totals(d).total,
          date,
          client: d.client?.company || d.client?.name || "",
          docRef: d.ref || d.number,
          note: `فاتورة ${d.number}${d.title ? " - " + d.title : ""}`,
        }),
      ]);
      const item = await markInvoicePaid(d.id, { at: entry.date, entryId: entry.id, amount: entry.amount });
      return NextResponse.json({ item, entry });
    }
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
    if (e.message === "LOCKED")
      return NextResponse.json({ error: "وافق العميل على هذه الوثيقة، لذلك هي محفوظة إجبارياً في الأرشيف ولا تُحذف. يمكنك إلغاؤها فقط." }, { status: 409 });
    return fail(e);
  }
}
