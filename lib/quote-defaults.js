// بنود عرض السعر الافتراضية: أسعار الباقات كما هي في بيانات الموقع، ومزاياها كاملة.
import { BIG_STORE_NAME, BIG_STORE_NAME_EN } from "./big-store.js";
import { DEMO_SHOTS } from "./demo-media.js";
import { PAYMENT_TERM_AR, PURCHASE_NAME, PURCHASE_NAME_EN, SUBSCRIPTION_FEATURES_AR, SUBSCRIPTION_NAME, SUBSCRIPTION_NAME_EN } from "./platform-offer.js";
import { FIRST_YEAR_SUPPORT_AR, SECOND_YEAR_SUPPORT_AR } from "./support-offer.js";

export const FREE_SUPPORT_LINE = FIRST_YEAR_SUPPORT_AR;
export const SECOND_YEAR_SUPPORT_LINE = SECOND_YEAR_SUPPORT_AR;

const STORE_NAMES = new Set([
  SUBSCRIPTION_NAME,
  SUBSCRIPTION_NAME_EN,
  BIG_STORE_NAME,
  BIG_STORE_NAME_EN,
  "متجر كبير",
  "باقة المتجر الكبير",
  "باقة المتجر الكبير شامل التطبيق",
]);
const PURCHASE_NAMES = new Set([PURCHASE_NAME, PURCHASE_NAME_EN]);

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

export function isPurchasePackage(p) {
  return PURCHASE_NAMES.has(String(p?.name || "").trim());
}

export function isWebsitePackage(p) {
  if (!p || isStorePackage(p) || isPurchasePackage(p)) return false;
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

function showcaseLines() {
  return DEMO_SHOTS.map((shot) => String(shot?.caption || "").trim()).filter(Boolean);
}

function freeAddonLines(addons) {
  return (Array.isArray(addons) ? addons : [])
    .filter((a) => a && isFreePrice(a.price) && !/دعم|support|دفع|شحن|payment|shipping|ios|إشعار|زاتكا|ذكا/i.test(String(a.title || "")))
    .map((a) => `${String(a.title).trim()} — مجاناً`)
    .filter((line) => !/^—/.test(line));
}

function tierNote(pkg) {
  const tiers = Array.isArray(pkg?.tiers) ? pkg.tiers : [];
  const range = tiers.map((t) => [t.label, t.price, t.unit].filter(Boolean).join(" ")).join(" · ");
  return range ? `النطاق المنشور: ${range}` : "";
}

function featureGroups(pkg, { addons, siteFeatures }) {
  const website = isWebsitePackage(pkg);
  const store = isStorePackage(pkg);
  const own = Array.isArray(pkg.features) ? pkg.features : [];
  const siteTitles = (Array.isArray(siteFeatures) ? siteFeatures : [])
    .map((f) => (typeof f === "string" ? f : f?.title))
    .filter(Boolean);
  const base = store ? [...own, ...SUBSCRIPTION_FEATURES_AR] : [...own, ...descInclusions(pkg.desc), ...(website ? siteTitles : []), ...(website ? ["عرض الخدمة ورقم التواصل ونموذج الطلب"] : [])];
  const extras = store ? showcaseLines() : [];
  return [base, extras, freeAddonLines(addons)];
}

// الاشتراك والشراء، وأي موقع تعريفي ما زال موجوداً في البيانات.
export function quotePackageSections({ packages, addons, siteFeatures } = {}) {
  const sections = [];
  for (const pkg of Array.isArray(packages) ? packages : []) {
    if (!isStorePackage(pkg) && !isWebsitePackage(pkg) && !isPurchasePackage(pkg)) continue;
    const name = String(pkg.name || "").trim();
    if (!name) continue;
    sections.push({
      title: name,
      desc: String(pkg.desc || "").trim(),
      qty: 1,
      price: packageAmount(pkg.price),
      note: tierNote(pkg),
      features: [...packageFeatures(pkg, { addons, siteFeatures }), FREE_SUPPORT_LINE, SECOND_YEAR_SUPPORT_LINE].filter((line, index, all) => all.indexOf(line) === index),
      tags: [],
    });
  }
  return sections;
}

function packageFeatures(pkg, { addons, siteFeatures } = {}) {
  return mergeFeatureLines(featureGroups(pkg, { addons, siteFeatures })).filter((line) => !/(?<!\d)7[,\s٬]?200(?!\d)/.test(line) && !/تكامل محاسبي|استيراد بالذكاء|توليد بنر|AI import|AI banner/i.test(line));
}

/* ---------- منشئ عرض السعر: باقة واحدة بمستواها، ودعم فني واضح في قسم مستقل ---------- */

const MONTHLY = /شهر|month/i;
const fmt = (n) => Number(n || 0).toLocaleString("en-US");

// أول رقم وآخر رقم في نطاق مثل «2,000 – 3,000»
export function priceRange(price) {
  const s = String(price ?? "").replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[٬،,]/g, "");
  const nums = (s.match(/\d+(?:\.\d+)?/g) || []).map(Number).filter((n) => n > 0);
  return { min: nums[0] || 0, max: nums[nums.length - 1] || 0 };
}

