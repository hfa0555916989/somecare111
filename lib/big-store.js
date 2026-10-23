// نص بطاقة صفحة إنشاء المتجر كما هو على main. النطاق الحالي يُضاف تحت الصفحة ولا يستبدل هذا النص.
import { DEMO_SHOTS, DEMO_VIDEO } from "./demo-media.js";

export const BIG_STORE_NAME = "باقة المتجر الكبير شامل التطبيق";
export const BIG_STORE_NAME_EN = "Large store package with the app";

export const BIG_STORE_DESC = "منتجات غير محدودة، مع تطبيق iOS و Android، والإضافات الأساسية مجاناً";
export const BIG_STORE_DESC_EN = "Unlimited products, with an iOS and Android app, and the main add-ons included free";

export const BIG_STORE_FEATURES = [
  "منتجات غير محدودة",
  "أقسام وتصنيفات للمنتجات",
  "بحث وفلترة متقدمة",
  "سلة شراء وإتمام الطلب",
  "كوبونات وخصومات",
  "حسابات للعملاء",
  "لوحة إدارة الطلبات",
  "إدارة المخزون",
  "تقارير وتحليلات المبيعات",
  "برنامج ولاء",
  "تكامل محاسبي",
  "تهيئة SEO",
  "العربية والإنجليزية",
  "تطبيق جوال iOS و Android للمتجر",
  "لوحة تحكم وموقع تعريفي",
  "بوابات دفع: مدى و Apple Pay و STC Pay — مجاناً",
  "ربط شركات الشحن — مجاناً",
  "الدومين وشهادة SSL — مجاناً",
  "زر واتساب يفتح محادثة مع صاحب المتجر",
  "تنبيهات الطلب داخل لوحة التحكم",
  "تحليلات جوجل — مجاناً",
  "الدعم في الاشتراك ضمن الرسم الشهري مع الاستضافة والنسخ الاحتياطي",
  "بعد الشراء: إصلاح أعطال مجاني من شهر إلى شهرين، ثم صيانة من 500 إلى 800 ريال شهرياً",
];

export const STORE_PAGE_FREE = [
  "بوابة الدفع: مدى و Apple Pay و STC Pay",
  "ربط الشحن",
  "الدومين وشهادة SSL",
  "زر واتساب يفتح محادثة مع صاحب المتجر",
  "تنبيهات الطلب داخل لوحة التحكم",
  "تحليلات جوجل",
];

export const BIG_STORE_FEATURES_EN = [
  "Unlimited products",
  "Product sections and categories",
  "Advanced search and filtering",
  "Shopping cart and checkout",
  "Coupons and discounts",
  "Customer accounts",
  "Order management dashboard",
  "Inventory management",
  "Sales reports and analytics",
  "Loyalty program",
  "Accounting integration",
  "SEO setup",
  "Arabic and English",
  "iOS and Android app for the store",
  "Admin panel and business website",
  "Payment gateways: Mada, Apple Pay and STC Pay — Free",
  "Shipping company integration — Free",
  "Domain and SSL certificate — Free",
  "WhatsApp button that opens a chat with the store owner",
  "Order alerts inside the dashboard",
  "Google Analytics — Free",
  "On the subscription, support is included in the monthly fee, with hosting and backups",
  "After purchase: free bug fixes for one to two months, then maintenance at 500–800 SAR per month",
];

export const BIG_STORE_SHOWCASE = {
  shots: DEMO_SHOTS,
  video: DEMO_VIDEO,
  post: {
    href: "/blog/matjar-tatbeeq-1500",
    title: "شرح باقة المتجر الكبير: من 2,000 ريال مع التطبيق",
    excerpt: "الإضافات المجانية، صور المتجر ولوحة التحكم، ورابط التجربة.",
  },
};

const LEGACY_NAMES = new Set([
  "متجر كبير",
  "باقة المتجر الكبير",
  "باقة المتجر الكبير شامل التطبيق",
  "Large store package with the app",
]);

export function isBigStorePackage(p) {
  const name = String(p?.name || "").trim();
  return name === BIG_STORE_NAME || name === BIG_STORE_NAME_EN || LEGACY_NAMES.has(name);
}
