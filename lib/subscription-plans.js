// باقات الاشتراك والصيانة. الأرقام نفسها تظهر للزائر وفي لوحة التحكم.
// لا يتصل هذا الملف بقاعدة بيانات حتى يمكن استيراده من المتصفح والاختبارات.

export const PLANS = [
  {
    id: "basic",
    group: "subscription",
    nameAr: "أساسية",
    nameEn: "Basic",
    monthly: 300,
    blurbAr: "حتى 500 منتج، وموظف واحد، واستضافة، ونسخ احتياطي يومي، وإصلاح الأعطال، ودعم عبر واتساب في ساعات العمل.",
    blurbEn: "Up to 500 products, 1 staff user, hosting, a daily backup, bug fixes, and WhatsApp support during working hours.",
  },
  {
    id: "advanced",
    group: "subscription",
    nameAr: "متقدمة",
    nameEn: "Advanced",
    monthly: 500,
    blurbAr: "منتجات بلا حد، و5 موظفين، ومستودعات متعددة، وتسويق كامل، ودعم بأولوية.",
    blurbEn: "Unlimited products, 5 staff users, more than one warehouse, the full marketing tools, and priority support.",
  },
  {
    id: "basic_apps",
    group: "subscription",
    nameAr: "أساسية مع التطبيقات",
    nameEn: "Basic with apps",
    monthly: 700,
    blurbAr: "كل ما في الأساسية، مع تطبيق iOS وAndroid وإشعارات الدفع وتحديثات المتاجر.",
    blurbEn: "Everything in Basic, plus the iOS and Android apps, push notifications, and app-store updates.",
  },
  {
    id: "advanced_apps",
    group: "subscription",
    nameAr: "متقدمة مع التطبيقات",
    nameEn: "Advanced with apps",
    monthly: 1000,
    blurbAr: "كل ما في المتقدمة، مع التطبيقين وإشعارات الدفع وتحديثات المتاجر، وتعديلان صغيران كل شهر.",
    blurbEn: "Everything in Advanced, plus both apps, push notifications, app-store updates, and two small edits each month.",
  },
  {
    id: "maint_500",
    group: "maintenance",
    nameAr: "صيانة بعد الشراء",
    nameEn: "Maintenance after purchase",
    monthly: 500,
    blurbAr: "إصلاح الأعطال، وتحديثات الأمان، والنسخ الاحتياطي، والدعم.",
    blurbEn: "Bug fixes, security updates, backups, and support.",
  },
  {
    id: "maint_800",
    group: "maintenance",
    nameAr: "صيانة مع التطبيقات",
    nameEn: "Maintenance with apps",
    monthly: 800,
    blurbAr: "تشمل صيانة 500، وتضيف التطبيقات وتعديلات شهرية صغيرة.",
    blurbEn: "Everything in the 500 maintenance plan, plus the apps and small monthly edits.",
  },
  {
    id: "custom",
    group: "custom",
    nameAr: "مبلغ مخصص",
    nameEn: "Custom amount",
    monthly: 0,
    blurbAr: "مبلغ شهري يُتفق عليه في العرض.",
    blurbEn: "A monthly amount agreed in the quote.",
  },
];

export const PLAN_IDS = new Set(PLANS.map((p) => p.id));
export const planById = (id) => PLANS.find((p) => p.id === id) || PLANS[0];
export const publicPlans = () => PLANS.filter((p) => p.group !== "custom");

export const STATUS = {
  active: { ar: "نشط", tone: "ok" },
  due_soon: { ar: "مستحق خلال 3 أيام", tone: "soon" },
  overdue_1_7: { ar: "متأخر من يوم إلى 7 أيام", tone: "late" },
  support_paused: { ar: "الدعم موقوف", tone: "pause" },
  suspend: { ar: "يُنصح بإيقاف المتجر", tone: "stop" },
};

export const POLICY_AR = "الدفع مقدّم. الميزات الجديدة تتسعّر بشكل منفصل. إذا تأخر السداد يوقف الدعم بعد 7 أيام، ويوقف المتجر بعد 15 يوماً.";
export const POLICY_EN = "Payment is prepaid. New features are quoted separately. If a payment is late, support pauses after 7 days and the store pauses after 15 days.";
export const ANNUAL_AR = "الاشتراك السنوي بشهرين مجاناً: تُدفع 10 أشهر وتُغطى السنة.";
export const ANNUAL_EN = "The annual plan includes two months free: 10 months are paid and the year is covered.";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function riyadhToday(now = Date.now()) {
  return new Date(now + 3 * 3600 * 1000).toISOString().slice(0, 10);
}

