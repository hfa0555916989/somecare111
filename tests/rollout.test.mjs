import test from "node:test";
import assert from "node:assert/strict";
import { syncStore, revertSyncCommit } from "../lib/stores/sync.js";
import {
  ROLLOUT_TIMEOUT_MS,
  applyDeployKick,
  applyProbe,
  applyRedeploy,
  applyRevert,
  applySyncResult,
  beginPromote,
  canPromote,
  confirmCanaryPush,
  failureActions,
  markCanary,
  nextAction,
  noteTimeout,
  probeOk,
  publicRollout,
  publishIntent,
} from "../lib/stores/rollout.js";

const NOW = "2026-04-20T12:00:00.000Z";
const LATER = "2026-04-20T12:04:00.000Z";
const A = "a".repeat(40);
const B = "b".repeat(40);
const C = "c".repeat(40);
const D = "d".repeat(40);
const P = "1".repeat(40);
const COMMIT = "2".repeat(40);

const canary = { id: "c", name: "النخيل", slug: "nakheel", canary: true, templateSha: A };
const fleet = [
  { id: "a", name: "الورد", slug: "ward" },
  { id: "b", name: "الساحل", slug: "sahel" },
  { id: "d", name: "النور", slug: "noor" },
  { id: "e", name: "الواحة", slug: "waha" },
];
const stores = [canary, ...fleet];

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

test("one canary flag is exclusive", () => {
  const marked = markCanary([{ id: "1", canary: true }, { id: "2", canary: false }, { id: "3" }], "2");
  assert.deepEqual(marked.patches, [
    { id: "1", canary: false },
    { id: "2", canary: true },
    { id: "3", canary: false },
  ]);
  assert.equal(markCanary(stores, "missing").ok, false);
});

test("publish opens a pull request and does not push", () => {
  const pr = publishIntent({ stores, mode: "pr", confirmSlug: "nakheel", templateVersion: "2.0.0", now: NOW });
  assert.equal(pr.ok, true);
  assert.equal(pr.push, false);
  assert.equal(pr.mode, "pr");
  assert.equal(pr.rollout.phase, "canary_pr");
  assert.deepEqual(Object.keys(pr.rollout.stores), ["c"]);
  assert.equal(nextAction(pr.rollout).type, "none");

  const opened = applySyncResult(pr.rollout, canary, { status: "pr", pr: 7, prUrl: "https://github.com/acme/shop/pull/7", commit: COMMIT, parent: P, nextSha: B }, LATER);
  assert.equal(opened.phase, "canary_pr");
  assert.equal(opened.stores.c.status, "pr_open");
  assert.equal(opened.stores.c.pushedSha, null);
  assert.equal(nextAction(opened).type, "none");
  assert.equal(failureActions(opened.stores.c).actions.length, 0);
});

test("direct push requires a second confirmation", () => {
  const denied = publishIntent({ stores, mode: "direct", confirmSlug: "other", templateVersion: "2.0.0", now: NOW });
  assert.equal(denied.ok, false);
  assert.equal(denied.needsConfirm, true);
  const none = publishIntent({ stores: fleet, mode: "pr", templateVersion: "2.0.0", now: NOW });
  assert.equal(none.ok, false);
  const allowed = publishIntent({ stores, mode: "direct", confirmSlug: "nakheel", templateVersion: "2.0.0", now: NOW });
  assert.equal(allowed.ok, true);
  assert.equal(allowed.push, true);
  assert.equal(allowed.rollout.phase, "canary_deploy");
});

test("confirm merge stays closed until the canary slug is typed", () => {
  const opened = applySyncResult(publishIntent({ stores, mode: "pr", templateVersion: "2.0.0", now: NOW }).rollout, canary, { status: "pr", pr: 4, commit: COMMIT, parent: P, nextSha: B }, NOW);
  assert.equal(confirmCanaryPush({ rollout: opened, canary, confirmSlug: "nope", now: LATER }).ok, false);
  const ok = confirmCanaryPush({ rollout: opened, canary, confirmSlug: "nakheel", now: LATER });
  assert.equal(ok.ok, true);
  assert.equal(ok.merge, true);
  assert.equal(ok.rollout.phase, "canary_deploy");
  assert.equal(ok.rollout.stores.c.status, "starting");
  assert.equal(nextAction(ok.rollout).type, "kick");
});

