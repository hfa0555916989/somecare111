import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getFile, readPrivateBase64, FILE_CATS } from "@/lib/storage";
import { askJson, aiError, aiEnabled, fileBlock, ENTRY_SCHEMA, ENTRY_RULES, obj, arr, S, N, oneOf } from "@/lib/ai";
import { cleanEntry, riyadhToday } from "@/lib/finance";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX = 20 * 1024 * 1024;

const SCHEMA = obj({
  cat: oneOf(Object.keys(FILE_CATS)),
  title: S,
  date: S,
  client: S,
  docRef: S,
  amount: N,
  summary: S,
  entries: arr(ENTRY_SCHEMA),
});

const SYSTEM = `You are the filing clerk and bookkeeper of a Saudi freelance web/app developer ("المطوّر حسن"). You receive one file (PDF or image) and must file it in the right place.

Categories (cat): ${Object.entries(FILE_CATS).map(([k, v]) => `${k} = ${v}`).join("; ")}.
- contract: a signed/accepted service contract. quote: a price quote. invoice: a purchase invoice or receipt for something the business bought (hosting, domains, tools, devices...). ads: an invoice/receipt from an ad platform (Snapchat, Google Ads, TikTok, X, Meta). income: an invoice/receipt the developer issued to a client or proof of a client payment. bank: bank statement, transfer confirmation or bank SMS. gov: government documents, licenses, freelance certificate. project: client project material (designs, requirements, content). image: a plain photo. other: anything else.

Fields:
- title: a short Arabic title that identifies the file, e.g. "فاتورة Vercel Pro - أكتوبر 2026" or "عقد متجر الورد".
- date: the document's own date (YYYY-MM-DD), not today, if printed; else today ({TODAY}).
- client: the client/company name if it concerns a client, else "". docRef: a quote/contract number like HD-2026-001 if printed, else "".
- amount: the total amount in SAR if it is a financial document, else 0. Convert other currencies only if the SAR amount is printed; otherwise put the printed number.
- summary: one or two Arabic sentences describing the file.
- entries: the accounting entries this file proves (for invoices, ad invoices, income receipts, bank transfers). Empty for contracts, quotes and non-financial files.

${ENTRY_RULES}`;

export async function POST(req) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!aiEnabled()) return NextResponse.json({ error: "أضف ANTHROPIC_API_KEY في Vercel لتفعيل الفرز الذكي." }, { status: 503 });
  const { id } = await req.json().catch(() => ({}));
  const f = await getFile(String(id || "")).catch(() => null);
  if (!f) return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
  if (f.size > MAX) return NextResponse.json({ error: "الملف أكبر من 20MB، صنّفه يدوياً" }, { status: 413 });
  try {
    const file = await readPrivateBase64(f.url);
    if (!file) return NextResponse.json({ error: "تعذر قراءة الملف من التخزين" }, { status: 404 });
    const block = fileBlock(file.contentType, file.data);
    if (!block) return NextResponse.json({ error: "الفرز الذكي يقرأ الصور وملفات PDF فقط" }, { status: 400 });
    const out = await askJson({
      system: SYSTEM.replace("{TODAY}", riyadhToday()),
      content: [block, { type: "text", text: `File name: ${f.name}\nFile this document.` }],
      schema: SCHEMA,
    });
    return NextResponse.json({
      suggestion: { ...out, entries: (out.entries || []).slice(0, 20).map(cleanEntry).filter((e) => e.amount > 0) },
    });
  } catch (e) {
    const { msg, status } = aiError(e);
    return NextResponse.json({ error: msg }, { status });
  }
}
