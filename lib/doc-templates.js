// قوالب وثائق جاهزة تظهر في لوحة التحكم ← الوثائق ← «قوالب جاهزة».
// الضغط على القالب يفتحه في المحرر كمسودة جديدة جاهزة للحفظ.
// بيانات العملاء الشخصية لا تُكتب في هذه الملفات لأن المستودع عام، وتُقرأ من متغير البيئة
// DOC_TEMPLATE_CLIENTS في Vercel، بصيغة JSON مفتاحها بداية مفتاح القالب:
//   {"law-office": {"name": "...", "phone": "05..."}}
import lawOfficeQuote from "../docs-templates/law-office-local-hosting.quote.json";
import lawOfficeContract from "../docs-templates/law-office-local-hosting.json";

export const DOC_TEMPLATES = [
  { key: "law-office-quote", label: "عرض سعر: نظام مكتب المحاماة (1,300 ريال)", doc: lawOfficeQuote },
  { key: "law-office-contract", label: "عقد: نظام مكتب المحاماة (1,300 ريال)", doc: lawOfficeContract },
];

const CLIENT_FIELDS = ["name", "company", "idNumber", "phone", "email", "city"];

export function templatesWithClients(raw) {
  let clients = {};
  try {
    const parsed = JSON.parse(raw || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) clients = parsed;
  } catch {}
  return DOC_TEMPLATES.map((t) => {
    const prefix = Object.keys(clients)
      .filter((p) => t.key === p || t.key.startsWith(p + "-"))
      .sort((a, b) => b.length - a.length)[0];
    const extra = prefix ? clients[prefix] || {} : {};
    const client = { ...(t.doc.client || {}) };
    for (const f of CLIENT_FIELDS) if (typeof extra[f] === "string" && extra[f].trim()) client[f] = extra[f].trim();
    return { ...t, doc: { ...t.doc, client } };
  });
}