test("healthy means health ok and the running version equals template VERSION", () => {
  assert.equal(probeOk("ok", "2.0.0", "2.0.0"), true);
  assert.equal(probeOk("ok", " 2.0.0 ", "2.0.0"), true);
  assert.equal(probeOk("degraded", "2.0.0", "2.0.0"), false);
  assert.equal(probeOk("down", "2.0.0", "2.0.0"), false);
  assert.equal(probeOk("ok", "1.9.0", "2.0.0"), false);
  assert.equal(probeOk("ok", "", "2.0.0"), false);
  assert.equal(probeOk("ok", "2.0.0", ""), false);
});

test("canary is polled until version matches, then promote runs one store at a time", () => {
  let rollout = confirmCanaryPush({
    rollout: applySyncResult(publishIntent({ stores, mode: "pr", templateVersion: "2.0.0", now: NOW }).rollout, canary, { status: "pr", pr: 4, commit: COMMIT, parent: P, nextSha: B }, NOW),
    canary,
    confirmSlug: "nakheel",
    now: NOW,
  }).rollout;
  rollout = { ...rollout, stores: { ...rollout.stores, c: { ...rollout.stores.c, pushedSha: D } } };
  rollout = applyDeployKick(rollout, "c", { ok: true }, NOW);
  rollout = applyProbe(rollout, "c", { health: "degraded", version: "2.0.0" }, NOW);
  assert.equal(rollout.phase, "canary_deploy");
  assert.equal(canPromote(rollout), false);
  rollout = applyProbe(rollout, "c", { health: "ok", version: "1.0.0" }, LATER);
  assert.equal(rollout.stores.c.status, "deploying");
  rollout = applyProbe(rollout, "c", { health: "ok", version: "2.0.0" }, LATER);
  assert.equal(rollout.phase, "canary_ok");
  assert.equal(canPromote(rollout), true);
  assert.equal(beginPromote({ rollout, stores, batchSize: 99, now: LATER }).rollout.batchSize, 10);

  rollout = beginPromote({ rollout, stores, now: LATER }).rollout;
  assert.equal(rollout.batchSize, 3);
  assert.deepEqual(rollout.queue, ["a", "b", "d", "e"]);
  assert.equal(nextAction(rollout).storeId, "a");

  const push = (id, commit) => applySyncResult(rollout, stores.find((s) => s.id === id), { status: "pushed", commit, parent: P, nextSha: B }, LATER);
  rollout = push("a", COMMIT);
  assert.equal(rollout.stores.a.status, "starting");
  assert.equal(rollout.stores.b.status, "pending");
  assert.equal(nextAction(rollout).type, "kick");
  rollout = applyDeployKick(rollout, "a", { ok: true }, LATER);
  rollout = applyProbe(rollout, "a", { health: "ok", version: "2.0.0" }, LATER);
  assert.equal(nextAction(rollout).storeId, "b");
  assert.equal(rollout.stores.d.status, "pending");

  rollout = applyDeployKick(push("b", "b".repeat(40)), "b", { ok: true }, LATER);
  rollout = applyProbe(rollout, "b", { health: "ok", version: "2.0.0" }, LATER);
  rollout = applyDeployKick(applySyncResult(rollout, fleet[2], { status: "pushed", commit: "d".repeat(40), parent: P, nextSha: B }, LATER), "d", { ok: true }, LATER);
  rollout = applyProbe(rollout, "d", { health: "ok", version: "2.0.0" }, LATER);
  assert.equal(rollout.cursor, 3);
  assert.match(rollout.log[0].msg, /اكتملت الدفعة 1/);
  assert.equal(nextAction(rollout).storeId, "e");
});

