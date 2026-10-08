import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAuthed } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { listDocs, totals, TYPES } from "@/lib/docs";
import { listEntries, createEntries, updateEntry, deleteEntry, getSettings, saveSettings } from "@/lib/accounting";
import { financeContext } from "@/lib/finance-context";
import { cleanEntry, KINDS, CATS, CHANNELS, riyadhToday } from "@/lib/finance";
import { listProjects, PROJECT_STATUS } from "@/lib/projects";
import { listFiles, FILE_CATS } from "@/lib/storage";
import { listIdeas, saveIdea } from "@/lib/ideas";
import { pricingReference, PRICING_RULES, DOC_SCHEMA, createDraftDoc } from "@/lib/pricing";
import { MODEL, FALLBACK, aiEnabled, aiError, ENTRY_SCHEMA, ENTRY_RULES, obj, arr, S, N, oneOf } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// أقسام لوحة التحكم التي يستطيع المساعد فتحها
const SECTIONS = ["home", "accounting", "inquiries", "docs", "ideas", "projects", "archive", "assistant", "guide", "hero", "packages", "addons", "features", "about", "gallery", "video", "titles", "pages", "brand", "sizes", "theme", "contact", "social", "seo", "tracking"];

// بدون strict: مجموع مخططات الأدوات بصيغة strict يتجاوز الحد الذي يقبله Claude (compiled grammar too large)،
// ولذلك كل مدخلات الأدوات تُنظّف وتُتحقق منها في الخادم قبل التنفيذ (cleanEntry / cleanDoc ...)
const tool = (name, description, properties) => ({ name, description, input_schema: obj(properties) });

const TOOLS = [
  tool("get_finance_summary", "Bookkeeping summary: balances (budget pot, profits pot, cash), funding by source, this month / last month / 3 months / year / all-time figures, ad platforms ROAS, monthly table, receivables, latest entries.", {}),
  tool("search_entries", "Search accounting entries. Use empty strings for no filter. Dates are YYYY-MM-DD.", { query: S, kind: oneOf(["all", ...Object.keys(KINDS)]), from: S, to: S, limit: N }),
  tool("list_documents", "List quotes, contracts and proposals with status and totals.", { status: oneOf(["all", "draft", "sent", "accepted", "cancelled"]) }),
  tool("get_pricing_reference", "Website packages and add-ons with prices, and past quotes/contracts with their line items. Use before suggesting any price.", {}),
  tool("list_projects", "Client projects: status, domain, hosting, renewals, obligations (no secret keys).", {}),
  tool("list_files", "Archived files (contracts, invoices, receipts, bank documents...). Use empty strings / all for no filter.", { year: S, cat: oneOf(["all", ...Object.keys(FILE_CATS)]), query: S }),
  tool("list_ideas", "Saved client ideas.", {}),
  tool("open_section", "Open a section of the dashboard on the owner's screen (e.g. to show a report where it belongs). Runs immediately.", { section: oneOf(SECTIONS) }),
  tool("add_entries", "Record accounting entries. The owner confirms on screen before it runs.", { entries: arr(ENTRY_SCHEMA) }),
  tool("update_entry", "Correct an existing accounting entry by id. The owner confirms first.", { id: S, entry: ENTRY_SCHEMA }),
  tool("delete_entry", "Delete an accounting entry by id. The owner confirms first.", { id: S, reason: S }),
  tool("update_budget_plan", "Change the budget plan. Use -1 for a value that should stay unchanged. The owner confirms first.", { reinvestPct: N, monthlyBudget: N, adsBudget: N }),
  tool("reinvest_profit", "Move money from the profits pot back into the budget (records a funding entry of cat reinvest). The owner confirms first.", { amount: N, note: S }),
  tool("create_document_draft", "Create a DRAFT quote, contract or proposal in «العقود وعروض الأسعار». It is not sent to the client until the owner reviews it. The owner confirms first.", { doc: DOC_SCHEMA }),
  tool("save_idea", "Save a client idea in «أفكار العملاء». The owner confirms first.", { title: S, client: S, phone: S, text: S }),
];
const WRITE = new Set(["add_entries", "update_entry", "delete_entry", "update_budget_plan", "reinvest_profit", "create_document_draft", "save_idea"]);

