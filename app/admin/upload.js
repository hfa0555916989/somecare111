"use client";
import { upload } from "@vercel/blob/client";

// رفع ملف إلى المخزن الخاص ثم تسجيله في الأرشيف (السنة/التصنيف)
const safe = (n) => String(n || "file").normalize("NFC").replace(/[\\/:*?"<>|#%\s]+/g, "-").replace(/-+/g, "-").slice(-100) || "file";
const today = () => new Date().toLocaleDateString("en-CA");

export async function uploadPrivate(file, meta = {}) {
  const date = meta.date || today();
  const cat = meta.cat || "other";
  let blob;
  try {
    blob = await upload(`archive/${date.slice(0, 4)}/${cat}/${safe(file.name)}`, file, {
      access: "private",
      handleUploadUrl: "/api/files/upload",
      contentType: file.type || undefined,
    });
  } catch {
    throw new Error("فشل رفع الملف: تأكد أن المخزن الخاص مربوط (PRIVATE_BLOB_READ_WRITE_TOKEN) وأنك ما زلت مسجّل الدخول.");
  }
  const r = await fetch("/api/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blob: { url: blob.url, pathname: blob.pathname, contentType: blob.contentType || file.type, size: file.size, name: file.name },
      meta: { title: meta.title || file.name.replace(/\.[^.]+$/, ""), ...meta, cat, date },
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "تعذر تسجيل الملف");
  return j.item;
}

export async function patchFile(id, meta) {
  const r = await fetch("/api/files", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...meta }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "تعذر التحديث");
  return j.item;
}

export const fileUrl = (id, download) => `/api/files/view?id=${encodeURIComponent(id)}${download ? "&download=1" : ""}`;
