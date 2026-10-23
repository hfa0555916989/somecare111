import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { PREVIOUS_WORK, PREVIOUS_WORK_COPY } from "../lib/previous-work.js";

const EXPECTED = [
  ["https://falahrealestate.com", "مكتب واجهة الفلاح للعقارات"],
  ["https://www.transportrose.com/", "روز للنقل الجامعي"],
  ["https://thebrightbath.com/", "الطريق المشرق للتدريب والتطوير"],
  ["https://bunyanraslan.com/", "مؤسسة بنيان رسلان الهندسية"],
];

test("previous work lists the live sites with screenshots and no invented metrics", () => {
  assert.deepEqual(PREVIOUS_WORK.map((item) => [item.url, item.nameAr]), EXPECTED);
  assert.doesNotMatch(JSON.stringify(PREVIOUS_WORK), /consultmovia|hrajna|حراجنا|قريباً|عميل سعيد|%\s|شهادة/);
  assert.match(PREVIOUS_WORK_COPY.ar.lead, /سريعة وآمنة ومهيّأة لمحركات البحث/);
  assert.equal((PREVIOUS_WORK_COPY.ar.lead.match(/سريعة/g) || []).length, 1);
  const view = readFileSync(new URL("../app/PreviousWork.js", import.meta.url), "utf8");
  assert.match(view, /className="work-phone"/);
  assert.match(view, /loading="lazy"/);
  assert.match(view, /width=\{390\}/);
  assert.match(view, /height=\{844\}/);
  for (const item of PREVIOUS_WORK) {
    assert.ok(item.descAr.length > 40 && item.descEn.length > 40);
    assert.doesNotMatch(item.descAr + item.descEn, /\d{2,}|%|\+|testimonial|شهادة/);
    assert.match(item.image, /\.webp$/);
    assert.ok(existsSync(new URL("../public" + item.image, import.meta.url)));
    assert.equal(existsSync(new URL("../public" + item.image.replace(/\.webp$/, ".jpg"), import.meta.url)), false);
  }
});
