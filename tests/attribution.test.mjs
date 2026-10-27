import test from "node:test";
import assert from "node:assert/strict";
import { cleanSrc, sourceLabel, fromGoogleAds, e164 } from "../lib/attribution.js";

test("only known source fields are kept, trimmed and without markup", () => {
  assert.deepEqual(cleanSrc({ gclid: " abc ", utm_campaign: "<b>sa</b>", evil: "x" }), { gclid: "abc", utm_campaign: "bsa/b" });
  assert.deepEqual(cleanSrc(null), {});
});

test("an inquiry from a Google ad is labelled with its campaign", () => {
  assert.equal(sourceLabel({ gclid: "x", utm_campaign: "stores-sa" }), "إعلان Google · stores-sa");
  assert.equal(sourceLabel({ wbraid: "x" }), "إعلان Google");
  assert.equal(sourceLabel({ utm_source: "snapchat", utm_medium: "paid" }), "snapchat / paid");
  assert.equal(sourceLabel({}), "");
  assert.equal(fromGoogleAds({ utm_source: "google" }), false);
});

test("Saudi mobile numbers go to E.164 for enhanced conversions", () => {
  assert.equal(e164("0551234567"), "+966551234567");
  assert.equal(e164("966551234567"), "+966551234567");
  assert.equal(e164("00966551234567"), "+966551234567");
  assert.equal(e164("+966 55 123 4567"), "+966551234567");
  assert.equal(e164("12"), "");
});
