import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "crypto";
import { buildXConversion, sendXConversion } from "../lib/x-capi.js";
import { scrubOldContact } from "../lib/contact-scrub.js";

const sha = (v) => createHash("sha256").update(v).digest("hex");

test("a form conversion hashes email and phone and keeps the inquiry id for dedupe", () => {
  const b = buildXConversion({
    eventId: "tw-rjzxq-abc12", conversionId: "HD-1042", twclid: "xyz", email: " Ali@Example.com ",
    phone: "0551234567", ip: "1.2.3.4", ua: "UA", time: "2026-11-23T10:00:00Z",
  });
  const c = b.conversions[0];
  assert.equal(c.event_id, "tw-rjzxq-abc12");
  assert.equal(c.conversion_id, "HD-1042");
  assert.equal(c.conversion_time, "2026-11-23T10:00:00.000Z");
  assert.deepEqual(c.identifiers, [
    { twclid: "xyz" },
    { hashed_email: sha("ali@example.com") },
    { hashed_phone_number: sha("+966551234567") },
    { ip_address: "1.2.3.4", user_agent: "UA" },
  ]);
});

test("nothing is built without an identifier", () => {
  assert.equal(buildXConversion({ eventId: "tw-rjzxq-a", conversionId: "1" }), null);
});

test("sending is skipped without a token or event id", async () => {
  assert.deepEqual(await sendXConversion({ xPixel: "rjzxq", xEventId: "tw-rjzxq-a" }, { twclid: "x" }, ""), { skipped: true });
  assert.deepEqual(await sendXConversion({ xPixel: "rjzxq", xEventId: "" }, { twclid: "x" }, "t"), { skipped: true });
});

test("the request goes to the pixel endpoint with the X-Pixel-Token header", async () => {
  const orig = globalThis.fetch;
  let call;
  globalThis.fetch = async (url, init) => ((call = { url, init }), new Response("{}", { status: 200 }));
  try {
    const r = await sendXConversion({ xPixel: "rjzxq", xEventId: "tw-rjzxq-a" }, { conversionId: "HD-1", twclid: "x" }, "secret");
    assert.equal(r.ok, true);
    assert.equal(call.url, "https://ads-api.x.com/12/measurement/conversions/rjzxq");
    assert.equal(call.init.headers["X-Pixel-Token"], "secret");
    assert.equal(JSON.parse(call.init.body).conversions[0].conversion_id, "HD-1");
  } finally {
    globalThis.fetch = orig;
  }
});

test("the old X pixel rgnuk and its event are replaced by the new pixel", () => {
  const out = scrubOldContact({ tracking: { xPixel: "rgnuk", xEventId: "tw-rgnuk-rgnvi", ga4: "G-1" } });
  assert.equal(out.tracking.xPixel, "rjzxq");
  assert.equal(out.tracking.xEventId, "");
  assert.equal(out.tracking.ga4, "G-1");
  const kept = scrubOldContact({ tracking: { xPixel: "rjzxq", xEventId: "tw-rjzxq-abc" } });
  assert.equal(kept.tracking.xEventId, "tw-rjzxq-abc");
});
