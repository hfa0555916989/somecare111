import { SiteHeader, SiteFooter } from "../SiteChrome";
import { getContent } from "@/lib/content";
import { localize } from "@/lib/i18n";
import { BIG_STORE_DESC, BIG_STORE_FEATURES, BIG_STORE_NAME, STORE_PAGE_FREE } from "@/lib/big-store";
import { PackagePoints, StoreShowcase, packageShowcase } from "../PackagePoints";
import PriceAddendum from "../PriceAddendum";

export const dynamic = "force-dynamic";

const TITLE = "إنشاء متجر إلكتروني وتطبيق جوال باشتراك من 300 ريال شهرياً | المطور حسن";
const DESC = "باقة المتجر الكبير شامل التطبيق باشتراك من 300 ريال شهرياً، والتجهيز من 2,000 ريال، أو الشراء من 12,000 ريال: منتجات غير محدودة ولوحة تحكم وتطبيق iOS وAndroid، والدفع والشحن والدومين، وزر واتساب يفتح محادثة مع صاحب المتجر.";

export const metadata = {
  title: { absolute: TITLE },
  description: DESC,
  keywords: "انشاء متجر الكتروني, انشاء متجر الكتروني في السعودية, متجر الكتروني مع تطبيق, تكلفة تطبيق متجر الكتروني, اشتراك من 300 ريال, المطور حسن",
  alternates: { canonical: "/app-store-development" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "ar_SA", url: "/app-store-development", title: TITLE, description: DESC, images: ["/images/brand-og.png"] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/images/brand-og.png"] },
};

const OFFER = {
  name: BIG_STORE_NAME,
  price: "من 2,000",
  unit: "ريال للتجهيز",
  desc: BIG_STORE_DESC,
  items: BIG_STORE_FEATURES,
};

const FREE = STORE_PAGE_FREE;

const FAQ = [
  ["كم تكلفة إنشاء متجر إلكتروني مع تطبيق؟", "التجهيز 2,000 ريال مرة واحدة. الاشتراك من 300 ريال شهرياً ويشمل الاستضافة والدعم والنسخ الاحتياطي. الشراء من 12,000 ريال، وبعد التسليم إصلاح الأعطال مجاني من شهر إلى شهرين ثم صيانة من 500 إلى 800 ريال شهرياً. المتجر فيه سلة ولوحة تحكم، وتطبيق iOS وAndroid ضمن باقة التطبيقات."],
  ["هل التطبيق داخل رسوم التجهيز؟", "لا. التجهيز 2,000 ريال مرة واحدة لتهيئة المتجر. تطبيق iOS وAndroid ضمن اشتراك التطبيقات أو شراء المتجر مع التطبيقين، وليس عرضاً يُضاف بعد التسليم."],
  ["هل بوابة الدفع والشحن داخلة في السعر؟", "نعم، ضمن رسوم التجهيز وليست فاتورة بعدها: بوابة الدفع، وربط الشحن، والدومين وشهادة SSL، وزر واتساب يفتح محادثة مع صاحب المتجر، وتنبيهات الطلب داخل لوحة التحكم، وتحليلات جوجل."],
  ["هل التعامل موثق؟", "نعم، عرض سعر وعقد رسمي مرتبطان بوثيقة العمل الحر، والتحويل على آيبان باسم المطور حسن فقط."],
  ["كم الدعم الفني؟", "في الاشتراك، الدعم داخل الرسم الشهري من 300 ريال، مع الاستضافة والنسخ الاحتياطي. في الشراء من 12,000 ريال، إصلاح الأعطال مجاني من شهر إلى شهرين بعد التسليم، ثم صيانة من 500 إلى 800 ريال شهرياً. إصلاح العطل خلل في ما تم تسليمه، والميزات الجديدة تتسعّر بشكل منفصل."],
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

const WA = "https://wa.me/966530779934?text=" + encodeURIComponent("أبغى باقة المتجر الكبير شامل التطبيق من 2,000 ريال للتجهيز، والاشتراك من 300 ريال شهرياً، أو الشراء من 12,000 ريال");

export default async function AppStoreDevelopment() {
  const c = localize(await getContent(), "ar");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      <SiteHeader c={c} altPath="/" />
      <main id="top">
        <section className="hero" style={{ padding: "56px 0 24px", textAlign: "center" }}>
          <div className="wrap">
            <p className="hero-badge">متجر إلكتروني مع تطبيق جوال · باشتراك من 300 ريال شهرياً</p>
            <h1 style={{ maxWidth: 900, marginInline: "auto" }}>
              إنشاء متجر إلكتروني وتطبيق جوال <span className="hl">باشتراك من 300 ريال شهرياً</span> مع المطور حسن
            </h1>
            <p className="lead" style={{ maxWidth: 780, marginInline: "auto" }}>
              أنا <strong>المطور حسن</strong>. أبني لك المتجر ولوحة التحكم وتطبيق iOS و Android. التجهيز 2,000 ريال مرة واحدة، والاشتراك من 300 ريال شهرياً، أو الشراء من 12,000 ريال. في المتجر زر واتساب يفتح محادثة مع صاحب المتجر.
            </p>
            <div className="cta-row" style={{ justifyContent: "center" }}>
              <a className="btn" href={WA} target="_blank" rel="noopener">اطلب الباقة على واتساب</a>
              <a className="btn btn-ghost" href="#packages">تفاصيل الباقة</a>
            </div>
          </div>
        </section>

        <section id="packages" className="sec">
          <div className="wrap">
            <h2>باقة المتجر الكبير شامل التطبيق</h2>
            <p className="sub">التجهيز من 2,000 ريال، والاشتراك من 300 ريال شهرياً، أو الشراء من 12,000 ريال للمتجر مع التطبيق.</p>
            <div className="pk-grid">
              <article id="big-store" className="pk pk-featured">
                <div className="pk-head"><div><h3>{OFFER.name}</h3></div></div>
                <p className="pk-price">
                  <strong>{OFFER.price}</strong>
                  <span>{OFFER.unit}</span>
                </p>
                <p className="pk-desc">{OFFER.desc}</p>
                <PackagePoints features={OFFER.items} lang="ar" />
                <StoreShowcase data={packageShowcase(OFFER)} lang="ar" />
                <a className="btn" href={WA} target="_blank" rel="noopener">اطلب هذه الباقة</a>
              </article>
            </div>
          </div>
        </section>

        <section id="addons" className="sec sec-alt">
          <div className="wrap narrow">
            <h2>إضافات داخلة مجاناً</h2>
            <p className="sub">هذه البنود جزء من التجهيز من 2,000 ريال، وليست فاتورة بعدها.</p>
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
        <PriceAddendum lang="ar" />
      </main>
      <SiteFooter c={c} />
    </>
  );
}
