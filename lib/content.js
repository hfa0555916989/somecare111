import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";
import { defaultContent, mergeContent } from "./defaults";

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
    return stored ? withExtras(mergeContent(stored), stored) : withExtras(defaultContent, null);
  }
  try {
    const stored = await r.get(KEY);
    if (stored) return withExtras(mergeContent(stored), stored);
  } catch (e) {
    console.error("DB read failed", e);
  }
  return withExtras(defaultContent, null);
}

export async function saveContent(content) {
  const r = redis();
  if (r) return r.set(KEY, content);
  if (!localFileAllowed()) throw new Error("DB_NOT_CONNECTED");
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(content, null, 2));
}
