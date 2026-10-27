import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEMO_SHOTS } from "../lib/demo-media.js";
import { PACKAGES_AR, SUBSCRIPTION_FEATURES_AR, QUOTE_TERMS_AR, alignCommercialContent } from "../lib/platform-offer.js";
import { quotePackageSections, sameFeature, packageAmount, FREE_SUPPORT_LINE, SECOND_YEAR_SUPPORT_LINE, packageOptions, quoteFromPackage, supportPoints, maintenanceTier, paymentPlan, withPaymentTerm, PAYMENT_TERM } from "../lib/quote-defaults.js";

const livePackages = PACKAGES_AR;

function covers(lines, needle) {
  return lines.some((line) => line === needle || sameFeature(line, needle));
}

test("package amounts keep the first published number in a range", () => {
  assert.equal(packageAmount("2,000 – 3,000"), 2000);
  assert.equal(packageAmount("12,000"), 12000);
  assert.equal(packageAmount("300 – 500"), 300);
  assert.equal(packageAmount("شهران مجاناً"), 0);
});

test("a new quote uses the subscription and purchase floors, not the retired 1,500", () => {
  const sections = quotePackageSections({ packages: livePackages, addons: [], siteFeatures: [] });
  assert.deepEqual(
    sections.map((s) => [s.title, s.price]),
    [
      ["اشتراك المتجر", 2000],
      ["شراء المتجر", 12000],
    ]
  );
  assert.match(sections[0].note, /2,000 – 3,000/);
  assert.match(sections[0].note, /300 – 500/);
  assert.match(sections[1].note, /20,000 – 30,000/);
  assert.ok(sections.every((s) => !String(s.features).includes("7200")));
  assert.ok(sections.every((s) => s.features.includes(FREE_SUPPORT_LINE) && s.features.includes(SECOND_YEAR_SUPPORT_LINE)));
});

test("prices are taken from the package records passed in", () => {
  const sections = quotePackageSections({
    packages: [
      { name: "موقع تعريفي احترافي", price: "1,100", desc: "شامل الدومين والاستضافة لأول سنة", features: ["لوحة تحكم كاملة"] },
      { name: "اشتراك المتجر", price: "2,000", features: ["نسخة مستقلة من المنصة لكل عميل"] },
    ],
    addons: [],
    siteFeatures: [],
  });
  assert.equal(sections[0].price, 1100);
  assert.equal(sections[1].price, 2000);
});

test("the subscription quote keeps the published features and does not call payment free", () => {
  const store = quotePackageSections({ packages: livePackages, addons: [{ title: "بوابة دفع", price: "مجاناً" }], siteFeatures: [] })[0];
  for (const feature of SUBSCRIPTION_FEATURES_AR) assert.ok(covers(store.features, feature), feature);
  for (const shot of DEMO_SHOTS) assert.ok(covers(store.features, shot.caption), shot.caption);
  assert.ok(!store.features.some((f) => /مجاناً/.test(f) && /دفع|شحن/.test(f)));
  assert.ok(!store.features.some((f) => /مدى|Apple Pay|STC Pay|تكامل محاسبي/.test(f)));
  assert.ok(!store.features.some((f) => /(?<!\d)7200(?!\d)/.test(f)));
  assert.ok(store.features.length <= 120);
  assert.ok(store.features.length > 8);
});

test("the website line keeps its card and the site feature titles", () => {
  const site = quotePackageSections({
    packages: [{ name: "موقع تعريفي احترافي", price: "1,100", desc: "شامل الدومين والاستضافة لأول سنة", features: ["لوحة تحكم كاملة"] }],
    addons: [],
    siteFeatures: [{ title: "تحكم كامل بالمحتوى" }],
  })[0];
  assert.ok(covers(site.features, "لوحة تحكم كاملة"));
  assert.ok(covers(site.features, "الدومين والاستضافة لأول سنة"));
  assert.ok(site.features.includes("تحكم كامل بالمحتوى"));
  assert.ok(site.features.includes("عرض الخدمة ورقم التواصل ونموذج الطلب"));
  assert.ok(site.features.includes(FREE_SUPPORT_LINE));
  assert.equal(site.price, 1100);
});

