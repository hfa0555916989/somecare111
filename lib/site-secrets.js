import { redis } from "./content";
import { encrypt, decrypt } from "./projects";

// رموز سرية تُدخل من لوحة التحكم (مثل رمز X Conversion API).
// تُحفظ مشفّرة في مفتاح مستقل عن محتوى الموقع، فلا تصل أبداً لمتصفح الزائر.
// متغير البيئة في Vercel (إن وُجد) يتقدّم على قيمة اللوحة.
const KEY = "site:secrets";
const ENV = { xPixelToken: "X_PIXEL_TOKEN" };

async function readStored(name) {
  const r = redis();
  if (!r) return "";
  try {
    const v = await r.hget(KEY, name);
    return v ? String(decrypt(v) || "") : "";
  } catch (e) {
    console.error("Secret read failed", name, e?.message || e);
    return "";
  }
}

export async function getSecret(name) {
  return process.env[ENV[name]] || (await readStored(name));
}

// ما يُعرض في اللوحة: هل الرمز موجود، ومن أين، وآخر 4 أحرف فقط
export async function secretStatus(name) {
  const env = process.env[ENV[name]];
  const v = env || (await readStored(name));
  return { set: !!v, source: env ? "env" : v ? "panel" : "", tail: v ? v.slice(-4) : "" };
}

export async function setSecret(name, value) {
  if (!ENV[name]) throw new Error("UNKNOWN_SECRET");
  const r = redis();
  if (!r) throw new Error("DB_NOT_CONNECTED");
  const v = String(value || "").trim();
  if (v) await r.hset(KEY, { [name]: encrypt(v) });
  else await r.hdel(KEY, name);
}
