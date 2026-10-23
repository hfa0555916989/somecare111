// بطاقة السعر الحالي. تُعرض تحت النص الأصلي ولا تستبدله.
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
      note: "يشمل الاستضافة والدعم والنسخ الاحتياطي. من 300 إلى 500 بدون تطبيقات، أو من 700 إلى 1,000 مع التطبيقات. سنوياً بشهرين مجاناً.",
    },
    {
      label: "الشراء",
      price: "من 12,000 ريال",
      note: "من 12,000 إلى 18,000 للمتجر، أو من 20,000 إلى 30,000 مع التطبيقين. بعد التسليم إصلاح أعطال مجاني من شهر إلى شهرين، ثم صيانة من 500 إلى 800 ريال شهرياً.",
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
      note: "Includes hosting, support and backups. 300–500 without apps, or 700–1,000 with apps. Two months free on the annual plan.",
    },
    {
      label: "Purchase",
      price: "from 12,000 SAR",
      note: "12,000–18,000 for the store, or 20,000–30,000 with both apps. After delivery, bug fixes are free for one to two months, then maintenance is 500–800 SAR per month.",
    },
  ],
};

export default function PriceAddendum({ lang = "ar" }) {
  const en = lang === "en";
  const rows = en ? ROWS.en : ROWS.ar;
  const title = en ? "Current price ranges" : "النطاق السعري الحالي";
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
      </div>
    </section>
  );
}
