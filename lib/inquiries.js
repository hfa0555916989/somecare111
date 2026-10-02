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

export const resendConnected = () => !!process.env.RESEND_API_KEY;

// الإرسال عبر Resend. بدون RESEND_API_KEY لا يُرسل شيء، ويبقى الاستفسار محفوظاً في اللوحة.
export async function sendEmail({ from, to, subject, html, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return { skipped: true };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) console.error("Resend failed", res.status, await res.text().catch(() => ""));
    return { ok: res.ok };
  } catch (e) {
    console.error("Resend error", e);
    return { ok: false };
  }
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

// قالب بريد بسيط بهوية الموقع (كحلي وذهبي، من اليمين لليسار)
export function emailHtml({ title, intro, rows = [], footer }) {
  const tr = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;color:#9aa6bf;width:110px;vertical-align:top">${esc(k)}</td><td style="padding:8px 0;color:#ffffff;white-space:pre-wrap">${esc(v)}</td></tr>`
    )
    .join("");
  return `<div dir="rtl" style="background:#0b1628;padding:28px;font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.7">
<div style="max-width:560px;margin:auto;background:#13213d;border:1px solid #d4a84b55;border-radius:16px;padding:24px">
<h2 style="margin:0 0 6px;color:#d4a84b;font-size:20px">${esc(title)}</h2>
${intro ? `<p style="margin:0 0 14px;color:#ffffff">${esc(intro)}</p>` : ""}
<table style="width:100%;border-collapse:collapse">${tr}</table>
${footer ? `<p style="margin:18px 0 0;color:#9aa6bf;font-size:13px">${esc(footer)}</p>` : ""}
</div></div>`;
}
