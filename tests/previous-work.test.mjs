import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { PREVIOUS_WORK, PREVIOUS_WORK_COPY } from "../lib/previous-work.js";

const EXPECTED = [
  ["https://falahrealestate.com", "مكتب واجهة الفلاح للعقارات"],
  ["https://www.transportrose.com/", "روز للنقل الجامعي"],
  ["https://hrajna.com", "حراجنا"],
  ["https://thebrightbath.com/", "الطريق المشرق للتدريب والتطوير"],
  ["https://bunyanraslan.com/", "مؤسسة بنيان رسلان الهندسية"],
];

test("previous work lists the live sites with screenshots and no invented metrics", () => {
  assert.deepEqual(PREVIOUS_WORK.map((item) => [item.url, item.nameAr]), EXPECTED);
  assert.doesNotMatch(JSON.stringify(PREVIOUS_WORK), /consultmovia|قريباً|عميل سعيد|%\s|شهادة/);
  assert.match(PREVIOUS_WORK_COPY.ar.lead, /سريعة وآمنة ومهيّأة لمحركات البحث/);
  assert.equal((PREVIOUS_WORK_COPY.ar.lead.match(/سريعة/g) || []).length, 1);
  for (const item of PREVIOUS_WORK) {
    assert.ok(item.descAr.length > 40 && item.descEn.length > 40);
    assert.doesNotMatch(item.descAr + item.descEn, /\d{2,}|%|\+|testimonial|شهادة/);
    assert.ok(existsSync(new URL("../public" + item.image, import.meta.url)));
  }
});
