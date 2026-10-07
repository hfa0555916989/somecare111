import crypto from "crypto";
import { put, get, del } from "@vercel/blob";
import { redis } from "./content";

// التخزين السحابي على Vercel Blob بمخزنين:
// - عام (BLOB_READ_WRITE_TOKEN): صور الموقع والفيديو، روابطها مفتوحة للزوار
// - خاص (PRIVATE_BLOB_READ_WRITE_TOKEN): العقود والفواتير والملفات، لا تُفتح إلا بعد دخول لوحة التحكم
// عند ربط المخزن الخاص بالمشروع في Vercel اكتب البادئة PRIVATE_BLOB في Advanced Options
export const publicToken = () => process.env.BLOB_READ_WRITE_TOKEN || "";
export const privateToken = () => process.env.PRIVATE_BLOB_READ_WRITE_TOKEN || process.env.PRIVATE_READ_WRITE_TOKEN || "";
export const storageStatus = () => ({ publicBlob: !!publicToken(), privateBlob: !!privateToken() });

export const FILE_CATS = {
  contract: "عقود موقّعة",
  quote: "عروض أسعار",
  invoice: "فواتير شراء ومصروفات",
  ads: "فواتير إعلانات",
  income: "فواتير وإيصالات مبيعات",
  bank: "كشوف وإشعارات بنكية",
  gov: "وثائق حكومية وتراخيص",
  project: "ملفات مشاريع العملاء",
  image: "صور",
  other: "أخرى",
};

const HASH = "files";
const HISTORY = "img:history";
const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ""));
const today = () => new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);

function db() {
  const r = redis();
  if (!r) throw new Error("DB_NOT_CONNECTED");
  return r;
}

// اسم ملف آمن داخل المخزن: السنة/التصنيف/الاسم
export function safeName(name) {
  const base = String(name || "file").normalize("NFC").replace(/[\\/:*?"<>|#%\s]+/g, "-").replace(/-+/g, "-").slice(-100);
  return base || "file";
}
export const filePath = (cat, date, name) => `archive/${String(date || today()).slice(0, 4)}/${FILE_CATS[cat] ? cat : "other"}/${safeName(name)}`;

export async function putPrivate(pathname, body, contentType) {
  const token = privateToken();
  if (!token) throw new Error("PRIVATE_BLOB_NOT_CONNECTED");
  return put(pathname, body, { access: "private", token, contentType, addRandomSuffix: true });
}

export async function readPrivate(urlOrPath) {
  const token = privateToken();
  if (!token) throw new Error("PRIVATE_BLOB_NOT_CONNECTED");
  return get(urlOrPath, { access: "private", token });
}

export async function readPrivateBase64(urlOrPath) {
  const res = await readPrivate(urlOrPath);
  if (!res || res.statusCode !== 200) return null;
  const buf = Buffer.from(await new Response(res.stream).arrayBuffer());
  return { data: buf.toString("base64"), contentType: res.blob.contentType, size: buf.length };
}

/* ---------- سجل الملفات (Redis) ---------- */
export function cleanMeta(b = {}) {
  return {
    title: str(b.title, 160),
    cat: FILE_CATS[b.cat] ? b.cat : "other",
    date: isDate(b.date) ? b.date : today(),
    client: str(b.client, 120),
    docRef: str(b.docRef, 40),
    projectId: str(b.projectId, 40),
    entryIds: (Array.isArray(b.entryIds) ? b.entryIds : []).map((x) => str(x, 20)).filter(Boolean).slice(0, 30),
    amount: Math.max(0, Number(b.amount) || 0),
    note: str(b.note, 500),
    locked: !!b.locked,
  };
}

export async function listFiles() {
  const r = redis();
  if (!r) return [];
  const all = (await r.hgetall(HASH)) || {};
  return Object.values(all)
    .filter((x) => x && typeof x === "object")
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function getFile(id) {
  return (await db().hget(HASH, id)) || null;
}

// يسجّل ملفاً رُفع للمخزن الخاص (blob = { url, pathname, contentType, size })
export async function addFile(blob, meta = {}, source = "upload") {
  const r = db();
  const id = "F-" + crypto.randomBytes(6).toString("hex");
  const now = new Date().toISOString();
  const item = {
    id,
    url: str(blob.url, 600),
    pathname: str(blob.pathname, 400),
    name: str(blob.name || blob.pathname?.split("/").pop(), 160),
    type: str(blob.contentType, 100),
    size: Math.max(0, Number(blob.size) || 0),
    source,
    ...cleanMeta(meta),
    year: (isDate(meta.date) ? meta.date : today()).slice(0, 4),
    createdAt: now,
    updatedAt: now,
  };
  await r.hset(HASH, { [id]: item });
  return item;
}

export async function updateFile(id, meta) {
  const r = db();
  const cur = await r.hget(HASH, id);
  if (!cur) return null;
  const m = cleanMeta({ ...cur, ...meta });
  // العقود الموقّعة المؤرشفة تلقائياً لا يتغير تصنيفها ولا تاريخها
  const next = { ...cur, ...m, ...(cur.locked ? { cat: cur.cat, date: cur.date, docRef: cur.docRef, locked: true } : {}), updatedAt: new Date().toISOString() };
  next.year = next.date.slice(0, 4);
  await r.hset(HASH, { [id]: next });
  return next;
}

export async function deleteFile(id) {
  const r = db();
  const cur = await r.hget(HASH, id);
  if (!cur) return;
  if (cur.locked) throw new Error("LOCKED");
  if (cur.url && privateToken()) await del(cur.url, { token: privateToken() }).catch(() => {});
  await r.hdel(HASH, id);
}

/* ---------- أرشيف الصور القديمة لكل خانة ---------- */
const MEDIA = /^(\/images\/|https:\/\/[^\s]+\.(blob\.vercel-storage\.com|public\.blob\.vercel-storage\.com)\/|https?:\/\/[^\s]+\.(png|jpe?g|webp|gif|svg|mp4|webm|pdf)(\?|$))/i;
const isMedia = (v) => typeof v === "string" && MEDIA.test(v.trim());

// كل خانات الصور في المحتوى: [المسار، القيمة]
function mediaFields(obj, path = [], out = []) {
  if (Array.isArray(obj)) obj.forEach((v, i) => mediaFields(v, [...path, i], out));
  else if (obj && typeof obj === "object") for (const [k, v] of Object.entries(obj)) mediaFields(v, [...path, k], out);
  else if (isMedia(obj)) out.push([path, obj.trim()]);
  return out;
}

// عند حفظ المحتوى: أي صورة تغيّرت أو حُذفت تُحفظ نسختها القديمة في الأرشيف
export async function recordImageChanges(prev, next) {
  const r = redis();
  if (!r || !prev) return;
  const now = mediaFields(next);
  const nowMap = new Map(now.map(([p, v]) => [p.join("."), v]));
  const items = [];
  for (const [p, v] of mediaFields(prev)) {
    const key = p.join(".");
    if (nowMap.get(key) === v) continue;
    // نفس الصورة انتقلت لخانة أخرى (مثل إعادة ترتيب المعرض) فلا تُعد صورة قديمة
    if ([...nowMap.values()].includes(v)) continue;
    items.push({ path: p, key, url: v, replacedBy: nowMap.get(key) || "", at: new Date().toISOString() });
  }
  if (items.length) {
    await r.lpush(HISTORY, ...items);
    await r.ltrim(HISTORY, 0, 999);
  }
}

export async function imageHistory() {
  const r = redis();
  if (!r) return [];
  return ((await r.lrange(HISTORY, 0, 999)) || []).filter((x) => x && typeof x === "object");
}
