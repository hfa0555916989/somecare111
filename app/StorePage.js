import { getContent } from "@/lib/content";
import { localize, prefix, ui } from "@/lib/i18n";
import { SiteHeader, SiteFooter } from "./SiteChrome";
import { Icon, Hl } from "./Icons";
import { Contact, WaIcon, makeWaLink } from "./HomePage";
import { PackagePoints, PackagePrice, StoreShowcase, packageShowcase } from "./PackagePoints";
import { isBigStorePackage } from "@/lib/big-store";
import AdvancedFeatures from "./AdvancedFeatures";
import PreviousWork from "./PreviousWork";
import { NOTE_AR, NOTE_EN, OFFER_DESC_AR, OFFER_DESC_EN, offerJsonLd } from "@/lib/platform-offer";

const FAQ = {
  ar: [
    ["كم تكلفة إنشاء المتجر؟", "التجهيز من 2,000 إلى 3,000 ريال مرة واحدة. الاشتراك من 300 ريال شهرياً (300 إلى 500 بدون تطبيقات أو 700 إلى 1,000 مع التطبيقات) ويشمل الاستضافة والدعم والنسخ الاحتياطي، وسنوياً بشهرين مجاناً. الشراء من 12,000 ريال (12,000 إلى 18,000 للمتجر أو 20,000 إلى 30,000 مع التطبيقين)، وبعد التسليم إصلاح الأعطال مجاني من شهر إلى شهرين ثم صيانة من 500 إلى 800 ريال شهرياً."],
    ["هل التطبيقان ضمن الباقة؟", "نعم. iOS وAndroid ضمن باقة التطبيقات، وإشعارات الدفع تصل معهما عند التسليم. النشر على App Store وGoogle Play يعتمد على مراجعة المتجر، وغالباً من أسبوع إلى أسبوعين، ويحتاج حسابات المطوّر الخاصة بك (رسوم Apple السنوية ورسوم Google لمرة واحدة)."],
    ["هل بوابات الدفع والشحن متاحة؟", "نعم. ميسر وتابي وتمارا والراجحي والدفع عند الاستلام، وأرامكس وسمسا وأوتو وطرود والبريد السعودي، جزء من المنصة، وربطها ضمن رسوم التجهيز. فاتورة زاتكا مع رمز QR كذلك."],
    ["ما الفرق بين إصلاح العطل والميزة الجديدة؟", "إصلاح العطل خلل في ما تم تسليمه. في الاشتراك، الدعم داخل الرسم الشهري من 300 ريال مع الاستضافة والنسخ الاحتياطي. في الشراء من 12,000 ريال، إصلاح الأعطال مجاني من شهر إلى شهرين بعد التسليم، ثم صيانة من 500 إلى 800 ريال شهرياً. الميزات الجديدة تتسعّر بشكل منفصل."],
    ["كم يستغرق التسليم؟", "التسليم سريع ويتوقف على تسليمك للمحتوى في وقته. لا نعد بعدد أيام ثابت."],
  ],
  en: [
    ["What does the store cost?", "Setup is 2,000–3,000 SAR once. The subscription is from 300 SAR per month (300–500 without apps or 700–1,000 with apps) and includes hosting, support and backups, with two months free on the annual plan. Purchase is from 12,000 SAR (12,000–18,000 for the store or 20,000–30,000 with both apps). After purchase, bug fixes are free for one to two months, then maintenance is 500–800 SAR per month."],
    ["Are both apps included?", "Yes. iOS and Android are part of the apps plan, and push notifications are included at delivery. App Store and Google Play publishing depends on store review, usually about one to two weeks, and needs your developer accounts."],
    ["Are payment and shipping available?", "Yes. Moyasar, Tabby, Tamara, Al Rajhi and cash on delivery, and Aramex, SMSA, OTO, Torod and Saudi Post, are part of the platform and are connected during setup. The ZATCA QR invoice is included too."],
    ["What is a bug fix versus a new feature?", "A bug fix is a defect in what was delivered. On the subscription, support is included in the monthly fee from 300 SAR, together with hosting and backups. After purchase from 12,000 SAR, bug fixes are free for one to two months, then maintenance is 500–800 SAR per month. A new feature is quoted separately."],
    ["How long does delivery take?", "Delivery is fast and depends on you providing the content on time. We do not promise a fixed number of days. App store publishing usually takes about one to two weeks of review."],
  ],
};

