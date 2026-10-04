import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAuthed } from "@/lib/auth";
import { cleanDoc } from "@/lib/docs";

export const dynamic = "force-dynamic";
// قراءة ملفات PDF قد تأخذ دقيقة تقريباً
export const maxDuration = 120;

// حدود Vercel لحجم الطلب ~4.5MB، والملفات تُرسل base64 (أكبر بالثلث)
const MAX_TOTAL = 3 * 1024 * 1024;

const S = { type: "string" };
const N = { type: "number" };
const arr = (items) => ({ type: "array", items });
const obj = (properties) => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });

const SCHEMA = obj({
  type: { type: "string", enum: ["quote", "contract"] },
  number: S,
  date: S,
  validDays: N,
  title: S,
  subtitle: S,
  intro: S,
  client: obj({ name: S, company: S, idNumber: S, phone: S, email: S, city: S }),
  sections: arr(obj({ title: S, desc: S, qty: N, price: N, note: S, features: arr(S), tags: arr(S) })),
  discount: N,
  vatRate: N,
  recurring: arr(S),
  duration: S,
  terms: arr(S),
  annex: arr(obj({ title: S, intro: S, points: arr(S) })),
});

const SYSTEM = `You convert Arabic price quotes, contracts and feature specifications (PDF) into the fields of a quote/contract builder for a Saudi freelance web developer.

Rules:
- Keep the original Arabic wording. Do not translate, summarize away details, or invent anything that is not in the files. Leave a field empty ("" / 0 / []) when the files don't state it.
- The PDFs were printed from designed HTML, so text order inside a line may look scrambled (numbers detached from words, parentheses flipped). Reconstruct each sentence the way a reader sees it on the page.
- type: "contract" only if the document is a contract between two parties; otherwise "quote".
- number: the quote/contract number as printed (e.g. HD-SPA-2026-001). date: YYYY-MM-DD (dates are usually DD / MM / YYYY). validDays: validity in days as a number.
- title/subtitle: the document's main title and the line under it (e.g. "موقع سبا متكامل" / "مع الدفع الإلكتروني"). intro: the short descriptive sentence under the title, if any.
- sections: every priced line item in order. price is a plain number in SAR (6,350 -> 6350), qty 1 unless stated. desc is the item's short description; note is a short qualifier like "اشتراك سنوي يُدفع مع الموقع"; features are its bullet points; tags are small labels/logos shown on it (e.g. مدى, Visa, Mastercard, Apple Pay).
- Do not add the summary/total table as sections; it is recomputed from the sections.
- recurring: lines about renewals or recurring fees (e.g. "تجديد الدعم الفني من السنة الثانية: 3,750 ريال سنوياً").
- duration: the delivery time sentence if stated (e.g. "من 21 إلى 30 يوم عمل من استلام المحتوى والدفعة الأولى").
- terms: each term/condition/clause as its own string, without its number.
- annex: if a file describes features/specifications, turn each numbered section into one annex entry: title, intro sentence, and points (one string per feature, written as "العنوان: الوصف" when the feature has a heading). Include table rows as points too ("القسم: الاستخدام").
- client: the customer's details if printed; leave empty otherwise. Never put the developer's own details in client.`;

export async function POST(req) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: "أضف ANTHROPIC_API_KEY في Vercel لتفعيل الاستيراد من PDF." }, { status: 503 });

  const b = await req.json().catch(() => ({}));
  const files = (Array.isArray(b.files) ? b.files : []).filter((f) => typeof f?.data === "string" && f.data).slice(0, 4);
  if (!files.length) return NextResponse.json({ error: "اختر ملف PDF" }, { status: 400 });
  if (files.reduce((s, f) => s + f.data.length * 0.75, 0) > MAX_TOTAL)
    return NextResponse.json({ error: "حجم الملفات كبير، الحد 3MB للملفات مجتمعة" }, { status: 413 });

  const content = [
    ...files.map((f) => ({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: f.data.replace(/^data:[^,]*,/, "").replace(/\s/g, "") },
      title: String(f.name || "document.pdf").slice(0, 120),
    })),
    { type: "text", text: "Fill the builder fields from these files." },
  ];

  const client = new Anthropic();
  let res;
  try {
    res = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content }],
    });
  } catch (e) {
    console.error("PDF import failed", e);
    const msg =
      e instanceof Anthropic.AuthenticationError
        ? "مفتاح ANTHROPIC_API_KEY غير صحيح"
        : e instanceof Anthropic.RateLimitError
          ? "ضغط على الخدمة، حاول بعد دقيقة"
          : e instanceof Anthropic.BadRequestError
            ? "تعذرت قراءة الملف، تأكد أنه PDF سليم"
            : "تعذر الاستيراد حالياً، حاول مرة أخرى";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  if (res.stop_reason === "refusal") return NextResponse.json({ error: "تعذرت قراءة هذا الملف" }, { status: 422 });
  if (res.stop_reason === "max_tokens") return NextResponse.json({ error: "الملف طويل جداً، جرّب ملفاً واحداً في كل مرة" }, { status: 422 });

  const text = res.content.find((x) => x.type === "text")?.text || "";
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "تعذر فهم محتوى الملف" }, { status: 422 });
  }
  return NextResponse.json({ doc: cleanDoc(parsed) });
}
