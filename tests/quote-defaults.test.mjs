import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BIG_STORE_FEATURES } from "../lib/big-store.js";
import { DEMO_SHOTS } from "../lib/demo-media.js";
import { PACKAGES_AR } from "../lib/platform-offer.js";
import { quotePackageSections, sameFeature, packageAmount, FREE_SUPPORT_LINE, SECOND_YEAR_SUPPORT_LINE } from "../lib/quote-defaults.js";

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
  for (const feature of BIG_STORE_FEATURES) assert.ok(covers(store.features, feature), feature);
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
