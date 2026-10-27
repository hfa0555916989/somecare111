import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { pricingReference, PRICING_RULES } from "@/lib/pricing";
import { askJson, aiError, aiEnabled, obj, arr, S, N } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const SCHEMA = obj({
  title: S,
  subtitle: S,
  intro: S,
  sections: arr(obj({ title: S, desc: S, qty: N, price: N, note: S, features: arr(S), tags: arr(S) })),
  annex: arr(obj({ title: S, intro: S, points: arr(S) })),
});

const SYSTEM = `You help a Saudi freelance web/app developer write a price quote (عرض سعر) from the client's idea. The idea may be written in Saudi dialect. Everything you write is shown to the client, in formal, clear Arabic.

${PRICING_RULES}

Rules:
- Only describe what the idea implies. Do not invent client details or promise things the idea does not ask for. Keep it realistic for a solo developer.
- Never write instructions to the developer (like "احذف" or "عدّل قبل الإرسال") in any field.
- Do not write support or maintenance terms; the quote has its own support section.
- features: one short line each. annex points: written as "العنوان: الوصف".
- Prices are plain numbers in SAR. note is a short qualifier for the client (e.g. "يُدفع مرة واحدة").`;

const WITH_BASE = `The quote already contains the package below. Add ONLY the extra priced line items the idea needs beyond it (custom features, integrations, special pages). Do not repeat anything the package already covers, and return no sections if nothing extra is needed. New features are priced separately, so price each extra item on its own. title: a short title for this client's project. subtitle: one line describing the idea. intro: 1-2 sentences for the client. annex: 1-4 sections that explain the client's custom features in detail.`;

const CUSTOM = `There is no package; this is a custom project. Split the work into priced line items with their features. Use the pricing reference so the total is not far from similar packages and past deals. title, subtitle and intro describe the project for the client. annex: 2-5 sections that describe the features in detail.`;

export async function POST(req) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!aiEnabled()) return NextResponse.json({ error: "أضف ANTHROPIC_API_KEY في Vercel لتوليد العرض بالذكاء الاصطناعي." }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const idea = String(b.idea || "").trim().slice(0, 6000);
  if (!idea) return NextResponse.json({ error: "اكتب فكرة العميل أولاً" }, { status: 400 });
  const base = (Array.isArray(b.sections) ? b.sections : []).slice(0, 30).map((s) => ({ title: String(s?.title || ""), price: Number(s?.price) || 0, features: (Array.isArray(s?.features) ? s.features : []).slice(0, 60) }));
  try {
    const ref = await pricingReference();
    const out = await askJson({
      system: SYSTEM,
      content: `Pricing reference:\n${JSON.stringify(ref)}\n\n${base.length ? `${WITH_BASE}\n\nPackage in the quote:\n${JSON.stringify(base)}` : CUSTOM}\n\nClient: ${String(b.client || "").slice(0, 120) || "(not stated)"}\nIdea:\n${idea}`,
      schema: SCHEMA,
      effort: "high",
    });
    return NextResponse.json({ out });
  } catch (e) {
    const { msg, status } = aiError(e);
    return NextResponse.json({ error: msg }, { status });
  }
}
