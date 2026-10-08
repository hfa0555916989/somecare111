import { redis } from "./content";
import { putPrivate, addFile, privateEnabled } from "./storage";
import { TYPES, totals } from "./docs";

// أرشفة إجبارية لكل عرض أو عقد يوافق عليه العميل: نسخة البيانات مع البصمة + صفحة الوثيقة كما ظهرت له
// تُحفظ في المخزن الخاص وتُسجَّل في الأرشيف مقفلة (لا تُحذف ولا يتغير تصنيفها)
export async function archiveAcceptedDoc(doc, site) {
  if (!doc || doc.status !== "accepted" || !privateEnabled()) return null;
  const r = redis();
  if (!r) return null;
  const cat = doc.type === "contract" ? "contract" : "quote";
  const date = String(doc.acceptance?.at || doc.date || "").slice(0, 10) || doc.date;
  const year = String(date).slice(0, 4);
  const base = `archive/${year}/${cat}/${String(doc.number).replace(/[^\w-]+/g, "-")}`;
  const title = `${TYPES[doc.type] || "وثيقة"} ${doc.number}${doc.title ? " - " + doc.title : ""}`;
  const client = doc.client?.company || doc.client?.name || "";
  const meta = { cat, date, client, docRef: doc.number, amount: totals(doc).total, locked: true };

  const { token, ...data } = doc;
  const json = JSON.stringify({ archivedAt: new Date().toISOString(), link: `${site}/doc/${token}`, doc: data }, null, 2);
  const jb = await putPrivate(`${base}.json`, json, "application/json");
  const jsonFile = await addFile({ ...jb, name: `${doc.number}.json`, size: Buffer.byteLength(json) }, { ...meta, title: `${title} (بيانات موثّقة)`, note: `بصمة SHA-256: ${doc.acceptance?.hash || ""}` }, "auto-contract");

  // صفحة الوثيقة كما يراها العميل (أفضل محاولة: لا تمنع الأرشفة لو فشلت)
  let htmlFile = null;
  try {
    const res = await fetch(`${site}/doc/${token}`, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const html = (await res.text()).replace(/<head>/i, `<head><base href="${site}/">`);
      const hb = await putPrivate(`${base}.html`, html, "text/html; charset=utf-8");
      htmlFile = await addFile({ ...hb, name: `${doc.number}.html`, size: Buffer.byteLength(html) }, { ...meta, title: `${title} (نسخة الصفحة)` }, "auto-contract");
    }
  } catch (e) {
    console.error("Doc HTML snapshot failed", e);
  }

  const archive = { jsonFileId: jsonFile.id, htmlFileId: htmlFile?.id || "", at: new Date().toISOString() };
  const cur = await r.hget("docs", doc.id);
  if (cur) await r.hset("docs", { [doc.id]: { ...cur, archive } });
  return archive;
}

// الوثائق الموافق عليها سابقاً ولم تُؤرشف بعد (عند ربط المخزن الخاص لأول مرة)
export async function archivePending(docs, site, limit = 10) {
  const pending = docs.filter((d) => d.status === "accepted" && !d.archive?.jsonFileId).slice(0, limit);
  const done = [];
  for (const d of pending) {
    try {
      if (await archiveAcceptedDoc(d, site)) done.push(d.number);
    } catch (e) {
      console.error("Archive failed", d.number, e);
    }
  }
  return { done, remaining: docs.filter((d) => d.status === "accepted" && !d.archive?.jsonFileId).length - done.length };
}
