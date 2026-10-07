// المحاسبة: ثوابت وحسابات بدون قاعدة بيانات (تُستخدم في لوحة التحكم وفي الخادم)
//
// للمشروع وعاءان:
// - الميزانية: يدخلها التمويل (رأس مال، قرض، شريك، أو إعادة تمويل من الأرباح) وتُصرف منها المصروفات
// - الأرباح: يدخلها دخل العملاء، ويخرج منها إعادة تمويل الميزانية والسحوبات
// صافي الربح = الإيرادات − المصروفات، والنقد الكلي = رصيد الميزانية + الأرباح المتاحة

export const KINDS = {
  income: "إيراد",
  expense: "مصروف",
  funding: "تمويل الميزانية",
  withdraw: "سحب من الأرباح",
};

export const INCOME_CATS = {
  project: "مشروع برمجة لعميل",
  support: "دعم فني وصيانة",
  hosting: "استضافة ودومين للعملاء",
  addon: "إضافات وتعديلات",
  other: "إيراد آخر",
};

export const EXPENSE_CATS = {
  ads: "إعلانات",
  hosting: "استضافة وسيرفرات",
  domains: "دومينات",
  tools: "أدوات واشتراكات برمجية",
  ai: "ذكاء اصطناعي و API",
  freelance: "مستقلين وتعهيد",
  devices: "أجهزة ومعدات",
  fees: "رسوم بنكية وبوابات دفع",
  gov: "رسوم حكومية وتراخيص",
  learning: "تعلّم ودورات",
  other: "مصروف آخر",
};

export const FUNDING_SOURCES = {
  personal: "رأس مال شخصي",
  reinvest: "إعادة تمويل من الأرباح",
  loan: "قرض / سلفة",
  partner: "شريك / مستثمر",
  grant: "دعم / منحة",
  other: "مصدر آخر",
};

export const WITHDRAW_REASONS = {
  personal: "سحب شخصي",
  loan: "سداد قرض",
  partner: "حصة شريك",
  other: "سبب آخر",
};

// منصات الإعلان (لمصروف الإعلانات) ومن أين جاء العميل (للإيراد)، لحساب العائد على كل منصة
export const AD_CHANNELS = {
  snap: "سناب شات",
  google: "Google Ads",
  tiktok: "تيك توك",
  x: "X (تويتر)",
  meta: "انستقرام / فيسبوك",
  other_ad: "منصة إعلانية أخرى",
};
export const CHANNELS = {
  ...AD_CHANNELS,
  referral: "توصية / عميل سابق",
  organic: "بحث جوجل / زيارة مباشرة",
  social: "حساباتي (بدون إعلان)",
};

export const CATS = { income: INCOME_CATS, expense: EXPENSE_CATS, funding: FUNDING_SOURCES, withdraw: WITHDRAW_REASONS };
export const CAT_LABEL = { income: "نوع الإيراد", expense: "البند", funding: "مصدر التمويل", withdraw: "السبب" };

export const DEFAULT_SETTINGS = { reinvestPct: 30, monthlyBudget: 0, adsBudget: 0 };

const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);
const r2 = (n) => Math.round(n * 100) / 100;
// يقبل الأرقام العربية والفواصل (١٬٥٠٠ أو 1,500)
export const toAmount = (v) => {
  const s = String(v ?? "")
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, ".")
    .replace(/[^\d.]/g, "");
  const n = r2(Number(s));
  return Number.isFinite(n) ? n : 0;
};
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ""));
// تاريخ اليوم بتوقيت الرياض
export const riyadhToday = () => new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);

// ينظّف العملية القادمة من اللوحة أو من الذكاء الاصطناعي (لا يُحفظ إلا الحقول المعروفة)
export function cleanEntry(b = {}) {
  const kind = KINDS[b.kind] ? b.kind : "expense";
  const cat = CATS[kind][b.cat] ? b.cat : "other";
  const channelOk = kind === "income" ? CHANNELS[b.channel] : kind === "expense" && cat === "ads" ? AD_CHANNELS[b.channel] : null;
  return {
    kind,
    cat,
    amount: Math.min(toAmount(b.amount), 100_000_000),
    date: isDate(b.date) ? b.date : riyadhToday(),
    note: str(b.note, 300),
    client: kind === "income" ? str(b.client, 120) : "",
    channel: channelOk ? b.channel : "",
    docRef: kind === "income" ? str(b.docRef, 40) : "",
    // الفاتورة أو الإيصال المحفوظ في الأرشيف
    fileId: /^F-[0-9a-f]{12}$/.test(String(b.fileId || "")) ? b.fileId : "",
  };
}

export function cleanSettings(b = {}) {
  return {
    reinvestPct: Math.min(100, toAmount(b.reinvestPct ?? DEFAULT_SETTINGS.reinvestPct)),
    monthlyBudget: toAmount(b.monthlyBudget),
    adsBudget: toAmount(b.adsBudget),
  };
}

const sum = (list) => r2(list.reduce((s, e) => s + (Number(e.amount) || 0), 0));
const groupSum = (list, key) => {
  const m = {};
  for (const e of list) m[e[key] || ""] = (m[e[key] || ""] || 0) + (Number(e.amount) || 0);
  return Object.entries(m)
    .map(([k, v]) => [k, r2(v)])
    .sort((a, b) => b[1] - a[1]);
};

export const monthKey = (date) => String(date || "").slice(0, 7);
// آخر n شهراً تنتهي بالشهر المعطى (YYYY-MM)
export function monthsBack(fromMonth, n) {
  const [y, m] = fromMonth.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => new Date(Date.UTC(y, m - 1 - (n - 1 - i), 1)).toISOString().slice(0, 7));
}

