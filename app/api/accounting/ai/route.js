import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAuthed } from "@/lib/auth";
import { listDocs, totals } from "@/lib/docs";
import { listEntries, getSettings } from "@/lib/accounting";
import {
  KINDS, INCOME_CATS, EXPENSE_CATS, FUNDING_SOURCES, WITHDRAW_REASONS, CHANNELS, AD_CHANNELS,
  cleanEntry, summarize, periodRange, receivables, riyadhToday,
} from "@/lib/finance";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// حدود Vercel لحجم الطلب ~4.5MB، والملفات تُرسل base64 (أكبر بالثلث)
const MAX_FILE = 3 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const S = { type: "string" };
const N = { type: "number" };
const arr = (items) => ({ type: "array", items });
const obj = (properties) => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });
const ALL_CATS = [...new Set([...Object.keys(INCOME_CATS), ...Object.keys(EXPENSE_CATS), ...Object.keys(FUNDING_SOURCES), ...Object.keys(WITHDRAW_REASONS)])];

const PARSE_SCHEMA = obj({
  entries: arr(
    obj({
      kind: { type: "string", enum: Object.keys(KINDS) },
      cat: { type: "string", enum: ALL_CATS },
      amount: N,
      date: S,
      note: S,
      client: S,
      channel: { type: "string", enum: ["", ...Object.keys(CHANNELS)] },
      docRef: S,
    })
  ),
  reply: S,
});

const ANALYZE_SCHEMA = obj({
  headline: S,
  health: { type: "string", enum: ["good", "warning", "critical"] },
  answer: S,
  insights: arr(S),
  warnings: arr(S),
  actions: arr(S),
  reinvest: obj({ amount: N, reason: S }),
  budgetPlan: arr(obj({ item: S, amount: N, why: S })),
});

const list = (o) => Object.entries(o).map(([k, v]) => `${k} = ${v}`).join("; ");

