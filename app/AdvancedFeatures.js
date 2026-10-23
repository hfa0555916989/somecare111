import { ADVANCED_AR, ADVANCED_EN } from "@/lib/platform-offer";
import { Icon, Hl } from "./Icons";

export default function AdvancedFeatures({ lang }) {
  const data = lang === "en" ? ADVANCED_EN : ADVANCED_AR;
  return (
    <section id="advanced-features" className="sec sec-alt" aria-labelledby="advanced-title">
      <div className="wrap">
        <h2 id="advanced-title"><Hl text={data.title} /></h2>
        <p className="sub">{data.lead}</p>
        <div className="adv-grid">
          {data.groups.map((group) => (
            <article key={group.title} className="adv-card">
              <div className="pk-head">
                {group.icon && (
                  <span className="ic-ring" aria-hidden="true">
                    <Icon name={group.icon} size={24} />
                  </span>
                )}
                <h3>{group.title}</h3>
              </div>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
