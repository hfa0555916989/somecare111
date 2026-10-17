import { NextResponse } from "next/server";
import { getContent } from "@/lib/content";
import { localize } from "@/lib/i18n";
import { createInquiry, rateLimit, clientIp } from "@/lib/inquiries";
import { verifyTurnstile } from "@/lib/turnstile";
import { notify } from "@/lib/mail";

export const dynamic = "force-dynamic";

const str = (v, max) => String(v ?? "").trim().slice(0, max);

// رسائل الخطأ بلغة الصفحة التي أُرسل منها النموذج
const ERR = {
  ar: {
    closed: "النموذج غير متاح حالياً",
    name: "اكتب اسمك",
    email: "البريد الإلكتروني غير صحيح",
    reach: "اكتب رقم جوال أو بريداً إلكترونياً للتواصل",
    message: "اكتب تفاصيل استفسارك",
    bot: "فشل التحقق من أنك لست روبوتاً، أعد المحاولة",
    limit: "أرسلت عدة استفسارات، حاول بعد قليل أو تواصل واتساب",
    failed: "تعذر الإرسال حالياً، تواصل معنا عبر واتساب",
  },
  en: {
    closed: "The form is currently unavailable",
    name: "Please enter your name",
    email: "The email address is not valid",
    reach: "Please enter a mobile number or an email so we can reach you",
    message: "Please describe your inquiry",
    bot: "We couldn't verify you're not a robot, please try again",
    limit: "You've sent several inquiries, please try again later or contact us on WhatsApp",
    failed: "Couldn't send right now, please contact us on WhatsApp",
  },
};
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

// استقبال نموذج «تواصل معنا» من الموقع
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  // حقل مخفي: إذا عبّأه أحد فهو روبوت، نرد بنجاح شكلي ولا نحفظ شيئاً
  if (b.website) return NextResponse.json({ ok: true, id: "HD-0" });

  const lang = b.lang === "en" ? "en" : "ar";
  const m = ERR[lang];
  const raw = await getContent();
  const c = localize(raw, lang);
  const f = c.form || {};
  if (f.show === false) return NextResponse.json({ error: m.closed }, { status: 403 });

  const data = {
    name: str(b.name, 80),
    phone: str(b.phone, 20).replace(/[^\d+]/g, ""),
    email: str(b.email, 120).toLowerCase(),
    service: str(b.service, 120),
    message: str(b.message, 2000),
  };
  if (data.name.length < 2) return NextResponse.json({ error: m.name }, { status: 400 });
  if (data.email && !EMAIL.test(data.email)) return NextResponse.json({ error: m.email }, { status: 400 });
  if (!data.email && data.phone.replace(/\D/g, "").length < 9)
    return NextResponse.json({ error: m.reach }, { status: 400 });
  if (data.message.length < 5) return NextResponse.json({ error: m.message }, { status: 400 });

  if (!(await verifyTurnstile(b["cf-turnstile-response"], clientIp(req))))
    return NextResponse.json({ error: m.bot }, { status: 400 });

  if (!(await rateLimit(`inq:${clientIp(req)}`, 5, 3600)))
    return NextResponse.json({ error: m.limit }, { status: 429 });

  let item;
  try {
    item = await createInquiry(data);
  } catch (e) {
    console.error("Inquiry save failed", e);
    return NextResponse.json({ error: m.failed }, { status: 503 });
  }

  // إشعار بالبريد (إذا فُعّل من «الاستفسارات» وأضيف RESEND_API_KEY)
  await notify(raw, `استفسار جديد ${item.id} من ${data.name}`, [
    ["الاسم", data.name],
    ["الجوال", data.phone],
    ["البريد", data.email],
    ["الخدمة", data.service],
    ["الرسالة", data.message],
  ], { replyTo: data.email });

  const msg = String(f.success || "تم استلام استفسارك برقم {number}").replace("{number}", item.id);
  return NextResponse.json({ ok: true, id: item.id, message: msg });
}
