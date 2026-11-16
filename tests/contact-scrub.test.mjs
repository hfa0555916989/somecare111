import test from "node:test";
import assert from "node:assert/strict";
import { scrubOldContact } from "../lib/contact-scrub.js";
import { e164 } from "../lib/attribution.js";

test("stored old contact numbers are replaced, other numbers are left alone", () => {
  const out = scrubOldContact({
    contact: { phone: "0530779934", whatsapp: "966530779934", message: "hi" },
    en: { contact: { phone: "+966530779934", availability: "24/7" } },
  });
  assert.equal(out.contact.phone, "0555916989");
  assert.equal(out.contact.whatsapp, "966555916989");
  assert.equal(out.contact.message, "hi");
  assert.equal(out.en.contact.phone, "0555916989");
  assert.equal(out.en.contact.availability, "24/7");

  const kept = scrubOldContact({ contact: { phone: "0551234567", whatsapp: "966551234567" } });
  assert.equal(kept.contact.phone, "0551234567");
  assert.equal(kept.contact.whatsapp, "966551234567");
});

test("the new number converts to the international tel link", () => {
  assert.equal(e164("0555916989"), "+966555916989");
  assert.equal(e164("966555916989"), "+966555916989");
});
