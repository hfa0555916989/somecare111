import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/defaults";

export const dynamic = "force-dynamic";

// الصفحة الرئيسية + كل صفحة منشورة من لوحة التحكم
export default async function sitemap() {
  const c = await getContent();
  const base = siteUrl(c);
  const pages = (c.pages || []).filter((p) => p.published !== false && p.slug);
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...pages.map((p) => ({ url: `${base}/${p.slug}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 })),
  ];
}
