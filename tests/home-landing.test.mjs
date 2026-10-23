import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HOME_DESC_EN, HOME_LANDING, HOME_TITLE_AR } from "../lib/home-landing.js";

test("homepage metadata matches main and the two paths stay linked", () => {
  const defaults = readFileSync(new URL("../lib/defaults.js", import.meta.url), "utf8");
  assert.match(defaults, /خدمات الأمن السيبراني في السعودية \| اختبار اختراق \| المطوّر حسن/);
  assert.match(defaults, /Cybersecurity Services in Saudi Arabia \| Penetration Testing \| Hassan Developer/);
  const home = readFileSync(new URL("../app/page.js", import.meta.url), "utf8");
  assert.doesNotMatch(home, /HOME_TITLE/);
  assert.match(home, /homeAlternates\("ar"\)/);
  const page = readFileSync(new URL("../app/HomePage.js", import.meta.url), "utf8");
  assert.match(page, /<h1><Hl text=\{c\.hero\.title\} \/><\/h1>/);
  assert.deepEqual(HOME_LANDING.ar.doors.map((d) => d.href), ["/security", "/app-store-development"]);
  assert.deepEqual(HOME_LANDING.en.doors.map((d) => d.href), ["/security", "/app-store-development"]);
  assert.match(HOME_TITLE_AR, /المطور حسن/);
  assert.match(HOME_DESC_EN, /penetration testing/);
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
  assert.match(home, /homeAlternates\("ar"\)/);
});
