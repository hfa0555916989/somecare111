// بطاقة السعر الحالي: المتجر 8,500 ريال مرة واحدة، والموقع التعريفي 2,300 ريال، والموقع الخدمي مع التطبيق 11,300 ريال، ونظام إدارة الأملاك 7,200 ريال، والمحاسب المحترف 39 ريال شهرياً أو 390 سنوياً.
import { CARE_LINE_AR, CARE_LINE_EN } from "@/lib/store-care";

const ROWS = {
  ar: [
    {
      label: "المتجر الإلكتروني",
      price: "8,500 ريال مرة واحدة",
      note: "شراء بدون اشتراكات، بكل المزايا الحالية، مع ربط بوابات الدفع وشركات الشحن.",
    },
    {
      label: "مجاناً مع المتجر",
      price: "استضافة ودعم فني لسنة + دومين",
      note: "استضافة مجانية لمدة سنة، ودعم فني مجاني لمدة سنة، ودومين مجاني.",
    },
    {
      label: "الموقع التعريفي",
      price: "2,300 ريال",
      note: "موقع تعريفي احترافي بسعر ثابت مرة واحدة، يشمل لوحة تحكم مع إحصائيات الزوار، واستضافة ودعم فني لسنة، ودومين مجاني.",
    },
    {
      label: "موقع خدمي + تطبيق iOS وAndroid",
      price: "11,300 ريال مرة واحدة",
      note: "تطبيق ويب مخصص لاستقبال الطلبات أو الحجوزات مع تطبيقين iOS وAndroid ولوحة تحكم واحدة.",
    },
    {
      label: "نظام إدارة أملاك",
      price: "7,200 ريال",
      note: "شامل الاستضافة والدعم الفني والدومين لمدة سنة.",
    },
    {
      label: "المحاسب المحترف",
      price: "39 ريال شهرياً أو 390 ريال سنوياً",
      note: "برنامج محاسبة سحابي على almohasebpro.com، مع تجربة مجانية 7 أيام.",
    },
  ],
  en: [
    {
      label: "Online store",
      price: "8,500 SAR one-time",
      note: "A purchase with no subscriptions, with every current feature and payment and shipping integration.",
    },
    {
      label: "Free with the store",
      price: "1 year hosting and support + domain",
      note: "Free hosting for one year, free technical support for one year, and a free domain.",
    },
    {
      label: "Business website",
      price: "2,300 SAR",
      note: "A professional business website at a fixed one-time price, including a control panel with visitor statistics, a year of hosting and support, and a free domain.",
    },
    {
      label: "Service website + iOS and Android app",
      price: "11,300 SAR one-time",
      note: "A custom web app for orders or bookings with iOS and Android apps and one dashboard.",
    },
    {
      label: "Property management system",
      price: "7,200 SAR",
      note: "Including hosting, technical support and the domain for one year.",
    },
    {
      label: "Professional Accountant",
      price: "39 SAR a month or 390 SAR a year",
      note: "Cloud accounting software at almohasebpro.com, with a 7-day free trial.",
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
