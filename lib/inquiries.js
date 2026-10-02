import { redis } from "./content";

// حالات الاستفسار في لوحة التحكم
export const STATUSES = {
  new: "جديد",
  progress: "قيد المتابعة",
  done: "تم الحل",
  archived: "مؤرشف",
};

const HASH = "inquiries";
const SEQ = "inquiries:seq";

export async function createInquiry(data) {
  const r = redis();
  if (!r) throw new Error("DB_NOT_CONNECTED");
  const n = await r.incr(SEQ);
  const id = `HD-${1000 + n}`;
  const item = { id, ...data, status: "new", note: "", createdAt: new Date().toISOString() };
  await r.hset(HASH, { [id]: item });
  return item;
}

export async function listInquiries() {
  const r = redis();
  if (!r) return [];
  const all = (await r.hgetall(HASH)) || {};
  return Object.values(all)
    .filter((x) => x && typeof x === "object")
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function updateInquiry(id, patch) {
  const r = redis();
  if (!r) throw new Error("DB_NOT_CONNECTED");
  const cur = await r.hget(HASH, id);
  if (!cur) return null;
  const next = { ...cur, updatedAt: new Date().toISOString() };
  if (patch.status && STATUSES[patch.status]) next.status = patch.status;
  if (typeof patch.note === "string") next.note = patch.note.slice(0, 2000);
  await r.hset(HASH, { [id]: next });
  return next;
}

export async function deleteInquiry(id) {
  const r = redis();
  if (!r) throw new Error("DB_NOT_CONNECTED");
  await r.hdel(HASH, id);
}

// حد أقصى لعدد المحاولات لكل IP خلال مدة زمنية (لمنع السبام وتخمين كلمة المرور)
export async function rateLimit(key, limit, windowSec) {
  const r = redis();
  if (!r) return true;
  try {
    const k = `rl:${key}`;
    const n = await r.incr(k);
    if (n === 1) await r.expire(k, windowSec);
    return n <= limit;
  } catch {
    return true;
  }
}

export const clientIp = (req) => (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "anon";
