// بطاقة السعر الحالي: بدون اشتراكات. المتجر 1,500 ريال مرة واحدة، والموقع التعريفي 299 ريال.
import { CARE_LINE_AR, CARE_LINE_EN } from "@/lib/store-care";

const ROWS = {
  ar: [
    {
      label: "المتجر الإلكتروني",
      price: "1,500 ريال مرة واحدة",
      note: "شراء بدون اشتراكات، بكل المزايا الحالية، مع ربط بوابات الدفع وشركات الشحن.",
    },
    {
      label: "مجاناً مع المتجر",
      price: "استضافة ودعم فني لسنة + دومين",
      note: "استضافة مجانية لمدة سنة، ودعم فني مجاني لمدة سنة، ودومين مجاني.",
    },
    {
      label: "الموقع التعريفي",
      price: "299 ريال",
      note: "موقع تعريفي احترافي بسعر ثابت مرة واحدة، يشمل لوحة تحكم مع إحصائيات الزوار، واستضافة ودعم فني لسنة، ودومين مجاني.",
    },
  ],
  en: [
    {
      label: "Online store",
      price: "1,500 SAR one-time",
      note: "A purchase with no subscriptions, with every current feature and payment and shipping integration.",
    },
    {
      label: "Free with the store",
      price: "1 year hosting and support + domain",
      note: "Free hosting for one year, free technical support for one year, and a free domain.",
    },
    {
      label: "Business website",
      price: "299 SAR",
      note: "A professional business website at a fixed one-time price, including a control panel with visitor statistics, a year of hosting and support, and a free domain.",
    },
  ],
};

export default function PriceAddendum({ lang = "ar" }) {
  const en = lang === "en";
  const rows = en ? ROWS.en : ROWS.ar;
  const title = en ? "Current prices" : "الأسعار الحالية";
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
        <p className="offer-policy">{en ? CARE_LINE_EN : CARE_LINE_AR}</p>
      </div>
    </section>
  );
}