test("timeout stops the batch, reverts that store only, and never restores the database", () => {
  let rollout = applySyncResult(
    beginPromote({
      rollout: { ...publishIntent({ stores, mode: "pr", templateVersion: "2.0.0", now: NOW }).rollout, phase: "canary_ok", stores: { c: { name: "النخيل", status: "healthy", version: "2.0.0", health: "ok" } } },
      stores,
      batchSize: 3,
      now: NOW,
    }).rollout,
    fleet[0],
    { status: "pushed", commit: COMMIT, parent: P, nextSha: B },
    NOW,
  );
  rollout = applyDeployKick(rollout, "a", { ok: true }, NOW);
  const started = Date.parse(rollout.stores.a.deployStartedAt);
  assert.equal(noteTimeout(rollout, started + ROLLOUT_TIMEOUT_MS - 1), rollout);
  rollout = noteTimeout(rollout, started + ROLLOUT_TIMEOUT_MS);
  assert.equal(rollout.phase, "failed");
  assert.equal(rollout.stores.a.status, "reverting");
  assert.equal(rollout.stores.b.status, "pending");
  assert.deepEqual(failureActions(rollout.stores.a), { actions: ["revert_commit", "redeploy"], restoreDatabase: false });
  const action = nextAction(rollout);
  assert.equal(action.type, "revert");
  assert.equal(action.restoreDatabase, false);
  assert.deepEqual(action.actions, ["revert_commit", "redeploy"]);
  rollout = applyRevert(rollout, "a", { ok: true, revertSha: D }, LATER);
  assert.equal(nextAction(rollout).type, "redeploy");
  rollout = applyRedeploy(rollout, "a", { ok: true }, LATER);
  assert.equal(rollout.phase, "failed");
  assert.equal(rollout.stores.a.status, "reverted");
  assert.equal(nextAction(rollout).type, "none");
  assert.equal(rollout.stores.b.status, "pending");
  assert.equal(rollout.stores.e.status, "pending");
  assert.equal(publicRollout({ ...rollout, secret: "nope", stores: { ...rollout.stores, a: { ...rollout.stores.a, cpSecret: "x" } } }).stores.a.cpSecret, undefined);
  assert.equal(publicRollout(rollout).restoreDatabase, false);
});

test("syncStore direct push records the parent and does not force main", async () => {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const method = init.method || "GET";
    calls.push({ url, method, body: init.body });
    const path = url.replace("https://api.github.com", "");
    if (path === "/repos/tmpl/git/ref/heads/main") return json({ object: { sha: B } });
    if (path === "/repos/acme/shop/git/ref/heads/main" && method === "GET") return json({ object: { sha: C } });
    if (path === `/repos/tmpl/git/commits/${A}`) return json({ tree: { sha: "treeA" }, message: "base" });
    if (path === `/repos/tmpl/git/commits/${B}`) return json({ tree: { sha: "treeB" }, message: "next" });
    if (path === `/repos/acme/shop/git/commits/${C}`) return json({ tree: { sha: "treeC" }, message: "client" });
    if (path.startsWith("/repos/tmpl/git/trees/treeA")) return json({ truncated: false, tree: [{ path: "a.php", mode: "100644", type: "blob", sha: "file1" }] });
    if (path.startsWith("/repos/tmpl/git/trees/treeB")) return json({ truncated: false, tree: [{ path: "a.php", mode: "100644", type: "blob", sha: "file2" }] });
    if (path.startsWith("/repos/acme/shop/git/trees/treeC")) return json({ truncated: false, tree: [{ path: "a.php", mode: "100644", type: "blob", sha: "file1" }] });
    if (path === "/repos/tmpl/git/blobs/file2") return json({ content: Buffer.from("<?php\n").toString("base64") });
    if (path === "/repos/acme/shop/git/blobs" && method === "POST") return json({ sha: "file2" });
    if (path === "/repos/acme/shop/git/trees" && method === "POST") return json({ sha: "treeNew" });
    if (path === "/repos/acme/shop/git/commits" && method === "POST") {
      assert.deepEqual(JSON.parse(init.body).parents, [C]);
      return json({ sha: D });
    }
    if (path === "/repos/acme/shop/git/refs/heads/main" && method === "PATCH") {
      const body = JSON.parse(init.body);
      assert.equal(body.force, false);
      assert.equal(body.sha, D);
      return json({ object: { sha: D } });
    }
    throw new Error(`unexpected ${method} ${path}`);
  };
  const result = await syncStore({ store: { repo: "acme/shop", templateSha: A }, templateRepo: "tmpl", mode: "direct", o: { fetchImpl, token: "t" } });
  assert.equal(result.status, "pushed");
  assert.equal(result.parent, C);
  assert.equal(result.commit, D);
  assert.ok(!calls.some((c) => /backup|restore/i.test(c.url)));
});

