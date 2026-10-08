import crypto from "crypto";
import { put, get, del, list, issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned } from "@vercel/blob/client";
import { getVercelOidcToken } from "@vercel/oidc";
import { redis } from "./content";

// التخزين السحابي على Vercel Blob بمخزنين:
// - عام (BLOB_*): صور الموقع والفيديو، روابطها مفتوحة للزوار
// - خاص (PRIVATE_BLOB_*): العقود والفواتير والملفات، لا تُفتح إلا بعد دخول لوحة التحكم
// عند ربط المخزن الخاص بالمشروع في Vercel اكتب البادئة PRIVATE_BLOB
// المخازن الحديثة تُربط بـ STORE_ID ويتصل بها الموقع عبر OIDC، والقديمة بـ READ_WRITE_TOKEN
export const publicToken = () => process.env.BLOB_READ_WRITE_TOKEN || "";
export const privateToken = () => process.env.PRIVATE_BLOB_READ_WRITE_TOKEN || process.env.PRIVATE_READ_WRITE_TOKEN || "";
const privateStoreId = () => process.env.PRIVATE_BLOB_STORE_ID || "";
const publicStoreId = () => process.env.BLOB_STORE_ID || "";
export const privateEnabled = () => !!(privateToken() || privateStoreId());
export const publicEnabled = () => !!(publicToken() || publicStoreId());
export const storageStatus = () => ({ publicBlob: publicEnabled(), privateBlob: privateEnabled() });

// بيانات الاتصال بمخزن معيّن صراحةً، حتى لا يذهب ملف خاص للمخزن العام بالخطأ
async function authFor(token, storeId) {
  if (token) return { token };
  if (!storeId) return null;
  const oidcToken = await getVercelOidcToken().catch(() => "");
  return oidcToken ? { oidcToken, storeId } : null;
}
export async function privateAuth() {
  const a = await authFor(privateToken(), privateStoreId());
  if (!a) throw new Error("PRIVATE_BLOB_NOT_CONNECTED");
  return a;
}
export async function publicAuth() {
  const a = await authFor(publicToken(), publicStoreId());
  if (!a) throw new Error("PUBLIC_BLOB_NOT_CONNECTED");
  return a;
}

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

// رفع مباشر من المتصفح بروابط موقّعة قصيرة العمر (يعمل مع المخازن الحديثة والقديمة)
export async function presignedUploadRoute(request, { access, allowed, maxBytes, prefix = "", authorize }) {
  const body = await request.json();
  // المفتاح يُستخدم فقط للتحقق من إشعارات اكتمال الرفع، ونحن لا نستقبلها (نسجّل الملف من المتصفح)
  const webhookPublicKey = (access === "private" ? process.env.PRIVATE_BLOB_WEBHOOK_PUBLIC_KEY : process.env.BLOB_WEBHOOK_PUBLIC_KEY) || "no-upload-callbacks";
  return handleUploadPresigned({
    body,
    request,
    webhookPublicKey,
    getSignedToken: async (pathname) => {
      await authorize();
      if (prefix && !pathname.startsWith(prefix)) throw new Error("مسار غير صالح");
      const auth = access === "private" ? await privateAuth() : await publicAuth();
      const token = await issueSignedToken({ ...auth, pathname, operations: ["put"], allowedContentTypes: allowed, maximumSizeInBytes: maxBytes, validUntil: Date.now() + 15 * 60 * 1000 });
      return { token, urlOptions: { allowedContentTypes: allowed, maximumSizeInBytes: maxBytes, addRandomSuffix: false } };
    },
  });
}

// فحص فعلي للاتصال بالمخزنين (يظهر في «الدليل»)
export async function storageHealth() {
  const check = async (enabled, auth) => {
    if (!enabled) return "off";
    try {
      await list({ limit: 1, ...(await auth()) });
      return "ok";
    } catch (e) {
      console.error("Blob health check failed", e);
      return "error";
    }
  };
  const [pub, priv] = await Promise.all([check(publicEnabled(), publicAuth), check(privateEnabled(), privateAuth)]);
  return { publicBlob: pub, privateBlob: priv };
}

export async function putPrivate(pathname, body, contentType) {
  return put(pathname, body, { access: "private", ...(await privateAuth()), contentType, addRandomSuffix: true });
}

export async function readPrivate(urlOrPath) {
  return get(urlOrPath, { access: "private", ...(await privateAuth()) });
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
  if (cur.url && privateEnabled()) await del(cur.url, await privateAuth()).catch(() => {});
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
