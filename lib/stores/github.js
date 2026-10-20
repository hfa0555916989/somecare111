// عميل GitHub بسيط (الرمز من GITHUB_TOKEN على الخادم فقط)
export const ghToken = () => process.env.STORES_GITHUB_TOKEN || process.env.GITHUB_TOKEN || "";
export const templateRepo = () => process.env.STORES_TEMPLATE_REPO || "hfa0555916989/retail-store-template";
export const ghOwner = () => process.env.STORES_GITHUB_OWNER || templateRepo().split("/")[0];

export async function gh(path, { method = "GET", body, fetchImpl = fetch, token = ghToken() } = {}) {
  if (!token) throw new Error("أضف STORES_GITHUB_TOKEN في Vercel");
  const r = await fetchImpl(`https://api.github.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (r.status === 204) return {};
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(`GitHub ${r.status}: ${j.message || "خطأ"}${j.errors ? " " + JSON.stringify(j.errors).slice(0, 200) : ""}`);
    e.status = r.status;
    throw e;
  }
  return j;
}

export const b64 = (s) => Buffer.from(s, "utf8").toString("base64");
export const unb64 = (s) => Buffer.from(String(s || ""), "base64").toString("utf8");

export async function headSha(repo, branch = "main", o = {}) {
  return (await gh(`/repos/${repo}/git/ref/heads/${branch}`, o)).object.sha;
}

export async function treeOf(repo, commitSha, o = {}) {
  const c = await gh(`/repos/${repo}/git/commits/${commitSha}`, o);
  const t = await gh(`/repos/${repo}/git/trees/${c.tree.sha}?recursive=1`, o);
  if (t.truncated) throw new Error("شجرة الملفات كبيرة جداً لواجهة GitHub");
  const map = {};
  for (const e of t.tree) if (e.type === "blob") map[e.path] = { sha: e.sha, mode: e.mode };
  return { map, treeSha: c.tree.sha, message: c.message };
}

export async function readFile(repo, path, ref, o = {}) {
  const j = await gh(`/repos/${repo}/contents/${encodeURI(path)}${ref ? `?ref=${ref}` : ""}`, o);
  return { text: unb64(j.content), sha: j.sha };
}
