import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CARE_LINE_AR, CARE_LINE_EN, STORE_CARE } from "../lib/store-care.js";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("the care copy stays concrete and does not claim the store cannot be hacked", () => {
  const blob = JSON.stringify(STORE_CARE) + CARE_LINE_AR + CARE_LINE_EN;
  assert.match(blob, /HTTPS/);
  assert.match(blob, /SSL/);
  assert.match(blob, /نسخ احتياطي يومي/);
  assert.match(blob, /daily backup/i);
  assert.match(blob, /دخول محمي/);
  assert.match(blob, /protected admin login/i);
  assert.match(blob, /كل المتاجر/);
  assert.match(blob, /every store/i);
  assert.equal(STORE_CARE.ar.faqQ, "هل تحدّثون المتجر أمنياً؟");
  assert.doesNotMatch(blob, /غير قابل للاختراق|unhackable|اختراق مستحيل|معتمد|ISO|شهادة أمن/);
});

test("store and package pages add the section below existing content and keep their titles", () => {
  const ar = read("../app/app-store-development/page.js");
  const en = read("../app/StorePage.js");
  const packages = read("../app/SitelinkPage.js");
  const plans = read("../lib/subscription-plans.js");
  assert.match(ar, /const TITLE = "إنشاء متجر إلكتروني وتطبيق جوال باشتراك من 700 ريال شهرياً \| المطور حسن"/);
  assert.match(ar, /StoreCare lang="ar"/);
  assert.match(ar, /STORE_CARE\.ar\.faqQ/);
  assert.match(en, /<StoreCare lang=\{c\.lang\} \/>/);
  assert.match(en, /STORE_CARE\.en\.faqQ/);
  assert.match(packages, /id === "packages" && <StoreCare lang=\{c\.lang\} \/>/);
  assert.match(plans, /نحدّث المتجر باستمرار، أمنياً وبالميزات/);
  assert.match(plans, /We keep the store updated for security and for features/);
  const home = read("../app/page.js");
  const security = read("../app/security/page.js");
  assert.doesNotMatch(home, /StoreCare|store-updates/);
  assert.doesNotMatch(security, /StoreCare|store-updates/);
});
