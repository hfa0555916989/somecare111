// أيقونات خطية بنفس أسلوب بطاقات الهوية (خط ذهبي داخل دائرة)
// المفتاح يُحفظ في لوحة التحكم، وأي قيمة غير معروفة (مثل إيموجي قديم) تُعرض كنص.
export const ICONS = {
  phone: ["جوال / تطبيق", <><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" /></>],
  monitor: ["موقع / شاشة", <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>],
  store: ["متجر", <><path d="M3 10l2-6h14l2 6z" /><path d="M4 10v10h16V10" /><path d="M9 20v-5h6v5" /></>],
  cart: ["سلة شراء", <><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></>],
  box: ["صندوق / منتجات", <><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>],
  card: ["بطاقة دفع", <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>],
  truck: ["شحن", <><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></>],
  headset: ["دعم فني", <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />],
  clock: ["وقت / تسليم", <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>],
  gear: ["تحكم / إعدادات", <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>],
  shield: ["أمان", <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M9 12l2 2 4-4" /></>],
  bolt: ["سرعة", <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />],
  search: ["بحث / SEO", <><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" /></>],
  chart: ["تحليلات", <><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></>],
  globe: ["عالمي / دومين", <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>],
  code: ["برمجة", <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />],
  bell: ["إشعارات", <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>],
  award: ["شهادة / ترخيص", <><circle cx="12" cy="8" r="6" /><path d="M15.48 12.89L17 22l-5-3-5 3 1.52-9.11" /></>],
  user: ["شخص", <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>],
  star: ["تميّز", <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />],
};

export function Icon({ name, size = 24 }) {
  const ic = ICONS[name];
  if (!ic) return name ? <span style={{ fontSize: size * 0.9, lineHeight: 1 }}>{name}</span> : null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ic[1]}
    </svg>
  );
}

// وسائل التواصل الاجتماعي: [المفتاح، الاسم، الأيقونة، رابط المعرّف إذا كُتب بدون رابط كامل]
const filled = (d) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
);
const line = (children) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export const SOCIALS = [
  ["x", "X (تويتر)", filled("M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"), (h) => `https://x.com/${h}`],
  ["instagram", "إنستقرام", line(<><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><path d="M17.5 6.5h.01" /></>), (h) => `https://instagram.com/${h}`],
  ["snapchat", "سناب شات", line(<path d="M12 3c3 0 5 2.2 5 5.2v2.3l1.8-.6c.6 0 .8.7.3 1-.7.4-1.6.7-2.2 1 .5 1.6 1.9 3.2 3.6 3.6.5.1.5.7 0 .9-.8.3-1.7.4-2 .6-.2.4-.1 1-.6 1.1-.8.1-1.6-.2-2.6.3-.9.5-1.7 1.6-3.3 1.6s-2.4-1.1-3.3-1.6c-1-.5-1.8-.2-2.6-.3-.5-.1-.4-.7-.6-1.1-.3-.2-1.2-.3-2-.6-.5-.2-.5-.8 0-.9 1.7-.4 3.1-2 3.6-3.6-.6-.3-1.5-.6-2.2-1-.5-.3-.3-1 .3-1l1.8.6V8.2C7 5.2 9 3 12 3z" />), (h) => `https://snapchat.com/add/${h}`],
  ["tiktok", "تيك توك", filled("M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"), (h) => `https://www.tiktok.com/@${h}`],
  ["linkedin", "لينكدإن", line(<><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>), (h) => `https://www.linkedin.com/in/${h}`],
  ["youtube", "يوتيوب", line(<><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="M10 15l5-3-5-3z" /></>), (h) => `https://www.youtube.com/@${h}`],
  ["email", "البريد الإلكتروني", line(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>), (h) => `mailto:${h}`],
];

// يقبل رابطاً كاملاً أو معرّفاً مثل @hassandev، ويرفض أي رابط غير http(s)
export function socialHref(key, value) {
  const v = String(value || "").trim();
  if (!v) return null;
  const s = SOCIALS.find((x) => x[0] === key);
  if (!s) return null;
  if (key === "email") return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(v) ? `mailto:${v}` : null;
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, "").replace(/[^\w.\-]/g, "");
  return handle ? s[3](handle) : null;
}

export function socialLinks(c) {
  return SOCIALS.map(([k, label, icon]) => ({ key: k, label, icon, href: socialHref(k, c.social?.[k]) })).filter((s) => s.href);
}

// معرّف X لبطاقات تويتر (twitter:site)
export function xHandle(c) {
  const v = String(c.social?.x || "").trim();
  const m = v.match(/(?:x|twitter)\.com\/@?([A-Za-z0-9_]{1,15})/i) || v.match(/^@?([A-Za-z0-9_]{1,15})$/);
  return m ? `@${m[1]}` : null;
}

// نص بين {أقواس} يظهر باللون الذهبي، مثل: إضافات {اختيارية}
export function Hl({ text }) {
  return String(text || "")
    .split(/\{([^{}]+)\}/)
    .map((p, i) => (i % 2 ? <span key={i} className="hl">{p}</span> : p));
}

// نسخة نصية بدون الأقواس (للعناوين في جوجل والوصف)
export const plain = (t) => String(t || "").replace(/[{}]/g, "");
