import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { PLANS } from "@/lib/subscription-plans";
import { deleteSubscription, listSubscriptions, saveSubscription } from "@/lib/subscriptions";

export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });
const fail = (e) => {
  const known = e.message === "DB_NOT_CONNECTED"
    ? "التخزين غير مربوط. الاشتراكات تستخدم Upstash Redis نفسه المستخدم لبقية اللوحة. من Vercel: Storage ثم Upstash Redis، ثم اربطها بالمشروع وأعد النشر."
    : e.message || "تعذر الحفظ";
  const status = e.message === "DB_NOT_CONNECTED" ? 503 : /مطلوب|اكتب/.test(e.message || "") ? 400 : 500;
  return NextResponse.json({ error: known }, { status });
};

export async function GET() {
  if (!isAuthed()) return deny();
  try {
    const data = await listSubscriptions();
    return NextResponse.json({ ...data, plans: PLANS });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req) {
  if (!isAuthed()) return deny();
  const b = await req.json().catch(() => ({}));
  try {
    return NextResponse.json({ item: await saveSubscription(b) });
  } catch (e) {
    return fail(e);
  }
}

export async function PUT(req) {
  if (!isAuthed()) return deny();
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
  try {
    const item = await saveSubscription(b);
    return item ? NextResponse.json({ item }) : NextResponse.json({ error: "غير موجود" }, { status: 404 });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req) {
  if (!isAuthed()) return deny();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
  try {
    const ok = await deleteSubscription(id);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "غير موجود" }, { status: 404 });
  } catch (e) {
    return fail(e);
  }
}
