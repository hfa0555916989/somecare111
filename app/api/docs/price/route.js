import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { cleanDoc } from "@/lib/docs";
import { pricingReference, PRICING_RULES } from "@/lib/pricing";
import { askJson, aiError, aiEnabled, obj, arr, S, N, oneOf } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const SCHEMA = obj({
  verdict: oneOf(["fair", "low", "high", "mixed"]),
  summary: S,
  total: obj({ suggested: N, min: N, max: N }),
  sections: arr(obj({ index: N, suggested: N, min: N, max: N, why: S })),
  notes: arr(S),
});

const SYSTEM = `You are the pricing advisor of a Saudi freelance web/app developer. You receive a draft quote/contract (its line items) and a pricing reference (website packages, add-ons, and past quotes/contracts). Suggest a fair price for each line item and for the total, in SAR.

${PRICING_RULES}

Output (Arabic text):
- verdict: fair if the current prices are within the healthy range, low / high if mostly below / above, mixed otherwise.
- summary: 1-2 sentences comparing the draft with the packages and past deals.
- sections: one entry per line item (index = its 0-based position) with suggested price, a healthy min-max range, and a short reason that names the package or past document it is based on.
- total: suggested total and range (before discount and VAT).
- notes: practical advice (items missing compared to similar past deals, recurring fees to add, etc.). Keep it short.`;

export async function POST(req) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!aiEnabled()) return NextResponse.json({ error: "أضف ANTHROPIC_API_KEY في Vercel لتفعيل مساعد التسعير." }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const d = cleanDoc(b.doc || {});
  if (!d.sections.length) return NextResponse.json({ error: "أضف بنداً واحداً على الأقل (العنوان والوصف) ثم اطلب الاقتراح" }, { status: 400 });
  try {
    const ref = await pricingReference();
    const draft = { type: d.type, title: d.title, subtitle: d.subtitle, intro: d.intro, duration: d.duration, sections: d.sections.map((s, i) => ({ index: i, title: s.title, desc: s.desc, qty: s.qty, price: s.price, features: s.features })) };
    const out = await askJson({ system: SYSTEM, content: `Pricing reference:\n${JSON.stringify(ref)}\n\nDraft:\n${JSON.stringify(draft)}`, schema: SCHEMA });
    return NextResponse.json({ advice: out });
  } catch (e) {
    const { msg, status } = aiError(e);
    return NextResponse.json({ error: msg }, { status });
  }
}
