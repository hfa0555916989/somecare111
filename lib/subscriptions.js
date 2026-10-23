import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { PLAN_IDS, presentClient, riyadhToday, sortClients, summarize } from "./subscription-plans.js";

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// اشتراكات العملاء وصيانتهم. تُحفظ في Redis نفسه المستخدم لبقية اللوحة،
// أو في ملف محلي عند العمل بدون Redis وخارج Vercel.
const HASH = "subs:clients";
const FILE = () => process.env.SUBSCRIPTIONS_FILE || path.join(process.cwd(), ".data", "subscriptions.json");

const str = (v, max = 160) => String(v ?? "").trim().slice(0, max);
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ""));
const money = (v) => Math.max(0, Math.round(Number(String(v ?? "").replace(/[^\d.-]/g, "")) || 0));

function backend() {
  if (process.env.SUBSCRIPTIONS_FORCE_FILE === "1") return "file";
  if (redis()) return "redis";
  if (!process.env.VERCEL) return "file";
  return null;
}

export function cleanClient(b = {}) {
  const plan = PLAN_IDS.has(b.plan) ? b.plan : "basic";
  return {
    storeName: str(b.storeName, 120),
    phone: str(b.phone, 20).replace(/[^\d+]/g, ""),
    plan,
    customAmount: plan === "custom" ? money(b.customAmount) : 0,
    cycle: b.cycle === "annual" ? "annual" : "monthly",
    startDate: isDate(b.startDate) ? b.startDate : "",
  };
}

function cleanPayment(p = {}) {
  return {
    id: str(p.id, 40) || "P-" + crypto.randomBytes(4).toString("hex"),
    date: isDate(p.date) ? p.date : riyadhToday(),
    amount: money(p.amount),
    note: str(p.note, 200),
  };
}

async function readAll() {
  const mode = backend();
  if (mode === "redis") {
    const all = (await redis().hgetall(HASH)) || {};
    return Object.values(all).filter((x) => x && typeof x === "object");
  }
  if (mode !== "file") throw new Error("DB_NOT_CONNECTED");
  try {
    const raw = JSON.parse(await fs.readFile(FILE(), "utf8"));
    return Array.isArray(raw) ? raw.filter((x) => x && typeof x === "object") : [];
  } catch (e) {
    if (e && e.code === "ENOENT") return [];
    throw e;
  }
}

async function writeAll(list) {
  const mode = backend();
  if (mode === "redis") {
    const r = redis();
    const existing = (await r.hgetall(HASH)) || {};
    const keep = new Set(list.map((x) => x.id));
    const gone = Object.keys(existing).filter((id) => !keep.has(id));
    if (gone.length) await r.hdel(HASH, ...gone);
    if (list.length) await r.hset(HASH, Object.fromEntries(list.map((x) => [x.id, x])));
    return;
  }
  if (mode !== "file") throw new Error("DB_NOT_CONNECTED");
  await fs.mkdir(path.dirname(FILE()), { recursive: true });
  await fs.writeFile(FILE(), JSON.stringify(list, null, 2));
}

export async function listSubscriptions(today = riyadhToday()) {
  const views = sortClients((await readAll()).map((x) => presentClient(x, today)));
  return { items: views, summary: summarize(views), storage: backend() };
}

export async function saveSubscription(body = {}, today = riyadhToday()) {
  const all = await readAll();
  const now = new Date().toISOString();
  const id = str(body.id, 40);
  const index = id ? all.findIndex((x) => x.id === id) : -1;
  if (id && index < 0) return null;
  let cur = index >= 0 ? all[index] : null;

  if (body.action === "pay" || body.action === "unpay") {
    if (!cur) return null;
    const payments = Array.isArray(cur.payments) ? cur.payments : [];
    cur = {
      ...cur,
      payments: body.action === "pay"
        ? [...payments, cleanPayment({ date: body.date, amount: body.amount, note: body.note })].slice(-240)
        : payments.filter((p) => p.id !== body.paymentId),
      updatedAt: now,
    };
  } else {
    const cleaned = cleanClient({ ...(cur || {}), ...body });
    if (!cleaned.storeName) throw new Error("اسم المتجر مطلوب");
    if (!cleaned.startDate) throw new Error("تاريخ البداية مطلوب");
    if (cleaned.plan === "custom" && cleaned.customAmount <= 0) throw new Error("اكتب المبلغ الشهري");
    cur = {
      ...cleaned,
      id: cur?.id || "S-" + crypto.randomBytes(5).toString("hex"),
      payments: Array.isArray(cur?.payments) ? cur.payments : [],
      createdAt: cur?.createdAt || now,
      updatedAt: now,
    };
  }

  const next = index >= 0 ? all.map((x, i) => (i === index ? cur : x)) : [...all, cur];
  await writeAll(next);
  return presentClient(cur, today);
}

export async function deleteSubscription(id) {
  const all = await readAll();
  const next = all.filter((x) => x.id !== id);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}
