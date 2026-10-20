// node --test tests/  (اختبارات لوحة متاجر العملاء)
import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { cpSign, cpHeaders, cpCall, CP_PREFIX } from "../lib/stores/signing.js";
import { planSync } from "../lib/stores/sync.js";
import { brandJson, baseEnvFrom } from "../lib/stores/provision.js";
import { dnsRecords } from "../lib/stores/cloud.js";

const SECRET = "test-secret-0123456789abcdef0123456789abcdef";

test("signature matches PHP hash_hmac of the documented string", () => {
  const s = cpSign(SECRET, "1700000000", "abcdefabcdefabcd", "post", "api/control-plane/v1/backups", '{"a":1}');
  const want = crypto.createHmac("sha256", SECRET).update('1700000000\nabcdefabcdefabcd\nPOST\n/api/control-plane/v1/backups\n{"a":1}').digest("hex");
  assert.equal(s, want);
});

test("headers carry ts, nonce of valid shape and verifiable signature", () => {
  const h = cpHeaders(SECRET, "GET", `${CP_PREFIX}/health`, "", 1700000000000);
  assert.equal(h["X-CP-Timestamp"], "1700000000");
  assert.match(h["X-CP-Nonce"], /^[\w-]{16,64}$/);
  assert.equal(h["X-CP-Signature"], cpSign(SECRET, h["X-CP-Timestamp"], h["X-CP-Nonce"], "GET", `${CP_PREFIX}/health`, ""));
});

test("cpCall refuses short secrets and maps errors", async () => {
  await assert.rejects(() => cpCall({ baseUrl: "https://x.test", secret: "short", endpoint: "health" }), /غير محفوظ/);
  const fetchImpl = async () => new Response("{}", { status: 401 });
  await assert.rejects(() => cpCall({ baseUrl: "https://x.test", secret: SECRET, endpoint: "version", fetchImpl }), /التوقيع/);
  const down = async () => new Response('{"status":"down"}', { status: 503 });
  assert.equal((await cpCall({ baseUrl: "https://x.test", secret: SECRET, endpoint: "health", fetchImpl: down })).status, "down");
});

test("cpCall sends exact body that was signed", async () => {
  let seen;
  const fetchImpl = async (url, init) => ((seen = { url, init }), new Response('{"ok":1}', { status: 201 }));
  await cpCall({ baseUrl: "https://x.test/", secret: SECRET, method: "POST", endpoint: "backups/restore", payload: { name: "b.gz", confirm: "b.gz" }, fetchImpl });
  assert.equal(seen.url, "https://x.test/api/control-plane/v1/backups/restore");
  const h = seen.init.headers;
  assert.equal(h["X-CP-Signature"], cpSign(SECRET, h["X-CP-Timestamp"], h["X-CP-Nonce"], "POST", "/api/control-plane/v1/backups/restore", seen.init.body));
});

test("planSync: 3-way per-file merge protects brand and client edits", () => {
  const f = (sha) => ({ sha, mode: "100644" });
  const base = { "a.php": f("1"), "b.php": f("1"), "c.php": f("1"), "gone.php": f("1"), "brand/brand.json": f("1"), ".github/workflows/x.yml": f("1"), "same.php": f("1") };
  const next = { "a.php": f("2"), "b.php": f("2"), "c.php": f("1"), "new.php": f("9"), "brand/brand.json": f("2"), ".github/workflows/x.yml": f("2"), "same.php": f("2") };
  const client = { "a.php": f("1"), "b.php": f("client"), "c.php": f("client"), "gone.php": f("1"), "brand/brand.json": f("mine"), ".github/workflows/x.yml": f("1"), "same.php": f("2") };
  const p = planSync(base, next, client);
  assert.deepEqual(p.apply.map((x) => x.path), ["a.php", "new.php"]);
  assert.deepEqual(p.remove, ["gone.php"]);
  assert.deepEqual(p.conflicts, ["b.php"]);
  assert.deepEqual(p.skipped.map((x) => x.path).sort(), [".github/workflows/x.yml", "brand/brand.json"]);
});

test("brandJson keeps template fields and applies store identity", () => {
  const out = JSON.parse(brandJson(JSON.stringify({ id: "t", name: { ar: "x", en: "X" }, currency: "SAR", theme: { colors: { primary: "#000000", text: "#111111" } } }), { slug: "alnakheel", name: "متجر النخيل", nameEn: "Alnakheel", domain: "alnakheel.sa", primary: "#123456" }));
  assert.equal(out.id, "alnakheel");
  assert.equal(out.name.ar, "متجر النخيل");
  assert.equal(out.domain, "alnakheel.sa");
  assert.equal(out.theme.colors.primary, "#123456");
  assert.equal(out.theme.colors.text, "#111111");
  assert.equal(out.currency, "SAR");
});

test("baseEnvFrom never copies keys, secrets or per-store values", () => {
  const vars = ["APP_KEY", "APP_NAME", "APP_URL", "DB_HOST", "CONTROL_PLANE_SECRET", "MOYASAR_SECRET_KEY", "TAP_API_TOKEN", "MAIL_PASSWORD", "APP_ENV", "SESSION_DRIVER", "APP_LOCALE"].map((key) => ({ key, value: "v" }));
  assert.deepEqual(baseEnvFrom(vars).map((v) => v.key), ["APP_ENV", "SESSION_DRIVER", "APP_LOCALE"]);
});

test("dnsRecords extracts records from nested domain payload", () => {
  const d = { data: { attributes: { name: "s.sa", dns_records: { hostname: [{ type: "CNAME", name: "s.sa", value: "x.laravel.cloud" }], ssl: [{ type: "TXT", name: "_acme.s.sa", value: "abc" }] } } } };
  assert.deepEqual(dnsRecords(d), [{ type: "CNAME", name: "s.sa", value: "x.laravel.cloud" }, { type: "TXT", name: "_acme.s.sa", value: "abc" }]);
});

// اختبار تكامل مع نسخة محلية من قالب المتجر: CP_TEST_URL=http://127.0.0.1:8799 CP_TEST_SECRET=...
test("integration: signed calls against a local template store", { skip: !process.env.CP_TEST_URL }, async () => {
  const o = { baseUrl: process.env.CP_TEST_URL, secret: process.env.CP_TEST_SECRET };
  const v = await cpCall({ ...o, endpoint: "version" });
  assert.ok(v.templateVersion);
  const h = await cpCall({ ...o, endpoint: "health" });
  assert.ok(["ok", "degraded", "down"].includes(h.status));
  const made = await cpCall({ ...o, method: "POST", endpoint: "backups", payload: {} });
  assert.ok(made.name);
  const list = await cpCall({ ...o, endpoint: "backups" });
  assert.ok(list.backups.some((b) => b.name === made.name));
  await assert.rejects(() => cpCall({ ...o, secret: SECRET.replace("0", "1") + "zz", endpoint: "version" }), /التوقيع/);
  await assert.rejects(() => cpCall({ ...o, method: "POST", endpoint: "backups/restore", payload: { name: made.name, confirm: "other" } }), /غير صالحة|HTTP 422/);
  const r = await cpCall({ ...o, method: "POST", endpoint: "backups/restore", payload: { name: made.name, confirm: made.name } });
  assert.equal(r.restored, made.name);
  assert.ok(r.preRestoreBackup);
  const u = await cpCall({ ...o, method: "POST", endpoint: "update", payload: { action: "optimize" } });
  assert.ok(u);
});
