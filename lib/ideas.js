import crypto from "crypto";
import { redis } from "./content";

// أفكار العملاء: فكرة تُكتب أو تُقال، ثم تتحول لمقترح أو وثيقة متطلبات أو عرض سعر
export const IDEA_STATUS = { new: "فكرة جديدة", drafted: "تحولت لوثيقة", sent: "أُرسلت للعميل", archived: "مؤرشفة" };
const HASH = "ideas";
const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);

function db() {
  const r = redis();
  if (!r) throw new Error("DB_NOT_CONNECTED");
  return r;
}

export function cleanIdea(b = {}) {
  return {
    title: str(b.title, 160) || "فكرة بدون عنوان",
    client: str(b.client, 120),
    phone: str(b.phone, 20).replace(/[^\d+]/g, ""),
    text: str(b.text, 8000),
    status: IDEA_STATUS[b.status] ? b.status : "new",
  };
}

export async function listIdeas() {
  const r = redis();
  if (!r) return [];
  const all = (await r.hgetall(HASH)) || {};
  return Object.values(all)
    .filter((x) => x && typeof x === "object")
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export async function saveIdea(id, data, extra = {}) {
  const r = db();
  const cur = id ? await r.hget(HASH, id) : null;
  if (id && !cur) return null;
  const now = new Date().toISOString();
  const next = { ...(cur || {}), ...cleanIdea({ ...(cur || {}), ...data }), ...extra, id: cur?.id || "I-" + crypto.randomBytes(5).toString("hex"), createdAt: cur?.createdAt || now, updatedAt: now };
  await r.hset(HASH, { [next.id]: next });
  return next;
}

export async function deleteIdea(id) {
  await db().hdel(HASH, id);
}