export const PERIODS = { month: "هذا الشهر", last: "الشهر الماضي", quarter: "آخر 3 أشهر", year: "هذه السنة", all: "الكل" };

// الفترات الجاهزة: [من، إلى] بصيغة YYYY-MM-DD (null = بدون حد)
export function periodRange(p, today = riyadhToday()) {
  const ym = today.slice(0, 7);
  if (p === "month") return [ym + "-01", today];
  if (p === "last") {
    const prev = monthsBack(ym, 2)[0];
    return [prev + "-01", prev + "-31"];
  }
  if (p === "quarter") return [monthsBack(ym, 3)[0] + "-01", today];
  if (p === "year") return [today.slice(0, 4) + "-01-01", today];
  return [null, null];
}
export const inRange = (e, [from, to]) => (!from || e.date >= from) && (!to || e.date <= to);

// كل أرقام لوحة المحاسبة: الفترة المختارة + الأرصدة منذ البداية + آخر 12 شهراً
export function summarize(entries, range = [null, null], settings = DEFAULT_SETTINGS, today = riyadhToday()) {
  const all = entries || [];
  const of = (list, kind) => list.filter((e) => e.kind === kind);
  const ads = (list) => of(list, "expense").filter((e) => e.cat === "ads");
  const p = all.filter((e) => inRange(e, range));

  const income = sum(of(p, "income"));
  const expense = sum(of(p, "expense"));
  const adsList = ads(p);
  const adsTotal = sum(adsList);
  const adIncomeList = of(p, "income").filter((e) => AD_CHANNELS[e.channel]);
  const adIncome = sum(adIncomeList);
  const net = r2(income - expense);

  // العائد على كل منصة إعلانية: المصروف مقابل دخل العملاء القادمين منها
  const spend = Object.fromEntries(groupSum(adsList, "channel"));
  const rev = Object.fromEntries(groupSum(adIncomeList, "channel"));
  const platforms = [...new Set([...Object.keys(spend), ...Object.keys(rev)])]
    .map((k) => ({ key: k, spend: spend[k] || 0, revenue: rev[k] || 0, roas: spend[k] ? (rev[k] || 0) / spend[k] : null }))
    .sort((a, b) => b.spend - a.spend || b.revenue - a.revenue);

  // الأرصدة منذ البداية (لا تتأثر بالفترة المختارة)
  const fundAll = of(all, "funding");
  const fundingTotal = sum(fundAll);
  const reinvested = sum(fundAll.filter((e) => e.cat === "reinvest"));
  const withdrawn = sum(of(all, "withdraw"));
  const budget = r2(fundingTotal - sum(of(all, "expense")));
  const profits = r2(sum(of(all, "income")) - reinvested - withdrawn);

  // إعادة التمويل المقترحة: تغطية أي عجز في الميزانية، أو نسبة من صافي ربح الشهر الحالي
  const ym = today.slice(0, 7);
  const monthAll = all.filter((e) => monthKey(e.date) === ym);
  const monthIncome = sum(of(monthAll, "income"));
  const monthExpense = sum(of(monthAll, "expense"));
  const monthNet = r2(monthIncome - monthExpense);
  const monthReinvested = sum(of(monthAll, "funding").filter((e) => e.cat === "reinvest"));
  const pct = Number(settings?.reinvestPct ?? DEFAULT_SETTINGS.reinvestPct) / 100;
  const deficit = budget < 0 ? -budget : 0;
  const target = Math.max(deficit, Math.max(0, monthNet) * pct - monthReinvested);
  const suggestReinvest = Math.max(0, Math.min(Math.round(target), Math.floor(Math.max(0, profits))));

  const months = monthsBack(ym, 12).map((m) => {
    const list = all.filter((e) => monthKey(e.date) === m);
    const inc = sum(of(list, "income"));
    const exp = sum(of(list, "expense"));
    return { month: m, income: inc, expense: exp, ads: sum(ads(list)), net: r2(inc - exp) };
  });

  return {
    income,
    expense,
    ads: adsTotal,
    net,
    margin: income ? net / income : null,
    adIncome,
    roas: adsTotal ? adIncome / adsTotal : null,
    adShare: expense ? adsTotal / expense : null,
    count: p.length,
    expenseByCat: groupSum(of(p, "expense"), "cat"),
    incomeByCat: groupSum(of(p, "income"), "cat"),
    incomeByChannel: groupSum(of(p, "income").filter((e) => e.channel), "channel"),
    platforms,
    fundingBySource: groupSum(fundAll, "cat"),
    fundingTotal,
    external: r2(fundingTotal - reinvested),
    reinvested,
    withdrawn,
    budget,
    profits,
    cash: r2(budget + profits),
    deficit,
    suggestReinvest,
    monthIncome,
    monthExpense,
    monthNet,
    monthReinvested,
    monthAds: sum(ads(monthAll)),
    months,
  };
}

// المستحقات: العروض والعقود الموافق عليها ناقص ما سُجّل لها من إيرادات (بربط الإيراد برقم الوثيقة)
export function receivables(docs, entries) {
  const paid = {};
  for (const e of entries || []) {
    if (e.kind !== "income" || !e.docRef) continue;
    const k = e.docRef.toUpperCase();
    paid[k] = (paid[k] || 0) + (Number(e.amount) || 0);
  }
  return (docs || []).map((d) => {
    const got = r2(paid[String(d.number).toUpperCase()] || 0);
    return { ...d, paid: got, due: Math.max(0, r2(d.total - got)) };
  });
}
