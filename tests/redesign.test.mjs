import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HOME_SECTIONS } from "../lib/home-sections.js";
import { PREVIOUS_WORK } from "../lib/previous-work.js";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

test("the new brand theme rolls out over a stored older theme and keeps the owner's brand fonts", () => {
  const d = read("../lib/defaults.js");
  assert.match(d, /export const THEME_VERSION = 2;/);
  assert.match(d, /v: THEME_VERSION,\n {2}bg: "#0a0c10"/);
  assert.match(d, /headingFont: "Changa"/);
  assert.match(d, /mode: "dark"/);
  assert.match(d, /if \(stored\.theme\?\.v === THEME_VERSION\) return value;/);
  assert.match(d, /brandFont: value\.brandFont, taglineFont: value\.taglineFont/);
  assert.match(d, /family=IBM\+Plex\+Mono/);
});

test("the stored hero from older designs is replaced by the new headline and the code photo", () => {
  const d = read("../lib/defaults.js");
  assert.match(d, /title: "نفهم مشروعك أولاً، \{ثم نكتب الكود\}"/);
  assert.match(d, /image: "\/images\/coding\.jpg"/);
  assert.match(d, /title: \[FIXED_PRICE_HERO_AR\.title, CYBER_HERO_AR\.title/);
  assert.match(d, /title: \[FIXED_PRICE_HERO_EN\.title, CYBER_HERO_EN\.title/);
  assert.match(d, /image: \["\/images\/brand-logo\.png", "\/images\/brand-office\.jpg"/);
});

test("the home page keeps its sections and adds the code-themed ones", () => {
  const home = read("../app/HomePage.js");
  for (const id of ["packages", "addons", "store-demo", "previous-work", "process", "features", "trust", "paths"]) {
    assert.match(home, new RegExp(`id="${id}"`));
  }
  assert.match(home, /<Terminal lines=\{copy\.terminal\} \/>/);
  assert.match(home, /<CodeCard code=\{copy\.code\} \/>/);
  assert.match(home, /<WorkWall lang=\{c\.lang\} \/>/);
  assert.match(home, /copy\.proof\(PREVIOUS_WORK\.length\)/);
  const css = read("../app/globals.css");
  for (const cls of [".hero-code", ".stats", ".pk-shot", ".work-wall", ".proc", ".code", ".sec-tag", ".about-badge"]) {
    assert.ok(css.includes(`${cls}{`), cls);
  }
});

test("home copy carries no invented numbers and has the same shape in both languages", () => {
  for (const lang of ["ar", "en"]) {
    const c = HOME_SECTIONS[lang];
    assert.equal(c.process.steps.length, 4);
    const proof = c.proof(PREVIOUS_WORK.length);
    assert.equal(proof.length, 3);
    assert.match(proof[0], new RegExp(String(PREVIOUS_WORK.length)));
    assert.doesNotMatch(JSON.stringify([proof.slice(1), c.terminal, c.noSubs, c.demo, c.work, c.process, c.code]), /\d|%/);
  }
  assert.deepEqual(
    HOME_SECTIONS.ar.process.steps.map((s) => s.fn),
    HOME_SECTIONS.en.process.steps.map((s) => s.fn)
  );
});
