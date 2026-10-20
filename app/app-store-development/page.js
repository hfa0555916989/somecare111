import { SiteHeader, SiteFooter } from "../SiteChrome";
import { getContent } from "@/lib/content";
import { localize } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const TITLE = "إنشاء متجر إلكتروني وتطبيق جوال بأسعار واضحة | المطور حسن";
const DESC = "المطور حسن: إنشاء متجر إلكتروني مع تطبيق جوال في السعودية يبدأ من 18,600 ريال، وتطبيق خدمات iOS وأندرويد بـ 16,700 ريال. أسعار واضحة وعقد رسمي. اطلب عرض سعر عبر واتساب.";

export const metadata = {
  title: { absolute: TITLE },
  description: DESC,
  keywords: "انشاء متجر الكتروني, انشاء متجر الكتروني في السعودية, شركة برمجة تطبيقات, شركة برمجة تطبيقات في السعودية, تطوير تطبيقات الجوال, برمجة تطبيقات الجوال, تصميم تطبيقات الجوال, تكلفة تطبيق متجر الكتروني, المطور حسن",
  alternates: { canonical: "/app-store-development" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "ar_SA", url: "/app-store-development", title: TITLE, description: "باقات متاجر إلكترونية مع تطبيق جوال وتطبيقات خدمات بأسعار معلنة بالريال السعودي.", images: ["/images/brand-og.png"] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/images/brand-og.png"] },
};

const LD = {"@context":"https://schema.org","@graph":[
{"@type":"Person","@id":"https://www.hassandev.sa/#person","name":"حسن فايز الأسمري","alternateName":"المطور حسن","jobTitle":"مطوّر مواقع وتطبيقات","url":"https://www.hassandev.sa/","telephone":"+966530779934","address":{"@type":"PostalAddress","addressLocality":"الرياض","addressCountry":"SA"}},
{"@type":"Service","name":"إنشاء متجر إلكتروني وبرمجة تطبيقات الجوال","serviceType":"تطوير متاجر إلكترونية وتطبيقات جوال","provider":{"@id":"https://www.hassandev.sa/#person"},"areaServed":{"@type":"Country","name":"السعودية"},"url":"https://www.hassandev.sa/app-store-development",
"offers":[
{"@type":"Offer","name":"باقة تطبيق خدمات","price":"16700","priceCurrency":"SAR","priceSpecification":{"@type":"PriceSpecification","price":"16700","priceCurrency":"SAR"}},
{"@type":"Offer","name":"متجر صغير","priceCurrency":"SAR","priceSpecification":{"@type":"PriceSpecification","minPrice":"18600","priceCurrency":"SAR"}},
{"@type":"Offer","name":"متجر متوسط","priceCurrency":"SAR","priceSpecification":{"@type":"PriceSpecification","minPrice":"22000","maxPrice":"26500","priceCurrency":"SAR"}},
{"@type":"Offer","name":"متجر كبير","priceCurrency":"SAR","priceSpecification":{"@type":"PriceSpecification","minPrice":"34000","maxPrice":"76500","priceCurrency":"SAR"}},
{"@type":"Offer","name":"موقع تعريفي احترافي","price":"5300","priceCurrency":"SAR","priceSpecification":{"@type":"PriceSpecification","price":"5300","priceCurrency":"SAR"}}
]},
{"@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"كم تكلفة إنشاء متجر إلكتروني مع تطبيق؟","acceptedAnswer":{"@type":"Answer","text":"المتجر الصغير يبدأ من 18,600 ريال، والمتوسط من 22,000 إلى 26,500 ريال، والكبير من 34,000 إلى 76,500 ريال فأكثر، وكل الباقات تشمل سلة شراء وإدارة مخزون وتطبيق جوال ولوحة تحكم وموقع تعريفي."}},
{"@type":"Question","name":"كم سعر تطبيق جوال للخدمات؟","acceptedAnswer":{"@type":"Answer","text":"باقة تطبيق الخدمات بـ 16,700 ريال وتشمل تطبيق iOS وأندرويد مع لوحة تحكم كاملة وموقع تعريفي مرافق وإشعارات فورية."}},
{"@type":"Question","name":"هل بوابة الدفع والشحن داخلة في السعر؟","acceptedAnswer":{"@type":"Answer","text":"هي إضافات اختيارية: بوابة دفع مع ميزة استرجاع المبلغ بـ 6,500 ريال، وربط شركة شحن واحدة بـ 7,000 ريال وكل شركة إضافية بـ 3,200 ريال."}},
{"@type":"Question","name":"كم تكلفة الدعم الفني؟","acceptedAnswer":{"@type":"Answer","text":"الدعم الفني مع الأمان والتحديثات المستمرة بـ 7,200 ريال سنوياً."}},
{"@type":"Question","name":"ما الفرق بين المتجر الصغير والمتوسط والكبير؟","acceptedAnswer":{"@type":"Answer","text":"الصغير حتى 400 منتج و10 فئات ومتغير واحد، والمتوسط حتى 4000 منتج بمتغيرات متعددة وكوبونات وتقارير مبيعات، والكبير فوق 4000 منتج مع بحث وفلترة متقدمة وبرنامج ولاء وتكامل محاسبة."}},
{"@type":"Question","name":"هل التعامل موثق؟","acceptedAnswer":{"@type":"Answer","text":"نعم، لكل مشروع عرض سعر وعقد رسمي برقم وتاريخ على hassandev.sa مرتبط بوثيقة العمل الحر FL-273857775، والتحويل على آيبان باسم حسن فايز الأسمري فقط."}}
]}]};

