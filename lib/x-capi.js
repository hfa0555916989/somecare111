import { createHash } from "crypto";
import { e164 } from "./attribution.js";

// X Conversion API: يرسل التحويل من الخادم مع بكسل المتصفح (twq)، ويتطابقان برقم conversion_id
// فلا يُحسب التحويل مرتين. الرمز يُنشأ من X Ads ← مدير الأحداث ← Manual setup ← Generate access token
// ويُلصق في لوحة التحكم ← أدوات التتبع (يُحفظ مشفّراً عبر lib/site-secrets، لا مع المحتوى).
const API = "https://ads-api.x.com/12/measurement/conversions/";
const ID = /^[A-Za-z0-9_-]{1,64}$/;

const sha256 = (v) => createHash("sha256").update(v).digest("hex");

export function buildXConversion({ eventId, conversionId, twclid, email, phone, ip, ua, time = new Date() }) {
  const identifiers = [];
  const click = String(twclid || "").trim();
  if (click) identifiers.push({ twclid: click.slice(0, 200) });
  const mail = String(email || "").trim().toLowerCase();
  if (mail.includes("@")) identifiers.push({ hashed_email: sha256(mail) });
  const tel = e164(phone);
  if (tel) identifiers.push({ hashed_phone_number: sha256(tel) });
  if (ip && ua) identifiers.push({ ip_address: String(ip).slice(0, 64), user_agent: String(ua).slice(0, 500) });
  if (!identifiers.length) return null;
  return {
    conversions: [
      {
        conversion_time: new Date(time).toISOString(),
        event_id: eventId,
        identifiers,
        ...(conversionId ? { conversion_id: String(conversionId).slice(0, 64) } : {}),
      },
    ],
  };
}

// tracking = إعدادات «أدوات التتبع» من اللوحة (xPixel و xEventId)، token = رمز Conversion API
export async function sendXConversion(tracking, data, token) {
  const pixel = String(tracking?.xPixel || "").trim();
  const eventId = String(tracking?.xEventId || "").trim();
  if (!token || !ID.test(pixel) || !ID.test(eventId)) return { skipped: true };
  const body = buildXConversion({ ...data, eventId });
  if (!body) return { skipped: true };
  try {
    const r = await fetch(API + pixel, {
      method: "POST",
      headers: { "X-Pixel-Token": token, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) console.error("X Conversion API failed", r.status, (await r.text().catch(() => "")).slice(0, 500));
    return { ok: r.ok, status: r.status };
  } catch (e) {
    console.error("X Conversion API error", e?.message || e);
    return { ok: false };
  }
}
