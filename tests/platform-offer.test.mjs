import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ADVANCED_AR, ADVANCED_EN, alignCommercialContent } from "../lib/platform-offer.js";

const INCLUDED = ["ميسر", "تابي", "تمارا", "الراجحي", "أرامكس", "سمسا", "أوتو", "طرود", "البريد السعودي", "زاتكا", "iOS", "Android", "إشعارات الدفع"];

test("stored legacy packages are replaced on read", () => {
  const merged = alignCommercialContent({
    packages: [
      { name: "موقع تعريفي احترافي", price: "1,100", unit: "ريال فقط", features: ["تسليم خلال أيام"] },
      { name: "باقة المتجر الكبير شامل التطبيق", price: "1,500", unit: "ريال", features: ["بوابات دفع: مدى — مجاناً"] },
    ],
    addons: [{ title: "بوابة دفع", price: "مجاناً", desc: "داخل باقة المتجر الكبير شامل التطبيق" }],
    features: [{ icon: "shield", title: "أمان وتحديثات مستمرة", desc: "ثم 200 ريال للسنة الثانية." }],
  });
  assert.deepEqual(merged.packages.map((p) => p.name), ["اشتراك المتجر", "شراء المتجر"]);
  assert.equal(merged.packages[0].featured, true);
  assert.equal(merged.packages[1].featured, false);
  assert.equal(merged.packages[0].tiers[1].price, "300 – 500");
  assert.equal(merged.packages[0].tiers[2].price, "700 – 1,000");
  assert.equal(merged.packages[1].tiers[0].price, "12,000 – 18,000");
  assert.ok(!JSON.stringify(merged.packages).includes("1,500"));
  assert.ok(!JSON.stringify(merged.packages).includes("1,100"));
  assert.equal(merged.addons[0].price, "ضمن التجهيز");
  assert.equal(merged.addons.find((a) => a.title === "إشعارات الدفع").price, "مع التطبيقات");
  assert.equal(merged.features.find((f) => f.icon === "shield").title, "دعم وإصلاح أعطال");
});

test("payment, shipping, ZATCA, both apps and push are offered as part of the platform", () => {
  const content = alignCommercialContent({
    packages: [],
    addons: [],
    features: [],
    titles: { addons: "ما زال {قريباً}" },
    legal: { terms: { body: "بوابات الدفع ليست مفعّلة على حسابات حقيقية، وتُعرض قريباً أو حسب الطلب." } },
  });
  const blob = JSON.stringify({ packages: content.packages, addons: content.addons, titles: content.titles });
  for (const name of INCLUDED) {
    assert.match(blob, new RegExp(name));
  }
  assert.doesNotMatch(blob, /قريباً|حسب الطلب|Coming soon|AI import|استيراد بالذكاء/);
  assert.doesNotMatch(blob, /تكامل محاسبي|توليد بنر|AI banner/);
  assert.match(blob, /أسبوع إلى أسبوعين/);
  assert.match(blob, /شهران مجاناً/);
  assert.match(blob, /500 – 800/);
  assert.match(content.legal.terms.body, /جزء من المنصة/);
  assert.doesNotMatch(content.legal.terms.body, /ليست مفعّلة|استيراد الذكاء/);
});

test("order tracking is listed for the customer and the merchant", () => {
  const ar = JSON.stringify(ADVANCED_AR);
  const en = JSON.stringify(ADVANCED_EN);
  assert.match(ar, /أين وصل ومن معه/);
  assert.match(ar, /تتبع حي لحالة الطلب وموقعه/);
  assert.match(en, /where the order is and who has it/);
  assert.match(en, /Live order status and location tracking/);
  assert.doesNotMatch(ar + en, /قريباً|حسب الطلب|AI import|استيراد بالذكاء|تكامل محاسبي/);
});

test("marketing pages no longer sell the retired 1,500 or 1,100 package", () => {
  const files = [
    "../lib/seo-pages.js",
    "../lib/sitelinks.js",
    "../app/SitelinkPage.js",
    "../app/app-store-development/page.js",
    "../app/HomePage.js",
    "../app/SeoArticle.js",
  ];
  const banned = [/1[,٬]?500\s*ريال/, /1[,٬]?100\s*ريال/, /200 ريال للسنة/, /1500 ريال/, /باقة 1500/, /قريباً أو حسب الطلب/, /ليست مفعّلة/, /Coming soon/, /AI import/, /استيراد بالذكاء/, /تطبيق iOS قريباً/];
  for (const file of files) {
    const text = readFileSync(new URL(file, import.meta.url), "utf8");
    for (const re of banned) assert.doesNotMatch(text, re, `${file} still matches ${re}`);
  }
});
