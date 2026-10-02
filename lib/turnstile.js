// Cloudflare Turnstile: تحقق من أن مرسل الاستفسار إنسان وليس روبوتاً.
// يعمل فقط بعد إضافة المفتاحين في Vercel: TURNSTILE_SITE_KEY و TURNSTILE_SECRET_KEY
export const turnstileEnabled = () => !!(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);

export const turnstileSiteKey = () => (turnstileEnabled() ? process.env.TURNSTILE_SITE_KEY : "");

export async function verifyTurnstile(token, ip) {
  if (!turnstileEnabled()) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: String(token) });
    if (ip && ip !== "anon") body.set("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const j = await r.json();
    return j.success === true;
  } catch (e) {
    console.error("Turnstile verify failed", e);
    return false;
  }
}
