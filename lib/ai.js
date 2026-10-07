import Anthropic from "@anthropic-ai/sdk";
import { KINDS, INCOME_CATS, EXPENSE_CATS, FUNDING_SOURCES, WITHDRAW_REASONS, CHANNELS, AD_CHANNELS } from "./finance";

// إعدادات Claude المشتركة لكل ميزات الذكاء الاصطناعي في لوحة التحكم
export const MODEL = "claude-opus-5-5";
export const FALLBACK = { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" };
export const aiEnabled = () => !!process.env.ANTHROPIC_API_KEY;

export const S = { type: "string" };
export const N = { type: "number" };
export const B = { type: "boolean" };
export const arr = (items) => ({ type: "array", items });
export const obj = (properties) => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });
export const oneOf = (values) => ({ type: "string", enum: values });

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// كتلة ملف لرسالة Claude (صورة أو PDF)، أو null إذا النوع غير مدعوم
export function fileBlock(type, data) {
  const clean = String(data || "").replace(/^data:[^,]*,/, "").replace(/\s/g, "");
  if (type === "application/pdf") return { type: "document", source: { type: "base64", media_type: "application/pdf", data: clean } };
  if (IMAGE_TYPES.includes(type)) return { type: "image", source: { type: "base64", media_type: type, data: clean } };
  return null;
}

// طلب واحد يرجع JSON مطابقاً للمخطط
export async function askJson({ system, content, schema, effort = "medium", maxTokens = 16000 }) {
  const client = new Anthropic();
  const res = await client.beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    ...FALLBACK,
    system,
    output_config: { effort, format: { type: "json_schema", schema } },
    messages: [{ role: "user", content }],
  });
  if (res.stop_reason === "refusal") throw new Error("REFUSAL");
  if (res.stop_reason === "max_tokens") throw new Error("TOO_LONG");
  return JSON.parse(res.content.find((x) => x.type === "text")?.text || "");
}

// رسالة خطأ عربية مناسبة للمستخدم
export function aiError(e) {
  if (e?.message === "REFUSAL") return { msg: "تعذرت معالجة هذا الطلب", status: 422 };
  if (e?.message === "TOO_LONG") return { msg: "الطلب طويل جداً، جرّب جزءاً أصغر", status: 422 };
  if (e instanceof SyntaxError) return { msg: "تعذر فهم الرد، حاول مرة أخرى", status: 422 };
  console.error("AI request failed", e);
  if (e instanceof Anthropic.AuthenticationError) return { msg: "مفتاح ANTHROPIC_API_KEY غير صحيح", status: 502 };
  if (e instanceof Anthropic.RateLimitError) return { msg: "ضغط على الخدمة، حاول بعد دقيقة", status: 502 };
  if (e instanceof Anthropic.BadRequestError) return { msg: "تعذرت قراءة الطلب، تأكد أن الملف صورة أو PDF سليم", status: 502 };
  return { msg: "تعذر الاتصال بالذكاء الاصطناعي حالياً، حاول مرة أخرى", status: 502 };
}

/* ---------- العمليات المحاسبية (مشتركة بين القراءة من النص والفواتير والمساعد) ---------- */
const ALL_CATS = [...new Set([...Object.keys(INCOME_CATS), ...Object.keys(EXPENSE_CATS), ...Object.keys(FUNDING_SOURCES), ...Object.keys(WITHDRAW_REASONS)])];
export const ENTRY_SCHEMA = obj({
  kind: oneOf(Object.keys(KINDS)),
  cat: oneOf(ALL_CATS),
  amount: N,
  date: S,
  note: S,
  client: S,
  channel: oneOf(["", ...Object.keys(CHANNELS)]),
  docRef: S,
});

const list = (o) => Object.entries(o).map(([k, v]) => `${k} = ${v}`).join("; ");
export const ENTRY_RULES = `Entry kinds (amounts in SAR):
- income: money received from a client. cat: ${list(INCOME_CATS)}
- expense: money the business spent. cat: ${list(EXPENSE_CATS)}
- funding: money put INTO the project budget. cat: ${list(FUNDING_SOURCES)}. Moving profit back into the budget ("رجعت/حطيت من الأرباح في الميزانية", "إعادة تمويل") is funding with cat reinvest. A bank loan or bank financing is funding with cat loan.
- withdraw: money taken OUT of the profits for the owner or to repay someone. cat: ${list(WITHDRAW_REASONS)}
channel: for an ads expense (cat ads) the ad platform: ${list(AD_CHANNELS)}. For income, where the client came from if stated: ${list(CHANNELS)}. Otherwise "".
- One entry per distinct amount. A receipt with several lines for the same purchase is one entry with the total (including VAT).
- date: YYYY-MM-DD. Resolve relative dates ("أمس", "1/9") against today; default to today.
- note: a short Arabic description (e.g. "اشتراك Vercel Pro لشهر أكتوبر"). client: the client's name for income, else "". docRef: a quote/contract number like HD-2026-001 if mentioned, else "".
- Never invent amounts.`;