export function isPurchaseLike(pkg) {
  return isPurchasePackage(pkg) || /شراء|تملّك|تملك|purchase|own/i.test(`${pkg?.name || ""} ${pkg?.label || ""}`);
}

// مستويات الباقة: ما يُدفع مرة واحدة، وما يُدفع شهرياً. المستوى بدون رقم (مثل «شهران مجاناً») معلومة فقط.
export function packageOptions(pkg) {
  const name = String(pkg?.name || "").trim();
  const tiers = (Array.isArray(pkg?.tiers) ? pkg.tiers : []).map((t) => ({ label: String(t?.label || "").trim(), price: String(t?.price || "").trim(), unit: String(t?.unit || "").trim(), ...priceRange(t?.price) }));
  const priced = tiers.filter((t) => t.min > 0);
  const once = priced.filter((t) => !MONTHLY.test(t.unit));
  const monthly = priced.filter((t) => MONTHLY.test(t.unit));
  if (!once.length && !monthly.length && packageAmount(pkg?.price) > 0) once.push({ label: name, price: String(pkg.price), unit: String(pkg.unit || ""), ...priceRange(pkg.price) });
  return { name, purchase: isPurchaseLike(pkg), annual: tiers.some((t) => /سنوي|annual/i.test(t.label)), once, monthly };
}

const BUG_LINE = `${FREE_SUPPORT_LINE}.`;
const WA_LINE = "التواصل للدعم عبر واتساب في أوقات العمل.";

// نقاط الدعم الفني كما تظهر للعميل في قسم «الدعم الفني»
export function supportPoints({ purchase, freeMonths = 1, maintenance } = {}) {
  if (!purchase)
    return [
      "الدعم الفني مشمول في الاشتراك طوال مدته، بدون رسوم إضافية.",
      "يشمل إصلاح الأعطال، والاستضافة، والنسخ الاحتياطي، وتحديثات الأمان والمنصة.",
      WA_LINE,
      BUG_LINE,
      "إذا تأخر السداد يتوقف الدعم بعد 7 أيام، ويتوقف المتجر بعد 15 يوماً.",
    ];
  const m = maintenance?.min > 0 ? maintenance : null;
  const range = m ? (m.max > m.min ? `من ${fmt(m.min)} إلى ${fmt(m.max)} ريال شهرياً` : `${fmt(m.min)} ريال شهرياً`) : "";
  return [
    `دعم مجاني لإصلاح الأعطال لمدة ${Number(freeMonths) === 2 ? "شهرين" : "شهر"} من تاريخ التسليم.`,
    `بعدها عقد صيانة اختياري${range ? ` ${range}` : " حسب الاتفاق"}، يشمل إصلاح الأعطال وتحديثات الأمان والنسخ الاحتياطي والدعم.`,
    WA_LINE,
    BUG_LINE,
  ];
}

// صيانة ما بعد الشراء من باقة الشراء في الموقع (إن وُجدت)
export function maintenanceTier(packages) {
  const pkg = (Array.isArray(packages) ? packages : []).find(isPurchaseLike);
  return pkg ? packageOptions(pkg).monthly[0] || null : null;
}

const amount = (v, fallback) => (v === "" || v == null || !Number.isFinite(Number(v)) ? fallback : Math.max(0, Number(v)));

// عرض سعر من باقة واحدة. choice: { once, oncePrice, monthly (-1 = بدون), monthlyPrice, billing: monthly|annual, freeMonths }
export function quoteFromPackage(pkg, choice = {}, { addons, siteFeatures } = {}) {
  const o = packageOptions(pkg);
  // سطور الدعم والصيانة تنتقل إلى قسم «الدعم الفني» حتى لا تتكرر أو تتعارض مع المدة المختارة
  const features = packageFeatures(pkg, { addons, siteFeatures }).filter((line) => !sameFeature(line, FREE_SUPPORT_LINE) && !/دعم مجاني|صيانة/.test(line));
  const sections = [];
  const one = o.once[Number(choice.once) || 0];
  if (one)
    sections.push({
      title: one.label && one.label !== o.name ? `${o.name}: ${one.label}` : o.name,
      desc: String(pkg.desc || "").trim(),
      qty: 1,
      price: amount(choice.oncePrice, one.min),
      note: "يُدفع مرة واحدة",
      features,
      tags: [],
    });
  const mon = o.purchase || Number(choice.monthly) === -1 ? null : o.monthly[Number(choice.monthly) || 0];
  const annual = o.annual && choice.billing === "annual";
  const recurring = [];
  if (mon) {
    const price = amount(choice.monthlyPrice, mon.min);
    sections.push({
      title: `الاشتراك ${annual ? "السنوي" : "الشهري"}: ${mon.label}`,
      desc: one ? "" : String(pkg.desc || "").trim(),
      qty: annual ? 10 : 1,
      price,
      note: annual ? "سنة كاملة: 12 شهراً بسعر 10 أشهر، ويُدفع مقدّماً" : "الشهر الأول، ويُدفع مقدّماً",
      features: one ? [] : features,
      tags: [],
    });
    recurring.push(
      annual
        ? `يتجدد الاشتراك سنوياً بمبلغ ${fmt(price * 10)} ريال (12 شهراً بسعر 10)، ويُدفع مقدّماً.`
        : `يتجدد الاشتراك شهرياً بمبلغ ${fmt(price)} ريال، ويُدفع مقدّماً.${o.annual ? " وعند الدفع السنوي: شهران مجاناً." : ""}`
    );
  }
  return {
    title: o.name,
    intro: "",
    sections,
    recurring,
    support: supportPoints({ purchase: o.purchase, freeMonths: choice.freeMonths, maintenance: o.purchase ? o.monthly[0] : null }),
  };
}

