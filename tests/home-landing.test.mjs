import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HOME_DESC_AR, HOME_DESC_EN, HOME_LANDING, HOME_TITLE_AR, HOME_TITLE_EN } from "../lib/home-landing.js";

test("the homepage title stays the brand line and the copy keeps both offerings", () => {
  assert.equal(HOME_TITLE_AR, "المطور حسن | خبير تطوير المواقع والتطبيقات وأنظمة الشركات");
  assert.match(HOME_TITLE_EN, /Websites, apps and company systems/);
  for (const text of [HOME_DESC_AR, HOME_LANDING.ar.lead, HOME_LANDING.ar.doors.map((d) => d.title).join(" ")]) {
    assert.match(text, /اختبار اختراق|الهيئة الوطنية للأمن السيبراني|NCA|متاجر|تطبيقات/);
  }
  assert.match(HOME_DESC_AR, /شركة اختبار اختراق/);
  assert.match(HOME_DESC_AR, /الهيئة الوطنية للأمن السيبراني \(NCA\)/);
  assert.match(HOME_DESC_AR, /متاجر إلكترونية/);
  assert.match(HOME_DESC_EN, /penetration testing/);
  assert.match(HOME_DESC_EN, /IT security audit/);
  assert.deepEqual(HOME_LANDING.ar.doors.map((d) => d.href), ["/security", "/app-store-development"]);
  assert.deepEqual(HOME_LANDING.en.doors.map((d) => d.href), ["/security", "/app-store-development"]);
});

test("ranked urls stay in the nav and sitemap and are not redirected", () => {
  const nav = readFileSync(new URL("../lib/sitelinks.js", import.meta.url), "utf8");
  const sitemap = readFileSync(new URL("../app/sitemap.js", import.meta.url), "utf8");
  const config = readFileSync(new URL("../next.config.js", import.meta.url), "utf8");
  assert.match(nav, /path: "\/security"/);
  assert.match(nav, /path: "\/app-store-development"/);
  assert.match(nav, /path: "\/packages"/);
  assert.match(sitemap, /SITE_NAV\.flatMap/);
  assert.doesNotMatch(config, /source:\s*"\/security"|source:\s*"\/app-store-development"|source:\s*"\/privacy"/);
  const home = readFileSync(new URL("../app/page.js", import.meta.url), "utf8");
  assert.match(home, /HOME_TITLE_AR/);
  assert.match(home, /canonical: lang === "en" \? "\/en" : "\/"|homeAlternates\("ar"\)/);
});
