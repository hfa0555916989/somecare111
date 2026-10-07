import crypto from "crypto";
import { redis } from "./content";

// مشاريع العملاء: بيانات المشروع + المفاتيح والمتغيرات السرية (مشفّرة AES-256-GCM قبل الحفظ)
export const PROJECT_STATUS = { active: "قيد التنفيذ", done: "منجز", maintenance: "دعم وصيانة", paused: "متوقف" };

const HASH = "projects";
const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ""));
const safeUrl = (u) => (/^https?:\/\/[^\s"'<>]+$/i.test(String(u || "").trim()) ? String(u).trim() : "");

// مفتاح التشفير: VAULT_KEY (مفضّل)، وإلا AUTH_SECRET أو كلمة مرور اللوحة
// تنبيه: تغيير هذا المتغير بعد الحفظ يمنع فك المفاتيح المحفوظة سابقاً
const secret = () => process.env.VAULT_KEY || process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || "";
export const vaultKeySource = () => (process.env.VAULT_KEY ? "VAULT_KEY" : process.env.AUTH_SECRET ? "AUTH_SECRET" : process.env.ADMIN_PASSWORD ? "ADMIN_PASSWORD" : "");
const key = () => crypto.createHash("sha256").update("hassandev-vault:" + secret()).digest();

export function encrypt(value) {
  if (!secret()) throw new Error("NO_KEY");
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([c.update(JSON.stringify(value), "utf8"), c.final()]);
  return ["v1", iv.toString("base64"), c.getAuthTag().toString("base64"), ct.toString("base64")].join(":");
}

export function decrypt(payload) {
  if (!payload) return null;
  const [v, iv, tag, ct] = String(payload).split(":");
  if (v !== "v1") return null;
  const d = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  d.setAuthTag(Buffer.from(tag, "base64"));
  return JSON.parse(Buffer.concat([d.update(Buffer.from(ct, "base64")), d.final()]).toString("utf8"));
}

export function cleanProject(b = {}) {
  return {
    name: str(b.name, 120) || "مشروع بدون اسم",
    client: str(b.client, 120),
    docRef: str(b.docRef, 40),
    status: PROJECT_STATUS[b.status] ? b.status : "active",
    domain: str(b.domain, 120),
    siteUrl: safeUrl(b.siteUrl),
    repo: safeUrl(b.repo),
    hosting: str(b.hosting, 120),
    startDate: isDate(b.startDate) ? b.startDate : "",
    endDate: isDate(b.endDate) ? b.endDate : "",
    renewals: (Array.isArray(b.renewals) ? b.renewals : []).slice(0, 30).map((x) => ({
      title: str(x?.title, 120),
      date: isDate(x?.date) ? x.date : "",
      amount: Math.max(0, Number(x?.amount) || 0),
      note: str(x?.note, 200),
    })).filter((x) => x.title),
    links: (Array.isArray(b.links) ? b.links : []).slice(0, 30).map((x) => ({ title: str(x?.title, 120), url: safeUrl(x?.url) })).filter((x) => x.url),
    obligations: str(b.obligations, 3000),
  };
}

// الأسرار: المتغيرات والملاحظات الخاصة
export function cleanSecrets(b = {}) {
  return {
    env: (Array.isArray(b.env) ? b.env : []).slice(0, 300).map((x) => ({
      key: str(x?.key, 120).replace(/[^\w.-]/g, "_"),
      value: String(x?.value ?? "").slice(0, 20000),
      note: str(x?.note, 200),
      env: ["production", "preview", "development", "all"].includes(x?.env) ? x.env : "all",
    })).filter((x) => x.key),
    notes: String(b.notes ?? "").slice(0, 20000),
  };
}

function db() {
  const r = redis();
  if (!r) throw new Error("DB_NOT_CONNECTED");
  return r;
}

const open = (p) => {
  let s = { env: [], notes: "" };
  let locked = false;
  try {
    s = decrypt(p.secret) || s;
  } catch {
    locked = true;
  }
  const { secret: _, ...rest } = p;
  return { ...rest, ...s, locked };
};

export async function listProjects() {
  const r = redis();
  if (!r) return [];
  const all = (await r.hgetall(HASH)) || {};
  return Object.values(all)
    .filter((x) => x && typeof x === "object")
    .map(open)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export async function saveProject(id, body) {
  const r = db();
  const cur = id ? await r.hget(HASH, id) : null;
  if (id && !cur) return null;
  // مشروع مقفل (تغيّر مفتاح التشفير): لا تُستبدل أسراره القديمة بقائمة فارغة
  if (cur && body.locked) return open(cur);
  const now = new Date().toISOString();
  const next = {
    ...(cur || {}),
    ...cleanProject(body),
    id: cur?.id || "P-" + crypto.randomBytes(5).toString("hex"),
    secret: encrypt(cleanSecrets(body)),
    createdAt: cur?.createdAt || now,
    updatedAt: now,
  };
  await r.hset(HASH, { [next.id]: next });
  return open(next);
}

export async function deleteProject(id) {
  await db().hdel(HASH, id);
}
