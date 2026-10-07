import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { listIdeas, saveIdea, deleteIdea, IDEA_STATUS } from "@/lib/ideas";
import { pricingReference, PRICING_RULES, DOC_SCHEMA, createDraftDoc } from "@/lib/pricing";
import { askJson, aiError, aiEnabled } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const deny = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });
const fail = (e) => NextResponse.json({ error: e.message === "DB_NOT_CONNECTED" ? "قاعدة البيانات غير مربوطة." : "تعذر الحفظ" }, { status: 500 });

const AS = {
  proposal: "a short initial project proposal (مقترح مبدئي): type proposal, no prices (sections empty). Title, subtitle, a persuasive intro, and annex with 2-4 sections: the idea, how it will work for the client, main features, next steps.",
  requirements: "a full requirements document (وثيقة متطلبات): type proposal, no prices (sections empty). Detailed annex: goals, users and roles, pages/screens, features (one point each, written as 'العنوان: الوصف'), integrations (payment, maps, SMS...), content needed from the client, and delivery phases.",
  quote: "a priced quote (عرض سعر): type quote. Split the work into priced sections with features, following the pricing rules. Add recurring yearly fees (hosting, support) when relevant and a realistic duration. Add an annex describing the features in detail.",
};

const SYSTEM = `You turn a client's project idea (written or dictated by a Saudi freelance web/app developer, possibly in Saudi dialect) into a professional Arabic business document that will be sent to the client.

${PRICING_RULES}

Rules:
- Formal, clear Arabic for the client. Do not invent the client's personal details; use only what the idea text states (client fields empty otherwise).
- Do not promise things the idea does not imply. Keep it realistic for a solo freelance developer.
- Never put the developer's own details in client.`;

export async function GET() {
  if (!isAuthed()) return deny();
  return NextResponse.json({ items: await listIdeas(), statuses: IDEA_STATUS, ai: aiEnabled() });
}

export async function POST(req) {
  if (!isAuthed()) return deny();
  const b = await req.json().catch(() => ({}));
  if (b.action !== "draft") {
    try {
      return NextResponse.json({ item: await saveIdea(null, b) });
    } catch (e) {
      return fail(e);
    }
  }

  // تحويل الفكرة إلى وثيقة (مسودة في «العقود وعروض الأسعار»)
  if (!aiEnabled()) return NextResponse.json({ error: "أضف ANTHROPIC_API_KEY في Vercel." }, { status: 503 });
  const idea = (await listIdeas()).find((x) => x.id === b.id);
  if (!idea) return NextResponse.json({ error: "الفكرة غير موجودة" }, { status: 404 });
  const as = AS[b.as] ? b.as : "proposal";
  try {
    const c = await getContent();
    const ref = as === "quote" ? await pricingReference(c) : null;
    const out = await askJson({
      system: SYSTEM,
      content: `${ref ? `Pricing reference:\n${JSON.stringify(ref)}\n\n` : ""}Write ${AS[as]}\n\nClient: ${idea.client || "(not stated)"}\nIdea title: ${idea.title}\nIdea:\n${idea.text}`,
      schema: DOC_SCHEMA,
      effort: as === "quote" ? "high" : "medium",
    });
    const doc = await createDraftDoc({ ...out, type: as === "quote" ? "quote" : "proposal", client: { ...out.client, name: out.client?.name || idea.client, phone: out.client?.phone || idea.phone } }, c);
    const item = await saveIdea(idea.id, { status: "drafted" }, { docs: [...(idea.docs || []), { id: doc.id, number: doc.number, as }] });
    return NextResponse.json({ item, doc: { id: doc.id, number: doc.number } });
  } catch (e) {
    if (e.message === "DB_NOT_CONNECTED") return fail(e);
    const { msg, status } = aiError(e);
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function PUT(req) {
  if (!isAuthed()) return deny();
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ error: "id" }, { status: 400 });
  try {
    const item = await saveIdea(String(b.id), b);
    return item ? NextResponse.json({ item }) : NextResponse.json({ error: "غير موجود" }, { status: 404 });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req) {
  if (!isAuthed()) return deny();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  try {
    await deleteIdea(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
