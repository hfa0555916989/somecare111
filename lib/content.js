import { Redis } from "@upstash/redis";
import { defaultContent, mergeContent } from "./defaults";

const KEY = "site:content";

// الصفحات الافتراضية (تُعدَّل وتُضاف من لوحة التحكم)
const DEFAULT_PAGES = [
  {
    slug: "privacy",
    title: "سياسة الخصوصية",
    subtitle: "موقع somecare.shop",
    body:
      "نجمع البيانات التي ترسلها عند طلب الخدمة، مثل الاسم ورقم التواصل وتفاصيل المشروع، من أجل الرد عليك وتنفيذ الطلب فقط.\nلا نبيع بياناتك لطرف ثالث.\nقد نستخدم أدوات تحليل بسيطة لمعرفة زيارات الموقع.",
    contactLabel: "للتواصل بشأن البيانات: واتساب",
    showInHeader: false,
    showInFooter: true,
    published: true,
  },
  {
    slug: "terms",
    title: "الشروط والأحكام",
    subtitle: "شروط الخدمة",
    body:
      "الخدمة المعروضة هي تصميم موقع تعريفي بالسعر الموضح في الصفحة.\nالسعر 1,100 ريال يشمل تصميم الموقع والدومين والاستضافة لسنة واحدة، ما لم يُذكر غير ذلك في الباقة المختارة.\nمدة التسليم تقريبية وتبدأ بعد تأكيد المتطلبات ودفع المبلغ المتفق عليه.\nأي إضافات مثل المتجر أو التطبيق لها سعر منفصل ظاهر في الموقع.",
    contactLabel: "للتواصل:",
    showInHeader: false,
    showInFooter: true,
    published: true,
  },
];

function withExtras(c, stored) {
  return {
    ...c,
    footer: { city: "الرياض", ...c.footer },
    pages: Array.isArray(stored?.pages) ? stored.pages : DEFAULT_PAGES,
  };
}

function client() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function dbConnected() {
  return !!client();
}

export async function getContent() {
  const r = client();
  if (!r) return withExtras(defaultContent, null);
  try {
    const stored = await r.get(KEY);
    if (stored) return withExtras(mergeContent(stored), stored);
  } catch (e) {
    console.error("DB read failed", e);
  }
  return withExtras(defaultContent, null);
}

export async function saveContent(content) {
  const r = client();
  if (!r) throw new Error("DB_NOT_CONNECTED");
  await r.set(KEY, content);
}