const SYSTEM = `أنت «المساعد»، المساعد الشخصي والمستشار المالي للمطوّر حسن، ممارس عمل حر سعودي يبني مواقع وتطبيقات ومتاجر إلكترونية. تعمل داخل لوحة تحكم موقعه hassandev.sa ولك أدوات تقرأ وتنفّذ فيها.

أسلوبك:
- تكلّم بالعربية بلهجة مهنية ودودة ومختصرة. افهم اللهجة السعودية والأخطاء الإملائية الناتجة عن تحويل الصوت لنص.
- أنت شريك تفكير لا منفّذ أعمى: ناقش، واسأل عند الغموض، واعترض بلطف وبالأرقام إذا رأيت قراراً مالياً ضعيفاً (مثل صرف إعلانات بلا عائد، أو تمويل من قرض لحملة لم تثبت نجاحها). ثم احترم قراره.
- قبل أي رأي مالي اقرأ البيانات بالأدوات (get_finance_summary و search_entries) ولا تخمّن الأرقام.
- إذا طلب تقريراً: أعطه الخلاصة والأرقام، وافتح القسم المناسب بـ open_section ليرى التقرير في مكانه (مثل accounting).
- إذا بدأت رسالته بـ 🎤 فهو يتكلم صوتياً: رد بجمل قصيرة تُقرأ بصوت (3 جمل كحد أقصى غالباً)، بدون جداول أو رموز تنسيق، واذكر الأرقام بوضوح.

التنفيذ:
- الأدوات التي تغيّر البيانات (add_entries, update_entry, delete_entry, update_budget_plan, reinvest_profit, create_document_draft, save_idea) تظهر له للتأكيد قبل تنفيذها. اطلبها مباشرة عندما يكون طلبه واضحاً، ولا تقل إنها نُفذت إلا بعد أن تصلك نتيجتها. إذا رفضها فاسأله ماذا يريد أن يتغير.
- لا تكرر تسجيل عملية سبق تسجيلها؛ ابحث أولاً إذا شككت.

نظام المحاسبة:
- وعاءان: «الميزانية» يدخلها التمويل (رأس مال شخصي، قرض/تمويل بنكي، شريك، منحة، أو إعادة تمويل من الأرباح) وتُصرف منها المصروفات. «الأرباح» يدخلها دخل العملاء، ويخرج منها إعادة التمويل والسحوبات.
- صافي الربح = الإيرادات − المصروفات. العائد على الإعلانات = دخل العملاء القادمين من المنصة ÷ ما صُرف عليها.
- عند الموازنة فرّق بين مصادر التمويل: المال المقترض من البنك له تكلفة وسداد، والمال القادم من أرباح مشاريع سابقة مخاطرته أقل.
${ENTRY_RULES}

التسعير والوثائق:
${PRICING_RULES}
- قبل اقتراح أي سعر أو إنشاء عرض اقرأ get_pricing_reference.
- create_document_draft ينشئ مسودة فقط؛ ذكّره أن يراجعها في «العقود وعروض الأسعار» ثم يرسل رابطها للعميل.
- type: quote = عرض سعر، contract = عقد، proposal = مقترح مشروع أو وثيقة متطلبات بدون أسعار.

لست مستشاراً مالياً أو ضريبياً مرخّصاً؛ نصائحك مبنية على بياناته فقط.`;

const money = (n) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
const entryLine = (e) => `${KINDS[e.kind]} · ${CATS[e.kind]?.[e.cat] || e.cat}${e.channel ? " · " + CHANNELS[e.channel] : ""}: ${money(e.amount)} ر.س (${e.date})${e.note ? " — " + e.note : ""}`;

// وصف عربي لما سينفذه المساعد (يظهر في بطاقة التأكيد)
function describe(u) {
  const i = u.input || {};
  switch (u.name) {
    case "add_entries":
      return { title: `تسجيل ${i.entries?.length || 0} عملية`, lines: (i.entries || []).map((e) => entryLine(cleanEntry(e))) };
    case "update_entry":
      return { title: `تعديل العملية ${i.id}`, lines: [entryLine(cleanEntry(i.entry))] };
    case "delete_entry":
      return { title: `حذف العملية ${i.id}`, lines: [i.reason].filter(Boolean) };
    case "update_budget_plan":
      return {
        title: "تعديل خطة الميزانية",
        lines: [
          i.reinvestPct >= 0 && `نسبة إعادة الاستثمار: ${i.reinvestPct}%`,
          i.monthlyBudget >= 0 && `الميزانية الشهرية للمصروفات: ${money(i.monthlyBudget)} ر.س`,
          i.adsBudget >= 0 && `الحد الشهري للإعلانات: ${money(i.adsBudget)} ر.س`,
        ].filter(Boolean),
      };
    case "reinvest_profit":
      return { title: `إعادة تمويل الميزانية من الأرباح: ${money(i.amount)} ر.س`, lines: [i.note].filter(Boolean) };
    case "create_document_draft": {
      const d = i.doc || {};
      const total = (d.sections || []).reduce((s, x) => s + (Number(x.price) || 0) * (Number(x.qty) || 1), 0);
      return {
        title: `مسودة ${TYPES[d.type] || "وثيقة"}: ${d.title || ""}`,
        lines: [...(d.sections || []).map((s) => `${s.title}: ${money((Number(s.price) || 0) * (Number(s.qty) || 1))} ر.س`), total ? `الإجمالي قبل الخصم والضريبة: ${money(total)} ر.س` : "بدون أسعار"],
      };
    }
    case "save_idea":
      return { title: `حفظ فكرة: ${i.title}`, lines: [i.client, String(i.text || "").slice(0, 200)].filter(Boolean) };
    default:
      return { title: u.name, lines: [] };
  }
}