test("saved documents keep every feature the quote page prints", () => {
  const store = quotePackageSections({ packages: livePackages, addons: [], siteFeatures: [] })[0];
  const docs = readFileSync(new URL("../lib/docs.js", import.meta.url), "utf8");
  const limit = Number(docs.match(/features: lines\(s\?\.features, (\d+),/)[1]);
  assert.ok(store.features.length <= limit, `${store.features.length} features exceed the save limit ${limit}`);
  assert.ok(store.features.length > 8);
});

test("the public quote renders every feature, and print does not hide them", () => {
  const page = readFileSync(new URL("../app/doc/[token]/page.js", import.meta.url), "utf8");
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(page, /s\.features\.map/);
  assert.match(css, /@media print\{[\s\S]*\.feats\{display:grid/);
  assert.doesNotMatch(css, /\.feats\{[^}]*display:\s*none/);
});

const [subscription, purchase] = livePackages;
const clientText = (q) => JSON.stringify([q.title, q.intro, q.sections, q.recurring, q.support]);

test("a subscription quote bills the setup and the first month, never the purchase", () => {
  const q = quoteFromPackage(subscription, {});
  assert.deepEqual(
    q.sections.map((s) => [s.title, s.qty, s.price]),
    [
      ["اشتراك المتجر: تجهيز وتخصيص", 1, 2000],
      ["الاشتراك الشهري: متجر بدون تطبيقات", 1, 300],
    ]
  );
  assert.match(q.recurring[0], /شهرياً بمبلغ 300 ريال/);
  assert.ok(q.sections[0].features.length > 8);
});

test("the chosen level, price and annual billing go into the quote", () => {
  const q = quoteFromPackage(subscription, { monthly: 1, monthlyPrice: 1000, oncePrice: 2500, billing: "annual" });
  assert.deepEqual(q.sections.map((s) => [s.qty, s.price]), [[1, 2500], [10, 1000]]);
  assert.match(q.sections[1].title, /السنوي: متجر مع التطبيقات/);
  assert.match(q.recurring[0], /سنوياً بمبلغ 10,000 ريال/);
  assert.equal(quoteFromPackage(subscription, { monthly: -1 }).sections.length, 1);
});

test("a purchase quote is one line, and its support says the free period and the maintenance range", () => {
  const q = quoteFromPackage(purchase, { once: 1, freeMonths: 2 });
  assert.deepEqual(q.sections.map((s) => [s.title, s.price]), [["شراء المتجر: المتجر مع تطبيقي iOS وAndroid", 20000]]);
  assert.deepEqual(q.recurring, []);
  assert.match(q.support[0], /لمدة شهرين من تاريخ التسليم/);
  assert.match(q.support[1], /من 500 إلى 800 ريال شهرياً/);
  assert.ok(!q.sections[0].features.some((f) => /دعم مجاني|صيانة/.test(f)));
});

test("support is its own clear section and the client never sees notes meant for the owner", () => {
  for (const q of [quoteFromPackage(subscription, {}), quoteFromPackage(purchase, {})]) {
    assert.ok(q.support.length >= 4);
    assert.ok(q.support.some((x) => x.includes(FREE_SUPPORT_LINE)));
    assert.doesNotMatch(clientText(q), /احذف|قبل إرسال|يُعدَّل داخل النطاق/);
  }
  assert.match(supportPoints({ purchase: false })[0], /مشمول في الاشتراك/);
  assert.match(supportPoints({ purchase: true, freeMonths: 1, maintenance: maintenanceTier(livePackages) })[0], /لمدة شهر من/);
  assert.match(supportPoints({ purchase: true })[1], /حسب الاتفاق/);
  for (const s of quotePackageSections({ packages: livePackages })) assert.doesNotMatch(s.note, /احذف/);
});

test("a renamed package keeps its levels in the quote builder", () => {
  const o = packageOptions({ ...subscription, name: "باقة الاشتراك" });
  assert.equal(o.name, "باقة الاشتراك");
  assert.deepEqual(o.once.map((t) => t.min), [2000]);
  assert.deepEqual(o.monthly.map((t) => [t.min, t.max]), [[300, 500], [700, 1000]]);
  assert.equal(packageOptions({ ...purchase, name: "تملّك المتجر" }).purchase, true);
  assert.deepEqual(packageOptions({ name: "موقع تعريفي", price: "1,100" }).once.map((t) => t.min), [1100]);
});

test("documents save the support points and the public page shows them", () => {
  const docs = readFileSync(new URL("../lib/docs.js", import.meta.url), "utf8");
  const page = readFileSync(new URL("../app/doc/[token]/page.js", import.meta.url), "utf8");
  assert.match(docs, /support: lines\(b\.support/);
  assert.match(page, /الدعم الفني[\s\S]*doc\.support\.map/);
});

const sum = (plan) => plan.reduce((n, p) => n + p.amount, 0);

test("a subscription pays the setup at signing and the first period at launch", () => {
  const monthly = paymentPlan(quoteFromPackage(subscription, {}));
  assert.deepEqual(monthly.map((p) => [p.when.split("،")[0], p.amount]), [["عند التعاقد", 2000], ["عند إطلاق المتجر", 300]]);
  const annual = paymentPlan(quoteFromPackage(subscription, { monthly: 1, billing: "annual" }));
  assert.equal(annual[1].amount, 7000);
  assert.match(annual[1].title, /السنة الأولى/);
});

test("large one-time work inside a subscription is split in half", () => {
  const q = quoteFromPackage(subscription, {});
  q.sections.push({ title: "ميزة خاصة", price: 6000, qty: 1 });
  assert.deepEqual(paymentPlan(q).map((p) => p.amount), [4000, 4300]);
});

test("a purchase pays 50/30/20 and the apps payment does not wait for store review", () => {
  const plan = paymentPlan(quoteFromPackage(purchase, { once: 1 }));
  assert.deepEqual(plan.map((p) => p.amount), [10000, 6000, 4000]);
  assert.match(plan[2].when, /رفع التطبيقين للمراجعة/);
  assert.doesNotMatch(paymentPlan(quoteFromPackage(purchase, {}))[2].when, /التطبيقين/);
});

test("payments always add up to the total after discount and VAT, and small projects pay in two", () => {
  const d = { ...quoteFromPackage(purchase, { oncePrice: 12345 }), discount: 345, vatRate: 15 };
  assert.equal(sum(paymentPlan(d)), Math.round(12000 * 1.15));
  const small = paymentPlan({ sections: [{ title: "موقع", price: 3001, qty: 1 }] });
  assert.deepEqual(small.map((p) => p.amount), [1501, 1500]);
  assert.deepEqual(paymentPlan({ sections: [] }), []);
});

test("a fixed 50/50 term gives way to the payment schedule", () => {
  const terms = withPaymentTerm(["مدة التنفيذ", "الدفع: 50% عند توقيع العقد، و50% عند التسليم والإطلاق، بالتحويل البنكي."]);
  assert.deepEqual(terms, ["مدة التنفيذ", PAYMENT_TERM]);
  assert.equal(withPaymentTerm(["أ"])[0], PAYMENT_TERM);
  assert.equal(QUOTE_TERMS_AR[0], PAYMENT_TERM);
});

test("saved quote terms drop the old payment line and the owner-only note", () => {
  const old = ["الدفع في الاشتراك: رسوم التجهيز عند التعاقد، ثم الاشتراك الشهري. في الشراء: 50% عند التعاقد و50% عند التسليم.", "الأرقام في البنود بداية النطاق المنشور، وتُعدَّل داخل النطاق قبل إرسال العرض."];
  const terms = alignCommercialContent({ contracts: { quoteTerms: old } }).contracts.quoteTerms;
  assert.deepEqual(terms, QUOTE_TERMS_AR);
});

test("documents save the payment schedule and the public page shows it", () => {
  const docs = readFileSync(new URL("../lib/docs.js", import.meta.url), "utf8");
  const page = readFileSync(new URL("../app/doc/[token]/page.js", import.meta.url), "utf8");
  assert.match(docs, /payments: \(Array\.isArray\(b\.payments\)/);
  assert.match(page, /جدول الدفعات[\s\S]*doc\.payments\.map/);
});
