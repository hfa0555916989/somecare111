import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";
import { defaultContent, mergeContent } from "./defaults";
import { scrubNames } from "./names";
import { replaceDemoUrls } from "./demo-media";
import { FIRST_YEAR_SUPPORT_AR, FIRST_YEAR_SUPPORT_EN, SECOND_YEAR_SUPPORT_AR, SECOND_YEAR_SUPPORT_EN, scrubOldSupportPrice } from "./support-offer.js";

const present = (value) => scrubOldSupportPrice(replaceDemoUrls(scrubNames(value)));

const KEY = "site:content";

// عند التشغيل على جهازك (npm run dev) بدون Upstash تُحفظ التعديلات في ملف محلي.
// لا يُستخدم على Vercel لأن ملفات الخادم هناك للقراءة فقط.
const LOCAL_FILE = path.join(process.cwd(), ".data", "content.json");
const localFileAllowed = () => !process.env.VERCEL;

// الصفحات الافتراضية (تُعدَّل وتُضاف من لوحة التحكم)
const DEFAULT_PAGES = [
  {
    slug: "privacy",
    title: "سياسة الخصوصية",
    subtitle: "موقع hassandev.sa",
    body:
      "نجمع البيانات التي ترسلها عند طلب الخدمة، مثل الاسم ورقم التواصل وتفاصيل المشروع، من أجل الرد عليك وتنفيذ الطلب فقط.\nلا نبيع بياناتك لطرف ثالث.\nقد نستخدم أدوات تحليل بسيطة لمعرفة زيارات الموقع.",
    contactLabel: "للتواصل بشأن البيانات: واتساب",
    showInHeader: false,
    showInFooter: true,
    published: true,
    en: {
      title: "Privacy Policy",
      subtitle: "hassandev.sa",
      body:
        "We collect the data you send when requesting a service, such as your name, contact number and project details, only to reply to you and deliver your request.\nWe do not sell your data to any third party.\nWe may use simple analytics tools to understand site visits.",
      contactLabel: "For data inquiries, WhatsApp:",
    },
  },
  {
    slug: "terms",
    title: "الشروط والأحكام",
    subtitle: "شروط الخدمة",
    body:
      "الخدمة المعروضة هي تصميم موقع تعريفي بالسعر الموضح في الصفحة.\nالسعر 1,100 ريال يشمل تصميم الموقع والدومين والاستضافة لسنة واحدة، ما لم يُذكر غير ذلك في الباقة المختارة.\nالدعم الفني مجاني أول سنة مع الدومين والاستضافة. السنة الثانية: الدعم بـ 200 ريال للسنة.\nمدة التسليم تقريبية وتبدأ بعد تأكيد المتطلبات ودفع المبلغ المتفق عليه.\nباقة المتجر الكبير شامل التطبيق بـ 1,500 ريال، وداخلها بوابة الدفع والشحن والدومين وواتساب مجاناً.",
    contactLabel: "للتواصل:",
    showInHeader: false,
    showInFooter: true,
    published: true,
    en: {
      title: "Terms & Conditions",
      subtitle: "Terms of service",
      body:
        "The service offered is the design of a business website at the price shown on the page.\nThe price of 1,100 SAR includes website design, domain and hosting for one year, unless the chosen package states otherwise.\nTechnical support is free for the first year, together with the domain and hosting. From the second year, support is 200 SAR for the full year.\nDelivery time is approximate and starts after the requirements are confirmed and the agreed amount is paid.\nThe large store package with the app is 1,500 SAR, and payment, shipping, the domain and WhatsApp are included free.",
      contactLabel: "Contact:",
    },
  },
];

// النصوص المحفوظة قبل نقل الموقع قد تذكر الدومين القديم somecare.shop
const OLD_DOMAIN = /(?:www\.)?somecare\.shop/gi;
const fixOldDomain = (p) =>
  p && typeof p === "object"
    ? { ...p, subtitle: String(p.subtitle || "").replace(OLD_DOMAIN, "hassandev.sa"), body: String(p.body || "").replace(OLD_DOMAIN, "hassandev.sa") }
    : p;

// الصفحات المحفوظة قبل إضافة النسخة الإنجليزية تأخذ ترجمتها الافتراضية ما دام عنوانها العربي لم يتغيّر
const STORE_PRICE_AR = "باقة المتجر الكبير شامل التطبيق بـ 1,500 ريال، وداخلها بوابة الدفع والشحن والدومين وواتساب مجاناً.";
const STORE_PRICE_EN = "The large store package with the app is 1,500 SAR, and payment, shipping, the domain and WhatsApp are included free.";
const SUPPORT_TERMS_AR = `${FIRST_YEAR_SUPPORT_AR}. ${SECOND_YEAR_SUPPORT_AR}.`;
const SUPPORT_TERMS_EN = `${FIRST_YEAR_SUPPORT_EN}. ${SECOND_YEAR_SUPPORT_EN}.`;
const addSupportTerms = (body, sentence, marker) => {
  const text = String(body || "");
  if (!text || text.includes(marker) || !/استضافة|hosting/i.test(text)) return text;
  return `${text}\n${sentence}`;
};
const fixStorePrice = (p) => {
  if (!p || typeof p !== "object") return p;
  let body = addSupportTerms(String(p.body || "").replace(/أي إضافات مثل المتجر أو التطبيق لها سعر منفصل ظاهر في الموقع\.?/g, STORE_PRICE_AR), SUPPORT_TERMS_AR, "السنة الثانية");
  const en = p.en && typeof p.en === "object"
    ? { ...p.en, body: addSupportTerms(String(p.en.body || "").replace(/Any add-ons such as a store or an app have a separate price shown on the site\.?/g, STORE_PRICE_EN), SUPPORT_TERMS_EN, "second year") }
    : p.en;
  return { ...p, body, ...(en ? { en } : {}) };
};

const withDefaultEn = (p) => {
  if (!p || typeof p !== "object" || p.en) return p;
  const d = DEFAULT_PAGES.find((x) => x.slug === p.slug && x.title === p.title);
  return d ? { ...p, en: d.en } : p;
};

function withExtras(c, stored) {
  return {
    ...c,
    footer: { city: "الرياض", ...c.footer },
    pages: (Array.isArray(stored?.pages) ? stored.pages : DEFAULT_PAGES).map(fixOldDomain).map(withDefaultEn).map(fixStorePrice),
  };
}

export function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function dbConnected() {
  return !!redis();
}

// مكان حفظ المحتوى: redis | file | null (غير متاح)
export function storageMode() {
  if (redis()) return "redis";
  return localFileAllowed() ? "file" : null;
}

async function readLocal() {
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
  } catch {
    return null;
  }
}

export async function getContent() {
  const r = redis();
  if (!r) {
    const stored = localFileAllowed() ? await readLocal() : null;
    return present(stored ? withExtras(mergeContent(stored), stored) : withExtras(defaultContent, null));
  }
  try {
    const stored = await r.get(KEY);
    if (stored) return present(withExtras(mergeContent(stored), stored));
  } catch (e) {
    console.error("DB read failed", e);
  }
  return present(withExtras(defaultContent, null));
}

export async function saveContent(content) {
  const r = redis();
  if (r) return r.set(KEY, content);
  if (!localFileAllowed()) throw new Error("DB_NOT_CONNECTED");
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(content, null, 2));
}
