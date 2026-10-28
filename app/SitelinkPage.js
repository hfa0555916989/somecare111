import { getContent } from "@/lib/content";
import { localize, prefix, ui } from "@/lib/i18n";
import { siteUrl } from "@/lib/defaults";
import { isBigStorePackage } from "@/lib/big-store";
import { SEO_PAGES } from "@/lib/seo-pages";
import { DEMO_ADMIN_URL, DEMO_EMAIL, DEMO_PASSWORD, DEMO_URL } from "@/lib/demo-media";
import { breadcrumbJsonLd, navItem } from "@/lib/sitelinks";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import { Icon } from "./Icons";
import { About, Contact, makeWaLink, WaIcon } from "./HomePage";
import { PackagePoints, PackagePrice, StoreShowcase, packageShowcase } from "./PackagePoints";
import { NOTE_AR, NOTE_EN } from "@/lib/platform-offer";
import PriceAddendum from "./PriceAddendum";
import { DemoGallery } from "./StoreShowcase";
import PreviousWork from "./PreviousWork";
import StoreCare from "./StoreCare";

const COPY = {
  ar: {
    servicesLead: "أبني من الرياض أربعة مسارات واضحة: موقع يعرّف بنشاطك، تطبيق جوال، متجر إلكتروني مع تطبيق، وخدمات أمن سيبراني للشركات.",
    worksLead: "هذه نماذج حقيقية من المتجر التجريبي ولوحة التحكم، لترى الواجهة والطلب والإدارة قبل أن تطلب التنفيذ.",
    packagesLead: "الأسعار الظاهرة هي أسعار الباقات الحالية. التجهيز 2,000 ريال مرة واحدة. الاشتراك: أساسية 300 ريال شهرياً، أو متقدمة 500، ومع التطبيقات 700 أو 1,000، وسنوياً بشهرين مجاناً. الشراء من 12,000 ريال للمتجر، أو من 20,000 مع التطبيقين، ثم صيانة 500 أو 800 ريال شهرياً بعد شهر إلى شهرين من إصلاح الأعطال. الدفع مقدّم. المواقع والتطبيقات الخدمية بسعر ثابت: موقع تعريفي 1,499 ريال، وموقع خدمي من 7,900، وتطبيق خدمي 13,500، وموقع خدمي مع تطبيق 17,900، ومع تطبيق لمقدّم الخدمة 20,000.",
    blogLead: "مقالات عن انشاء المتاجر والتطبيقات وأسعارها. المتجر من 300 ريال شهرياً، وعنوان المتجر مع التطبيق يذكر باشتراك من 700 ريال شهرياً.",
    guides: "صفحات الشرح",
    posts: "المقالات",
    demoLogin: "دخول لوحة التحكم التجريبية",
    email: "البريد",
    password: "كلمة المرور",
    openDemo: "افتح المتجر التجريبي",
    openAdmin: "لوحة التحكم",
    ask: "اطلب هذه الخدمة",
    services: [
      { href: "/packages", title: "مواقع تعريفية", text: "موقع يعرض خدمتك ورقم التواصل ونموذج الطلب، مناسب إن لم تكن تبيع منتجات بسلة شراء." },
      { href: "/app-design-saudi", title: "تطبيقات الجوال", text: "تطبيق المتجر على iOS وAndroid داخل باقة من 2,000 ريال للتجهيز، والاشتراك مع التطبيق من 700 ريال شهرياً، أو الشراء مع المتجر من 20,000 ريال، والدفع والشحن والدومين مجاناً." },
      { href: "/create-online-store", title: "متجر إلكتروني مع تطبيق", text: "منتجات غير محدودة، سلة، لوحة تحكم، وتطبيق جوال. السعر من 2,000 ريال للتجهيز، والاشتراك مع التطبيق من 700 ريال شهرياً، أو الشراء مع التطبيقين من 20,000 ريال، والدفع والشحن والدومين مجاناً." },
      { href: "/security", title: "الأمن السيبراني", text: "خدمات الأمن للشركات بالشراكة مع فريق متخصص، في صفحة مستقلة بتفاصيلها وعرضها." },
    ],
  },
  en: {
    servicesLead: "Four clear paths from Riyadh: a business website, a mobile app, an online store with an app, and enterprise cybersecurity.",
    worksLead: "Real screenshots of the demo store and its admin panel, so you can see the shop, the cart and the dashboard before you order.",
    packagesLead: "These are the current packages. Setup is 2,000 SAR once. Subscription: Basic 300 SAR per month, Advanced 500, or 700 and 1,000 with the apps, with two months free on the annual plan. Purchase is from 12,000 SAR for the store, or from 20,000 with both apps, then maintenance is 500 or 800 SAR per month after one to two months of bug fixes. Payment is prepaid. Websites and service apps have fixed prices: a business website is 1,499 SAR, a service website from 7,900, a service app 13,500, a service website with an app 17,900, and with a provider app 20,000.",
    blogLead: "The articles are written in Arabic. A store alone is from 300 SAR/month. A title about the store with the app states a subscription from 700 SAR/month.",
    guides: "Guides",
    posts: "Articles",
    demoLogin: "Demo admin login",
    email: "Email",
    password: "Password",
    openDemo: "Open the live demo store",
    openAdmin: "Admin panel",
    ask: "Ask about this service",
    services: [
      { href: "/en/packages", title: "Business websites", text: "A site that presents your service, phone number and inquiry form when you are not selling through a cart." },
      { href: "/app-design-saudi", title: "Mobile apps", text: "The store app for iOS and Android is inside the package from 2,000 SAR setup, subscription with the app from 700 SAR/month, or purchase with both apps from 20,000 SAR, with payment, shipping and the domain included free." },
      { href: "/create-online-store", title: "Online store with an app", text: "Unlimited products, cart, admin panel and a mobile app from 2,000 SAR setup, subscription with the app from 700 SAR/month, or purchase with both apps from 20,000 SAR. Payment, shipping and the domain are free." },
      { href: "/en/security", title: "Cybersecurity", text: "Enterprise security services with a specialist partner, on their own page with the offer details." },
    ],
  },
};

