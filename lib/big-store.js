// باقة المتجر الكبير شامل التطبيق. سطر ينتهي بـ «مجاناً» أو Free يُعرض كإضافة داخلة في السعر.
import { DEMO_SHOTS, DEMO_VIDEO } from "./demo-media";
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
  "ربط واتساب — مجاناً",
  "إشعارات للطلبات — مجاناً",
  "تحليلات جوجل — مجاناً",
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
  "WhatsApp integration — Free",
  "Order notifications — Free",
  "Google Analytics — Free",
];

// نسخة المزايا قبل تمييز الإضافات بـ «مجاناً». تُستبدل بالنسخة الحالية إن لم يعدّلها صاحب الموقع.
export const BIG_STORE_FEATURES_PREV = [
  "منتجات غير محدودة",
  "أقسام وتصنيفات للمنتجات",
  "بحث وفلترة متقدمة",
  "سلة شراء وإتمام الطلب",
  "بوابات دفع: مدى و Apple Pay و STC Pay",
  "ربط شركات الشحن",
  "كوبونات وخصومات",
  "حسابات للعملاء",
  "لوحة إدارة الطلبات",
  "إدارة المخزون",
  "تقارير وتحليلات المبيعات",
  "برنامج ولاء",
  "تكامل محاسبي",
  "تهيئة SEO",
  "العربية والإنجليزية",
  "ربط واتساب",
  "إشعارات للطلبات",
  "تطبيق جوال iOS و Android للمتجر",
  "لوحة تحكم وموقع تعريفي",
];

// صور المتجر ولوحة التحكم والفيديو تظهر تحت مزايا الباقة. المقال يُربط من البطاقة.
export const BIG_STORE_SHOWCASE = {
  shots: DEMO_SHOTS,
  video: DEMO_VIDEO,
  post: {
    href: "/blog/matjar-tatbeeq-1500",
    title: "شرح باقة المتجر الكبير: 1500 ريال مع التطبيق",
    excerpt: "الإضافات المجانية، صور المتجر ولوحة التحكم، ورابط التجربة.",
  },
};

export function isBigStorePackage(p) {
  const name = String(p?.name || "").trim();
  return name === BIG_STORE_NAME || name === BIG_STORE_NAME_EN;
}
