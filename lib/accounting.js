import { redis } from "./content";
import { cleanSettings, DEFAULT_SETTINGS } from "./finance";

// عمليات المحاسبة (إيرادات، مصروفات، تمويل، سحوبات) تُحفظ في Redis
const HASH = "acct:entries";
const SEQ = "acct:seq";
const SETTINGS = "acct:settings";

function db() {
  const r = redis();
  if (!r) throw new Error("DB_NOT_CONNECTED");
  return r;
}

export async function listEntries() {
  const r = redis();
  if (!r) return [];
  const all = (await r.hgetall(HASH)) || {};
  return Object.values(all)
    .filter((x) => x && typeof x === "object")
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function createEntries(list) {
  const r = db();
  const now = new Date().toISOString();
  const out = [];
  for (const data of list) {
    const id = `T-${await r.incr(SEQ)}`;
    out.push({ ...data, id, createdAt: now, updatedAt: now });
  }
  if (out.length) await r.hset(HASH, Object.fromEntries(out.map((e) => [e.id, e])));
  return out;
}

export async function updateEntry(id, data) {
  const r = db();
  const cur = await r.hget(HASH, id);
  if (!cur) return null;
  const next = { ...cur, ...data, id, updatedAt: new Date().toISOString() };
  await r.hset(HASH, { [id]: next });
  return next;
}

export async function deleteEntry(id) {
  await db().hdel(HASH, id);
}

export async function getSettings() {
  const r = redis();
  const s = r ? await r.get(SETTINGS) : null;
  return { ...DEFAULT_SETTINGS, ...(s && typeof s === "object" ? s : {}) };
}

export async function saveSettings(data) {
  const s = cleanSettings(data);
  await db().set(SETTINGS, s);
  return s;
}
