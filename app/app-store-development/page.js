import { SiteHeader, SiteFooter } from "../SiteChrome";
import { getContent } from "@/lib/content";
import { localize } from "@/lib/i18n";
import { BIG_STORE_NAME, BIG_STORE_PRODUCT, STORE_PAGE_FREE } from "@/lib/big-store";
import { PackagePoints, StoreShowcase, packageShowcase } from "../PackagePoints";
import PriceAddendum from "../PriceAddendum";
import StoreCare from "../StoreCare";
import { STORE_CARE } from "@/lib/store-care";

export const dynamic = "force-dynamic";

const TITLE = "إنشاء متجر إلكتروني بـ 8,500 ريال شراء بدون اشتراكات | المطور حسن";
const DESC = "متجر إلكتروني جاهز بـ 8,500 ريال مرة واحدة بدون اشتراكات: كل المزايا الحالية، وربط الدفع والشحن، واستضافة ودعم فني مجاناً لسنة، ودومين مجاني. والمواقع التعريفية بـ 2,300 ريال.";

export const metadata = {
  title: { absolute: TITLE },
  description: DESC,
  keywords: "انشاء متجر الكتروني, انشاء متجر الكتروني في السعودية, متجر الكتروني مع تطبيق, تكلفة تطبيق متجر الكتروني, متجر 8500 ريال, المطور حسن",
  alternates: { canonical: "/app-store-development" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "ar_SA", url: "/app-store-development", title: TITLE, description: DESC, images: ["/images/brand-og.png"] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/images/brand-og.png"] },
};

const wa = (text) => "https://wa.me/966530779934?text=" + encodeURIComponent(text);
const WA = wa("السلام عليكم، أبغى عرض المتجر بـ 8500 ريال");

// شراء لمرة واحدة بدون اشتراكات
const PLANS = [
  {
    id: "purchase",
    name: "المتجر الإلكتروني",
    price: "8,500",
    unit: "ريال مرة واحدة",
    points: [
      "شراء بدون اشتراكات، بكل المزايا الحالية",
      "ربط بوابات الدفع وشركات الشحن",
      "استضافة مجانية لمدة سنة",
      "دعم فني مجاني لمدة سنة",
      "دومين مجاني",
    ],
    cta: "اطلب المتجر",
    wa: WA,
  },
  {
    id: "website",
    name: "موقع تعريفي",
    price: "2300",
    unit: "ريال",
    points: [
      "موقع تعريفي احترافي لنشاطك",
      "لوحة تحكم مع إحصائيات الزوار",
      "استضافة ودعم فني لسنة ودومين مجاني",
      "متجاوب مع الجوال والكمبيوتر",
      "سعر ثابت مرة واحدة",
    ],
    cta: "اطلب الموقع",
    wa: wa("السلام عليكم، أبغى موقع تعريفي بـ 2,300 ريال"),
  },
  {
    id: "service",
    name: "موقع خدمي + تطبيق",
    price: "11,000",
    unit: "ريال مرة واحدة",
    points: ["موقع خدمي لاستقبال الطلبات أو الحجوزات", "تطبيق iOS وAndroid للعملاء", "لوحة تحكم واحدة", "سعر ثابت بدون اشتراك"],
    cta: "اطلب الموقع الخدمي",
    wa: wa("السلام عليكم، أبغى موقع خدمي مع تطبيق بـ 11000 ريال"),
  },
];

const OFFER = { name: BIG_STORE_NAME, items: BIG_STORE_PRODUCT };

const FREE = STORE_PAGE_FREE;

const FAQ = [
  ["كم تكلفة إنشاء متجر إلكتروني؟", "8,500 ريال شراءً لمرة واحدة بدون اشتراكات، ويشمل كل المزايا الحالية وربط الدفع والشحن، واستضافة مجانية لسنة، ودعماً فنياً مجانياً لسنة، ودوميناً مجانياً. والموقع التعريفي بـ 2,300 ريال."],
  ["هل فيه اشتراك شهري؟", "لا. تدفع مرة واحدة فقط، ويصير المتجر لك."],
  ["هل بوابة الدفع والشحن داخلة في السعر؟", "نعم، وليست فاتورة بعدها: بوابة الدفع مع التقسيط عبر تابي وتمارا، وربط جميع شركات الشحن، والدومين وشهادة SSL، وزر واتساب يتواصل به عملاؤك معك، وتنبيهات الطلب داخل لوحة التحكم، وتحليلات جوجل."],
  ["كم الدعم الفني؟", "الدعم الفني مجاني لمدة سنة كاملة، ومعه استضافة مجانية لسنة. إصلاح العطل خلل في ما تم تسليمه، والميزات الجديدة تتسعّر بشكل منفصل."],
  ["هل التعامل موثق؟", "نعم، عرض سعر وعقد رسمي مرتبطان بوثيقة العمل الحر، والتحويل على آيبان باسم المطور حسن فقط."],
  [STORE_CARE.ar.faqQ, STORE_CARE.ar.faqA],
];

const LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://www.hassandev.sa/#person",
      name: "المطور حسن",
      alternateName: "Developer Hassan",
      jobTitle: "مطوّر مواقع وتطبيقات",
      url: "https://www.hassandev.sa/",
      telephone: "+966530779934",
      address: { "@type": "PostalAddress", addressLocality: "الرياض", addressCountry: "SA" },
    },
    {
      "@type": "Product",
      name: BIG_STORE_NAME,
      description: DESC,
      brand: { "@type": "Brand", name: "المطور حسن" },
      offers: [
        { "@type": "Offer", name: "متجر إلكتروني (شراء لمرة واحدة)", price: "8500", priceCurrency: "SAR", availability: "https://schema.org/InStock", url: "https://www.hassandev.sa/app-store-development" },
        { "@type": "Offer", name: "موقع تعريفي", price: "2300", priceCurrency: "SAR", availability: "https://schema.org/InStock", url: "https://www.hassandev.sa/app-store-development" },
        { "@type": "Offer", name: "موقع خدمي + تطبيق iOS وAndroid", price: "11000", priceCurrency: "SAR", availability: "https://schema.org/InStock", url: "https://www.hassandev.sa/app-store-development" },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
    },
  ],
};

