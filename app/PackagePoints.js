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