const PARSE_SYSTEM = `You are the bookkeeping assistant of a Saudi freelance web/app developer ("المطوّر حسن"). Convert what the user writes (Arabic or English, possibly Saudi dialect) and/or an attached receipt, invoice or bank SMS screenshot into accounting entries. Amounts are in SAR.

Entry kinds:
- income: money received from a client. cat: ${list(INCOME_CATS)}
- expense: money the business spent. cat: ${list(EXPENSE_CATS)}
- funding: money put INTO the project budget. cat: ${list(FUNDING_SOURCES)}. Moving profit back into the budget ("رجعت/حطيت من الأرباح في الميزانية", "إعادة تمويل") is funding with cat reinvest.
- withdraw: money taken OUT of the profits for the owner or to repay someone. cat: ${list(WITHDRAW_REASONS)}

channel:
- For an ads expense (cat ads), the ad platform: ${list(AD_CHANNELS)}.
- For income, where the client came from if stated: ${list(CHANNELS)}.
- Otherwise "".

Rules:
- One entry per distinct amount. A receipt with several lines for the same purchase is one entry with the total (including VAT).
- date: YYYY-MM-DD. Today is {TODAY} (Asia/Riyadh). Resolve "أمس", "الأسبوع الماضي", "1/9" etc. relative to today; default to today.
- note: a short Arabic description (e.g. "اشتراك Vercel Pro لشهر أكتوبر"). client: the client's name for income, else "". docRef: a quote/contract number like HD-2026-001 if mentioned, else "".
- Never invent amounts. If no amount can be determined, return no entries and explain in reply.
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

function claudeError(e) {
  console.error("Accounting AI failed", e);
  return e instanceof Anthropic.AuthenticationError
    ? "مفتاح ANTHROPIC_API_KEY غير صحيح"
    : e instanceof Anthropic.RateLimitError
      ? "ضغط على الخدمة، حاول بعد دقيقة"
      : e instanceof Anthropic.BadRequestError
        ? "تعذرت قراءة الطلب، تأكد أن الملف صورة أو PDF سليم"
        : "تعذر التحليل حالياً، حاول مرة أخرى";
}

async function ask(system, content, schema) {
  const client = new Anthropic();
  const res = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    output_config: { effort: "medium", format: { type: "json_schema", schema } },
    messages: [{ role: "user", content }],
  });
  if (res.stop_reason === "refusal") throw new Error("REFUSAL");
  if (res.stop_reason === "max_tokens") throw new Error("TOO_LONG");
  return JSON.parse(res.content.find((x) => x.type === "text")?.text || "");
}

// ملخص مختصر للبيانات يُرسل للتحليل (أرقام مجمّعة + آخر العمليات، بدون بيانات العملاء الشخصية)
async function context() {
  const [entries, settings, docs] = await Promise.all([listEntries(), getSettings(), listDocs()]);
  const today = riyadhToday();
  const pick = (s) => ({
    income: s.income, expenses: s.expense, adSpend: s.ads, netProfit: s.net, margin: s.margin,
    adIncome: s.adIncome, roas: s.roas,
    expenseByItem: s.expenseByCat.map(([k, v]) => ({ item: EXPENSE_CATS[k] || k, amount: v })),
    incomeByType: s.incomeByCat.map(([k, v]) => ({ type: INCOME_CATS[k] || k, amount: v })),
    incomeBySource: s.incomeByChannel.map(([k, v]) => ({ source: CHANNELS[k] || k, amount: v })),
    adPlatforms: s.platforms.map((p) => ({ platform: AD_CHANNELS[p.key] || "غير محدد", spend: p.spend, clientIncome: p.revenue, roas: p.roas })),
  });
  const all = summarize(entries, [null, null], settings, today);
  const accepted = receivables(
    docs.filter((d) => d.status === "accepted").map((d) => ({ number: d.number, total: totals(d).total })),
    entries
  ).filter((d) => d.due > 0);
  return {
    today,
    settings: { reinvestPct: settings.reinvestPct, monthlyBudgetTarget: settings.monthlyBudget || null, monthlyAdsBudget: settings.adsBudget || null },
    balances: {
      budgetBalance: all.budget, availableProfits: all.profits, totalCash: all.cash,
      totalFunding: all.fundingTotal, externalFunding: all.external, reinvestedFromProfits: all.reinvested, withdrawn: all.withdrawn,
      fundingBySource: all.fundingBySource.map(([k, v]) => ({ source: FUNDING_SOURCES[k] || k, amount: v })),
      suggestedReinvestByFormula: all.suggestReinvest,
    },
    thisMonth: pick(summarize(entries, periodRange("month", today), settings, today)),
    lastMonth: pick(summarize(entries, periodRange("last", today), settings, today)),
    last3Months: pick(summarize(entries, periodRange("quarter", today), settings, today)),
    thisYear: pick(summarize(entries, periodRange("year", today), settings, today)),
    allTime: pick(all),
    monthly: all.months,
    receivables: { count: accepted.length, totalDue: accepted.reduce((s, d) => s + d.due, 0) },
    recentEntries: entries.slice(0, 40).map((e) => ({
      date: e.date, kind: KINDS[e.kind], item: { income: INCOME_CATS, expense: EXPENSE_CATS, funding: FUNDING_SOURCES, withdraw: WITHDRAW_REASONS }[e.kind]?.[e.cat] || e.cat,
      amount: e.amount, note: e.note, channel: CHANNELS[e.channel] || "",
    })),
  };
}

export async function POST(req) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: "أضف ANTHROPIC_API_KEY في Vercel لتفعيل المحاسب الذكي." }, { status: 503 });

  const b = await req.json().catch(() => ({}));
  const text = String(b.text || "").trim().slice(0, 4000);

  try {
    if (b.mode === "analyze") {
      const data = await context();
      const content = `Bookkeeping data:\n${JSON.stringify(data)}\n\n${text ? `Owner's question: ${text}` : "No specific question; give the general analysis."}`;
      return NextResponse.json({ analysis: await ask(ANALYZE_SYSTEM, content, ANALYZE_SCHEMA) });
    }

    // قراءة عملية من نص أو صورة فاتورة / إيصال
    const f = b.file && typeof b.file.data === "string" ? b.file : null;
    if (!text && !f) return NextResponse.json({ error: "اكتب العملية أو اختر صورة الفاتورة" }, { status: 400 });
    const content = [];
    if (f) {
      const data = f.data.replace(/^data:[^,]*,/, "").replace(/\s/g, "");
      if (data.length * 0.75 > MAX_FILE) return NextResponse.json({ error: "حجم الملف كبير، الحد 3MB" }, { status: 413 });
      if (f.type === "application/pdf") content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data } });
      else if (IMAGE_TYPES.includes(f.type)) content.push({ type: "image", source: { type: "base64", media_type: f.type, data } });
      else return NextResponse.json({ error: "الملف يجب أن يكون صورة (JPG / PNG) أو PDF" }, { status: 400 });
    }
    content.push({ type: "text", text: text || "Record the entries from this attachment." });
    const out = await ask(PARSE_SYSTEM.replace("{TODAY}", riyadhToday()), content, PARSE_SCHEMA);
    const entries = (out.entries || []).slice(0, 20).map(cleanEntry).filter((e) => e.amount > 0);
    return NextResponse.json({ entries, reply: String(out.reply || "") });
  } catch (e) {
    if (e.message === "REFUSAL") return NextResponse.json({ error: "تعذرت معالجة هذا الطلب" }, { status: 422 });
    if (e.message === "TOO_LONG") return NextResponse.json({ error: "الطلب طويل جداً، جرّب جزءاً أصغر" }, { status: 422 });
    if (e instanceof SyntaxError) return NextResponse.json({ error: "تعذر فهم الرد، حاول مرة أخرى" }, { status: 422 });
    return NextResponse.json({ error: claudeError(e) }, { status: 502 });
  }
}
