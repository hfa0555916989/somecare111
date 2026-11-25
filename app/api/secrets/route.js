import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { secretStatus, setSecret } from "@/lib/site-secrets";

export const dynamic = "force-dynamic";

// الرموز السرية من لوحة التحكم: لا تُعاد قيمتها أبداً، فقط حالتها وآخر 4 أحرف
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ xPixelToken: await secretStatus("xPixelToken") });
}

export async function PUT(req) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const value = String(b.value ?? "").trim();
  if (b.name !== "xPixelToken") return NextResponse.json({ error: "حقل غير معروف" }, { status: 400 });
  if (value && !/^[\x21-\x7e]{10,2000}$/.test(value)) return NextResponse.json({ error: "الرمز غير صحيح، انسخه كاملاً من X" }, { status: 400 });
  try {
    await setSecret(b.name, value);
  } catch (e) {
    const msg =
      e.message === "DB_NOT_CONNECTED" ? "قاعدة البيانات غير مربوطة" : e.message === "NO_KEY" ? "أضف AUTH_SECRET أو VAULT_KEY في Vercel أولاً" : "تعذر الحفظ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  return NextResponse.json({ ok: true, xPixelToken: await secretStatus("xPixelToken") });
}