function Crumbs({ lang, page }) {
  const en = lang === "en";
  const home = prefix(lang) || "/";
  return (
    <nav className="crumbs" aria-label={en ? "Breadcrumb" : "مسار التنقل"}>
      <a href={home}>{en ? "Home" : "الرئيسية"}</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{en ? page.en : page.ar}</span>
    </nav>
  );
}

function DemoAccess({ lang }) {
  const t = COPY[lang] || COPY.ar;
  return (
    <aside className="demo-login">
      <p>{t.demoLogin}</p>
      <p>
        {t.email}: <b dir="ltr">{DEMO_EMAIL}</b>
      </p>
      <p>
        {t.password}: <b dir="ltr">{DEMO_PASSWORD}</b>
      </p>
      <a href={DEMO_URL} target="_blank" rel="noopener">
        {t.openDemo}
      </a>
      {" · "}
      <a href={DEMO_ADMIN_URL} target="_blank" rel="noopener">
        {t.openAdmin}
      </a>
    </aside>
  );
}

function BlogList({ lang }) {
  const t = COPY[lang] || COPY.ar;
  const posts = SEO_PAGES.filter((p) => p.kind === "post");
  const guides = SEO_PAGES.filter((p) => p.kind === "landing");
  return (
    <>
      <p className="sub">{t.blogLead}</p>
      <PriceAddendum lang={lang} />
      <h2 className="sec-h3">{t.posts}</h2>
      <ul className="link-list">
        {posts.map((p) => (
          <li key={p.id}>
            <a href={p.path}>{p.h1}</a>
            <p>{p.description}</p>
          </li>
        ))}
      </ul>
      <h2 className="sec-h3">{t.guides}</h2>
      <ul className="link-list">
        {guides.map((p) => (
          <li key={p.id}>
            <a href={p.path}>{p.h1}</a>
            <p>{p.description}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default async function SitelinkPage({ id, lang }) {
  const page = navItem(id);
  const c = localize(await getContent(), lang);
  const t = ui(c.lang);
  const copy = COPY[c.lang] || COPY.ar;
  const wa = makeWaLink(c);
  const home = prefix(c.lang);
  const ld = breadcrumbJsonLd(siteUrl(c), c.lang, page);
  const h1 = c.lang === "en" ? page.en : page.ar;
  const wide = id === "packages" || id === "works";

  return (
    <>
      <SiteHeader c={c} icon={<WaIcon size={18} />} altPath={page.path} />
      <main className="page-main">
        <div className="wrap narrow">
          <Crumbs lang={c.lang} page={page} />
        </div>
        {id === "about" && c.about?.show !== false && <About a={c.about} t={t} heading="h1" title={h1} />}
        {id === "contact" && <Contact c={c} t={t} waLink={wa} heading="h1" title={h1} />}
        {id !== "about" && id !== "contact" && (
          <div className={wide ? "wrap" : "wrap narrow"}>
            <h1>{id === "packages" && c.lang !== "en" ? "الباقات والأسعار" : h1}</h1>
            {id === "services" && (
              <>
                <p className="sub">{copy.servicesLead}</p>
                <div className="svc-list">
                  {copy.services.map((s) => (
                    <article key={s.href} className="svc-card">
                      <h2>{s.title}</h2>
                      <p>{s.text}</p>
                      <a className="more-link" href={s.href}>
                        {copy.ask}
                      </a>
                    </article>
                  ))}
                </div>
                <PriceAddendum lang={c.lang} />
                <p className="page-cta">
                  <a className="btn" href={`${home}/contact`}>
                    {c.lang === "en" ? "Contact" : "تواصل معنا"}
                  </a>
                </p>
              </>
            )}
            {id === "works" && (
              <>
                <p className="sub">{copy.worksLead}</p>
                <DemoGallery lang={c.lang} />
                <DemoAccess lang={c.lang} />
                <PreviousWork lang={c.lang} />
                {c.gallery?.length > 0 && (
                  <div className="gal">
                    {c.gallery.map((g, i) => (
                      <figure key={i}>
                        <a href={g.src} target="_blank" rel="noopener">
                          <img src={g.src} alt={g.caption || h1} loading="lazy" />
                        </a>
                        {g.caption && <figcaption>{g.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                )}
              </>
            )}
            {id === "packages" && (
              <>
                <p className="sub">{copy.packagesLead}</p>
                <p className="pk-included-note">{c.lang === "en" ? NOTE_EN : NOTE_AR}</p>
                <div className="pk-grid">
                  {(c.packages || []).map((p, i) => (
                    <article key={i} id={isBigStorePackage(p) ? "big-store" : undefined} className={"pk" + (p.featured ? " pk-featured" : "")}>
                      <div className="pk-head">
                        {p.icon && (
                          <span className="ic-ring">
                            <Icon name={p.icon} size={26} />
                          </span>
                        )}
                        <div>
                          {p.label && <p className="pk-label">{p.label}</p>}
                          <h2>{p.name}</h2>
                        </div>
                      </div>
                      <PackagePrice p={p} />
                      {p.desc && <p className="pk-desc">{p.desc}</p>}
                      <PackagePoints features={p.features} lang={c.lang} />
                      <StoreShowcase data={packageShowcase(p)} lang={c.lang} />
                      <a className={"btn" + (p.featured ? "" : " btn-ghost")} href={wa(p.name)} target="_blank" rel="noopener">
                        {t.orderPackage}
                      </a>
                    </article>
                  ))}
                </div>
              </>
            )}
            {id === "blog" && <BlogList lang={c.lang} />}
          </div>
        )}
        {id === "packages" && <StoreCare lang={c.lang} />}
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <SiteFooter c={c} />
    </>
  );
}
