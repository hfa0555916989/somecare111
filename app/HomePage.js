import { getContent } from "@/lib/content";
import { localize, ui } from "@/lib/i18n";
import { SiteHeader, SiteFooter, SocialRow } from "./SiteChrome";
import { Icon, Hl, plain } from "./Icons";
import ContactForm from "./ContactForm";
import { turnstileSiteKey } from "@/lib/turnstile";

// روابط النسختين لجوجل (hreflang)
export const homeAlternates = (lang) => ({
  canonical: lang === "en" ? "/en" : "/",
  languages: { "ar-SA": "/", en: "/en", "x-default": "/" },
});

const digits = (s) => String(s || "").replace(/\D/g, "");

function youtubeId(url) {
  const m = String(url || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function WaIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// الصفحة الرئيسية بالعربية (/) أو الإنجليزية (/en)
export default async function HomePage({ lang }) {
  const c = localize(await getContent(), lang);
  const t = ui(c.lang);
  const sec = c.security || {};
  const showSecurity = sec.show !== false && !!sec.title;
  const waLink = makeWaLink(c);
  const yt = youtubeId(c.video.url);

  return (
    <>
      <SiteHeader c={c} icon={<WaIcon size={18} />} />

      <main id="top">
        <section className="hero">
          <div className="wrap hero-in">
            <div className="hero-text">
              <p className="hero-badge">{c.hero.badge}</p>
              <h1><Hl text={c.hero.title} /></h1>
              <p className="lead">{c.hero.subtitle}</p>
              <div className="cta-row">
                <a className="btn" href={waLink()} target="_blank" rel="noopener">
                  <WaIcon /> {c.hero.primaryButton}
                </a>
                <a className="btn btn-ghost" href="#packages">
                  {c.hero.secondaryButton}
                </a>
              </div>
              <p className="avail">{c.contact.availability}</p>
            </div>
            <div className="hero-media">
              {c.hero.image && <img src={c.hero.image} alt="" />}
            </div>
          </div>
        </section>

        <section id="packages" className="sec">
          <div className="wrap">
            <h2><Hl text={c.titles.packages} /></h2>
            <p className="sub">{c.titles.packagesSub}</p>
            <div className="pk-grid">
              {c.packages.map((p, i) => (
                <article key={i} className={"pk" + (p.featured ? " pk-featured" : "")}>
                  {p.image && <img className="pk-img" src={p.image} alt="" />}
                  <div className="pk-head">
                    {p.icon && <span className="ic-ring"><Icon name={p.icon} size={26} /></span>}
                    <div>
                      {p.label && <p className="pk-label">{p.label}</p>}
                      <h3>{p.name}</h3>
                    </div>
                  </div>
                  <p className="pk-price">
                    {p.pricePrefix && <small>{p.pricePrefix}</small>}
                    <strong>{p.price}</strong>
                    <span>{p.unit}</span>
                  </p>
                  {p.desc && <p className="pk-desc">{p.desc}</p>}
                  <ul>
                    {(p.features || []).map((f, j) => (
                      <li key={j}>{f}</li>
                    ))}
                  </ul>
                  <a className={"btn" + (p.featured ? "" : " btn-ghost")} href={waLink(p.name)} target="_blank" rel="noopener">
                    {t.orderPackage}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {showSecurity && <Security s={sec} t={t} waLink={waLink} />}

        <section id="addons" className="sec sec-alt">
          <div className="wrap narrow">
            <h2><Hl text={c.titles.addons} /></h2>
            {c.titles.addonsSub && <p className="sub">{c.titles.addonsSub}</p>}
            <div className="addons">
              {c.addons.map((a, i) => (
                <div key={i} className="addon">
                  {a.icon && <span className="ic-ring"><Icon name={a.icon} size={24} /></span>}
                  <div className="addon-txt">
                    <h3>{a.title}</h3>
                    {a.desc && <p>{a.desc}</p>}
                  </div>
                  <span className="addon-price">{a.price}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="wrap">
            <h2><Hl text={c.titles.features} /></h2>
            <div className="ft-grid">
              {c.features.map((f, i) => (
                <div key={i} className="ft">
                  <span className="ic-ring" aria-hidden="true"><Icon name={f.icon} size={24} /></span>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {c.trust?.show !== false && c.trust?.title && (
          <section id="trust" className="sec sec-alt">
            <div className="wrap">
              <h2><Hl text={c.trust.title} /></h2>
              {c.trust.subtitle && <p className="sub">{c.trust.subtitle}</p>}
              <div className="trust-grid">
                {(c.trust.points || []).map((p, i) => (
                  <div key={i} className="trust-card">
                    {p.icon && <span className="ic-ring" aria-hidden="true"><Icon name={p.icon} size={24} /></span>}
                    <div>
                      <h3>{p.title}</h3>
                      {p.desc && <p>{p.desc}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {(c.trust.note || c.trust.button) && (
                <div className="trust-cta">
                  {c.trust.note && <p>{c.trust.note}</p>}
                  {c.trust.button && (
                    <a className="btn" href={waLink(c.trust.button)} target="_blank" rel="noopener">
                      <WaIcon /> {c.trust.button}
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {c.about?.show !== false && c.about?.name && <About a={c.about} t={t} />}

        {c.gallery.length > 0 && (
          <section id="gallery" className="sec sec-alt">
            <div className="wrap">
              <h2><Hl text={c.titles.gallery} /></h2>
              <div className="gal">
                {c.gallery.map((g, i) => (
                  <figure key={i}>
                    <a href={g.src} target="_blank" rel="noopener">
                      <img src={g.src} alt={g.caption || ""} loading="lazy" />
                    </a>
                    {g.caption && <figcaption>{g.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {c.video.url && (
          <section className="sec">
            <div className="wrap narrow">
              <h2><Hl text={c.titles.video} /></h2>
              <div className="video">
                {yt ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${yt}`}
                    title="video"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <video src={c.video.url} controls playsInline preload="metadata" />
                )}
              </div>
            </div>
          </section>
        )}

        <Contact c={c} t={t} waLink={waLink} />
      </main>

      <SiteFooter c={c} />

      <a className="wa-float" href={waLink()} target="_blank" rel="noopener" aria-label={t.whatsapp}>
        <WaIcon size={30} />
      </a>
    </>
  );
}

// رابط واتساب برسالة جاهزة، ويُلحق بها اسم الباقة أو الخدمة إن وُجد
export function makeWaLink(c) {
  const wa = digits(c.contact.whatsapp);
  return (extra) =>
    `https://wa.me/${wa}?text=${encodeURIComponent(extra ? `${c.contact.message} - ${extra}` : c.contact.message)}`;
}

// قسم «تواصل معنا» (يُستخدم أيضاً في صفحة الأمن السيبراني)
export function Contact({ c, t, waLink, service }) {
  const sec = c.security || {};
  const showSecurity = sec.show !== false && !!sec.title;
  return (
    <section id="contact" className="contact">
      <div className="wrap narrow center">
        <h2><Hl text={c.titles.contact} /></h2>
        <p className="sub">{c.contact.availability}</p>
        <a className="btn btn-lg" href={waLink(service)} target="_blank" rel="noopener">
          <WaIcon size={26} /> {t.whatsapp} <span dir="ltr">{c.contact.phone}</span>
        </a>
        <p className="or">
          {t.callDirect} <a href={`tel:${digits(c.contact.phone)}`} dir="ltr">{c.contact.phone}</a>
        </p>
        {c.form?.show !== false && (
          <ContactForm
            title={c.form?.title}
            services={[...c.packages.map((p) => p.name), showSecurity ? plain(sec.navLabel || sec.title) : ""].filter(Boolean)}
            siteKey={turnstileSiteKey()}
            lang={c.lang}
          />
        )}
        <SocialRow c={c} />
      </div>
    </section>
  );
}

function About({ a, t }) {
  const lines = String(a.bio || "").split("\n").filter((l) => l.trim());
  return (
    <section id="about" className="sec">
      <div className="wrap">
        <h2><Hl text={a.title} /></h2>
        <div className="about">
          {a.photo && (
            <div className="about-photo">
              <img src={a.photo} alt={a.name} loading="lazy" />
            </div>
          )}
          <div className="about-txt">
            <h3>{a.name}</h3>
            {a.role && <p className="about-role">{a.role}</p>}
            {lines.map((l, i) => (
              <p key={i} className="about-bio">{l}</p>
            ))}
            {(a.highlights || []).length > 0 && (
              <ul className="about-hl">
                {a.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {(a.certImage || a.badgeImage) && (
          <div className="cert">
            <div className="cert-head">
              <span className="ic-ring"><Icon name="award" size={26} /></span>
              <div>
                <h3>{a.certTitle}</h3>
                {a.certText && <p>{a.certText}</p>}
              </div>
            </div>
            {(a.certNumber || a.certExpiry || a.verifyUrl) && (
              <div className="cert-facts">
                {a.certNumber && <span>{t.certNumber} <b dir="ltr">{a.certNumber}</b></span>}
                {a.certExpiry && <span>{t.certExpiry} <b>{a.certExpiry}</b></span>}
                {/^https?:\/\//i.test(a.verifyUrl || "") && (
                  <a href={a.verifyUrl} target="_blank" rel="noopener">{t.certVerify}</a>
                )}
              </div>
            )}
            {a.certImage && (
              <a className="cert-img" href={a.certImage} target="_blank" rel="noopener">
                <img src={a.certImage} alt={a.certTitle || t.certAlt} loading="lazy" />
              </a>
            )}
            {a.badgeImage && (
              <a className="cert-badge" href={a.badgeImage} target="_blank" rel="noopener">
                <img src={a.badgeImage} alt={t.badgeAlt} loading="lazy" />
              </a>
            )}
            {a.badgePdf && (
              <a className="btn btn-ghost btn-sm cert-pdf" href={a.badgePdf} target="_blank" rel="noopener" download>
                {t.badgePdf}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// باقة الأمن السيبراني للشركات (بالشراكة مع شركة الأمن السيبراني)
// heading: عنوان الصفحة h1 في صفحة الأمن السيبراني، و h2 في الصفحة الرئيسية
export function Security({ s, t, waLink, heading = "h2" }) {
  const H = heading;
  const p = s.partner || {};
  const httpUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");
  const partnerUrl = httpUrl(p.url);
  const list = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);
  const services = list(s.services);
  const solutions = list(s.solutions).filter((x) => x.name);
  const steps = list(s.steps).filter((x) => x.title);
  const gallery = list(s.gallery).filter((g) => g.src);
  return (
    <section id="security" className="sec sec-sec">
      <div className="wrap">
        {s.badge && <p className="hero-badge">{s.badge}</p>}
        <H className="sec-title"><Hl text={s.title} /></H>
        {s.subtitle && <p className="sub">{s.subtitle}</p>}

        {p.name && (
          <div className="partner">
            {p.logo && <img className="partner-logo" src={p.logo} alt={p.name} loading="lazy" />}
            <div className="partner-txt">
              <small>{t.partnerWith}</small>
              <h3>{p.name}{p.country && <span> · {p.country}</span>}</h3>
              {p.text && <p>{p.text}</p>}
            </div>
            {partnerUrl && (
              <a className="btn btn-ghost btn-sm" href={partnerUrl} target="_blank" rel="noopener">{t.partnerVisit}</a>
            )}
          </div>
        )}

        {s.image && <img className="sec-cover" src={s.image} alt="" loading="lazy" />}

        {services.length > 0 && (
          <div className="pk-grid">
            {services.map((x, i) => (
              <article key={i} className="pk">
                {x.image && <img className="pk-img" src={x.image} alt="" loading="lazy" />}
                <div className="pk-head">
                  {x.icon && <span className="ic-ring"><Icon name={x.icon} size={26} /></span>}
                  <h3>{x.title}</h3>
                </div>
                {x.desc && <p className="pk-desc">{x.desc}</p>}
                {list(x.points).length > 0 && (
                  <ul>
                    {list(x.points).map((pt, j) => <li key={j}>{pt}</li>)}
                  </ul>
                )}
                <div className="pk-actions">
                  <a className="btn btn-ghost btn-sm" href={waLink(x.title)} target="_blank" rel="noopener">
                    <WaIcon size={18} /> {t.orderService}
                  </a>
                  {httpUrl(x.url) && (
                    <a className="more-link" href={x.url} target="_blank" rel="noopener">{t.details}</a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {solutions.length > 0 && (
          <>
            {s.solutionsTitle && <h3 className="sec-h3">{s.solutionsTitle}</h3>}
            <div className="sol-grid">
              {solutions.map((x, i) => (
                <div key={i} className="sol">
                  {x.image && <img src={x.image} alt={x.name} loading="lazy" />}
                  <b dir="ltr">{x.name}</b>
                  {x.desc && <p>{x.desc}</p>}
                  {httpUrl(x.url) && (
                    <a className="more-link" href={x.url} target="_blank" rel="noopener">{t.details}</a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="sec-cols">
          {list(s.frameworks).length > 0 && (
            <div>
              {s.frameworksTitle && <h3 className="sec-h3">{s.frameworksTitle}</h3>}
              <div className="chips">
                {list(s.frameworks).map((f, i) => <span key={i} className="chip" dir="ltr">{f}</span>)}
              </div>
            </div>
          )}
          {list(s.sectors).length > 0 && (
            <div>
              {s.sectorsTitle && <h3 className="sec-h3">{s.sectorsTitle}</h3>}
              <div className="chips">
                {list(s.sectors).map((f, i) => <span key={i} className="chip">{f}</span>)}
              </div>
            </div>
          )}
        </div>

        {steps.length > 0 && (
          <>
            {s.stepsTitle && <h3 className="sec-h3">{s.stepsTitle}</h3>}
            <ol className="steps">
              {steps.map((x, i) => (
                <li key={i}>
                  <span className="step-n">{i + 1}</span>
                  <div>
                    <b>{x.title}</b>
                    {x.desc && <p>{x.desc}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}

        {gallery.length > 0 && (
          <div className="gal">
            {gallery.map((g, i) => (
              <figure key={i}>
                <a href={g.src} target="_blank" rel="noopener">
                  <img src={g.src} alt={g.caption || ""} loading="lazy" />
                </a>
                {g.caption && <figcaption>{g.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}

        {(s.price || s.button) && (
          <div className="sec-cta">
            {s.price && (
              <p className="pk-price">
                {s.priceLabel && <small>{s.priceLabel}</small>}
                <strong>{s.price}</strong>
              </p>
            )}
            {s.priceNote && <p className="sec-note">{s.priceNote}</p>}
            {s.button && (
              <a className="btn" href={waLink(plain(s.navLabel || s.title))} target="_blank" rel="noopener">
                <WaIcon /> {s.button}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
