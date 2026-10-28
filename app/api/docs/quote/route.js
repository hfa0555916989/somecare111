import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { cleanDoc } from "@/lib/docs";
import { priceCatalog } from "@/lib/pricing";
import { askJson, aiError, aiEnabled, obj, arr, S, N, B, oneOf } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// الذكاء الاصطناعي يختار البنود من الكتالوج ويكتب وصف فكرة العميل فقط، والأسعار تُؤخذ من الكتالوج في الخادم
const SCHEMA = obj({
  reply: S,
  ready: B,
  quote: obj({
    title: S,
    subtitle: S,
    intro: S,
    client: obj({ name: S, company: S, phone: S, email: S, city: S }),
    items: arr(obj({ id: S, qty: N, desc: S, features: arr(S), note: S })),
    supportId: S,
    supportMonths: N,
    discount: N,
    discountType: oneOf(["amount", "percent"]),
    duration: S,
    annex: arr(obj({ title: S, intro: S, points: arr(S) })),
    gaps: arr(S),
  }),
});

const SYSTEM = `You help a Saudi freelance web/app developer (Hassan) turn a client's idea into a ready price quote. Hassan chats with you about the idea; every reply you return the full current quote.

Prices are FIXED. You never write a price. You only pick items from the catalog below by id, and the system fills in their prices exactly as published on Hassan's website.

Catalog kinds:
- package: a main package. Usually one per quote (the one that matches the idea: website only, app only, website + app, website + client app + provider app, store...). qty is always 1.
- addon: an optional add-on (payment gateway, shipping company...). qty is how many (e.g. 2 shipping companies); 1 if not stated.
- monthly: monthly technical support. Never put it in items. If Hassan wants support in the quote, set supportId to the matching one (website support for websites, app support when the quote has an app) and supportMonths to the number of months (12 for "سنة"). Otherwise supportId "" and supportMonths 0. Ask him whether to include support when the quote is otherwise ready and he has not said.

How to work:
- reply: Arabic, short and friendly, Saudi professional tone. Discuss the idea like a partner: ask the few questions that decide the package (website, app, or both? is there a service provider/driver/technician who needs his own app? how many products for a store? online payment? shipping?). Ask at most 2-3 questions at a time. When the quote is ready, say which package and add-ons you chose and why in one or two lines.
- items: the chosen catalog ids. desc (one sentence) and features (4-8 bullets) describe what THIS client gets, in the client's own context (e.g. "تطبيق لحجز مواعيد الصالون مع تذكير قبل الموعد"). Do not repeat the package price or terms. note: a short qualifier or "".
- title / subtitle / intro: the client's project in Arabic (e.g. "منصة حجز صالون نسائي" / "موقع وتطبيق مع الدفع الإلكتروني"). intro: 1-2 sentences.
- annex: optional technical annex describing the client's idea in more detail (screens, roles, flows). Keep it practical. [] if the idea is still vague.
- client: only details Hassan gave you; "" otherwise.
- discount: 0 and "amount", unless Hassan explicitly states a discount in the chat (e.g. "خصم 10%" -> 10 percent, "خصم 500" -> 500 amount). Never offer a discount yourself.
- duration: only if Hassan stated the delivery time; "" otherwise.
- gaps: requested features that no catalog item covers, so Hassan can price them himself (Arabic, one line each). Never add them as items and never guess their price.
- ready: true once there is a main package and nothing important is still unclear.
- Payment terms, validity, VAT and contract terms are fixed by the system: never write them.
- If Hassan asks about prices, answer only with catalog prices.`;

const str = (v, max) => String(v ?? "").trim().slice(0, max);

export async function POST(req) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!aiEnabled()) return NextResponse.json({ error: "أضف ANTHROPIC_API_KEY في Vercel لتفعيل عرض السعر بالذكاء الاصطناعي." }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const history = (Array.isArray(b.messages) ? b.messages : [])
    .filter((m) => ["user", "assistant"].includes(m?.role) && str(m.content, 4000))
    .slice(-30)
    .map((m) => ({ role: m.role, content: str(m.content, 4000) }));
  // المحادثة تبدأ وتنتهي برسالة من المالك
  while (history.length && history[0].role !== "user") history.shift();
  if (!history.length || history[history.length - 1].role !== "user") return NextResponse.json({ error: "اكتب فكرة العميل أولاً" }, { status: 400 });

  try {
    const content = await getContent();
    const catalog = priceCatalog(content);
    if (!catalog.some((x) => x.kind === "package")) return NextResponse.json({ error: "لا توجد باقات بأسعار في تبويب «الباقات والأسعار»." }, { status: 400 });
    const last = history[history.length - 1];
    const draft = b.draft && typeof b.draft === "object" ? JSON.stringify(b.draft).slice(0, 12000) : "";
    const messages = [
      ...history.slice(0, -1),
      { role: "user", content: `${last.content}${draft ? `\n\n---\nالمسودة الحالية (من ردك السابق):\n${draft}` : ""}` },
    ];
    const system = `${SYSTEM}\n\nCatalog (id, kind, name, published price, description, features):\n${JSON.stringify(catalog.map(({ price, ...x }) => x))}`;
    const out = await askJson({ system, messages, schema: SCHEMA });
    return NextResponse.json({ reply: out.reply, ready: out.ready, draft: out.quote, ...buildQuote(out.quote, catalog) });
  } catch (e) {
    const { msg, status } = aiError(e);
    return NextResponse.json({ error: msg }, { status });
  }
}

// يبني بنود العرض بأسعار الكتالوج (أي معرّف غير موجود في الكتالوج يُتجاهل)
function buildQuote(q, catalog) {
  const byId = Object.fromEntries(catalog.map((x) => [x.id, x]));
  const sections = (q.items || [])
    .map((it) => {
      const x = byId[it.id];
      if (!x || x.kind === "monthly") return null;
      return {
        title: x.name,
        desc: str(it.desc, 400) || x.desc,
        qty: x.kind === "package" ? 1 : Math.max(1, Math.round(Number(it.qty) || 1)),
        price: x.price,
        note: str(it.note, 160),
        features: (it.features?.length ? it.features : x.features).map((f) => str(f, 300)).filter(Boolean),
        tags: [],
      };
    })
    .filter(Boolean);
  const sup = byId[q.supportId];
  const months = Math.max(0, Math.min(60, Math.round(Number(q.supportMonths) || 0)));
  const doc = cleanDoc({
    type: "quote",
    title: q.title,
    subtitle: q.subtitle,
    intro: q.intro,
    client: q.client,
    sections,
    discount: q.discount,
    discountType: q.discountType,
    duration: q.duration,
    annex: q.annex,
  });
  return {
    doc: { title: doc.title, subtitle: doc.subtitle, intro: doc.intro, client: doc.client, sections: doc.sections, discount: doc.discount, discountType: doc.discountType, duration: doc.duration, annex: doc.annex },
    support: sup?.kind === "monthly" && months ? { months, monthly: sup.price, name: sup.name } : null,
    gaps: (q.gaps || []).map((g) => str(g, 300)).filter(Boolean),
  };
}
