import { NextResponse } from "next/server";
import { getContent } from "@/lib/content";
import { createInquiry, rateLimit, clientIp } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

const str = (v, max) => String(v ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

// استقبال نموذج «تواصل معنا» من الموقع
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  // حقل مخفي: إذا عبّأه أحد فهو روبوت، نرد بنجاح شكلي ولا نحفظ شيئاً
  if (b.website) return NextResponse.json({ ok: true, id: "HD-0" });

  const c = await getContent();
  const f = c.form || {};
  if (f.show === false) return NextResponse.json({ error: "النموذج غير متاح حالياً" }, { status: 403 });

  const data = {
    name: str(b.name, 80),
    phone: str(b.phone, 20).replace(/[^\d+]/g, ""),
    email: str(b.email, 120).toLowerCase(),
    service: str(b.service, 120),
    message: str(b.message, 2000),
  };
  if (data.name.length < 2) return NextResponse.json({ error: "اكتب اسمك" }, { status: 400 });
  if (data.email && !EMAIL.test(data.email)) return NextResponse.json({ error: "البريد الإلكتروني غير صحيح" }, { status: 400 });
  if (!data.email && data.phone.replace(/\D/g, "").length < 9)
    return NextResponse.json({ error: "اكتب رقم جوال أو بريداً إلكترونياً للتواصل" }, { status: 400 });
  if (data.message.length < 5) return NextResponse.json({ error: "اكتب تفاصيل استفسارك" }, { status: 400 });

  if (!(await rateLimit(`inq:${clientIp(req)}`, 5, 3600)))
    return NextResponse.json({ error: "أرسلت عدة استفسارات، حاول بعد قليل أو تواصل واتساب" }, { status: 429 });

  let item;
  try {
    item = await createInquiry(data);
  } catch (e) {
    console.error("Inquiry save failed", e);
    return NextResponse.json({ error: "تعذر الإرسال حالياً، تواصل معنا عبر واتساب" }, { status: 503 });
  }

  const msg = String(f.success || "تم استلام استفسارك برقم {number}").replace("{number}", item.id);
  return NextResponse.json({ ok: true, id: item.id, message: msg });
}