export default async function AppStoreDevelopment() {
  const c = localize(await getContent(), "ar");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      <SiteHeader c={c} altPath="/" />
      <main id="top">
        <section className="hero" style={{ padding: "56px 0 24px", textAlign: "center" }}>
          <div className="wrap">
            <p className="hero-badge">شراء بدون اشتراكات · استضافة ودعم فني سنة مجاناً</p>
            <h1 style={{ maxWidth: 900, marginInline: "auto" }}>
              إنشاء متجر إلكتروني <span className="hl">بـ 8,500 ريال فقط</span> مع المطور حسن
            </h1>
            <p className="lead" style={{ maxWidth: 780, marginInline: "auto" }}>
              أنا <strong>المطور حسن</strong>. أبني لك المتجر ولوحة التحكم بكل المزايا الحالية، مع ربط الدفع والشحن. تدفع 8,500 ريال مرة واحدة بدون اشتراكات، والاستضافة والدعم الفني مجاناً لسنة، والدومين مجاني.
            </p>
            <div className="cta-row" style={{ justifyContent: "center" }}>
              <a className="btn" href={WA} target="_blank" rel="noopener">اطلب متجرك على واتساب</a>
              <a className="btn btn-ghost" href="#packages">الأسعار</a>
            </div>
          </div>
        </section>

        <section id="packages" className="sec">
          <div className="wrap">
            <h2>الأسعار</h2>
            <p className="sub">شراء لمرة واحدة بدون اشتراكات.</p>
            <div className="pk-grid">
              {PLANS.map((p, i) => (
                <article key={p.id} id={p.id} className={i === 0 ? "pk pk-featured" : "pk"}>
                  <div className="pk-head"><div><h3>{p.name}</h3></div></div>
                  <p className="pk-price">
                    <strong>{p.price}</strong>
                    <span>{p.unit}</span>
                  </p>
                  <PackagePoints features={p.points} lang="ar" />
                  <a className="btn" href={p.wa} target="_blank" rel="noopener">{p.cta}</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="big-store" className="sec sec-alt">
          <div className="wrap narrow">
            <h2>ماذا يشمل المتجر</h2>
            <p className="sub">كل المزايا الحالية ضمن سعر 8,500 ريال.</p>
            <PackagePoints features={OFFER.items} lang="ar" />
            <StoreShowcase data={packageShowcase(OFFER)} lang="ar" />
          </div>
        </section>

        <section id="addons" className="sec">
          <div className="wrap narrow">
            <h2>داخلة في السعر مجاناً</h2>
            <p className="sub">مع المتجر، بدون فاتورة إضافية.</p>
            <div className="addons">
              {FREE.map((item) => (
                <div key={item} className="addon">
                  <div className="addon-txt"><h3>{item}</h3></div>
                  <span className="addon-price">مجاناً</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PriceAddendum lang="ar" />

        <section id="faq" className="sec">
          <div className="wrap narrow">
            <h2>أسئلة عن السعر والدعم</h2>
            <div className="faq">
              {FAQ.map(([q, a], i) => (
                <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>
              ))}
            </div>
            <div className="cta-row" style={{ justifyContent: "center", marginTop: 24 }}>
              <a className="btn" href={WA} target="_blank" rel="noopener">تواصل مع المطور حسن على واتساب</a>
            </div>
          </div>
        </section>
        <StoreCare lang="ar" />
      </main>
      <SiteFooter c={c} />
    </>
  );
}
