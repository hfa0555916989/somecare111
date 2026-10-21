import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BIG_STORE_FEATURES, STORE_PAGE_FREE } from "../lib/big-store.js";
import { DEMO_SHOTS } from "../lib/demo-media.js";
import { SEO_PAGES } from "../lib/seo-pages.js";
import { quotePackageSections, sameFeature, packageAmount, FREE_SUPPORT_LINE, SECOND_YEAR_SUPPORT_LINE } from "../lib/quote-defaults.js";

const livePackages = [
  {
    name: "موقع تعريفي احترافي",
    price: "450",
    unit: "ريال فقط",
    desc: "شامل الدومين والاستضافة لأول سنة",
    features: ["لوحة تحكم كاملة", "سرعة فائقة", "متجاوب لكل الأجهزة", "تهيئة SEO", "تحليلات جوجل", "تسليم خلال أيام"],
  },
  {
    name: "باقة المتجر الكبير شامل التطبيق",
    price: "1,500",
    unit: "ريال",
    desc: "منتجات غير محدودة، مع تطبيق iOS و Android، والإضافات الأساسية مجاناً",
    features: ["منتجات غير محدودة"],
  },
];

const liveAddons = [
  { title: "بوابة دفع", price: "مجاناً", desc: "داخل باقة المتجر الكبير شامل التطبيق" },
  { title: "ربط شركة شحن واحدة", price: "مجاناً", desc: "داخل باقة المتجر الكبير شامل التطبيق" },
  { title: "الدعم الفني", price: "7200/سنوي", desc: "أمان وتحديثات مستمرة" },
];

const liveFeatures = [
  { title: "تسليم خلال أيام قليلة" },
  { title: "تحكم كامل بالمحتوى" },
  { title: "أمان وتحديثات مستمرة" },
  { title: "سرعة فائقة" },
  { title: "تهيئة SEO" },
  { title: "تحليلات جوجل" },
];

function covers(lines, needle) {
  return lines.some((line) => line === needle || sameFeature(line, needle));
}

test("package amounts keep the published digits", () => {
  assert.equal(packageAmount("1,500"), 1500);
  assert.equal(packageAmount("450"), 450);
  assert.equal(packageAmount("1,100"), 1100);
  assert.equal(packageAmount("7200/سنوي"), 7200);
});

test("a new quote uses the prices stored on the packages, including the live 450 website", () => {
  const sections = quotePackageSections({ packages: livePackages, addons: liveAddons, siteFeatures: liveFeatures });
  assert.deepEqual(
    sections.map((s) => [s.title, s.price]),
    [
      ["موقع تعريفي احترافي", 450],
      ["باقة المتجر الكبير شامل التطبيق", 1500],
    ]
  );
  assert.ok(sections.every((s) => !String(s.features).includes("7200")));
  assert.ok(sections.every((s) => s.price !== 7200));
  assert.ok(sections.every((s) => s.features.includes(FREE_SUPPORT_LINE) && s.features.includes(SECOND_YEAR_SUPPORT_LINE)));
});

test("prices are taken from the package records passed in", () => {
  const sections = quotePackageSections({
    packages: [
      { name: "موقع تعريفي احترافي", price: "1,100", desc: "شامل الدومين والاستضافة لأول سنة", features: ["لوحة تحكم كاملة"] },
      { name: "باقة المتجر الكبير شامل التطبيق", price: "1,500", features: BIG_STORE_FEATURES },
    ],
    addons: [],
    siteFeatures: [],
  });
  assert.equal(sections[0].price, 1100);
  assert.equal(sections[1].price, 1500);
});

test("the store line keeps every published package feature and the free extras", () => {
  const store = quotePackageSections({ packages: livePackages, addons: liveAddons, siteFeatures: liveFeatures })[1];
  for (const feature of BIG_STORE_FEATURES) assert.ok(store.features.includes(feature), feature);
  for (const feature of STORE_PAGE_FREE) assert.ok(covers(store.features, feature), feature);
  for (const shot of DEMO_SHOTS) assert.ok(covers(store.features, shot.caption), shot.caption);
  for (const page of SEO_PAGES) {
    for (const block of page.blocks) {
      if (block.type !== "ul") continue;
      for (const item of block.items) assert.ok(covers(store.features, item), item);
    }
  }
  assert.ok(store.features.includes("دخول العميل لحسابه من الجوال"));
  assert.ok(covers(store.features, "بوابة دفع"));
  assert.ok(covers(store.features, "ربط شركة شحن واحدة"));
  assert.ok(!store.features.some((f) => /(?<!\d)7200(?!\d)/.test(f)));
  assert.ok(store.features.length <= 120);
});

test("the website line keeps its card, the inclusions, and the site feature titles", () => {
  const site = quotePackageSections({ packages: livePackages, addons: liveAddons, siteFeatures: liveFeatures })[0];
  for (const feature of livePackages[0].features) assert.ok(covers(site.features, feature), feature);
  assert.ok(covers(site.features, "الدومين والاستضافة لأول سنة"));
  assert.ok(site.features.includes("تحكم كامل بالمحتوى"));
  assert.ok(site.features.includes("عرض الخدمة ورقم التواصل ونموذج الطلب"));
  assert.ok(site.features.includes(FREE_SUPPORT_LINE));
  assert.ok(covers(site.features, "بوابة دفع"));
  assert.equal(site.price, 450);
});

test("saved documents keep every feature the quote page prints", () => {
  const store = quotePackageSections({ packages: livePackages, addons: liveAddons, siteFeatures: liveFeatures })[1];
  const docs = readFileSync(new URL("../lib/docs.js", import.meta.url), "utf8");
  const limit = Number(docs.match(/features: lines\(s\?\.features, (\d+),/)[1]);
  assert.ok(store.features.length <= limit, `${store.features.length} features exceed the save limit ${limit}`);
  assert.ok(store.features.length > 20);
});

test("the public quote renders every feature, and print does not hide them", () => {
  const page = readFileSync(new URL("../app/doc/[token]/page.js", import.meta.url), "utf8");
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(page, /s\.features\.map/);
  assert.match(css, /@media print\{[\s\S]*\.feats\{display:grid/);
  assert.doesNotMatch(css, /\.feats\{[^}]*display:\s*none/);
});
