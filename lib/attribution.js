// مصدر الزائر: رقم نقرة إعلان Google (gclid / gbraid / wbraid) ووسوم utm من رابط الدخول.
// يُحفظ في متصفح الزائر 90 يوماً ويُرسل مع نموذج الاستفسار، فتعرف في اللوحة أي استفسار جاء من إعلان.
const KEY = "hd_src";
const MAX_AGE = 90 * 864e5;
export const SRC_FIELDS = ["gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "landing"];

export const cleanSrc = (v) => {
  const out = {};
  for (const k of SRC_FIELDS) {
    const s = String(v?.[k] ?? "").trim().slice(0, 200).replace(/[<>"']/g, "");
    if (s) out[k] = s;
  }
  return out;
};

// يُستدعى عند فتح أي صفحة: رابط فيه مصدر جديد يحلّ محل القديم (آخر نقرة إعلان هي المعتمدة)
export function saveAttribution(href) {
  try {
    const url = new URL(href);
    const src = cleanSrc(Object.fromEntries(url.searchParams));
    if (!Object.keys(src).length) return;
    localStorage.setItem(KEY, JSON.stringify({ ...src, landing: url.pathname, at: Date.now() }));
  } catch (_) {}
}

export function getAttribution() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!v || Date.now() - Number(v.at) > MAX_AGE) return {};
    return cleanSrc(v);
  } catch (_) {
    return {};
  }
}

export const fromGoogleAds = (src) => !!(src?.gclid || src?.gbraid || src?.wbraid);

// اسم المصدر كما يظهر في اللوحة والبريد
export function sourceLabel(src) {
  if (!src) return "";
  if (fromGoogleAds(src)) return `إعلان Google${src.utm_campaign ? ` · ${src.utm_campaign}` : ""}`;
  return [src.utm_source, src.utm_medium, src.utm_campaign].filter(Boolean).join(" / ");
}

// رقم الجوال بالصيغة الدولية للتحويلات المحسّنة (05xxxxxxxx ← +9665xxxxxxxx)
export function e164(phone) {
  let p = String(phone || "").replace(/[^\d+]/g, "");
  if (p.startsWith("00")) p = "+" + p.slice(2);
  if (/^05\d{8}$/.test(p)) p = "+966" + p.slice(1);
  if (/^5\d{8}$/.test(p)) p = "+966" + p;
  if (/^9665\d{8}$/.test(p)) p = "+" + p;
  return /^\+\d{8,15}$/.test(p) ? p : "";
}
