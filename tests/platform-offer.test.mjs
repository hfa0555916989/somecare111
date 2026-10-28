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
  assert.deepEqual(merged.packages.map((p) => p.name), [
    "اشتراك المتجر",
    "شراء المتجر",
    "موقع تعريفي احترافي",
    "موقع تعريفي متقدم",
    "موقع خدمي",
    "تطبيق خدمي",
    "موقع خدمي + تطبيق",
    "موقع خدمي + تطبيق عميل وتطبيق مقدّم خدمة",
  ]);
  assert.deepEqual(merged.packages.slice(2).map((p) => p.price), ["1,499", "2,999", "7,900", "13,500", "17,900", "20,000"]);
  assert.ok(merged.packages.slice(2).every((p) => p.oneTime && !p.featured));
  assert.equal(merged.packages[0].featured, true);
  assert.equal(merged.packages[1].featured, false);
  assert.equal(merged.packages[0].tiers[1].price, "300 – 500");
  assert.equal(merged.packages[0].tiers[2].price, "700 – 1,000");
  assert.equal(merged.packages[1].tiers[0].price, "12,000 – 18,000");
  assert.ok(!JSON.stringify(merged.packages).includes("1,500"));
  assert.ok(!JSON.stringify(merged.packages).includes("1,100"));
  assert.equal(merged.addons[0].price, "ضمن التجهيز");
  assert.equal(merged.addons.find((a) => a.title === "إشعارات الدفع").price, "مع التطبيقات");
  assert.equal(merged.features.find((f) => f.icon === "shield").title, "أمان وتحديثات مستمرة");
  assert.ok(merged.features.some((f) => f.title === "دعم وإصلاح أعطال"));
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
  assert.match(content.legal.terms.body, /الخدمة المعروضة هي تصميم موقع تعريفي/);
  assert.match(content.legal.terms.body, /1,500 ريال/);
  assert.match(content.legal.terms.body, /جزء من المنصة/);
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

test("ranked titles and H1s stay, and the current offer is added below", () => {
  const seo = readFileSync(new URL("../lib/seo-pages.js", import.meta.url), "utf8");
  assert.match(seo, /شركة برمجة في السعودية \| متجر \+ تطبيق باشتراك من 700 ريال شهرياً/);
  assert.match(seo, /h1: "شركة برمجة في السعودية تسلّمك المتجر والتطبيق باشتراك من 700 ريال شهرياً"/);
  assert.match(seo, /تصميم متجر الكتروني \| في السعودية باشتراك من 300 ريال شهرياً/);
  assert.doesNotMatch(seo, /مع تطبيق جوال باشتراك من 300 ريال/);
  assert.match(seo, /slug: "matjar-tatbeeq-1500"/);
  assert.match(seo, /slug: "matjar-jahiz-1500"/);
  assert.doesNotMatch(seo, /1500 ريال|1,500 ريال/);
  const article = readFileSync(new URL("../app/SeoArticle.js", import.meta.url), "utf8");
  assert.match(article, /PriceAddendum/);
  assert.match(article, /اطلب باقة من 2,000 ريال/);
  const home = readFileSync(new URL("../app/HomePage.js", import.meta.url), "utf8");
  assert.match(home, /<h1><Hl text=\{c\.hero\.title\} \/><\/h1>/);
  assert.match(home, /PriceAddendum/);
  const store = readFileSync(new URL("../app/app-store-development/page.js", import.meta.url), "utf8");
  assert.match(store, /إنشاء متجر إلكتروني وتطبيق جوال باشتراك من 700 ريال شهرياً/);
  assert.doesNotMatch(store, /تطبيق جوال باشتراك من 300 ريال/);
  assert.match(store, /canonical: "\/app-store-development"/);
  assert.match(store, /PriceAddendum/);
  assert.doesNotMatch(store, /1500|1,500/);
});