const WA = "https://wa.me/966530779934?text=" + encodeURIComponent("أبغى عرض سعر لمتجر إلكتروني");
const BASE = ["سلة شراء + إدارة مخزون", "تطبيق جوال", "لوحة تحكم + موقع تعريفي"];
const PACKAGES = [
  { name: "متجر صغير", pre: "يبدأ من", price: "18,600", unit: "ريال", desc: "حتى 400 منتج، حتى 10 فئات، متغير واحد للمنتج كاللون أو المقاس", items: BASE, featured: true },
  { name: "متجر متوسط", price: "22,000 – 26,500", unit: "ريال", desc: "حتى 4000 منتج، متغيرات متعددة، كوبونات وخصومات، تقارير مبيعات", items: BASE },
  { name: "متجر كبير", price: "34,000 – 76,500", unit: "ريال فأكثر", desc: "فوق 4000 منتج، بحث وفلترة متقدمة، برنامج ولاء، تكامل محاسبة", items: BASE },
  { name: "باقة تطبيق خدمات", price: "16,700", unit: "ريال", desc: "تطبيق (iOS + Android) مع لوحة تحكم كاملة", items: ["تطبيق جوال + لوحة تحكم لإدارة الطلبات والمحتوى", "موقع تعريفي مرافق بنفس الهوية", "إشعارات فورية", "تصميم متجاوب وسريع"] },
  { name: "موقع تعريفي احترافي", price: "5,300", unit: "ريال فقط", desc: "شامل الدومين والاستضافة لأول سنة", items: ["لوحة تحكم كاملة", "سرعة فائقة", "متجاوب لكل الأجهزة", "تهيئة SEO", "تحليلات جوجل", "تسليم خلال أيام"] },
];
const ADDONS = [
  ["بوابة دفع", "تشمل ميزة استرجاع المبلغ للعميل", "6,500 ريال"],
  ["ربط شركة شحن واحدة", "كل شركة إضافية 3,200 ريال", "7,000 ريال"],
  ["الدعم الفني", "أمان وتحديثات مستمرة", "7,200/سنوي"],
];
const WHY = ["عرض سعر وعقد رسمي لكل مشروع، برقم وتاريخ على hassandev.sa.", "مرتبط بوثيقة العمل الحر رقم FL-273857775 (سارية حتى 28 سبتمبر 2027).", "الدومين hassandev.sa مسجّل باسمي، والتحويل على آيبان باسمي فقط بدون وسطاء.", "موافقة إلكترونية وبصمة رقمية تقفل السعر والبنود.", "تحكم كامل بالمحتوى والأسعار بنفسك، سرعة عالية، تصميم متجاوب، وتهيئة SEO وتحليلات جوجل."];
const FAQ = [["كم تكلفة إنشاء متجر إلكتروني مع تطبيق؟", "الصغير يبدأ من 18,600 ريال، والمتوسط 22,000 – 26,500 ريال، والكبير 34,000 – 76,500 ريال فأكثر."], ["كم سعر تطبيق جوال للخدمات؟", "16,700 ريال، ويشمل iOS وأندرويد ولوحة تحكم وموقع تعريفي مرافق وإشعارات فورية."], ["هل بوابة الدفع والشحن داخلة في السعر؟", "إضافات اختيارية: بوابة الدفع 6,500 ريال، وربط شركة شحن 7,000 ريال وكل شركة إضافية 3,200 ريال."], ["كم تكلفة الدعم الفني؟", "7,200 ريال سنوياً تشمل الأمان والتحديثات المستمرة."], ["ما الفرق بين المتجر الصغير والمتوسط والكبير؟", "عدد المنتجات والمزايا: حتى 400 منتج، حتى 4000 منتج، أو فوق 4000 منتج مع بحث متقدم وبرنامج ولاء وتكامل محاسبة."], ["هل التعامل موثق؟", "نعم، عرض سعر وعقد رسمي مرتبطان بوثيقة العمل الحر، والتحويل على آيبان باسم حسن فايز الأسمري فقط."]];