export function addMonths(iso, months) {
  if (!DATE.test(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  const day = Math.min(d, last);
  const out = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), day));
  const mm = String(out.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(out.getUTCDate()).padStart(2, "0");
  return `${out.getUTCFullYear()}-${mm}-${dd}`;
}

export function daysBetween(fromIso, toIso) {
  if (!DATE.test(fromIso) || !DATE.test(toIso)) return 0;
  const a = Date.parse(fromIso + "T00:00:00Z");
  const b = Date.parse(toIso + "T00:00:00Z");
  return Math.round((b - a) / 86400000);
}

export function daysPhrase(n) {
  const x = Math.abs(Math.trunc(Number(n) || 0));
  if (x === 0) return "اليوم";
  if (x === 1) return "يوم واحد";
  if (x === 2) return "يومين";
  if (x >= 3 && x <= 10) return `${x} أيام`;
  return `${x} يوماً`;
}

export function monthlyAmount(client) {
  if (client?.plan === "custom") return Math.max(0, Math.round(Number(client.customAmount) || 0));
  return planById(client?.plan).monthly;
}

// الدفعة السنوية تغطي 12 شهراً وسعرها 10 أشهر (شهران مجاناً).
export function periodAmount(client) {
  const monthly = monthlyAmount(client);
  return client?.cycle === "annual" ? monthly * 10 : monthly;
}

export function nextRenewal(client) {
  if (!DATE.test(client?.startDate)) return "";
  const paid = Array.isArray(client.payments) ? client.payments.length : 0;
  const step = client.cycle === "annual" ? 12 : 1;
  return addMonths(client.startDate, paid * step);
}

export function statusFor(daysUntil) {
  if (daysUntil > 3) return "active";
  if (daysUntil >= 0) return "due_soon";
  if (daysUntil >= -7) return "overdue_1_7";
  if (daysUntil >= -15) return "support_paused";
  return "suspend";
}

export function paidAnswer(view) {
  if (!view?.nextRenewal) return "أدخل تاريخ البداية أولاً.";
  if (view.status === "active") return `مسدد حتى ${view.nextRenewal}.`;
  if (view.status === "due_soon") {
    return view.daysUntil === 0 ? `مستحق اليوم (${view.nextRenewal}).` : `مستحق خلال ${daysPhrase(view.daysUntil)}. التجديد ${view.nextRenewal}.`;
  }
  const late = daysPhrase(view.daysUntil);
  if (view.status === "overdue_1_7") return `متأخر ${late}. الدعم مستمر حتى يكتمل اليوم السابع.`;
  if (view.status === "support_paused") return `متأخر ${late}. الدعم موقوف.`;
  return `متأخر ${late}. الدعم موقوف، ويُنصح بإيقاف المتجر.`;
}

export function presentClient(client, today = riyadhToday()) {
  const plan = planById(client?.plan);
  const monthly = monthlyAmount(client);
  const renewal = nextRenewal(client);
  const daysUntil = renewal ? daysBetween(today, renewal) : 0;
  const status = renewal ? statusFor(daysUntil) : "due_soon";
  const view = {
    ...client,
    planName: plan.nameAr,
    monthly,
    periodAmount: periodAmount(client),
    nextRenewal: renewal,
    daysUntil,
    status,
    mrr: client?.cycle === "annual" ? (monthly * 10) / 12 : monthly,
    wa: waLink(client?.phone),
  };
  return { ...view, answer: paidAnswer(view), paidUp: daysUntil > 0 };
}

export function summarize(views) {
  return {
    mrr: Math.round(views.reduce((sum, v) => sum + (Number(v.mrr) || 0), 0)),
    dueSoon: views.filter((v) => v.status === "due_soon").length,
    overdue: views.filter((v) => v.status === "overdue_1_7" || v.status === "support_paused" || v.status === "suspend").length,
    clients: views.length,
  };
}

export function waLink(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = "966" + digits.slice(1);
  return digits ? `https://wa.me/${digits}` : "";
}

const STATUS_RANK = { suspend: 0, support_paused: 1, overdue_1_7: 2, due_soon: 3, active: 4 };

export function sortClients(views) {
  return [...views].sort((a, b) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9) || String(a.nextRenewal).localeCompare(String(b.nextRenewal)) || String(a.storeName).localeCompare(String(b.storeName), "ar"));
}