/* ---------- جدول الدفعات ---------- */

const SUB_LINE = /^الاشتراك (الشهري|السنوي)/;
const APPS = /تطبيق|iOS|Android/i;
export const PAYMENT_TERM = PAYMENT_TERM_AR;
// الشروط القديمة التي تذكر تقسيماً ثابتاً تتعارض مع الجدول، فتُستبدل بسطر يحيل إليه
const OLD_PAYMENT_TERM = /^الدفع(\s|:)|50% عند (التعاقد|توقيع)/;

export function withPaymentTerm(terms) {
  const out = [];
  for (const t of Array.isArray(terms) ? terms : []) {
    const line = OLD_PAYMENT_TERM.test(String(t)) ? PAYMENT_TERM : t;
    if (!out.includes(line)) out.push(line);
  }
  if (!out.includes(PAYMENT_TERM)) out.unshift(PAYMENT_TERM);
  return out;
}

const lineTotal = (s) => (Number(s.price) || 0) * (Math.max(1, Number(s.qty) || 1));

// يقسّم المبالغ على المراحل، ويأخذ آخر مبلغ فرق التقريب حتى يساوي المجموع الإجمالي بالضبط
function split(total, shares) {
  const out = shares.map(([title, when, pct]) => ({ title, when, amount: Math.round((total * pct) / 100) }));
  if (out.length) out[out.length - 1].amount += total - out.reduce((n, p) => n + p.amount, 0);
  return out;
}

// جدول دفعات مقترح من بنود الوثيقة وإجماليها (بعد الخصم والضريبة)
export function paymentPlan(doc) {
  const sections = Array.isArray(doc?.sections) ? doc.sections : [];
  const subtotal = sections.reduce((n, s) => n + lineTotal(s), 0);
  if (subtotal <= 0) return [];
  const discount = Math.min(Number(doc.discount) || 0, subtotal);
  const total = Math.round((subtotal - discount) * (1 + (Number(doc.vatRate) || 0) / 100));
  const scale = total / subtotal;
  const sub = sections.filter((s) => SUB_LINE.test(String(s.title || "")));
  if (sub.length) {
    const subAmount = Math.round(sub.reduce((n, s) => n + lineTotal(s), 0) * scale);
    const once = total - subAmount;
    const annual = sub.some((s) => /السنوي/.test(s.title));
    const first = annual ? "السنة الأولى من الاشتراك مقدّماً" : "الشهر الأول من الاشتراك مقدّماً";
    if (once <= 0) return [{ title: first, when: "عند إطلاق المتجر", amount: total }];
    if (once < 5000)
      return [
        { title: "رسوم التجهيز", when: "عند التعاقد", amount: once },
        { title: first, when: "عند إطلاق المتجر، ثم يتجدد مقدّماً", amount: subAmount },
      ];
    const half = Math.round(once / 2);
    return [
      { title: "الدفعة الأولى: 50% من التجهيز", when: "عند التعاقد", amount: half },
      { title: `باقي التجهيز مع ${first.replace(" مقدّماً", "")}`, when: "عند إطلاق المتجر، ثم يتجدد الاشتراك مقدّماً", amount: once - half + subAmount },
    ];
  }
  if (total < 5000)
    return split(total, [
      ["الدفعة الأولى (50%)", "عند التعاقد", 50],
      ["الدفعة الثانية (50%)", "عند التسليم والإطلاق", 50],
    ]);
  const apps = sections.some((s) => APPS.test(`${s.title} ${s.desc}`));
  return split(total, [
    ["الدفعة الأولى (50%)", "عند التعاقد", 50],
    ["الدفعة الثانية (30%)", "عند عرض المتجر على رابط تجريبي", 30],
    ["الدفعة الأخيرة (20%)", apps ? "عند إطلاق المتجر ورفع التطبيقين للمراجعة في App Store وGoogle Play" : "عند التسليم والإطلاق", 20],
  ]);
}
