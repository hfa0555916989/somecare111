import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/defaults";

export const dynamic = "force-dynamic";

// الصفحة الرئيسية + كل صفحة منشورة من لوحة التحكم، بالعربية وبنسختها الإنجليزية (/en)
export default async function sitemap() {
  const c = await getContent();
  const base = siteUrl(c);
  const pages = (c.pages || []).filter((p) => p.published !== false && p.slug);
  const both = (path) => ({ "ar-SA": `${base}${path || "/"}`, en: `${base}/en${path}` });
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1, alternates: { languages: both("") } },
    { url: `${base}/en`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9, alternates: { languages: both("") } },
    ...(c.security?.show !== false && c.security?.title
      ? [
          { url: `${base}/security`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8, alternates: { languages: both("/security") } },
          { url: `${base}/en/security`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7, alternates: { languages: both("/security") } },
        ]
      : []),
    { url: `${base}/app-store-development`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    ...pages.flatMap((p) => [
      { url: `${base}/${p.slug}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5, alternates: { languages: both(`/${p.slug}`) } },
      { url: `${base}/en/${p.slug}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4, alternates: { languages: both(`/${p.slug}`) } },
    ]),
  ];
}
