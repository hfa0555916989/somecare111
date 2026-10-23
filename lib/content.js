import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";
import { defaultContent, mergeContent } from "./defaults";
import { scrubNames } from "./names";
import { replaceDemoUrls } from "./demo-media";
import { ORIGINAL_TERMS_AR, ORIGINAL_TERMS_EN, rewriteStoredPage } from "./platform-offer.js";
import { scrubOldSupportPrice } from "./support-offer.js";

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
    body: ORIGINAL_TERMS_AR,
    contactLabel: "للتواصل:",
    showInHeader: false,
    showInFooter: true,
    published: true,
    en: {
      title: "Terms & Conditions",
      subtitle: "Terms of service",
      body: ORIGINAL_TERMS_EN,
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
const fixStorePrice = (p) => rewriteStoredPage(p);

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
