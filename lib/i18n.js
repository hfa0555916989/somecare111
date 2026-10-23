// لغتا الموقع: العربية على / والإنجليزية على /en
export const LANGS = ["ar", "en"];
export const langOf = (v) => (v === "en" ? "en" : "ar");
// بداية الروابط في كل لغة
export const prefix = (lang) => (lang === "en" ? "/en" : "");

// نصوص الواجهة الثابتة (أزرار وعناوين القائمة) التي لا تُعدَّل من لوحة التحكم
export const UI = {
  ar: {
    htmlLang: "ar-SA",
    dir: "rtl",
    locale: "ar_SA",
    nav: { packages: "الباقات", security: "الأمن السيبراني", addons: "الإضافات", about: "من نحن", services: "خدماتنا", works: "أعمالنا", blog: "المدونة", gallery: "أعمالنا", contact: "تواصل معنا" },
    menu: "القائمة",
    menuClose: "إغلاق القائمة",
    whatsapp: "واتساب",
    orderPackage: "اطلب هذه الباقة",
    callDirect: "أو اتصل مباشرة:",
    switchLabel: "English",
    switchTitle: "النسخة الإنجليزية",
    themeToggle: "تبديل الوضع الليلي والنهاري",
    themeTitle: "الوضع الليلي / النهاري",
    certNumber: "رقم الوثيقة:",
    certExpiry: "سارية حتى:",
    certVerify: "التحقق من الوثيقة ↗",
    certAlt: "وثيقة العمل الحر",
    badgeAlt: "بطاقة العمل الحر",
    badgePdf: "تحميل بطاقة العمل الحر (PDF)",
    partnerWith: "بالشراكة مع",
    partnerVisit: "موقع الشريك ↗",
    partnerProfile: "الملف التعريفي (PDF)",
    orderService: "اطلب هذه الخدمة",
    details: "التفاصيل ↗",
    form: {
      name: "الاسم",
      phone: "رقم الجوال",
      email: "البريد الإلكتروني (اختياري)",
      service: "الخدمة المطلوبة",
      pickService: "اختر الخدمة",
      other: "أخرى",
      message: "تفاصيل الاستفسار",
      send: "إرسال الاستفسار",
      sending: "جارٍ الإرسال...",
      failed: "تعذر الإرسال",
      sent: "تم الإرسال",
    },
  },
  en: {
    htmlLang: "en",
    dir: "ltr",
    locale: "en_US",
    nav: { packages: "Packages", security: "Cybersecurity", addons: "Add-ons", about: "About", services: "Services", works: "Our work", blog: "Blog", gallery: "Our work", contact: "Contact" },
    menu: "Menu",
    menuClose: "Close menu",
    whatsapp: "WhatsApp",
    orderPackage: "Order this package",
    callDirect: "Or call us directly:",
    switchLabel: "عربي",
    switchTitle: "النسخة العربية",
    themeToggle: "Toggle dark and light mode",
    themeTitle: "Dark / light mode",
    certNumber: "Document no.:",
    certExpiry: "Valid until:",
    certVerify: "Verify the document ↗",
    certAlt: "Freelance document",
    badgeAlt: "Freelance card",
    badgePdf: "Download the freelance card (PDF)",
    partnerWith: "In partnership with",
    partnerVisit: "Partner website ↗",
    partnerProfile: "Company profile (PDF)",
    orderService: "Request this service",
    details: "Learn more ↗",
    form: {
      name: "Name",
      phone: "Mobile number",
      email: "Email (optional)",
      service: "Service needed",
      pickService: "Choose a service",
      other: "Other",
      message: "Inquiry details",
      send: "Send inquiry",
      sending: "Sending...",
      failed: "Could not send",
      sent: "Sent",
    },
  },
};

export const ui = (lang) => UI[langOf(lang)];

// العملة والوحدات في الأسعار تُكتب بالعربي في لوحة التحكم، فتُحوَّل تلقائياً في النسخة الإنجليزية
// حتى يبقى السعر واحداً في اللغتين بدون تكراره.
const MONEY_KEYS = new Set(["price", "unit", "pricePrefix"]);
const MONEY_WORDS = [
  [/يبدأ من/g, "From"],
  [/ريال فأكثر/g, "SAR+"],
  [/ريال فقط/g, "SAR"],
  [/مرة واحدة/g, "one-time"],
  [/ريال/g, "SAR"],
  [/شهرياً|\/\s*شهر/g, "/ month"],
  [/سنوياً|\/\s*سنة/g, "/ year"],
];
export const money = (s) => MONEY_WORDS.reduce((t, [re, en]) => t.replace(re, en), String(s ?? ""));

const filled = (v) => (typeof v === "string" ? v.trim() !== "" : Array.isArray(v) ? v.length > 0 : v != null);

// يضع الترجمة فوق الأصل العربي: القوائم تُطابَق بالترتيب، وقوائم النصوص تُستبدل كاملة،
// وأي خانة لم تُترجم تبقى بالعربي (أو تُحوَّل عملتها إن كانت سعراً).
function overlay(base, tr, key) {
  if (Array.isArray(base) && base.some((x) => x && typeof x === "object")) {
    return base.map((b, i) => overlay(b, Array.isArray(tr) ? tr[i] : undefined));
  }
  if (base && typeof base === "object" && !Array.isArray(base)) {
    if (!tr || typeof tr !== "object" || Array.isArray(tr)) return overlay(base, {}, key);
    const out = { ...base };
    for (const k of new Set([...Object.keys(base), ...Object.keys(tr)])) out[k] = overlay(base[k], tr[k], k);
    return out;
  }
  if (filled(tr) && typeof tr !== "object") return tr;
  const list = Array.isArray(tr) ? tr.filter((x) => (typeof x === "string" ? x.trim() : x)) : [];
  if (list.length) return list;
  if (MONEY_KEYS.has(key) && typeof base === "string") return money(base);
  return base;
}

// محتوى الموقع باللغة المطلوبة (c.lang تحدد اللغة لبقية المكوّنات)
export function localize(c, lang) {
  if (langOf(lang) !== "en") return { ...c, lang: "ar" };
  const en = c.en && typeof c.en === "object" ? c.en : {};
  const out = { ...c, lang: "en" };
  for (const k of ["seo", "brand", "contact", "form", "hero", "titles", "packages", "addons", "security", "features", "trust", "about", "gallery", "footer"]) {
    if (c[k] !== undefined) out[k] = overlay(c[k], en[k], k);
  }
  out.pages = (c.pages || []).map((p) => overlay(p, p.en));
  return out;
}
