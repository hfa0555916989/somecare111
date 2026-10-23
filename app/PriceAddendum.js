// بطاقة السعر الحالي. تُعرض تحت النص الأصلي ولا تستبدله.
import { ANNUAL_AR, ANNUAL_EN, PLANS, POLICY_AR, POLICY_EN, publicPlans } from "@/lib/subscription-plans";

const ROWS = {
  ar: [
    {
      label: "التجهيز",
      price: "2,000 ريال مرة واحدة",
      note: "من 2,000 إلى 3,000 ريال لتهيئة المتجر: الهوية، وربط الدفع والشحن، واستيراد المنتجات.",
    },
    {
      label: "الاشتراك",
      price: "من 300 ريال شهرياً",
      note: "أساسية 300، أو متقدمة 500، ومع التطبيقات 700 أو 1,000. التفاصيل تحت البطاقة.",
    },
    {
      label: "الشراء",
      price: "من 12,000 ريال",
      note: "من 12,000 إلى 18,000 للمتجر، أو من 20,000 إلى 30,000 مع التطبيقين. بعد التسليم إصلاح أعطال مجاني من شهر إلى شهرين، ثم صيانة 500 أو 800 ريال شهرياً.",
    },
  ],
  en: [
    {
      label: "Setup",
      price: "2,000 SAR once",
      note: "2,000–3,000 SAR to prepare the store: branding, payment and shipping setup, and product import.",
    },
    {
      label: "Subscription",
      price: "from 300 SAR/month",
      note: "Basic 300, Advanced 500, or 700 and 1,000 with the apps. The plans are listed below.",
    },
    {
      label: "Purchase",
      price: "from 12,000 SAR",
      note: "12,000–18,000 for the store, or 20,000–30,000 with both apps. After delivery, bug fixes are free for one to two months, then maintenance is 500 or 800 SAR per month.",
    },
  ],
};

const GROUP = {
  ar: { subscription: "باقات الاشتراك", maintenance: "الصيانة بعد الشراء" },
  en: { subscription: "Subscription plans", maintenance: "Maintenance after purchase" },
};

export default function PriceAddendum({ lang = "ar" }) {
  const en = lang === "en";
  const rows = en ? ROWS.en : ROWS.ar;
  const title = en ? "Current price ranges" : "النطاق السعري الحالي";
  const groups = en ? GROUP.en : GROUP.ar;
  const plans = publicPlans();
  return (
    <section className="offer-band" id="current-offer" aria-labelledby="current-offer-title">
      <div className="offer-card">
        <h2 id="current-offer-title">{title}</h2>
        <ul className="offer-rows">
          {rows.map((row) => (
            <li key={row.label}>
              <span className="offer-label">{row.label}</span>
              <strong>{row.price}</strong>
              <p>{row.note}</p>
            </li>
          ))}
        </ul>
        {["subscription", "maintenance"].map((group) => (
          <div key={group}>
            <h3 className="offer-group">{groups[group]}</h3>
            <ul className="offer-plans">
              {plans.filter((p) => p.group === group).map((plan) => (
                <li key={plan.id}>
                  <div className="offer-plan-h">
                    <strong>{en ? plan.nameEn : plan.nameAr}</strong>
                    <span>{en ? `${plan.monthly.toLocaleString("en-US")} SAR/month` : `${plan.monthly.toLocaleString("en-US")} ريال شهرياً`}</span>
                  </div>
                  <p>{en ? plan.blurbEn : plan.blurbAr}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="offer-policy">{en ? ANNUAL_EN : ANNUAL_AR}</p>
        <p className="offer-policy">{en ? POLICY_EN : POLICY_AR}</p>
      </div>
    </section>
  );
}
