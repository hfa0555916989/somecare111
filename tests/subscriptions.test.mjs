import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  addMonths, daysBetween, monthlyAmount, periodAmount, presentClient, statusFor, summarize,
} from "../lib/subscription-plans.js";

const dir = mkdtempSync(path.join(tmpdir(), "subs-"));
process.env.SUBSCRIPTIONS_FORCE_FILE = "1";
process.env.SUBSCRIPTIONS_FILE = path.join(dir, "subscriptions.json");
const { saveSubscription, listSubscriptions, deleteSubscription } = await import("../lib/subscriptions.js");

test("month math stays on the calendar and clamps short months", () => {
  assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
  assert.equal(addMonths("2024-01-31", 1), "2024-02-29");
  assert.equal(addMonths("2026-03-15", 12), "2027-03-15");
  assert.equal(daysBetween("2026-05-01", "2026-05-04"), 3);
});

test("renewal, status and the annual free months follow the prepaid rules", () => {
  const today = "2026-06-01";
  const base = { storeName: "تجربة", phone: "0550000000", plan: "basic", cycle: "monthly", startDate: "2026-05-01", payments: [] };
  const due = presentClient(base, today);
  assert.equal(due.monthly, 300);
  assert.equal(due.periodAmount, 300);
  assert.equal(due.nextRenewal, "2026-05-01");
  assert.equal(due.status, "suspend");
  assert.equal(due.paidUp, false);

  const paid = presentClient({ ...base, payments: [{ id: "1" }, { id: "2" }] }, today);
  assert.equal(paid.nextRenewal, "2026-07-01");
  assert.equal(paid.status, "active");
  assert.equal(paid.paidUp, true);
  assert.match(paid.answer, /مسدد حتى 2026-07-01/);

  assert.equal(statusFor(4), "active");
  assert.equal(statusFor(3), "due_soon");
  assert.equal(statusFor(0), "due_soon");
  assert.equal(statusFor(-1), "overdue_1_7");
  assert.equal(statusFor(-7), "overdue_1_7");
  assert.equal(statusFor(-8), "support_paused");
  assert.equal(statusFor(-15), "support_paused");
  assert.equal(statusFor(-16), "suspend");

  const annual = presentClient({ ...base, plan: "advanced_apps", cycle: "annual", payments: [{ id: "1" }] }, today);
  assert.equal(monthlyAmount(annual), 1000);
  assert.equal(periodAmount(annual), 10000);
  assert.equal(annual.nextRenewal, "2027-05-01");
  assert.equal(annual.mrr, (1000 * 10) / 12);

  const custom = presentClient({ ...base, plan: "custom", customAmount: 640, payments: [{ id: "1" }] }, today);
  assert.equal(custom.monthly, 640);
  assert.equal(custom.nextRenewal, "2026-06-01");
  assert.equal(custom.status, "due_soon");
});

test("the summary counts recurring revenue, due soon and overdue", () => {
  const today = "2026-06-10";
  const views = [
    presentClient({ plan: "basic", cycle: "monthly", startDate: "2026-01-01", payments: Array.from({ length: 8 }, (_, i) => ({ id: String(i) })) }, today),
    presentClient({ plan: "maint_800", cycle: "monthly", startDate: "2026-06-12", payments: [] }, today),
    presentClient({ plan: "basic", cycle: "annual", startDate: "2026-06-01", payments: [] }, today),
  ];
  assert.equal(views[0].status, "active");
  assert.equal(views[1].status, "due_soon");
  assert.equal(views[2].status, "support_paused");
  const sum = summarize(views);
  assert.equal(sum.clients, 3);
  assert.equal(sum.dueSoon, 1);
  assert.equal(sum.overdue, 1);
  assert.equal(sum.mrr, Math.round(300 + 800 + (300 * 10) / 12));
});

test("saving a client and a payment advances the renewal without a new database", async () => {
  const today = "2026-04-20";
  const created = await saveSubscription({
    storeName: "متجر التجربة",
    phone: "0551112233",
    plan: "advanced",
    cycle: "monthly",
    startDate: "2026-04-01",
  }, today);
  assert.equal(created.status, "suspend");
  assert.equal(created.wa, "https://wa.me/966551112233");
  const paid = await saveSubscription({ id: created.id, action: "pay", date: "2026-04-20", amount: 500 }, today);
  assert.equal(paid.payments.length, 1);
  assert.equal(paid.nextRenewal, "2026-05-01");
  assert.equal(paid.status, "active");
  const listed = await listSubscriptions(today);
  assert.equal(listed.storage, "file");
  assert.equal(listed.items.length, 1);
  assert.equal(listed.summary.mrr, 500);
  assert.equal(await deleteSubscription(created.id), true);
  assert.equal((await listSubscriptions(today)).items.length, 0);
  rmSync(dir, { recursive: true, force: true });
});
