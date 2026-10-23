import test from "node:test";
import assert from "node:assert/strict";
import { upgradeSupportAddons, scrubOldSupportPrice, withSupportTerms, FIRST_YEAR_SUPPORT_AR, SECOND_YEAR_SUPPORT_AR } from "../lib/support-offer.js";

test("the published support add-on replaces 7200 and the old yearly price", () => {
  const arabic = upgradeSupportAddons([
    { title: "بوابة دفع", price: "قريباً" },
    { title: "الدعم الفني", desc: "أمان وتحديثات مستمرة", price: "7200/سنوي" },
  ]);
  assert.equal(arabic[1].price, "حسب الباقة");
  assert.match(arabic[1].desc, new RegExp(FIRST_YEAR_SUPPORT_AR));
  assert.match(arabic[1].desc, /500 إلى 800/);
  assert.equal(JSON.stringify(arabic).includes("7200"), false);
  assert.equal(JSON.stringify(arabic).includes("200 ريال للسنة"), false);

  const monthly = upgradeSupportAddons([{ title: "الدعم الفني الشهري", price: "230 ريال / شهر" }]);
  assert.equal(monthly[0].price, "حسب الباقة");

  const english = upgradeSupportAddons([{ title: "Monthly technical support", desc: "Ongoing maintenance and follow-up" }], true);
  assert.equal(english[0].price, "Depends on the plan");
  assert.match(english[0].desc, /500–800 SAR/);
});

test("stray 7200 prices and the old 1,500 offer are rewritten", () => {
  const page = scrubOldSupportPrice({
    body: "تجديد الدعم 7,200 ريال سنوياً. باقة المتجر الكبير شامل التطبيق بـ 1,500 ريال، وداخلها بوابة الدفع والشحن والدومين وواتساب مجاناً.",
    price: "7200/سنوي",
  });
  assert.equal(JSON.stringify(page).includes("7200"), false);
  assert.equal(JSON.stringify(page).includes("7,200"), false);
  assert.match(page.body, /1,500 ريال/);
  assert.match(page.body, new RegExp(SECOND_YEAR_SUPPORT_AR.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("package copy gains the bug-fix policy without dropping existing features", () => {
  const site = withSupportTerms({ name: "موقع تعريفي احترافي", desc: "شامل الدومين والاستضافة لأول سنة", features: ["لوحة تحكم كاملة"] });
  assert.ok(site.features.includes("لوحة تحكم كاملة"));
  assert.ok(site.features.includes(FIRST_YEAR_SUPPORT_AR));
  assert.ok(site.features.includes(SECOND_YEAR_SUPPORT_AR));
  assert.match(site.desc, /إصلاح الأعطال/);
});
