// بطاقة الاشتراك (الخيار الموصى به) تعرض صور المتجر ولوحة التحكم.
import { DEMO_SHOTS, DEMO_VIDEO } from "./demo-media.js";
import { FIRST_YEAR_SUPPORT_AR, FIRST_YEAR_SUPPORT_EN, SECOND_YEAR_SUPPORT_AR, SECOND_YEAR_SUPPORT_EN } from "./support-offer.js";
import {
  SUBSCRIPTION_FEATURES_AR,
  SUBSCRIPTION_FEATURES_EN,
  SUBSCRIPTION_NAME,
  SUBSCRIPTION_NAME_EN,
} from "./platform-offer.js";

export const BIG_STORE_NAME = SUBSCRIPTION_NAME;
export const BIG_STORE_NAME_EN = SUBSCRIPTION_NAME_EN;

export const BIG_STORE_DESC = "نسخة مستقلة. تجهيز مرة واحدة ثم اشتراك شهري يشمل الاستضافة والدعم والنسخ الاحتياطي والتحديثات";
export const BIG_STORE_DESC_EN = "An independent instance. One-time setup, then a monthly subscription that includes hosting, support, backups and updates";

export const BIG_STORE_FEATURES = [...SUBSCRIPTION_FEATURES_AR, FIRST_YEAR_SUPPORT_AR, SECOND_YEAR_SUPPORT_AR];
export const BIG_STORE_FEATURES_EN = [...SUBSCRIPTION_FEATURES_EN, FIRST_YEAR_SUPPORT_EN, SECOND_YEAR_SUPPORT_EN];

// بوابات الدفع والشحن جزء من التجهيز، فلا تُعرض كإضافات مجانية منفصلة.
export const STORE_PAGE_FREE = [];

export const BIG_STORE_SHOWCASE = {
  shots: DEMO_SHOTS,
  video: DEMO_VIDEO,
  post: {
    href: "/blog/matjar-tatbeeq-1500",
    title: "شرح الاشتراك والشراء لنسخة المتجر",
    excerpt: "النطاقات السعرية، والدفع والشحن والتطبيقان ضمن المنصة.",
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
