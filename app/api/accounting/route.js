import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { dbConnected } from "@/lib/content";
import { listDocs, totals } from "@/lib/docs";
import { listEntries, createEntries, updateEntry, deleteEntry, getSettings, saveSettings } from "@/lib/accounting";
import { cleanEntry } from "@/lib/finance";
import { storageStatus } from "@/lib/storage";

export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });
const fail = (e) =>
  NextResponse.json(
    { error: e.message === "DB_NOT_CONNECTED" ? "قاعدة البيانات غير مربوطة، لذلك لا يمكن حفظ العمليات." : "تعذر الحفظ" },
    { status: 500 }
  );

export async function GET() {
  if (!isAuthed()) return deny();
  const [items, settings, docs] = await Promise.all([listEntries(), getSettings(), listDocs()]);
  // العروض والعقود (لربط الإيراد بها وحساب المستحقات)
  // الفواتير غير المدفوعة تُحسب مستحقات، إلا إذا كانت مبنية على عقد موافق عليه (لأن العقد محسوب أصلاً)
  const acceptedNums = new Set(docs.filter((d) => d.status === "accepted").map((d) => String(d.number).toUpperCase()));
  const linkable = docs
    .filter((d) => d.status === "accepted" || d.status === "sent")
    .map((d) => ({
      number: d.number,
      title: d.title,
      client: d.client?.company || d.client?.name || "",
      status: d.type === "invoice" ? (d.payment?.paid || acceptedNums.has(String(d.ref).toUpperCase()) ? "invoice-covered" : "invoice") : d.status,
      total: totals(d).total,
    }));
  return NextResponse.json({ items, settings, docs: linkable, db: dbConnected(), ai: !!process.env.ANTHROPIC_API_KEY, ...storageStatus() });
}

// إضافة عملية واحدة أو عدة عمليات ({ entries: [...] })
export async function POST(req) {
  if (!isAuthed()) return deny();
  const b = await req.json().catch(() => ({}));
  const list = (Array.isArray(b.entries) ? b.entries : [b]).slice(0, 50).map(cleanEntry).filter((e) => e.amount > 0);
  if (!list.length) return NextResponse.json({ error: "اكتب المبلغ" }, { status: 400 });
  try {
    return NextResponse.json({ items: await createEntries(list) });
  } catch (e) {
    return fail(e);
  }
}

// تعديل عملية ({ id, ... }) أو حفظ الإعدادات ({ settings })
export async function PUT(req) {
  if (!isAuthed()) return deny();
  const b = await req.json().catch(() => ({}));
  try {
    if (b.settings) return NextResponse.json({ settings: await saveSettings(b.settings) });
    if (!b.id) return NextResponse.json({ error: "id" }, { status: 400 });
    const data = cleanEntry(b);
    if (!(data.amount > 0)) return NextResponse.json({ error: "اكتب المبلغ" }, { status: 400 });
    const item = await updateEntry(String(b.id), data);
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
    await deleteEntry(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
