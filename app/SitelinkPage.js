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
import { DemoGallery } from "./StoreShowcase";
import PreviousWork from "./PreviousWork";
import { PREVIOUS_WORK_COPY } from "@/lib/previous-work";

const COPY = {
  ar: {
    servicesLead: "أبني من الرياض نسخة مستقلة من المتجر لكل عميل، مع اشتراك شهري أو شراء لمرة واحدة، وإلى جانبها خدمات الأمن السيبراني للشركات.",
    worksLead: PREVIOUS_WORK_COPY.ar.lead,
    demoLead: "وهذه نماذج من المتجر التجريبي ولوحة التحكم، لترى الواجهة والطلب والإدارة قبل أن تطلب التنفيذ.",
    packagesLead: "الاشتراك هو الخيار الذي نوصي به: تجهيز من 2,000 إلى 3,000 ريال مرة واحدة، ثم 300 إلى 500 ريال شهرياً بدون تطبيقات أو 700 إلى 1,000 مع التطبيقات، وسنوياً بشهرين مجاناً. الشراء من 12,000 إلى 18,000 ريال للمتجر أو 20,000 إلى 30,000 مع التطبيقين.",
    blogLead: "مقالات عن إنشاء المتاجر والتطبيقات، والأسعار فيها هي نطاقات الاشتراك والشراء الحالية.",
    guides: "صفحات الشرح",
    posts: "المقالات",
    demoLogin: "دخول لوحة التحكم التجريبية",
    email: "البريد",
    password: "كلمة المرور",
    openDemo: "افتح المتجر التجريبي",
    openAdmin: "لوحة التحكم",
    ask: "اطلب هذه الخدمة",
    services: [
      { href: "/packages", title: "الاشتراك", text: "الخيار الذي نوصي به: تجهيز من 2,000 إلى 3,000 ريال، ثم 300 إلى 500 شهرياً بدون تطبيقات أو 700 إلى 1,000 مع التطبيقات." },
      { href: "/app-design-saudi", title: "تطبيقات الجوال", text: "تطبيق iOS وAndroid بهوية المتجر ضمن الاشتراك أو الشراء، مع إشعارات الدفع عند التسليم. النشر يعتمد على مراجعة المتاجر وغالباً من أسبوع إلى أسبوعين." },
      { href: "/create-online-store", title: "متجر إلكتروني", text: "نسخة مستقلة مع لوحة تاجر. الشراء من 12,000 إلى 18,000 ريال، أو مع التطبيقين من 20,000 إلى 30,000." },
      { href: "/security", title: "الأمن السيبراني", text: "خدمات الأمن للشركات بالشراكة مع فريق متخصص، في صفحة مستقلة بتفاصيلها وعرضها." },
    ],
  },
  en: {
    servicesLead: "From Riyadh: an independent store for each client, on a monthly subscription or a one-time purchase, plus enterprise cybersecurity.",
    worksLead: PREVIOUS_WORK_COPY.en.lead,
    demoLead: "Below are screenshots of the demo store and its admin panel, so you can see the shop, the cart and the dashboard before you order.",
    packagesLead: "The subscription is what we recommend: setup 2,000–3,000 SAR once, then 300–500 SAR per month without apps or 700–1,000 with apps, and two months free on the annual plan. Purchase is 12,000–18,000 SAR for the store or 20,000–30,000 with both apps.",
    blogLead: "The articles are in Arabic. They describe the current subscription and purchase ranges.",
    guides: "Guides",
    posts: "Articles",
    demoLogin: "Demo admin login",
    email: "Email",
    password: "Password",
    openDemo: "Open the live demo store",
    openAdmin: "Admin panel",
    ask: "Ask about this service",
    services: [
      { href: "/en/packages", title: "Subscription", text: "The option we recommend: setup 2,000–3,000 SAR, then 300–500 per month without apps or 700–1,000 with apps." },
      { href: "/app-design-saudi", title: "Mobile apps", text: "Branded iOS and Android apps on the subscription or the purchase, with push notifications at delivery. Publishing depends on store review, usually about one to two weeks." },
      { href: "/create-online-store", title: "Online store", text: "An independent instance with a merchant dashboard. Purchase is 12,000–18,000 SAR, or 20,000–30,000 with both apps." },
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
                <p className="page-cta">
                  <a className="btn" href={`${home}/contact`}>
                    {c.lang === "en" ? "Contact" : "تواصل معنا"}
                  </a>
                </p>
              </>
            )}
            {id === "works" && (
              <>
                <PreviousWork lang={c.lang} showHeading={false} />
                <h2>{c.lang === "en" ? "Demo store" : "المتجر التجريبي"}</h2>
                <p className="sub">{copy.demoLead}</p>
                <DemoGallery lang={c.lang} />
                <DemoAccess lang={c.lang} />
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
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <SiteFooter c={c} />
    </>
  );
}
