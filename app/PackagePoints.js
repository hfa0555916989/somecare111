import { BIG_STORE_SHOWCASE, isBigStorePackage } from "@/lib/big-store";
export { StoreShowcase } from "./StoreShowcase";

const FREE_RE = /\s*[—–-]\s*(?:مجاناً|Free)\s*$/i;

export function splitPackageFeatures(features) {
  const core = [];
  const free = [];
  for (const raw of features || []) {
    const text = String(raw ?? "").trim();
    if (!text) continue;
    if (FREE_RE.test(text)) free.push(text.replace(FREE_RE, "").trim());
    else core.push(text);
  }
  return { core, free };
}

export function PackagePrice({ p }) {
  if (Array.isArray(p?.tiers) && p.tiers.length) {
    return (
      <div className="pk-tiers">
        {p.tiers.map((t) => (
          <p className="pk-price" key={t.label}>
            {t.label && <small>{t.label}</small>}
            <strong>{t.price}</strong>
            {t.unit && <span>{t.unit}</span>}
          </p>
        ))}
      </div>
    );
  }
  return (
    <p className="pk-price">
      {p.pricePrefix && <small>{p.pricePrefix}</small>}
      <strong>{p.price}</strong>
      {p.unit && <span>{p.unit}</span>}
    </p>
  );
}

export function PackagePoints({ features, lang }) {
  const { core, free } = splitPackageFeatures(features);
  const en = lang === "en";
  return (
    <div className="pk-points">
      {core.length > 0 && (
        <ul>
          {core.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
      {free.length > 0 && (
        <div className="pk-free-block">
          <p className="pk-free-title">{en ? "Included at no extra cost" : "إضافات داخلة مجاناً"}</p>
          <ul className="pk-free-list">
            {free.map((f) => (
              <li key={f}>
                {f} <span className="pk-free">{en ? "Free" : "مجاناً"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function packageShowcase(p) {
  return isBigStorePackage(p) ? BIG_STORE_SHOWCASE : null;
}