test("syncStore pull request does not patch main", async () => {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const method = init.method || "GET";
    calls.push({ url, method });
    const path = url.replace("https://api.github.com", "");
    if (path === "/repos/tmpl/git/ref/heads/main") return json({ object: { sha: B } });
    if (path === "/repos/acme/shop/git/ref/heads/main") return json({ object: { sha: C } });
    if (path === `/repos/tmpl/git/commits/${A}`) return json({ tree: { sha: "treeA" } });
    if (path === `/repos/tmpl/git/commits/${B}`) return json({ tree: { sha: "treeB" } });
    if (path === `/repos/acme/shop/git/commits/${C}`) return json({ tree: { sha: "treeC" } });
    if (path.startsWith("/repos/tmpl/git/trees/treeA")) return json({ truncated: false, tree: [{ path: "a.php", mode: "100644", type: "blob", sha: "file1" }] });
    if (path.startsWith("/repos/tmpl/git/trees/treeB")) return json({ truncated: false, tree: [{ path: "a.php", mode: "100644", type: "blob", sha: "file2" }] });
    if (path.startsWith("/repos/acme/shop/git/trees/treeC")) return json({ truncated: false, tree: [{ path: "a.php", mode: "100644", type: "blob", sha: "file1" }] });
    if (path === "/repos/tmpl/git/blobs/file2") return json({ content: Buffer.from("<?php\n").toString("base64") });
    if (path === "/repos/acme/shop/git/blobs") return json({ sha: "file2" });
    if (path === "/repos/acme/shop/git/trees") return json({ sha: "treeNew" });
    if (path === "/repos/acme/shop/git/commits") return json({ sha: D });
    if (path === "/repos/acme/shop/git/refs" && method === "POST") return json({ ref: "refs/heads/template-sync-bbbbbbb" });
    if (path === "/repos/acme/shop/pulls" && method === "POST") return json({ number: 9, html_url: "https://github.com/acme/shop/pull/9" });
    throw new Error(`unexpected ${method} ${path}`);
  };
  const result = await syncStore({ store: { repo: "acme/shop", templateSha: A }, templateRepo: "tmpl", mode: "pr", o: { fetchImpl, token: "t" } });
  assert.equal(result.status, "pr");
  assert.equal(result.parent, C);
  assert.equal(result.pr, 9);
  assert.ok(!calls.some((c) => c.method === "PATCH"));
});

test("revert writes a new commit, refuses to force, and does not restore a database", async () => {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const method = init.method || "GET";
    calls.push({ url, method, body: init.body });
    const path = url.replace("https://api.github.com", "");
    if (path.endsWith("/git/ref/heads/main")) return json({ object: { sha: D } });
    if (path.endsWith(`/git/commits/${P}`)) return json({ tree: { sha: "treeOld" } });
    if (path.endsWith("/git/commits") && method === "POST") return json({ sha: "e".repeat(40) });
    if (path.endsWith("/git/refs/heads/main") && method === "PATCH") return json({});
    throw new Error(`unexpected ${method} ${path}`);
  };
  const result = await revertSyncCommit({ repo: "acme/shop", parent: P, pushedSha: D }, { fetchImpl, token: "t" });
  assert.equal(result.status, "reverted");
  const post = JSON.parse(calls.find((c) => c.method === "POST").body);
  assert.equal(post.tree, "treeOld");
  assert.deepEqual(post.parents, [D]);
  assert.match(post.message, /لا يشمل استرجاع قاعدة البيانات/);
  assert.equal(JSON.parse(calls.find((c) => c.method === "PATCH").body).force, false);
  assert.ok(!calls.some((c) => /backup|restore/i.test(c.url)));

  const moved = [];
  await assert.rejects(
    () => revertSyncCommit({ repo: "acme/shop", parent: P, pushedSha: D }, {
      token: "t",
      fetchImpl: async (url, init = {}) => {
        moved.push(init.method || "GET");
        return json({ object: { sha: C } });
      },
    }),
    /لن يُفرض التراجع/,
  );
  assert.deepEqual(moved, ["GET"]);
});