const HERO = {
  ar: {
    badge: "الاشتراك هو الخيار الذي نوصي به",
    h1Before: "إنشاء متجر إلكتروني بنسخة مستقلة، ",
    h1Mark: "اشتراكاً أو شراءً",
    lead: OFFER_DESC_AR,
    primary: "اطلب الاشتراك على واتساب",
    secondary: "تفاصيل الأسعار",
    packages: "الاشتراك والشراء",
    packagesSub: "الأرقام نطاقات بالريال السعودي. التسليم سريع ويتوقف على وصول المحتوى في وقته.",
    order: "اطلب هذه الباقة",
    faq: "أسئلة عن السعر والتسليم",
    faqCta: "تواصل مع المطور حسن على واتساب",
  },
  en: {
    badge: "The subscription is what we recommend",
    h1Before: "An independent online store, ",
    h1Mark: "subscribe or buy",
    lead: OFFER_DESC_EN,
    primary: "Ask about the subscription on WhatsApp",
    secondary: "Pricing",
    packages: "Subscription and purchase",
    packagesSub: "Figures are ranges in Saudi riyals. Delivery is fast and depends on the content arriving on time.",
    order: "Order this package",
    faq: "Questions on price and delivery",
    faqCta: "Contact Developer Hassan on WhatsApp",
  },
};

export default async function StorePage({ lang }) {
  const c = localize(await getContent(), lang);
  const en = lang === "en";
  const copy = en ? HERO.en : HERO.ar;
  const faq = en ? FAQ.en : FAQ.ar;
  const t = ui(c.lang);
  const waLink = makeWaLink(c);
  const home = prefix(lang) || "";
  const pageUrl = `https://www.hassandev.sa${home}/app-store-development`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      offerJsonLd(pageUrl),
      {
        "@type": "FAQPage",
        inLanguage: en ? "en" : "ar",
        mainEntity: faq.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <SiteHeader c={c} icon={<WaIcon size={18} />} altPath="/app-store-development" />
      <main id="top">
        <section className="hero" style={{ padding: "56px 0 24px", textAlign: "center" }}>
          <div className="wrap">
            <p className="hero-badge">{copy.badge}</p>
            <h1 style={{ maxWidth: 900, marginInline: "auto" }}>
              {copy.h1Before}<span className="hl">{copy.h1Mark}</span>
            </h1>
            <p className="lead" style={{ maxWidth: 780, marginInline: "auto" }}>{copy.lead}</p>
            <div className="cta-row" style={{ justifyContent: "center" }}>
              <a className="btn" href={waLink(en ? "Store subscription" : "اشتراك المتجر")} target="_blank" rel="noopener">{copy.primary}</a>
              <a className="btn btn-ghost" href="#packages">{copy.secondary}</a>
            </div>
          </div>
        </section>

        <section id="packages" className="sec">
          <div className="wrap">
            <h2>{copy.packages}</h2>
            <p className="sub">{copy.packagesSub}</p>
            <div className="pk-grid">
              {(c.packages || []).map((p) => (
                <article key={p.name} id={isBigStorePackage(p) ? "big-store" : undefined} className={"pk" + (p.featured ? " pk-featured" : "")}>
                  <div className="pk-head">
                    {p.icon && <span className="ic-ring"><Icon name={p.icon} size={26} /></span>}
                    <div>{p.label && <p className="pk-label">{p.label}</p>}<h3>{p.name}</h3></div>
                  </div>
                  <PackagePrice p={p} />
                  {p.desc && <p className="pk-desc">{p.desc}</p>}
                  <PackagePoints features={p.features} lang={c.lang} />
                  <StoreShowcase data={packageShowcase(p)} lang={c.lang} />
                  <a className={"btn" + (p.featured ? "" : " btn-ghost")} href={waLink(p.name)} target="_blank" rel="noopener">{copy.order}</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="addons" className="sec sec-alt">
          <div className="wrap narrow">
            <h2><Hl text={c.titles.addons} /></h2>
            {c.titles.addonsSub && <p className="sub">{c.titles.addonsSub}</p>}
            <p className="pk-included-note">{en ? NOTE_EN : NOTE_AR}</p>
            <div className="addons">
              {(c.addons || []).map((a) => (
                <div key={a.title} className="addon">
                  {a.icon && <span className="ic-ring"><Icon name={a.icon} size={24} /></span>}
                  <div className="addon-txt"><h3>{a.title}</h3>{a.desc && <p>{a.desc}</p>}</div>
                  <span className="addon-price">{a.price}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="sec">
          <div className="wrap">
            <h2><Hl text={c.titles.features} /></h2>
            <div className="ft-grid">
              {(c.features || []).map((f) => (
                <div key={f.title} className="ft">
                  <span className="ic-ring" aria-hidden="true"><Icon name={f.icon} size={24} /></span>
                  <div><h3>{f.title}</h3><p>{f.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <AdvancedFeatures lang={c.lang} />
        <PreviousWork lang={c.lang} />

        <section id="faq" className="sec">
          <div className="wrap narrow">
            <h2>{copy.faq}</h2>
            <div className="faq">
              {faq.map(([q, a], i) => (
                <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>
              ))}
            </div>
            <div className="cta-row" style={{ justifyContent: "center", marginTop: 24 }}>
              <a className="btn" href={waLink(en ? "Store subscription" : "اشتراك المتجر")} target="_blank" rel="noopener">{copy.faqCta}</a>
            </div>
          </div>
        </section>
        <Contact c={c} t={t} waLink={waLink} />
      </main>
      <SiteFooter c={c} />
    </>
  );
}
