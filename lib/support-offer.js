// الدعم: إصلاح الأعطال داخل الاشتراك أو خلال شهر إلى شهرين بعد الشراء، ثم صيانة.
// طلب الميزة الجديدة ليس دعماً ويُسعَّر وحده.
import { rewriteLegacyCopy } from "./platform-offer.js";

export const FIRST_YEAR_SUPPORT_AR = "إصلاح الأعطال يعني خللاً في ما تم تسليمه، وطلب الميزة الجديدة يُسعَّر بشكل مستقل";
export const SECOND_YEAR_SUPPORT_AR = "الاشتراك يشمل الدعم ضمن الرسم الشهري. بعد الشراء: دعم أعطال مجاني من شهر إلى شهرين ثم صيانة من 500 إلى 800 ريال شهرياً";
export const FIRST_YEAR_SUPPORT_EN = "A bug fix is a defect in what was delivered. A new feature request is quoted and paid separately";
export const SECOND_YEAR_SUPPORT_EN = "The subscription includes support in the monthly fee. After purchase: bug fixes are free for 1–2 months, then maintenance is 500–800 SAR per month";

export const SUPPORT_ADDON_AR = {
  icon: "headset",
  title: "الدعم الفني",
  desc: `${FIRST_YEAR_SUPPORT_AR}. ${SECOND_YEAR_SUPPORT_AR}.`,
  price: "حسب الباقة",
};

export const SUPPORT_ADDON_EN = {
  title: "Technical support",
  desc: `${FIRST_YEAR_SUPPORT_EN}. ${SECOND_YEAR_SUPPORT_EN}.`,
  price: "Depends on the plan",
};

const OLD_SUPPORT_PRICE = /(?<!\d)7[,\s٬]?200(?!\d)(?:\s*\/\s*سنوي(?:اً)?|\s*ريال(?:اً|ا)?(?:\s*\/\s*سنوي(?:اً)?|\s*سنوياً)?)?/gi;
const ALREADY = /إصلاح الأعطال|bug fix|separately|500 إلى 800|500–800/i;

export function isSupportAddon(item) {
  return /دعم|support/i.test(String(item?.title || ""));
}

export function upgradeSupportAddons(list, en = false) {
  const template = en ? SUPPORT_ADDON_EN : SUPPORT_ADDON_AR;
  const source = Array.isArray(list) ? list : [];
  let used = false;
  const out = [];
  for (const item of source) {
    if (!item || typeof item !== "object") continue;
    if (!isSupportAddon(item)) {
      out.push(item);
      continue;
    }
    if (used) continue;
    used = true;
    out.push({
      ...item,
      icon: item.icon || template.icon || "headset",
      title: template.title,
      desc: template.desc,
      price: template.price,
    });
  }
  if (!used) out.push({ ...template });
  return out;
}

export function withSupportTerms(pkg, en = false) {
  if (!pkg || typeof pkg !== "object") return pkg;
  const lines = en ? [FIRST_YEAR_SUPPORT_EN, SECOND_YEAR_SUPPORT_EN] : [FIRST_YEAR_SUPPORT_AR, SECOND_YEAR_SUPPORT_AR];
  const hadFeatures = Array.isArray(pkg.features) && pkg.features.length > 0;
  const features = hadFeatures ? [...pkg.features] : [];
  if (hadFeatures || !en) {
    for (const line of lines) {
      if (!features.some((f) => ALREADY.test(f) && ALREADY.test(line) && f === line)) {
        if (!features.includes(line)) features.push(line);
      }
    }
  }
  const sentence = `${lines[0]}. ${lines[1]}.`;
  let desc = String(pkg.desc || "").trim();
  if (desc && !ALREADY.test(desc) && !/السنة الثانية|second year/i.test(desc)) desc = `${desc} ${sentence}`;
  return { ...pkg, ...(desc ? { desc } : {}), ...(hadFeatures || !en ? { features } : {}) };
}

export function scrubOldSupportPrice(value) {
  if (typeof value === "string") return rewriteLegacyCopy(value.replace(OLD_SUPPORT_PRICE, SECOND_YEAR_SUPPORT_AR));
  if (Array.isArray(value)) return value.map(scrubOldSupportPrice);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = scrubOldSupportPrice(item);
    return out;
  }
  return value;
}
