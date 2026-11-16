// الرقم القديم 0530779934 كان محفوظاً في قاعدة البيانات ويتغلّب على القيم الافتراضية
const OLD_CONTACT = new Set(["0530779934", "530779934", "966530779934"]);
const isOldContact = (v) => OLD_CONTACT.has(String(v || "").replace(/\D/g, ""));

export function scrubOldContact(value) {
  if (!value || typeof value !== "object") return value;
  const next = { ...value };
  if (next.contact && typeof next.contact === "object") {
    const contact = { ...next.contact };
    if (isOldContact(contact.phone)) contact.phone = "0555916989";
    if (isOldContact(contact.whatsapp)) contact.whatsapp = "966555916989";
    next.contact = contact;
  }
  if (next.en && typeof next.en === "object") next.en = scrubOldContact(next.en);
  return next;
}
