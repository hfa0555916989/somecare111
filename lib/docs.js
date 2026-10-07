import crypto from "crypto";
import { redis } from "./content";
import { siteUrl, docTotals, validIban, normalizeIban } from "./defaults";

// عروض الأسعار والعقود: تُحفظ في Redis، ولكل وثيقة رابط سري على الموقع /doc/<token>
export const TYPES = { quote: "عرض سعر", contract: "عقد تقديم خدمات", proposal: "مقترح مشروع" };
export const DOC_STATUSES = { draft: "مسودة", sent: "مُرسل", accepted: "تمت الموافقة", cancelled: "ملغي" };

const HASH = "docs";
const TOKENS = "docs:tokens";
const SEQ = "docs:seq";

const str = (v, max = 300) => String(v ?? "").trim().slice(0, max);
const num = (v) => {
  const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const lines = (v, max = 60, len = 600) =>
  (Array.isArray(v) ? v : String(v || "").split("\n")).map((x) => str(x, len)).filter(Boolean).slice(0, max);
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ""));
const safeUrl = (u) => (/^(https?:\/\/|\/)[^\s"'<>]*$/i.test(String(u || "")) ? String(u) : "");

// ينظّف بيانات الوثيقة القادمة من لوحة التحكم أو من الاستيراد (لا يُحفظ إلا الحقول المعروفة)
export function cleanDoc(b = {}) {
  const c = b.client || {};
  return {
    type: TYPES[b.type] ? b.type : "quote",
    number: str(b.number, 40),
    // الافتراضي تاريخ اليوم بتوقيت الرياض
    date: isDate(b.date) ? b.date : new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10),
    validDays: Math.max(0, Math.min(365, Math.round(num(b.validDays)))),
    title: str(b.title, 120),
    subtitle: str(b.subtitle, 160),
    intro: str(b.intro, 600),
    client: {
      name: str(c.name, 120),
      company: str(c.company, 120),
      idNumber: str(c.idNumber, 40),
      phone: str(c.phone, 20).replace(/[^\d+]/g, ""),
      email: str(c.email, 120),
      city: str(c.city, 60),
    },
    sections: (Array.isArray(b.sections) ? b.sections : []).slice(0, 30).map((s) => ({
      title: str(s?.title, 160),
      desc: str(s?.desc, 400),
      qty: Math.max(1, Math.round(num(s?.qty) || 1)),
      price: Math.max(0, num(s?.price)),
      note: str(s?.note, 160),
      features: lines(s?.features, 40, 300),
      tags: lines(s?.tags, 12, 40),
    })),
    discount: Math.max(0, num(b.discount)),
    vatRate: Math.max(0, Math.min(100, num(b.vatRate))),
    recurring: lines(b.recurring, 10, 300),
    duration: str(b.duration, 160),
    terms: lines(b.terms, 40, 800),
    annex: (Array.isArray(b.annex) ? b.annex : []).slice(0, 20).map((a) => ({
      title: str(a?.title, 160),
      intro: str(a?.intro, 600),
      points: lines(a?.points, 40, 400),
    })),
    attachments: (Array.isArray(b.attachments) ? b.attachments : [])
      .slice(0, 10)
      .map((a) => ({ title: str(a?.title, 120), url: safeUrl(a?.url) }))
      .filter((a) => a.url),
    ref: str(b.ref, 40),
    status: ["draft", "sent", "cancelled"].includes(b.status) ? b.status : "draft",
  };
}

export const totals = docTotals;

// تاريخ انتهاء صلاحية العرض (null = بدون صلاحية)
export function expiresAt(d) {
  if (d.type !== "quote" || !d.validDays || !isDate(d.date)) return null;
  const t = new Date(d.date + "T23:59:59+03:00");
  t.setDate(t.getDate() + Number(d.validDays));
  return t;
}
export const isExpired = (d) => d.status !== "accepted" && !!expiresAt(d) && expiresAt(d) < new Date();

// بيانات مقدّم الخدمة كما في الإعدادات الآن (تُثبَّت داخل الوثيقة لحظة موافقة العميل)
export function liveProvider(c) {
  const k = c.contracts || {};
  const a = c.about || {};
  const site = siteUrl(c);
  return {
    name: k.providerName || a.name || c.brand.name,
    brand: c.brand.name,
    site,
    domain: new URL(site).hostname.replace(/^www\./, ""),
    phone: c.contact.phone,
    whatsapp: String(c.contact.whatsapp || "").replace(/\D/g, ""),
    email: c.social?.email || "",
    certTitle: a.certTitle || "وثيقة العمل الحر",
    certNumber: a.certNumber || "",
    certExpiry: a.certExpiry || "",
    certImage: a.certImage || "",
    certVerify: a.verifyUrl || "",
    bankName: k.bankName || "",
    accountName: k.accountName || "",
    iban: normalizeIban(k.iban),
    ibanCert: k.ibanCert || "",
    domainRegistrar: k.domainRegistrar || "",
    domainRegistered: k.domainRegistered || "",
    domainExpiry: k.domainExpiry || "",
    domainProof: k.domainProof || "",
    whoisUrl: k.whoisUrl || "https://secure.nic.sa/whois",
  };
}

// بصمة SHA-256 لمحتوى الوثيقة: أي تغيير في البنود أو الأسعار أو بيانات الطرفين يغيّر البصمة
export function fingerprint(d, provider) {
  const p = provider;
  const body = {
    type: d.type, number: d.number, date: d.date, validDays: d.validDays,
    title: d.title, subtitle: d.subtitle, intro: d.intro, client: d.client,
    sections: d.sections, discount: d.discount, vatRate: d.vatRate, recurring: d.recurring,
    duration: d.duration, terms: d.terms, annex: d.annex, attachments: d.attachments,
    provider: { name: p.name, domain: p.domain, certNumber: p.certNumber, bankName: p.bankName, accountName: p.accountName, iban: p.iban },
  };
  return crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

export { validIban };

function db() {
  const r = redis();
  if (!r) throw new Error("DB_NOT_CONNECTED");
  return r;
}

export async function listDocs() {
  const r = redis();
  if (!r) return [];
  const all = (await r.hgetall(HASH)) || {};
  return Object.values(all)
    .filter((x) => x && typeof x === "object")
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function getDoc(id) {
  return (await db().hget(HASH, id)) || null;
}

export async function getDocByToken(token) {
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(String(token || ""))) return null;
  const r = redis();
  if (!r) return null;
  const id = await r.hget(TOKENS, token);
  return id ? (await r.hget(HASH, id)) || null : null;
}

// رقم الوثيقة لا يتكرر بين وثيقتين (إعادة الاستيراد لنفس العرض كانت تنشئ نسخة بنفس الرقم ورابط مختلف)
const sameNumber = (a, b) => String(a || "").trim().toUpperCase() === String(b || "").trim().toUpperCase();
async function numberTaken(r, number, exceptId) {
  const all = (await r.hgetall(HASH)) || {};
  return Object.values(all).some((d) => d && d.id !== exceptId && sameNumber(d.number, number));
}

export async function createDoc(data) {
  const r = db();
  if (data.number && (await numberTaken(r, data.number))) throw new Error("DUPLICATE");
  const year = new Date().getFullYear();
  let id;
  do {
    id = `HD-${year}-${String(await r.incr(SEQ)).padStart(3, "0")}`;
  } while ((await r.hexists(HASH, id)) || (!data.number && (await numberTaken(r, id))));
  const token = crypto.randomBytes(15).toString("base64url");
  const now = new Date().toISOString();
  const doc = { ...data, id, number: data.number || id, token, createdAt: now, updatedAt: now };
  await r.hset(HASH, { [id]: doc });
  await r.hset(TOKENS, { [token]: id });
  return doc;
}

// الوثيقة الموافق عليها مقفلة: لا يتغير إلا إلغاؤها
export async function updateDoc(id, data) {
  const r = db();
  const cur = await r.hget(HASH, id);
  if (!cur) return null;
  if (cur.status === "accepted") {
    if (data.status !== "cancelled") throw new Error("LOCKED");
    const next = { ...cur, status: "cancelled", updatedAt: new Date().toISOString() };
    await r.hset(HASH, { [id]: next });
    return next;
  }
  if (data.number && !sameNumber(data.number, cur.number) && (await numberTaken(r, data.number, id))) throw new Error("DUPLICATE");
  const next = { ...cur, ...data, number: data.number || cur.number, id, token: cur.token, updatedAt: new Date().toISOString() };
  await r.hset(HASH, { [id]: next });
  return next;
}

export async function deleteDoc(id) {
  const r = db();
  const cur = await r.hget(HASH, id);
  // الوثيقة الموافق عليها محفوظة إجبارياً ولا تُحذف (يمكن إلغاؤها فقط)
  if (cur?.status === "accepted") throw new Error("LOCKED");
  if (cur?.token) await r.hdel(TOKENS, cur.token);
  await r.hdel(HASH, id);
}

export async function acceptDoc(doc, provider, info) {
  const r = db();
  const acceptance = { ...info, at: new Date().toISOString(), hash: fingerprint(doc, provider) };
  const next = { ...doc, status: "accepted", provider, acceptance, updatedAt: acceptance.at };
  await r.hset(HASH, { [doc.id]: next });
  return next;
}
