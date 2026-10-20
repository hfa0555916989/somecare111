import crypto from "crypto";
import { redis } from "../content";
import { encrypt, decrypt } from "../projects";

// متاجر العملاء (نسخة مستقلة لكل عميل). الأسرار تُحفظ مشفّرة AES-256-GCM ولا تُرسل للمتصفح أبداً
const HASH = "stores";
const LOG = "stores:log";
const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ""));
export const slugOk = (s) => /^[a-z][a-z0-9-]{1,30}[a-z0-9]$/.test(String(s || ""));
export const domainOk = (d) => !d || /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(String(d));
export const hexOk = (c) => !c || /^#[0-9a-f]{6}$/i.test(String(c));

// http مسموح فقط لمتجر محلي أثناء الاختبار (STORES_ALLOW_LOCAL=1)
const urlOk = (u) => /^https:\/\/[^\s"'<>]+$/i.test(u) || (process.env.STORES_ALLOW_LOCAL === "1" && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(u));

function db() {
  const r = redis();
  if (!r) throw new Error("DB_NOT_CONNECTED");
  return r;
}

export function cleanStore(b = {}) {
  return {
    name: str(b.name, 80) || "متجر بدون اسم",
    nameEn: str(b.nameEn, 80),
    slug: str(b.slug, 32).toLowerCase(),
    domain: str(b.domain, 120).toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
    baseUrl: urlOk(str(b.baseUrl, 300)) ? str(b.baseUrl, 300).replace(/\/+$/, "") : "",
    repo: /^[\w.-]+\/[\w.-]+$/.test(str(b.repo, 120)) ? str(b.repo, 120) : "",
    client: str(b.client, 120),
    phone: str(b.phone, 20).replace(/[^\d+]/g, ""),
    renewal: isDate(b.renewal) ? b.renewal : "",
    plan: str(b.plan, 80),
    notes: str(b.notes, 4000),
    primary: hexOk(b.primary) ? str(b.primary, 7) : "",
    secondary: hexOk(b.secondary) ? str(b.secondary, 7) : "",
    logoUrl: /^https:\/\/[^\s"'<>]+$/i.test(str(b.logoUrl, 500)) ? str(b.logoUrl, 500) : "",
  };
}

// ما يُرسل للمتصفح: بدون أي سر (فقط هل هو محفوظ أم لا)
export function publicStore(s) {
  if (!s) return s;
  const { secret, ...rest } = s;
  return { ...rest, hasSecret: !!secret };
}

export async function listStores() {
  const r = redis();
  if (!r) return [];
  const all = (await r.hgetall(HASH)) || {};
  return Object.values(all)
    .filter((x) => x && typeof x === "object")
    .sort((a, b) => String(a.name).localeCompare(String(b.name), "ar"));
}

export async function getStore(id) {
  return (await db().hget(HASH, String(id))) || null;
}

export function storeSecret(s) {
  return s?.secret ? decrypt(s.secret) || {} : {};
}

// data: الحقول العامة. secrets: يُدمج مع الأسرار المحفوظة. extra: حقول نظام (الحالة، معرّفات Laravel Cloud...)
export async function saveStore(id, data = {}, { secrets, extra } = {}) {
  const r = db();
  const cur = id ? await r.hget(HASH, id) : null;
  if (id && !cur) return null;
  const now = new Date().toISOString();
  const next = { ...(cur || {}), ...cleanStore({ ...(cur || {}), ...data }), ...(extra || {}), id: cur?.id || "S-" + crypto.randomBytes(5).toString("hex"), createdAt: cur?.createdAt || now, updatedAt: now };
  if (secrets) {
    const merged = { ...storeSecret(cur), ...Object.fromEntries(Object.entries(secrets).filter(([, v]) => v)) };
    next.secret = encrypt(merged);
  }
  await r.hset(HASH, { [next.id]: next });
  return next;
}

export async function patchStore(id, extra) {
  const r = db();
  const cur = await r.hget(HASH, id);
  if (!cur) return null;
  const next = { ...cur, ...extra, updatedAt: new Date().toISOString() };
  await r.hset(HASH, { [id]: next });
  return next;
}

export async function deleteStore(id) {
  await db().hdel(HASH, id);
}

// سجل العمليات (آخر 500)
export async function logAction(entry) {
  const r = redis();
  if (!r) return;
  const e = { at: new Date().toISOString(), ok: true, ...entry };
  if (e.detail) e.detail = String(e.detail).slice(0, 600);
  await r.lpush(LOG, e);
  await r.ltrim(LOG, 0, 499);
}

export async function listLog(limit = 200) {
  const r = redis();
  if (!r) return [];
  return (await r.lrange(LOG, 0, limit - 1)) || [];
}
