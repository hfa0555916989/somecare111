import { gh, headSha, treeOf } from "./github.js";

// ملفات تخص هوية كل عميل ولا يلمسها تحديث القالب أبداً
export const PROTECTED = [/^brand\/brand\.json$/, /^brand\/assets\/(?!demo\/)/, /^\.env/];
// ملفات سير عمل GitHub تحتاج صلاحية workflow في الرمز، فتُتخطى ويُبلَّغ عنها
export const WORKFLOWS = /^\.github\/workflows\//;

// دمج ثلاثي على مستوى الملف: base = نسخة القالب التي بُني عليها المتجر، next = آخر القالب، client = مستودع العميل
export function planSync(base, next, client) {
  const apply = [], remove = [], conflicts = [], skipped = [];
  const paths = new Set([...Object.keys(base), ...Object.keys(next)]);
  for (const p of [...paths].sort()) {
    const b = base[p]?.sha, n = next[p]?.sha, c = client[p]?.sha;
    if (n === b) continue; // القالب لم يتغير في هذا الملف
    if (PROTECTED.some((r) => r.test(p))) { skipped.push({ path: p, why: "هوية العميل" }); continue; }
    if (WORKFLOWS.test(p)) { skipped.push({ path: p, why: "workflow" }); continue; }
    if (c === n) continue; // مطبّق مسبقاً
    if (c !== b) { conflicts.push(p); continue; } // العميل عدّل الملف بنفسه
    if (n) apply.push({ path: p, sha: n, mode: next[p].mode });
    else remove.push(p);
  }
  return { apply, remove, conflicts, skipped };
}

export async function syncStore({ store, templateRepo, mode = "pr", dryRun = false, o = {} }) {
  if (!store.repo) throw new Error("لا يوجد مستودع لهذا المتجر");
  if (!store.templateSha) throw new Error("نسخة القالب الأساسية لهذا المتجر غير معروفة (templateSha). حدّدها من تعديل المتجر.");
  const nextSha = await headSha(templateRepo, "main", o);
  if (nextSha === store.templateSha) return { status: "uptodate", nextSha };
  const clientHead = await headSha(store.repo, "main", o);
  const [base, next, client] = await Promise.all([treeOf(templateRepo, store.templateSha, o), treeOf(templateRepo, nextSha, o), treeOf(store.repo, clientHead, o)]);
  const plan = planSync(base.map, next.map, client.map);
  const summary = { nextSha, apply: plan.apply.length, remove: plan.remove.length, conflicts: plan.conflicts, skipped: plan.skipped, files: [...plan.apply.map((x) => x.path), ...plan.remove.map((p) => "- " + p)].slice(0, 60) };
  if (!plan.apply.length && !plan.remove.length) return { status: dryRun ? "dry" : "nothing", ...summary };
  if (dryRun) return { status: "dry", ...summary };

  // نسخ محتوى الملفات المتغيرة من القالب إلى مستودع العميل
  const entries = [];
  for (const f of plan.apply) {
    if (!client.map[f.path] || client.map[f.path].sha !== f.sha) {
      const blob = await gh(`/repos/${templateRepo}/git/blobs/${f.sha}`, o);
      await gh(`/repos/${store.repo}/git/blobs`, { ...o, method: "POST", body: { content: blob.content.replace(/\n/g, ""), encoding: "base64" } });
    }
    entries.push({ path: f.path, mode: f.mode, type: "blob", sha: f.sha });
  }
  for (const p of plan.remove) entries.push({ path: p, mode: "100644", type: "blob", sha: null });
  const tree = await gh(`/repos/${store.repo}/git/trees`, { ...o, method: "POST", body: { base_tree: client.treeSha, tree: entries } });
  const msg = `Sync template ${nextSha.slice(0, 7)}\n\nFrom ${templateRepo}@${nextSha}\nBase ${store.templateSha}${plan.conflicts.length ? `\nConflicts kept as client version: ${plan.conflicts.join(", ")}` : ""}`;
  const commit = await gh(`/repos/${store.repo}/git/commits`, { ...o, method: "POST", body: { message: msg, tree: tree.sha, parents: [clientHead] } });

  if (mode === "direct") {
    await gh(`/repos/${store.repo}/git/refs/heads/main`, { ...o, method: "PATCH", body: { sha: commit.sha, force: false } });
    return { status: "pushed", commit: commit.sha, parent: clientHead, pushedSha: commit.sha, ...summary };
  }
  const branch = `template-sync-${nextSha.slice(0, 7)}`;
  try {
    await gh(`/repos/${store.repo}/git/refs`, { ...o, method: "POST", body: { ref: `refs/heads/${branch}`, sha: commit.sha } });
  } catch (e) {
    if (e.status !== 422) throw e;
    await gh(`/repos/${store.repo}/git/refs/heads/${branch}`, { ...o, method: "PATCH", body: { sha: commit.sha, force: true } });
  }
  let pr;
  try {
    pr = await gh(`/repos/${store.repo}/pulls`, { ...o, method: "POST", body: { title: `تحديث القالب ${nextSha.slice(0, 7)}`, head: branch, base: "main", body: msg } });
  } catch (e) {
    if (e.status !== 422) throw e;
    pr = (await gh(`/repos/${store.repo}/pulls?head=${store.repo.split("/")[0]}:${branch}&state=open`, o))[0] || {};
  }
  return { status: "pr", pr: pr.number, prUrl: pr.html_url, commit: commit.sha, parent: clientHead, ...summary };
}

// تراجع عن التزام المزامنة بالتزام جديد (شجرة ما قبل الدفع) بدون force وبدون لمس قاعدة البيانات.
export async function revertSyncCommit({ repo, parent, pushedSha }, o = {}) {
  if (!repo || !/^[0-9a-f]{40}$/i.test(parent || "") || !/^[0-9a-f]{40}$/i.test(pushedSha || "")) {
    throw new Error("لا يمكن التراجع: بيانات الالتزام ناقصة");
  }
  const head = await headSha(repo, "main", o);
  if (head !== pushedSha) throw new Error("رأس الفرع تغيّر بعد التحديث، لن يُفرض التراجع");
  const parentCommit = await gh(`/repos/${repo}/git/commits/${parent}`, o);
  const tree = parentCommit?.tree?.sha;
  if (!tree) throw new Error("تعذر قراءة شجرة الالتزام السابق");
  const rev = await gh(`/repos/${repo}/git/commits`, {
    ...o,
    method: "POST",
    body: {
      message: `تراجع عن مزامنة القالب ${pushedSha.slice(0, 7)}\n\nيعيد شجرة الملفات إلى ${parent.slice(0, 7)}. لا يشمل استرجاع قاعدة البيانات.`,
      tree,
      parents: [head],
    },
  });
  await gh(`/repos/${repo}/git/refs/heads/main`, { ...o, method: "PATCH", body: { sha: rev.sha, force: false } });
  return { status: "reverted", revert: rev.sha, parent, pushedSha };
}

// دمج طلب سحب التحديث (بعد مراجعته)
export async function mergeSyncPr(store, o = {}) {
  if (!store.syncPr) throw new Error("لا يوجد طلب تحديث مفتوح");
  return gh(`/repos/${store.repo}/pulls/${store.syncPr}/merge`, { ...o, method: "PUT", body: { merge_method: "merge" } });
}
