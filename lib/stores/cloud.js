// عميل Laravel Cloud API (الرمز من LARAVEL_CLOUD_API_TOKEN على الخادم فقط)
export const cloudToken = () => process.env.LARAVEL_CLOUD_API_TOKEN || "";
export const cloudRegion = () => process.env.LARAVEL_CLOUD_REGION || "eu-central-1";

export async function lc(path, { method = "GET", body, fetchImpl = fetch, token = cloudToken() } = {}) {
  if (!token) throw new Error("أضف LARAVEL_CLOUD_API_TOKEN في Vercel");
  const r = await fetchImpl(`https://cloud.laravel.com/api${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (r.status === 204) return {};
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const errs = j.errors ? " " + Object.values(j.errors).flat().join("، ").slice(0, 300) : "";
    const e = new Error(`Laravel Cloud ${r.status}: ${j.message || "خطأ"}${errs}`);
    e.status = r.status;
    throw e;
  }
  return j;
}

// يحوّل سجلات DNS المطلوبة من استجابة الدومين إلى قائمة بسيطة للعميل
export function dnsRecords(domainResource) {
  const out = [];
  const walk = (v) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) return v.forEach(walk);
    const type = v.type || v.record_type;
    const name = v.name ?? v.host ?? v.hostname;
    const value = v.value ?? v.content ?? v.target;
    if (type && name != null && value && /^(A|AAAA|CNAME|TXT|ALIAS|ANAME)$/i.test(type)) out.push({ type: String(type).toUpperCase(), name: String(name), value: String(value) });
    else Object.values(v).forEach(walk);
  };
  walk(domainResource?.data?.attributes || domainResource?.attributes || domainResource);
  const seen = new Set();
  return out.filter((x) => (seen.has(JSON.stringify(x)) ? false : seen.add(JSON.stringify(x))));
}