export default async function AppStoreDevelopment() {
  const c = localize(await getContent(), "ar");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
      <SiteHeader c={c} altPath="/" />
      <main id="top">
        <section className="hero" style={{ padding: "56px 0 24px", textAlign: "center" }}>
          <div className="wrap">
            <p className="hero-badge">متاجر إلكترونية وتطبيقات جوال · الرياض</p>
            <h1 style={{ maxWidth: 900, marginInline: "auto" }}>إنشاء متجر إلكتروني وتطبيق جوال <span className="hl">بأسعار واضحة</span> مع المطور حسن</h1>
            <p className="lead" style={{ maxWidth: 780, marginInline: "auto" }}>
              أنا <strong>حسن فايز الأسمري (المطور حسن)</strong>، مطوّر مواقع وتطبيقات وممارس عمل حر مرخّص من وزارة الموارد البشرية في الرياض. أبني لك متجرك الإلكتروني مع تطبيق جوال ولوحة تحكم كاملة، أو تطبيق خدماتك على iOS وأندرويد، وأتعامل معك مباشرة بدون وسطاء من الفكرة حتى الإطلاق.
            </p>
            <div className="cta-row" style={{ justifyContent: "center" }}>
              <a className="btn" href={WA} target="_blank" rel="noopener">اطلب عرض سعر على واتساب</a>
              <a className="btn btn-ghost" href="#packages">شوف الأسعار</a>
            </div>
          </div>
        </section>

        <section id="packages" className="sec">
          <div className="wrap">
            <h2>أسعار إنشاء متجر إلكتروني وبرمجة تطبيقات الجوال</h2>
            <p className="sub">اختر الباقة المناسبة لمشروعك، والسعر يختلف حسب حجم العمل.</p>
            <div className="pk-grid">
              {PACKAGES.map((p) => (
                <article key={p.name} className={"pk" + (p.featured ? " pk-featured" : "")}>
                  <div className="pk-head"><div><h3>{p.name}</h3></div></div>
                  <p className="pk-price">
                    {p.pre && <small>{p.pre}</small>}
                    <strong style={{ whiteSpace: "nowrap", fontSize: p.price.includes("–") ? ".72em" : undefined }}>{p.price}</strong>
                    <span>{p.unit}</span>
                  </p>
                  <p className="pk-desc">{p.desc}</p>
                  <ul>{p.items.map((x) => <li key={x}>{x}</li>)}</ul>
                  <a className={"btn" + (p.featured ? "" : " btn-ghost")} href={WA} target="_blank" rel="noopener">اطلب هذه الباقة</a>
                </article>
              ))}
            </div>
            <p style={{ textAlign: "center", color: "var(--muted)", marginTop: 22 }}>السعر النهائي يختلف حسب حجم العمل، ويوصلك عرض سعر رسمي تراجعه وتوافق عليه من جوالك.</p>
          </div>
        </section>

        <section id="addons" className="sec sec-alt">
          <div className="wrap narrow">
            <h2>إضافات اختيارية لكل الباقات</h2>
            <p className="sub">متاحة لكل الباقات</p>
            <div className="addons">
              {ADDONS.map(([t, d, p]) => (
                <div key={t} className="addon">
                  <div className="addon-txt"><h3>{t}</h3><p>{d}</p></div>
                  <span className="addon-price">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="wrap">
            <h2>ليش تختار المطور حسن لإنشاء متجرك أو تطبيقك؟</h2>
            <div className="ft-grid">
              {WHY.map((x) => (
                <div key={x} className="ft">
                  <span className="ic-ring" aria-hidden="true"><span style={{ fontSize: 21.6, lineHeight: 1 }}>✓</span></span>
                  <div><p style={{ margin: 0 }}>{x}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="sec sec-alt">
          <div className="wrap narrow">
            <h2>أسئلة شائعة عن أسعار المتاجر والتطبيقات</h2>
            <div className="faq">
              {FAQ.map(([q, a], i) => (
                <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>
              ))}
            </div>
            <div className="cta-row" style={{ justifyContent: "center", marginTop: 24 }}>
              <a className="btn" href="https://wa.me/966530779934" target="_blank" rel="noopener">تواصل مع المطور حسن على واتساب 0530779934</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter c={c} />
    </>
  );
}
