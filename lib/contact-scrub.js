// الرقم السابق 0555916989 قد يكون محفوظاً في قاعدة البيانات ويتغلّب على القيم الافتراضية،
// فيُستبدل عند القراءة بالرقم المعتمد 0530779934
const OLD_CONTACT = new Set(["0555916989", "555916989", "966555916989"]);
const isOldContact = (v) => OLD_CONTACT.has(String(v || "").replace(/\D/g, ""));

export const CONTACT_PHONE = "0530779934";
export const CONTACT_WHATSAPP = "966530779934";

export function scrubOldContact(value) {
  if (!value || typeof value !== "object") return value;
  const next = { ...value };
  if (next.contact && typeof next.contact === "object") {
    const contact = { ...next.contact };
    if (isOldContact(contact.phone)) contact.phone = CONTACT_PHONE;
    if (isOldContact(contact.whatsapp)) contact.whatsapp = CONTACT_WHATSAPP;
    next.contact = contact;
  }
  // حساب X القديم @Hassan_dev_sa محظور، والجديد @hassandev_sa
  if (next.social && typeof next.social === "object" && /hassan_dev_sa/i.test(String(next.social.x || ""))) {
    next.social = { ...next.social, x: "https://x.com/hassandev_sa" };
  }
  if (next.en && typeof next.en === "object") next.en = scrubOldContact(next.en);
  return next;
}
