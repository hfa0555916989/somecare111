// قوالب وثائق جاهزة تظهر في لوحة التحكم ← الوثائق ← «قوالب جاهزة».
// الضغط على القالب يفتحه في المحرر كمسودة جديدة: أكمل بيانات العميل ثم احفظ.
// بيانات العملاء الشخصية لا تُكتب في هذه الملفات لأن المستودع عام.
import lawOfficeQuote from "../docs-templates/law-office-local-hosting.quote.json";
import lawOfficeContract from "../docs-templates/law-office-local-hosting.json";

export const DOC_TEMPLATES = [
  { key: "law-office-quote", label: "عرض سعر: نظام مكتب المحاماة (استضافة محلية)", doc: lawOfficeQuote },
  { key: "law-office-contract", label: "عقد: نظام مكتب المحاماة (استضافة محلية)", doc: lawOfficeContract },
];
