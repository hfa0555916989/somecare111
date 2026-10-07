import { siteUrl } from "./defaults";

// إشعارات البريد عبر Resend: تعمل فقط عند وجود RESEND_API_KEY وإيميل الإشعارات في «الاستفسارات»
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);

export const mailEnabled = () => !!process.env.RESEND_API_KEY;

// المرسل: MAIL_FROM من Vercel، أو noreply على نطاق الموقع (يجب توثيق النطاق في Resend)
export function mailFrom(c) {
  if (process.env.MAIL_FROM) return process.env.MAIL_FROM;
  const host = new URL(siteUrl(c)).hostname.replace(/^www\./, "");
  return `${c.brand?.name || "الموقع"} <noreply@${host}>`;
}

export async function sendMail({ from, to, subject, html, replyTo }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

// إشعار لصاحب الموقع: rows = [[العنوان، القيمة], ...]
export async function notify(c, subject, rows, { replyTo, link } = {}) {
  const to = String(c.form?.notifyEmail || "").split(/[,\s؛;]+/).map((x) => x.trim()).filter((x) => EMAIL.test(x));
  if (!mailEnabled() || !to.length) return false;
  const admin = `${siteUrl(c)}/admin552255#inquiries`;
  const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.8;color:#0b1628">
<h2 style="color:#b8892f;margin:0 0 12px">${esc(subject)}</h2>
<table style="border-collapse:collapse">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 0 4px 16px;color:#667;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:4px 0;white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join("")}</table>
<p style="margin-top:18px"><a href="${esc(link || admin)}" style="background:#d4a84b;color:#0b1628;padding:8px 18px;border-radius:999px;text-decoration:none">فتح لوحة التحكم</a></p>
</div>`;
  try {
    await sendMail({ from: mailFrom(c), to, subject, html, replyTo: EMAIL.test(replyTo || "") ? replyTo : undefined });
    return true;
  } catch (e) {
    console.error("Notify email failed", e);
    return false;
  }
}
