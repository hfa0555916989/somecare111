// يُزال الاسم الشخصي من كل النصوص المعروضة، بما فيها المحتوى المحفوظ في قاعدة البيانات.
const RULES = [
  [/حسن\s*فايز\s*عبد\s*الرحمن\s*ال[أا]سمري/g, "المطور حسن"],
  [/حسن\s*فايز\s*عبدالرحمن\s*ال[أا]سمري/g, "المطور حسن"],
  [/حسن\s*فايز\s*ال[أا]سمري/g, "المطور حسن"],
  [/Hassan\s+Fayez(?:\s+Al[-\s]?Asmari)?/gi, "Developer Hassan"],
  [/Al[-\s]?Asmari/gi, "Hassan"],
  [/حسن\s*فايز/g, "المطور حسن"],
  [/ال[أا]سمري/g, "المطور حسن"],
];

export function scrubNames(value) {
  if (typeof value === "string") return RULES.reduce((s, [re, to]) => s.replace(re, to), value);
  if (Array.isArray(value)) return value.map(scrubNames);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = scrubNames(v);
    return out;
  }
  return value;
}
