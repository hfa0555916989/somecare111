import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { cleanEntry, riyadhToday } from "@/lib/finance";
import { financeContext } from "@/lib/finance-context";
import { askJson, aiError, aiEnabled, fileBlock, ENTRY_SCHEMA, ENTRY_RULES, obj, arr, S, N, oneOf } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// حدود Vercel لحجم الطلب ~4.5MB، والملفات تُرسل base64 (أكبر بالثلث)
const MAX_FILE = 3 * 1024 * 1024;

const PARSE_SCHEMA = obj({ entries: arr(ENTRY_SCHEMA), reply: S });

const ANALYZE_SCHEMA = obj({
  headline: S,
  health: oneOf(["good", "warning", "critical"]),
  answer: S,
  insights: arr(S),
  warnings: arr(S),
  actions: arr(S),
  reinvest: obj({ amount: N, reason: S }),
  budgetPlan: arr(obj({ item: S, amount: N, why: S })),
});

const PARSE_SYSTEM = `You are the bookkeeping assistant of a Saudi freelance web/app developer ("المطوّر حسن"). Convert what the user writes (Arabic or English, possibly Saudi dialect) and/or an attached receipt, invoice or bank SMS screenshot into accounting entries. Today is {TODAY} (Asia/Riyadh).

${ENTRY_RULES}
- If no amount can be determined, return no entries and explain in reply.
- reply: one short Arabic sentence summarizing what you understood, or what is missing.`;

const ANALYZE_SYSTEM = `You are the financial advisor of a Saudi freelance web/app developer. You receive the business's bookkeeping summary as JSON (amounts in SAR) and optionally a question. Write in clear, friendly Saudi-business Arabic.

How the books work:
- Income lands in the profits pot; expenses are paid from the budget pot.
- funding adds to the budget (personal capital, loan, partner, grant, or "reinvest" = profit moved back into the budget).
- withdraw takes money out of profits (owner draw, loan repayment, partner share).
- budget balance = all funding − all expenses. available profits = all income − reinvested − withdrawn. net profit = income − expenses.
- ROAS = income from clients who came through an ad platform ÷ ad spend on it.

Give a practical analysis:
- headline: one sentence on the overall state. health: good / warning / critical.
- answer: a direct answer to the question if one was asked, otherwise "".
- insights: 3-6 concrete observations with numbers (trends, biggest cost items, margin, best/worst ad platform, seasonality, receivables).
- warnings: real risks only (budget deficit, ads with no return, rising costs, unpaid receivables, depending on one client). Empty if none.
- actions: 3-6 specific next steps (what to cut, which platform to scale or stop, how much to reinvest, chasing receivables).
- reinvest: the amount to move from profits back into the budget now and why. Respect the owner's reinvestPct setting, cover any deficit first, never exceed available profits.
- budgetPlan: a suggested budget for next month by expense item (use the item names from the data, in Arabic), with a short reason each. Base it on actual spend and results.
Base everything on the data. If there is too little data, say so and keep the lists short. Do not invent numbers.`;

export async function POST(req) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!aiEnabled()) return NextResponse.json({ error: "أضف ANTHROPIC_API_KEY في Vercel لتفعيل المحاسب الذكي." }, { status: 503 });

  const b = await req.json().catch(() => ({}));
  const text = String(b.text || "").trim().slice(0, 4000);

  try {
    if (b.mode === "analyze") {
      const data = await financeContext();
      const content = `Bookkeeping data:
${JSON.stringify(data)}

${text ? `Owner's question: ${text}` : "No specific question; give the general analysis."}`;
      return NextResponse.json({ analysis: await askJson({ system: ANALYZE_SYSTEM, content, schema: ANALYZE_SCHEMA }) });
    }

    // قراءة عملية من نص أو صورة فاتورة / إيصال
    const f = b.file && typeof b.file.data === "string" ? b.file : null;
    if (!text && !f) return NextResponse.json({ error: "اكتب العملية أو اختر صورة الفاتورة" }, { status: 400 });
    const content = [];
    if (f) {
      if (f.data.length * 0.75 > MAX_FILE) return NextResponse.json({ error: "حجم الملف كبير، الحد 3MB" }, { status: 413 });
      const block = fileBlock(f.type, f.data);
      if (!block) return NextResponse.json({ error: "الملف يجب أن يكون صورة (JPG / PNG) أو PDF" }, { status: 400 });
      content.push(block);
    }
    content.push({ type: "text", text: text || "Record the entries from this attachment." });
    const out = await askJson({ system: PARSE_SYSTEM.replace("{TODAY}", riyadhToday()), content, schema: PARSE_SCHEMA });
    const entries = (out.entries || []).slice(0, 20).map(cleanEntry).filter((e) => e.amount > 0);
    return NextResponse.json({ entries, reply: String(out.reply || "") });
  } catch (e) {
    const { msg, status } = aiError(e);
    return NextResponse.json({ error: msg }, { status });
  }
}
