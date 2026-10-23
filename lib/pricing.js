import { getContent } from "./content";
import { listDocs, totals, createDoc, cleanDoc } from "./docs";
import { obj, arr, S, N, oneOf } from "./ai";

// مرجع الأسعار: الباقات والإضافات في الموقع + العروض والعقود السابقة (لاقتراح سعر لا يبتعد عنها كثيراً)
export async function pricingReference(c) {
  const content = c || (await getContent());
  const docs = await listDocs().catch(() => []);
  return {
    packages: (content.packages || []).map((p) => ({ name: p.name, price: `${p.pricePrefix || ""} ${p.price} ${p.unit || ""}`.trim(), desc: p.desc, features: p.features })),
    addons: (content.addons || []).map((a) => ({ title: a.title, price: a.price, desc: a.desc })),
    pastDocs: docs
      .filter((d) => ["accepted", "sent"].includes(d.status) && d.sections?.length)
      .slice(0, 25)
      .map((d) => ({
        number: d.number, status: d.status, type: d.type, title: d.title, date: d.date, total: totals(d).total,
        sections: d.sections.map((s) => ({ title: s.title, qty: s.qty, price: s.price })),
      })),
    vatRate: Number(content.contracts?.vatRate) || 0,
  };
}

export const PRICING_RULES = `Pricing rules for this developer:
- The published offer is in SAR ranges. Subscription is the recommended option: setup 2000-3000 once, then 300-500 per month without apps or 700-1000 with apps, and two months free on annual billing. Purchase: store 12000-18000, or 20000-30000 with iOS and Android apps, then 1-2 months of free bug-fix support and maintenance at 500-800 per month.
- A line price is the start of a published range, and the note must keep the full range. Do not collapse a range into a single undocumented number.
- Bug fixes mean defects in what was delivered. New feature requests are quoted and paid separately.
- Do not promise a fixed number of days for building the store. Delivery is fast and depends on the client providing content on time.
- Payment gateways (Moyasar, Tabby, Tamara, Al Rajhi, cash on delivery), shipping carriers (Aramex, SMSA, OTO, Torod, Saudi Post), ZATCA e-invoice QR, and the iOS and Android apps are part of the platform. Push notifications are included with the apps at delivery. The customer can track where an order is and who has it. The merchant dashboard includes live order status and location tracking.
- Do not claim an accounting system, AI banner generation, or AI import.
- App Store and Google Play publishing depends on store review, usually about one to two weeks, and needs the client's developer accounts (Apple annual fee, Google one-time fee).
- Prices are plain numbers in SAR.`;

// مخطط وثيقة يبنيها الذكاء الاصطناعي (عرض سعر، عقد، أو مقترح مشروع)
export const DOC_SCHEMA = obj({
  type: oneOf(["quote", "contract", "proposal", "invoice"]),
  title: S,
  subtitle: S,
  intro: S,
  client: obj({ name: S, company: S, phone: S, email: S, city: S }),
  sections: arr(obj({ title: S, desc: S, qty: N, price: N, note: S, features: arr(S), tags: arr(S) })),
  duration: S,
  recurring: arr(S),
  annex: arr(obj({ title: S, intro: S, points: arr(S) })),
  // مدة العقد وتاريخ استحقاق الفاتورة (YYYY-MM-DD أو "")
  period: obj({ start: S, end: S }),
  dueDate: S,
  ref: S,
});

// ينشئ مسودة وثيقة (لا تُرسل للعميل حتى تراجعها وتغيّر حالتها)
export async function createDraftDoc(data, c) {
  const content = c || (await getContent());
  const k = content.contracts || {};
  const type = ["quote", "contract", "proposal", "invoice"].includes(data.type) ? data.type : "quote";
  const terms = type === "contract" ? k.contractTerms : type === "quote" ? k.quoteTerms : type === "invoice" ? ["يُرجى سداد المبلغ بالتحويل البنكي قبل تاريخ الاستحقاق."] : [];
  const due = new Date(Date.now() + (3 * 3600 + 7 * 86400) * 1000).toISOString().slice(0, 10);
  const doc = cleanDoc({
    ...data,
    type,
    number: "",
    validDays: type === "quote" ? Number(k.validDays) || 15 : 0,
    vatRate: type === "invoice" ? 0 : Number(k.vatRate) || 0,
    dueDate: type === "invoice" ? data.dueDate || due : "",
    terms: data.terms?.length ? data.terms : terms || [],
    status: "draft",
  });
  return createDoc(doc);
}