async function exec(name, i, actions) {
  switch (name) {
    case "get_finance_summary":
      return financeContext({ recent: 30 });
    case "search_entries": {
      const q = String(i.query || "").trim();
      const list = (await listEntries()).filter(
        (e) =>
          (i.kind === "all" || !i.kind || e.kind === i.kind) &&
          (!i.from || e.date >= i.from) &&
          (!i.to || e.date <= i.to) &&
          (!q || [e.note, e.client, e.docRef, CATS[e.kind]?.[e.cat], CHANNELS[e.channel], String(e.amount)].some((v) => String(v || "").includes(q)))
      );
      const n = Math.min(100, Math.max(1, Number(i.limit) || 30));
      return { count: list.length, total: list.reduce((s, e) => s + e.amount, 0), entries: list.slice(0, n).map((e) => ({ id: e.id, ...e, text: entryLine(e) })) };
    }
    case "list_documents": {
      const docs = await listDocs();
      return docs
        .filter((d) => i.status === "all" || d.status === i.status)
        .slice(0, 50)
        .map((d) => ({ number: d.number, type: TYPES[d.type], title: d.title, client: d.client?.company || d.client?.name || "", status: d.status, date: d.date, total: totals(d).total, recurring: d.recurring, duration: d.duration }));
    }
    case "get_pricing_reference":
      return pricingReference();
    case "list_projects":
      return (await listProjects()).map((p) => ({ id: p.id, name: p.name, client: p.client, status: PROJECT_STATUS[p.status], docRef: p.docRef, domain: p.domain, hosting: p.hosting, renewals: p.renewals, obligations: p.obligations, envKeys: (p.env || []).map((e) => e.key) }));
    case "list_files": {
      const q = String(i.query || "").trim();
      return (await listFiles())
        .filter((f) => (!i.year || f.year === i.year) && (i.cat === "all" || !i.cat || f.cat === i.cat) && (!q || [f.title, f.name, f.client, f.docRef, f.note].some((v) => String(v || "").includes(q))))
        .slice(0, 60)
        .map((f) => ({ id: f.id, title: f.title || f.name, cat: FILE_CATS[f.cat], date: f.date, client: f.client, docRef: f.docRef, amount: f.amount }));
    }
    case "list_ideas":
      return (await listIdeas()).map((x) => ({ id: x.id, title: x.title, client: x.client, status: x.status, text: String(x.text).slice(0, 400) }));
    case "open_section":
      actions.push({ type: "open", section: i.section });
      return { opened: i.section };
    case "add_entries": {
      const list = (i.entries || []).map(cleanEntry).filter((e) => e.amount > 0);
      const saved = await createEntries(list);
      actions.push({ type: "refresh", section: "accounting" });
      return { saved: saved.map((e) => ({ id: e.id, text: entryLine(e) })) };
    }
    case "update_entry": {
      const item = await updateEntry(String(i.id), cleanEntry(i.entry));
      actions.push({ type: "refresh", section: "accounting" });
      return item ? { updated: entryLine(item) } : { error: "not found" };
    }
    case "delete_entry":
      await deleteEntry(String(i.id));
      actions.push({ type: "refresh", section: "accounting" });
      return { deleted: i.id };
    case "update_budget_plan": {
      const cur = await getSettings();
      const pick = (v, old) => (Number(v) >= 0 ? v : old);
      const s = await saveSettings({ reinvestPct: pick(i.reinvestPct, cur.reinvestPct), monthlyBudget: pick(i.monthlyBudget, cur.monthlyBudget), adsBudget: pick(i.adsBudget, cur.adsBudget) });
      actions.push({ type: "refresh", section: "accounting" });
      return { settings: s };
    }
    case "reinvest_profit": {
      if (!(Number(i.amount) > 0)) return { error: "amount must be a positive number" };
      const [e] = await createEntries([cleanEntry({ kind: "funding", cat: "reinvest", amount: i.amount, date: riyadhToday(), note: i.note || "إعادة تمويل الميزانية من الأرباح" })]);
      actions.push({ type: "refresh", section: "accounting" });
      return { saved: entryLine(e) };
    }
    case "create_document_draft": {
      const doc = await createDraftDoc(i.doc, await getContent());
      actions.push({ type: "refresh", section: "docs" });
      return { created: { number: doc.number, type: TYPES[doc.type], status: "مسودة", total: totals(doc).total } };
    }
    case "save_idea": {
      const item = await saveIdea(null, i);
      actions.push({ type: "refresh", section: "ideas" });
      return { saved: { id: item.id, title: item.title } };
    }
    default:
      throw new Error("unknown tool");
  }
}

