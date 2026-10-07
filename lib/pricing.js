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
- Base every price on the reference: the published packages and add-ons on the website, and past quotes/contracts (accepted ones weigh more).
- A comparable scope should stay within about ±20% of the matching package or past accepted price. Only go beyond that when the scope clearly differs, and say why.
- Never price far below the cheapest comparable package, and never far above the most expensive comparable one, without a clear scope reason.
- Prices are plain numbers in SAR.`;

// مخطط وثيقة يبنيها الذكاء الاصطناعي (عرض سعر، عقد، أو مقترح مشروع)
export const DOC_SCHEMA = obj({
  type: oneOf(["quote", "contract", "proposal"]),
  title: S,
  subtitle: S,
  intro: S,
  client: obj({ name: S, company: S, phone: S, email: S, city: S }),
  sections: arr(obj({ title: S, desc: S, qty: N, price: N, note: S, features: arr(S), tags: arr(S) })),
  duration: S,
  recurring: arr(S),
  annex: arr(obj({ title: S, intro: S, points: arr(S) })),
});

// ينشئ مسودة وثيقة (لا تُرسل للعميل حتى تراجعها وتغيّر حالتها)
export async function createDraftDoc(data, c) {
  const content = c || (await getContent());
  const k = content.contracts || {};
  const type = ["quote", "contract", "proposal"].includes(data.type) ? data.type : "quote";
  const terms = type === "contract" ? k.contractTerms : type === "quote" ? k.quoteTerms : [];
  const doc = cleanDoc({
    ...data,
    type,
    number: "",
    validDays: type === "quote" ? Number(k.validDays) || 15 : 0,
    vatRate: Number(k.vatRate) || 0,
    terms: data.terms?.length ? data.terms : terms || [],
    status: "draft",
  });
  return createDoc(doc);
}
