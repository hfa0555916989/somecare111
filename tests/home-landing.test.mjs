import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HOME_DESC_EN, HOME_LANDING, HOME_TITLE_AR } from "../lib/home-landing.js";

test("the homepage targets website design, stores and apps, and cybersecurity keeps its own page", () => {
  const defaults = readFileSync(new URL("../lib/defaults.js", import.meta.url), "utf8");
  assert.match(defaults, /title: "تصميم مواقع وإنشاء متاجر إلكترونية وتطبيقات بأسعار تنافسية/);
  assert.match(defaults, /title: "Website Design, Online Stores and Apps at Competitive Prices/);
  const home = readFileSync(new URL("../app/page.js", import.meta.url), "utf8");
  assert.doesNotMatch(home, /HOME_TITLE/);
  assert.match(home, /homeAlternates\("ar"\)/);
  const page = readFileSync(new URL("../app/HomePage.js", import.meta.url), "utf8");
  assert.match(page, /<h1><Hl text=\{c\.hero\.title\} \/><\/h1>/);
  assert.deepEqual(HOME_LANDING.ar.doors.map((d) => d.href), ["/security", "/app-store-development"]);
  assert.deepEqual(HOME_LANDING.en.doors.map((d) => d.href), ["/security", "/app-store-development"]);
  assert.match(HOME_TITLE_AR, /تصميم مواقع/);
  assert.match(HOME_DESC_EN, /online store/);
  const security = readFileSync(new URL("../app/SecurityPage.js", import.meta.url), "utf8");
  assert.match(security, /SECURITY_KEYWORDS_AR/);
  assert.doesNotMatch(page, /<Security s=\{sec\}/);
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
