// بنود عرض السعر الافتراضية: أسعار الباقات كما هي في بيانات الموقع، ومزاياها كاملة.
import { BIG_STORE_FEATURES, BIG_STORE_NAME, BIG_STORE_NAME_EN, STORE_PAGE_FREE } from "./big-store.js";
import { DEMO_SHOTS } from "./demo-media.js";
import { SEO_PAGES } from "./seo-pages.js";
import { FIRST_YEAR_SUPPORT_AR, SECOND_YEAR_SUPPORT_AR } from "./support-offer.js";

export const FREE_SUPPORT_LINE = FIRST_YEAR_SUPPORT_AR;
export const SECOND_YEAR_SUPPORT_LINE = SECOND_YEAR_SUPPORT_AR;

const STORE_NAMES = new Set([BIG_STORE_NAME, BIG_STORE_NAME_EN, "متجر كبير", "باقة المتجر الكبير"]);

const STOP = new Set(["مع", "في", "من", "على", "هذا", "هذه", "داخل", "السعر", "بعد", "قبل", "عند", "الى", "إلى", "كل", "غير"]);

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/مجاناً?|مجاني|free/gi, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s) {
  return norm(s)
    .split(" ")
    .filter((w) => w.length >= 3 && !STOP.has(w));
}

function wordHit(a, b) {
  if (a === b) return true;
  const n = Math.min(a.length, b.length);
  return n >= 4 && (a.includes(b) || b.includes(a));
}

// سطران يصفان الميزة نفسها إذا تطابقت عبارتهما أو تقاربت كلماتهما دون أن يبتلع سطر قصير جملة أطول بكثير.
export function sameFeature(a, b) {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 8 && nb.length >= 8 && (na.includes(nb) || nb.includes(na))) return true;
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.length < 2 || tb.length < 2) return false;
  const [shorter, longer] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  if (longer.length > shorter.length * 1.8) return false;
  const hits = shorter.filter((w) => longer.some((x) => wordHit(w, x)));
  return hits.length / shorter.length >= 0.8;
}

export function mergeFeatureLines(groups) {
  const out = [];
  for (const group of groups) {
    for (const raw of group || []) {
      const line = String(raw || "").replace(/\s+/g, " ").trim();
      if (!line) continue;
      if (out.some((have) => sameFeature(have, line))) continue;
      out.push(line);
    }
  }
  return out;
}

export function packageAmount(price) {
  const s = String(price ?? "")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[٬،,\s]/g, "");
  const m = s.match(/\d+(?:\.\d+)?/);
  const n = m ? Number(m[0]) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function isStorePackage(p) {
  return STORE_NAMES.has(String(p?.name || "").trim());
}

export function isWebsitePackage(p) {
  if (!p || isStorePackage(p)) return false;
  return /تعريفي|business website|informational website|company website/i.test(String(p.name || ""));
}

function isFreePrice(price) {
  const p = String(price ?? "").trim();
  return /مجانا|مجاني|^free$/i.test(p) || p === "0";
}

function descInclusions(desc) {
  const m = String(desc || "").match(/شامل\s+([^.\n]+)/);
  return m ? [m[1].trim()] : [];
}

function seoStoreLines() {
  const lines = [];
  for (const page of SEO_PAGES) {
    for (const block of page.blocks || []) {
      if (block.type === "ul" && Array.isArray(block.items)) lines.push(...block.items);
      if (block.type === "rows" && Array.isArray(block.rows)) {
        for (const row of block.rows) {
          const label = String(row?.[0] || "").trim();
          const value = String(row?.[1] || "").trim();
          if (!label || /اختياري/.test(value)) continue;
          if (!/مجاناً|داخل السعر/.test(value)) continue;
          lines.push(/مجاناً/.test(value) ? `${label} — مجاناً` : label);
        }
      }
    }
  }
  return lines;
}

function showcaseLines() {
  return DEMO_SHOTS.map((shot) => String(shot?.caption || "").trim()).filter(Boolean);
}

function freeAddonLines(addons) {
  return (Array.isArray(addons) ? addons : [])
    .filter((a) => a && isFreePrice(a.price) && !/دعم|support/i.test(String(a.title || "")))
    .map((a) => `${String(a.title).trim()} — مجاناً`)
    .filter((line) => !/^—/.test(line));
}

function featureGroups(pkg, { addons, siteFeatures }) {
  const website = isWebsitePackage(pkg);
  const store = isStorePackage(pkg);
  const own = Array.isArray(pkg.features) ? pkg.features : [];
  const siteTitles = (Array.isArray(siteFeatures) ? siteFeatures : [])
    .map((f) => (typeof f === "string" ? f : f?.title))
    .filter(Boolean);
  const base = store ? [...own, ...BIG_STORE_FEATURES] : [...own, ...descInclusions(pkg.desc), ...(website ? siteTitles : []), ...(website ? ["عرض الخدمة ورقم التواصل ونموذج الطلب"] : [])];
  const extras = store ? [...seoStoreLines(), ...STORE_PAGE_FREE.map((line) => `${line} — مجاناً`), ...showcaseLines()] : [];
  return [base, extras, freeAddonLines(addons)];
}

// باقة المتجر + المواقع التعريفية فقط، بالترتيب الظاهر في بيانات الموقع.
export function quotePackageSections({ packages, addons, siteFeatures } = {}) {
  const sections = [];
  for (const pkg of Array.isArray(packages) ? packages : []) {
    if (!isStorePackage(pkg) && !isWebsitePackage(pkg)) continue;
    const name = String(pkg.name || "").trim();
    if (!name) continue;
    sections.push({
      title: name,
      desc: String(pkg.desc || "").trim(),
      qty: 1,
      price: packageAmount(pkg.price),
      note: "",
      features: [...mergeFeatureLines(featureGroups(pkg, { addons, siteFeatures })).filter((line) => !/(?<!\d)7[,\s٬]?200(?!\d)/.test(line)), FREE_SUPPORT_LINE, SECOND_YEAR_SUPPORT_LINE].filter((line, index, all) => all.indexOf(line) === index),
      tags: [],
    });
  }
  return sections;
}
