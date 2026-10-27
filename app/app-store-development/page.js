import { SiteHeader, SiteFooter } from "../SiteChrome";
import { getContent } from "@/lib/content";
import { localize } from "@/lib/i18n";
import { BIG_STORE_NAME, BIG_STORE_PRODUCT, STORE_PAGE_FREE } from "@/lib/big-store";
import { PackagePoints, StoreShowcase, packageShowcase } from "../PackagePoints";
import PriceAddendum from "../PriceAddendum";
import StoreCare from "../StoreCare";
import { STORE_CARE } from "@/lib/store-care";

export const dynamic = "force-dynamic";

const TITLE = "إنشاء متجر إلكتروني وتطبيق جوال باشتراك من 700 ريال شهرياً | المطور حسن";
const DESC = "متجر إلكتروني مع تطبيق iOS وAndroid: اشتراك من 700 ريال شهرياً بعد تجهيز من 2,000 ريال، أو شراء من 20,000 ريال. منتجات غير محدودة ولوحة تحكم، والدفع والشحن والدومين داخل السعر.";

export const metadata = {
  title: { absolute: TITLE },
  description: DESC,
  keywords: "انشاء متجر الكتروني, انشاء متجر الكتروني في السعودية, متجر الكتروني مع تطبيق, تكلفة تطبيق متجر الكتروني, اشتراك من 700 ريال, المطور حسن",
  alternates: { canonical: "/app-store-development" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "ar_SA", url: "/app-store-development", title: TITLE, description: DESC, images: ["/images/brand-og.png"] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/images/brand-og.png"] },
};

const wa = (text) => "https://wa.me/966530779934?text=" + encodeURIComponent(text);
const WA = wa("أبغى متجر إلكتروني مع تطبيق جوال");

// المتجر والتطبيق نفسهما في الطريقتين، والفرق في طريقة الدفع فقط
const PLANS = [
  {
    id: "subscription",
    name: "اشتراك شهري",
    price: "من 700",
    unit: "ريال شهرياً مع التطبيق",
    points: [
      "التجهيز من 2,000 ريال مرة واحدة",
      "الاستضافة والنسخ الاحتياطي والدعم داخل الرسم الشهري",
      "السنوي بشهرين مجاناً: تدفع 10 أشهر",
    ],
    cta: "اطلب الاشتراك",
    wa: wa("أبغى متجر مع تطبيق بالاشتراك: التجهيز من 2,000 ريال، ثم من 700 ريال شهرياً"),
  },
  {
    id: "purchase",
    name: "شراء",
    price: "من 20,000",
    unit: "ريال للمتجر مع التطبيقين",
    points: [
      "من 20,000 إلى 30,000 حسب حجم المتجر",
      "دفعات حسب مراحل العمل، ويصير المتجر والتطبيق ملكك",
      "إصلاح أعطال مجاني من شهر إلى شهرين، ثم صيانة اختيارية 500 أو 800 ريال شهرياً",
    ],
    cta: "اطلب الشراء",
    wa: wa("أبغى شراء متجر مع التطبيقين من 20,000 ريال"),
  },
];

const OFFER = { name: BIG_STORE_NAME, items: BIG_STORE_PRODUCT };

const FREE = STORE_PAGE_FREE;

const FAQ = [
  ["كم تكلفة إنشاء متجر إلكتروني مع تطبيق؟", "طريقتان. بالاشتراك: التجهيز من 2,000 ريال مرة واحدة، ثم من 700 ريال شهرياً مع التطبيق، أو 1,000 للباقة الأعلى، والسنوي بشهرين مجاناً. بالشراء: من 20,000 إلى 30,000 ريال للمتجر مع التطبيقين. وإذا أردت المتجر بدون تطبيق: اشتراك من 300 ريال شهرياً، أو شراء من 12,000 ريال."],
  ["ما الفرق بين الاشتراك والشراء؟", "المتجر والتطبيق نفسهما. في الاشتراك تدفع شهرياً، والاستضافة والدعم والنسخ الاحتياطي داخل الرسم. في الشراء تدفع المبلغ على دفعات حسب مراحل العمل ويصير المتجر ملكك، ثم الصيانة اختيارية."],
  ["هل التطبيق داخل رسوم التجهيز؟", "لا. التجهيز لتهيئة المتجر: الهوية، وربط الدفع والشحن، واستيراد المنتجات. التطبيق داخل اشتراك التطبيقات من 700 ريال، أو داخل الشراء من 20,000 ريال."],
  ["هل بوابة الدفع والشحن داخلة في السعر؟", "نعم، وليست فاتورة بعدها: بوابة الدفع مع التقسيط عبر تابي وتمارا، وربط جميع شركات الشحن، والدومين وشهادة SSL، وزر واتساب يتواصل به عملاؤك معك، وتنبيهات الطلب داخل لوحة التحكم، وتحليلات جوجل."],
  ["كم الدعم الفني؟", "في الاشتراك، الدعم داخل الرسم الشهري. بعد الشراء، إصلاح الأعطال مجاني من شهر إلى شهرين، ثم صيانة 500 أو 800 ريال شهرياً. إصلاح العطل خلل في ما تم تسليمه، والميزات الجديدة تتسعّر بشكل منفصل. إذا تأخر سداد الاشتراك يوقف الدعم بعد 7 أيام، ويوقف المتجر بعد 15 يوماً."],
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
      offers: { "@type": "AggregateOffer", lowPrice: "2000", highPrice: "30000", priceCurrency: "SAR", offerCount: 2, availability: "https://schema.org/InStock", url: "https://www.hassandev.sa/app-store-development" },
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
            <p className="hero-badge">متجر إلكتروني مع تطبيق جوال · باشتراك من 700 ريال شهرياً</p>
            <h1 style={{ maxWidth: 900, marginInline: "auto" }}>
              إنشاء متجر إلكتروني وتطبيق جوال <span className="hl">باشتراك من 700 ريال شهرياً</span> مع المطور حسن
            </h1>
            <p className="lead" style={{ maxWidth: 780, marginInline: "auto" }}>
              أنا <strong>المطور حسن</strong>. أبني لك المتجر ولوحة التحكم وتطبيق iOS و Android. تدفع بالاشتراك من 700 ريال شهرياً بعد تجهيز من 2,000 ريال، أو تشتري المتجر مع التطبيقين من 20,000 ريال ويصير ملكك.
            </p>
            <div className="cta-row" style={{ justifyContent: "center" }}>
              <a className="btn" href={WA} target="_blank" rel="noopener">اطلب متجرك على واتساب</a>
              <a className="btn btn-ghost" href="#packages">قارن الاشتراك والشراء</a>
            </div>
          </div>
        </section>

        <section id="packages" className="sec">
          <div className="wrap">
            <h2>اختر طريقة الدفع</h2>
            <p className="sub">المتجر والتطبيق نفسهما في الطريقتين. الفرق في طريقة الدفع فقط.</p>
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
            <p className="sub">نفس المتجر في الاشتراك وفي الشراء.</p>
            <PackagePoints features={OFFER.items} lang="ar" />
            <StoreShowcase data={packageShowcase(OFFER)} lang="ar" />
          </div>
        </section>

        <section id="addons" className="sec">
          <div className="wrap narrow">
            <h2>داخلة في السعر مجاناً</h2>
            <p className="sub">في الاشتراك وفي الشراء، بدون فاتورة إضافية.</p>
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