async function runTool(u, decision, actions) {
  if (WRITE.has(u.name) && decision !== "approve")
    return { type: "tool_result", tool_use_id: u.id, content: "رفض المالك تنفيذ هذا الإجراء. لا تكرره كما هو؛ اسأله ماذا يريد أن يتغير أو ناقشه." };
  try {
    return { type: "tool_result", tool_use_id: u.id, content: JSON.stringify(await exec(u.name, u.input || {}, actions)) };
  } catch (e) {
    console.error("Assistant tool failed", u.name, e);
    return { type: "tool_result", tool_use_id: u.id, is_error: true, content: e.message === "DB_NOT_CONNECTED" ? "قاعدة البيانات غير مربوطة" : "تعذر التنفيذ" };
  }
}

const MAX_MESSAGES = 160;

export async function POST(req) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!aiEnabled()) return NextResponse.json({ error: "أضف ANTHROPIC_API_KEY في Vercel لتفعيل المساعد." }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  let messages = Array.isArray(b.messages) ? b.messages : [];
  if (!messages.length) return NextResponse.json({ error: "اكتب رسالتك" }, { status: 400 });
  if (messages.length > MAX_MESSAGES) return NextResponse.json({ error: "المحادثة طويلة جداً، ابدأ محادثة جديدة" }, { status: 413 });
  const actions = [];

  // ردّ المالك على إجراءات تنتظر التأكيد: تُنفذ الموافق عليها وتُرفض البقية
  const last = messages[messages.length - 1];
  if (last.role === "assistant") {
    const uses = (last.content || []).filter((x) => x.type === "tool_use");
    if (!uses.length) return NextResponse.json({ error: "لا توجد إجراءات بانتظار التأكيد" }, { status: 400 });
    const decisions = b.decisions || {};
    const results = [];
    for (const u of uses) results.push(await runTool(u, decisions[u.id], actions));
    // رسالة كتبها أو قالها المالك بدل الضغط على تنفيذ/رفض
    const text = String(b.text || "").trim().slice(0, 4000);
    messages = [...messages, { role: "user", content: text ? [...results, { type: "text", text }] : results }];
  }

  const client = new Anthropic();
  try {
    for (let step = 0; step < 8; step++) {
      const res = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        ...FALLBACK,
        system: [{ type: "text", text: `${SYSTEM}\n\nتاريخ اليوم: ${riyadhToday()} (توقيت الرياض).`, cache_control: { type: "ephemeral" } }],
        tools: TOOLS,
        output_config: { effort: "medium" },
        messages,
      });
      messages = [...messages, { role: "assistant", content: res.content }];
      if (res.stop_reason === "refusal")
        return NextResponse.json({ messages, actions, notice: "اعتذر المساعد عن هذا الطلب، جرّب صياغة أخرى." });
      if (res.stop_reason !== "tool_use") return NextResponse.json({ messages, actions });

      const uses = res.content.filter((x) => x.type === "tool_use");
      const pending = uses.filter((u) => WRITE.has(u.name));
      if (pending.length) return NextResponse.json({ messages, actions, pending: pending.map((u) => ({ id: u.id, name: u.name, ...describe(u) })) });

      const results = [];
      for (const u of uses) results.push(await runTool(u, "auto", actions));
      messages = [...messages, { role: "user", content: results }];
    }
    return NextResponse.json({ messages, actions });
  } catch (e) {
    const { msg, status } = aiError(e);
    return NextResponse.json({ error: msg }, { status });
  }
}
