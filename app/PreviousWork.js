import { Hl } from "./Icons";
import { PREVIOUS_WORK, PREVIOUS_WORK_COPY } from "@/lib/previous-work";

function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function PreviousWork({ lang, showHeading = true }) {
  const copy = lang === "en" ? PREVIOUS_WORK_COPY.en : PREVIOUS_WORK_COPY.ar;
  const Heading = showHeading ? "h2" : "p";
  return (
    <section id="previous-work" className={showHeading ? "sec sec-alt" : "previous-work-embed"}>
      <div className="wrap">
        {showHeading ? <h2><Hl text={copy.title} /></h2> : <Heading className="sub previous-work-lead">{copy.lead}</Heading>}
        {showHeading && <p className="sub">{copy.lead}</p>}
        <div className="work-grid">
          {PREVIOUS_WORK.map((item) => {
            const name = lang === "en" ? item.nameEn : item.nameAr;
            const desc = lang === "en" ? item.descEn : item.descAr;
            return (
              <article key={item.id} className="work-card">
                <a className="work-phone" href={item.url} target="_blank" rel="noopener noreferrer">
                  <span className="work-phone-speaker" aria-hidden="true" />
                  <img src={item.image} alt={name} width={390} height={844} loading="lazy" decoding="async" />
                </a>
                <div className="work-body">
                  <h3>{name}</h3>
                  <p>{desc}</p>
                  <a className="more-link" href={item.url} target="_blank" rel="noopener noreferrer">
                    {copy.visit} <span dir="ltr">{hostOf(item.url)}</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
