import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { redis } from "../content";
import { encrypt, decrypt } from "../projects";

// متاجر العملاء (نسخة مستقلة لكل عميل). الأسرار تُحفظ مشفّرة AES-256-GCM ولا تُرسل للمتصفح أبداً
const HASH = "stores";
const LOG = "stores:log";
const ROLLOUT = "stores:rollout";
const FILE = () => process.env.STORES_FILE || path.join(process.cwd(), ".data", "stores.json");

// Redis في الإنتاج. الملف المحلي فقط عند STORES_FORCE_FILE=1 (معاينة لوحة التحكم بدون لمس Upstash).
function backend() {
  if (process.env.STORES_FORCE_FILE === "1") return "file";
  if (redis()) return "redis";
  return null;
}

async function readBag() {
  try {
    const raw = JSON.parse(await fs.readFile(FILE(), "utf8"));
    return {
      stores: raw?.stores && typeof raw.stores === "object" ? raw.stores : {},
      log: Array.isArray(raw?.log) ? raw.log : [],
      rollout: raw?.rollout && typeof raw.rollout === "object" ? raw.rollout : null,
    };
  } catch (e) {
    if (e && e.code === "ENOENT") return { stores: {}, log: [], rollout: null };
    throw e;
  }
}

async function writeBag(bag) {
  await fs.mkdir(path.dirname(FILE()), { recursive: true });
  await fs.writeFile(FILE(), JSON.stringify(bag));
}
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
    adminEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(b.adminEmail, 120)) ? str(b.adminEmail, 120) : "",
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

function sortStores(all) {
  return Object.values(all || {})
    .filter((x) => x && typeof x === "object")
    .sort((a, b) => String(a.name).localeCompare(String(b.name), "ar"));
}

export async function listStores() {
  const mode = backend();
  if (mode === "file") return sortStores((await readBag()).stores);
  const r = redis();
  if (!r) return [];
  return sortStores(await r.hgetall(HASH));
}

export async function getStore(id) {
  const mode = backend();
  if (mode === "file") return (await readBag()).stores[String(id)] || null;
  return (await db().hget(HASH, String(id))) || null;
}

export function storeSecret(s) {
  return s?.secret ? decrypt(s.secret) || {} : {};
}

// data: الحقول العامة. secrets: يُدمج مع الأسرار المحفوظة. extra: حقول نظام (الحالة، معرّفات Laravel Cloud...)
export async function saveStore(id, data = {}, { secrets, extra } = {}) {
  const mode = backend();
  const bag = mode === "file" ? await readBag() : null;
  const r = mode === "redis" ? db() : null;
  if (!mode) throw new Error("DB_NOT_CONNECTED");
  const cur = id ? (mode === "file" ? bag.stores[id] : await r.hget(HASH, id)) : null;
  if (id && !cur) return null;
  const now = new Date().toISOString();
  const next = { ...(cur || {}), ...cleanStore({ ...(cur || {}), ...data }), ...(extra || {}), id: cur?.id || "S-" + crypto.randomBytes(5).toString("hex"), createdAt: cur?.createdAt || now, updatedAt: now };
  if (secrets) {
    const merged = { ...storeSecret(cur), ...Object.fromEntries(Object.entries(secrets).filter(([, v]) => v)) };
    next.secret = encrypt(merged);
  }
  if (mode === "file") {
    bag.stores[next.id] = next;
    await writeBag(bag);
  } else await r.hset(HASH, { [next.id]: next });
  return next;
}

export async function patchStore(id, extra) {
  const mode = backend();
  if (mode === "file") {
    const bag = await readBag();
    const cur = bag.stores[id];
    if (!cur) return null;
    bag.stores[id] = { ...cur, ...extra, updatedAt: new Date().toISOString() };
    await writeBag(bag);
    return bag.stores[id];
  }
  const r = db();
  const cur = await r.hget(HASH, id);
  if (!cur) return null;
  const next = { ...cur, ...extra, updatedAt: new Date().toISOString() };
  await r.hset(HASH, { [id]: next });
  return next;
}

export async function deleteStore(id) {
  const mode = backend();
  if (mode === "file") {
    const bag = await readBag();
    delete bag.stores[id];
    await writeBag(bag);
    return;
  }
  await db().hdel(HASH, id);
}

// سجل العمليات (آخر 500)
export async function logAction(entry) {
  const e = { at: new Date().toISOString(), ok: true, ...entry };
  if (e.detail) e.detail = String(e.detail).slice(0, 600);
  const mode = backend();
  if (mode === "file") {
    const bag = await readBag();
    bag.log = [e, ...bag.log].slice(0, 500);
    await writeBag(bag);
    return;
  }
  const r = redis();
  if (!r) return;
  await r.lpush(LOG, e);
  await r.ltrim(LOG, 0, 499);
}

export async function listLog(limit = 200) {
  const mode = backend();
  if (mode === "file") return (await readBag()).log.slice(0, limit);
  const r = redis();
  if (!r) return [];
  return (await r.lrange(LOG, 0, limit - 1)) || [];
}

export async function getRollout() {
  const mode = backend();
  if (mode === "file") return (await readBag()).rollout;
  const r = redis();
  if (!r) return null;
  const v = await r.get(ROLLOUT);
  return v && typeof v === "object" ? v : null;
}

export async function saveRollout(rollout) {
  const mode = backend();
  if (mode === "file") {
    const bag = await readBag();
    bag.rollout = rollout;
    await writeBag(bag);
    return rollout;
  }
  if (mode !== "redis") throw new Error("DB_NOT_CONNECTED");
  await redis().set(ROLLOUT, rollout);
  return rollout;
}
