// الدعم الفني: مجاني أول سنة مع الدومين والاستضافة، ثم 200 ريال للسنة الثانية.
export const FIRST_YEAR_SUPPORT_AR = "الدعم الفني مجاني أول سنة مع الدومين والاستضافة";
export const SECOND_YEAR_SUPPORT_AR = "السنة الثانية: الدعم بـ 200 ريال للسنة";
export const FIRST_YEAR_SUPPORT_EN = "Technical support is free for the first year, together with the domain and hosting";
export const SECOND_YEAR_SUPPORT_EN = "From the second year: support is 200 SAR for the full year";

export const SUPPORT_ADDON_AR = {
  icon: "headset",
  title: "الدعم الفني",
  desc: `${FIRST_YEAR_SUPPORT_AR}. ${SECOND_YEAR_SUPPORT_AR}.`,
  price: "مجاناً أول سنة",
};

export const SUPPORT_ADDON_EN = {
  title: "Technical support",
  desc: `${FIRST_YEAR_SUPPORT_EN}. ${SECOND_YEAR_SUPPORT_EN}.`,
  price: "Free the first year",
};

const OLD_SUPPORT_PRICE = /(?<!\d)7[,\s٬]?200(?!\d)(?:\s*\/\s*سنوي(?:اً)?|\s*ريال(?:اً|ا)?(?:\s*\/\s*سنوي(?:اً)?|\s*سنوياً)?)?/gi;

export function isSupportAddon(item) {
  return /دعم|support/i.test(String(item?.title || ""));
}

export function upgradeSupportAddons(list, en = false) {
  const template = en ? SUPPORT_ADDON_EN : SUPPORT_ADDON_AR;
  const source = Array.isArray(list) ? list : [];
  let used = false;
  const out = [];
  for (const item of source) {
    if (!item || typeof item !== "object") continue;
    if (!isSupportAddon(item)) {
      out.push(item);
      continue;
    }
    if (used) continue;
    used = true;
    out.push({
      ...item,
      icon: item.icon || template.icon || "headset",
      title: template.title,
      desc: template.desc,
      price: template.price,
    });
  }
  if (!used) out.push({ ...template });
  return out;
}

export function withSupportTerms(pkg, en = false) {
  if (!pkg || typeof pkg !== "object") return pkg;
  const lines = en ? [FIRST_YEAR_SUPPORT_EN, SECOND_YEAR_SUPPORT_EN] : [FIRST_YEAR_SUPPORT_AR, SECOND_YEAR_SUPPORT_AR];
  const hadFeatures = Array.isArray(pkg.features) && pkg.features.length > 0;
  const features = hadFeatures ? [...pkg.features] : [];
  if (hadFeatures || !en) {
    for (const line of lines) {
      if (!features.includes(line)) features.push(line);
    }
  }
  const sentence = `${lines[0]}. ${lines[1]}.`;
  let desc = String(pkg.desc || "").trim();
  if (desc && !/السنة الثانية|second year/i.test(desc)) desc = `${desc} ${sentence}`;
  return { ...pkg, ...(desc ? { desc } : {}), ...(hadFeatures || !en ? { features } : {}) };
}

export function scrubOldSupportPrice(value) {
  if (typeof value === "string") return value.replace(OLD_SUPPORT_PRICE, SECOND_YEAR_SUPPORT_AR);
  if (Array.isArray(value)) return value.map(scrubOldSupportPrice);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = scrubOldSupportPrice(item);
    return out;
  }
  return value;
}
