import { NextResponse } from "next/server";
import { getContent } from "@/lib/content";
import { getDocByToken, acceptDoc, liveProvider, isExpired } from "@/lib/docs";
import { createInquiry, rateLimit, clientIp } from "@/lib/inquiries";
import { archiveAcceptedDoc } from "@/lib/doc-archive";
import { notify } from "@/lib/mail";

export const dynamic = "force-dynamic";

// موافقة العميل إلكترونياً على عرض السعر أو العقد من رابطه على الموقع
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const ip = clientIp(req);
  if (!(await rateLimit(`accept:${ip}`, 10, 3600)))
    return NextResponse.json({ error: "محاولات كثيرة، حاول بعد قليل" }, { status: 429 });

  const doc = await getDocByToken(b.token);
  if (!doc) return NextResponse.json({ error: "الوثيقة غير موجودة" }, { status: 404 });
  if (doc.status === "accepted") return NextResponse.json({ error: "تمت الموافقة على هذه الوثيقة مسبقاً" }, { status: 409 });
  if (doc.status === "cancelled") return NextResponse.json({ error: "هذه الوثيقة ملغاة" }, { status: 409 });
  if (isExpired(doc)) return NextResponse.json({ error: "انتهت صلاحية العرض، تواصل معنا لتحديثه" }, { status: 409 });

  const name = String(b.name || "").trim().replace(/\s+/g, " ").slice(0, 120);
  if (name.length < 3 || !b.agree) return NextResponse.json({ error: "اكتب اسمك الكامل وأكّد موافقتك" }, { status: 400 });

  const c = await getContent();
  let item;
  try {
    item = await acceptDoc(doc, liveProvider(c), {
      name,
      ip,
      ua: String(req.headers.get("user-agent") || "").slice(0, 200),
    });
  } catch (e) {
    console.error("Accept failed", e);
    return NextResponse.json({ error: "تعذر تسجيل الموافقة حالياً، حاول بعد قليل أو تواصل معنا واتساب" }, { status: 503 });
  }

  // أرشفة إجبارية في المخزن الخاص (نسخة البيانات والبصمة وصفحة الوثيقة)
  try {
    await archiveAcceptedDoc(item, liveProvider(c).site);
  } catch (e) {
    console.error("Archive on accept failed", e);
  }
  await notify(c, `✅ موافقة على ${doc.type === "contract" ? "العقد" : "العرض"} ${doc.number}`, [
    ["العميل", name],
    ["الوثيقة", doc.title || doc.number],
  ]).catch(() => {});

  // تنبيه في «الاستفسارات» بلوحة التحكم
  try {
    await createInquiry({
      name,
      phone: doc.client?.phone || "",
      email: doc.client?.email || "",
      service: `موافقة على ${doc.type === "contract" ? "العقد" : "عرض السعر"} ${doc.number}`,
      message: `وافق ${name} إلكترونياً على «${doc.title || doc.number}».`,
    });
  } catch {}

  return NextResponse.json({ ok: true, acceptance: item.acceptance });
}
