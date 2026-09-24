import { getContent } from "@/lib/content";
import { SiteHeader, SiteFooter } from "./SiteChrome";

export const dynamic = "force-dynamic";

const digits = (s) => String(s || "").replace(/\D/g, "");

function youtubeId(url) {
  const m = String(url || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function WaIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default async function Home() {
  const c = await getContent();
  const wa = digits(c.contact.whatsapp);
  const waLink = (extra) =>
    `https://wa.me/${wa}?text=${encodeURIComponent(
      extra ? `${c.contact.message} - ${extra}` : c.contact.message
    )}`;
  const yt = youtubeId(c.video.url);

  return (
    <>
      <SiteHeader c={c} icon={<WaIcon size={18} />} />

      <main id="top">
        <section className="hero">
          <div className="wrap hero-in">
            <div className="hero-text">
              <p className="hero-badge">{c.hero.badge}</p>
              <h1>{c.hero.title}</h1>
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
            <h2>{c.titles.packages}</h2>
            <p className="sub">{c.titles.packagesSub}</p>
            <div className="pk-grid">
              {c.packages.map((p, i) => (
                <article key={i} className={"pk" + (p.featured ? " pk-featured" : "")}>
                  {p.image && <img className="pk-img" src={p.image} alt="" />}
                  <h3>{p.name}</h3>
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
                    اطلب هذه الباقة
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="addons" className="sec sec-alt">
          <div className="wrap narrow">
            <h2>{c.titles.addons}</h2>
            <div className="addons">
              {c.addons.map((a, i) => (
                <div key={i} className="addon">
                  <div>
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
            <h2>{c.titles.features}</h2>
            <div className="ft-grid">
              {c.features.map((f, i) => (
                <div key={i} className="ft">
                  <span className="ft-ic" aria-hidden="true">{f.icon}</span>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {c.gallery.length > 0 && (
          <section id="gallery" className="sec sec-alt">
            <div className="wrap">
              <h2>{c.titles.gallery}</h2>
              <div className="gal">
                {c.gallery.map((g, i) => (
                  <figure key={i}>
                    <img src={g.src} alt={g.caption || ""} loading="lazy" />
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
              <h2>{c.titles.video}</h2>
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

        <section id="contact" className="contact">
          <div className="wrap narrow center">
            <h2>{c.titles.contact}</h2>
            <p className="sub">{c.contact.availability}</p>
            <a className="btn btn-lg" href={waLink()} target="_blank" rel="noopener">
              <WaIcon size={26} /> واتساب {c.contact.phone}
            </a>
            <p className="or">
              أو اتصل مباشرة: <a href={`tel:${digits(c.contact.phone)}`} dir="ltr">{c.contact.phone}</a>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter c={c} />

      <a className="wa-float" href={waLink()} target="_blank" rel="noopener" aria-label="واتساب">
        <WaIcon size={30} />
      </a>
    </>
  );
}
