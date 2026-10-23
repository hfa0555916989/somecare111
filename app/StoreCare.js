import { STORE_CARE } from "@/lib/store-care";

export default function StoreCare({ lang = "ar" }) {
  const t = lang === "en" ? STORE_CARE.en : STORE_CARE.ar;
  return (
    <section className="sec store-care" id="store-updates" aria-labelledby="store-updates-title">
      <div className="wrap">
        <h2 id="store-updates-title">{t.title}</h2>
        <p className="sub">{t.lead}</p>
        <div className="care-grid">
          {t.points.map((point) => (
            <article key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
