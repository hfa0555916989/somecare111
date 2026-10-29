import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { askJson, aiError, aiEnabled, obj, arr, S, oneOf } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// الذكاء الاصطناعي لا يكتب أسعاراً: يصف فكرة العميل، ويختار الباقة إن لم تُختر، ويذكر ما يخرج عن الباقة ليسعّره المالك
const schema = (names) =>
  obj({
    pkg: oneOf(["", ...names]),
    title: S,
    subtitle: S,
    intro: S,
    annex: arr(obj({ title: S, intro: S, points: arr(S) })),
    extras: arr(S),
  });

const SYSTEM = `You help a Saudi freelance web/app developer turn a client's idea into a price quote (عرض سعر). The idea may be written in Saudi dialect.

Prices are FIXED and come from the developer's published packages. You never write, suggest or change a price.

Fields shown to the client (formal, clear Arabic):
- title: a short title for this client's project. subtitle: one line describing the idea. intro: 1-2 sentences for the client.
- annex: sections that explain the client's idea in detail (screens, roles, flows), points written as "العنوان: الوصف".

Fields for the developer only:
- pkg: see the task below.
- extras: features the idea asks for that the package does not cover, one short Arabic line each, so the developer can price them himself. [] if none.

Rules:
- Only describe what the idea implies. Do not invent client details or promise things the idea does not ask for. Keep it realistic for a solo developer.
- Never write instructions to the developer (like "احذف" or "عدّل قبل الإرسال") in the client fields.
- Do not write prices, payment, support or maintenance terms; the quote has its own sections for them.`;

const WITH_BASE = `The quote already contains the package below. Set pkg to "". Describe the client's project on top of it, annex: 1-4 sections about the client's own features, and list in extras only what the package does not already cover.`;

const PICK = `No package is chosen yet. Set pkg to the ONE published package that best fits the idea (website only, app only, website + app, website + customer app + provider app, store subscription or store purchase...). Use "" only if none fits at all. annex: 2-5 sections describing the features in detail. extras: what the chosen package does not cover.`;

export async function POST(req) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!aiEnabled()) return NextResponse.json({ error: "أضف ANTHROPIC_API_KEY في Vercel لتوليد العرض بالذكاء الاصطناعي." }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const idea = String(b.idea || "").trim().slice(0, 6000);
  if (!idea) return NextResponse.json({ error: "اكتب فكرة العميل أولاً" }, { status: 400 });
  const base = (Array.isArray(b.sections) ? b.sections : []).slice(0, 30).map((s) => ({ title: String(s?.title || ""), features: (Array.isArray(s?.features) ? s.features : []).slice(0, 60) }));
  try {
    const content = await getContent();
    const packages = (content.packages || [])
      .filter((p) => p?.name)
      .map((p) => ({ name: String(p.name).trim(), group: p.label || "", price: `${p.pricePrefix || ""} ${p.price} ${p.unit || ""}`.trim(), desc: p.desc || "", features: p.features || [] }));
    const out = await askJson({
      system: SYSTEM,
      content: `Published packages:\n${JSON.stringify(packages)}\n\n${base.length ? `${WITH_BASE}\n\nPackage in the quote:\n${JSON.stringify(base)}` : PICK}\n\nClient: ${String(b.client || "").slice(0, 120) || "(not stated)"}\nIdea:\n${idea}`,
      schema: schema(packages.map((p) => p.name)),
      effort: "high",
    });
    return NextResponse.json({ out: { ...out, pkg: base.length ? "" : out.pkg } });
  } catch (e) {
    const { msg, status } = aiError(e);
    return NextResponse.json({ error: msg }, { status });
  }
}
