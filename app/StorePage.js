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
import StoreCare from "./StoreCare";
import { STORE_CARE } from "@/lib/store-care";

const FAQ = {
  ar: [
    ["كم تكلفة إنشاء المتجر؟", "1,500 ريال شراءً لمرة واحدة بدون اشتراكات، بكل المزايا الحالية، ويشمل ربط بوابات الدفع وشركات الشحن، واستضافة مجانية لمدة سنة، ودعماً فنياً مجانياً لمدة سنة، ودوميناً مجانياً. والموقع التعريفي بـ 350 ريال."],
    ["هل فيه اشتراك شهري؟", "لا. تدفع 1,500 ريال مرة واحدة فقط، والاستضافة والدعم الفني مجاناً لمدة سنة كاملة، والدومين مجاني."],
    ["هل بوابات الدفع والشحن متاحة؟", "نعم. ميسر وتابي وتمارا والراجحي والدفع عند الاستلام، وأرامكس وسمسا وأوتو وطرود والبريد السعودي، جزء من المنصة وربطها داخل السعر. فاتورة زاتكا مع رمز QR كذلك."],
    ["ما الفرق بين إصلاح العطل والميزة الجديدة؟", "إصلاح العطل خلل في ما تم تسليمه، ويشمله الدعم الفني المجاني لمدة سنة. الميزات الجديدة تتسعّر بشكل منفصل."],
    ["كم يستغرق التسليم؟", "التسليم سريع ويتوقف على تسليمك للمحتوى في وقته. لا نعد بعدد أيام ثابت."],
    [STORE_CARE.ar.faqQ, STORE_CARE.ar.faqA],
  ],
  en: [
    ["What does the store cost?", "1,500 SAR as a one-time purchase with no subscriptions, with every current feature, payment gateway and shipping carrier integration, free hosting for one year, free technical support for one year, and a free domain. A business website is 350 SAR."],
    ["Is there a monthly fee?", "No. You pay 1,500 SAR once. Hosting and technical support are free for a full year, and the domain is free."],
    ["Are payment and shipping available?", "Yes. Moyasar, Tabby, Tamara, Al Rajhi and cash on delivery, and Aramex, SMSA, OTO, Torod and Saudi Post, are part of the platform and connected within the price. The ZATCA QR invoice is included too."],
    ["What is a bug fix versus a new feature?", "A bug fix is a defect in what was delivered, and it is covered by the free year of technical support. A new feature is quoted separately."],
    ["How long does delivery take?", "Delivery is fast and depends on you providing the content on time. We do not promise a fixed number of days."],
    [STORE_CARE.en.faqQ, STORE_CARE.en.faqA],
  ],
};

const HERO = {
  ar: {
    badge: "شراء بدون اشتراكات",
    h1Before: "متجرك الإلكتروني الجاهز ",
    h1Mark: "بـ 1,500 ريال فقط",
    lead: OFFER_DESC_AR,
    primary: "اطلب المتجر على واتساب",
    secondary: "تفاصيل السعر",
    packages: "سعر المتجر",
    packagesSub: "شراء لمرة واحدة بالريال السعودي. التسليم سريع ويتوقف على وصول المحتوى في وقته.",
    order: "اطلب هذه الباقة",
    faq: "أسئلة عن السعر والتسليم",
    faqCta: "تواصل مع المطور حسن على واتساب",
  },
  en: {
    badge: "One-time purchase, no subscriptions",
    h1Before: "Your ready online store ",
    h1Mark: "for only 1,500 SAR",
    lead: OFFER_DESC_EN,
    primary: "Order the store on WhatsApp",
    secondary: "Pricing",
    packages: "Store price",
    packagesSub: "A one-time purchase in Saudi riyals. Delivery is fast and depends on the content arriving on time.",
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
              <a className="btn" href={waLink(en ? "Online store for 1,500 SAR" : "المتجر بـ 1500 ريال")} target="_blank" rel="noopener">{copy.primary}</a>
              <a className="btn btn-ghost" href="#packages">{copy.secondary}</a>
            </div>
          </div>
        </section>

        <section id="packages" className="sec">
          <div className="wrap">
            <h2>{copy.packages}</h2>
            <p className="sub">{copy.packagesSub}</p>
            <div className="pk-grid">
              {/* صفحة المتاجر تعرض باقات المتجر فقط، والمواقع والتطبيقات الخدمية في الرئيسية وصفحة الباقات */}
              {(c.packages || []).filter((p) => !p.oneTime).map((p) => (
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
              <a className="btn" href={waLink(en ? "Online store for 1,500 SAR" : "المتجر بـ 1500 ريال")} target="_blank" rel="noopener">{copy.faqCta}</a>
            </div>
          </div>
        </section>
        <StoreCare lang={c.lang} />
        <Contact c={c} t={t} waLink={waLink} />
      </main>
      <SiteFooter c={c} />
    </>
  );
}
