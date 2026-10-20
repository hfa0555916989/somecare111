import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/defaults";
import { SEO_DATE, SEO_PAGES } from "@/lib/seo-pages";
import { RESERVED_SLUGS, SITE_NAV } from "@/lib/sitelinks";

export const dynamic = "force-dynamic";

// الصفحة الرئيسية + كل صفحة منشورة من لوحة التحكم، بالعربية وبنسختها الإنجليزية (/en)
export default async function sitemap() {
  const c = await getContent();
  const base = siteUrl(c);
  const pages = (c.pages || []).filter((p) => p.published !== false && p.slug && !RESERVED_SLUGS.has(p.slug));
  const both = (path) => ({ "ar-SA": `${base}${path || "/"}`, en: `${base}/en${path}` });
  const dated = new Date(SEO_DATE);
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1, alternates: { languages: both("") } },
    { url: `${base}/en`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9, alternates: { languages: both("") } },
    ...SITE_NAV.flatMap((item) => [
      { url: `${base}${item.path}`, lastModified: dated, changeFrequency: "weekly", priority: 0.8, alternates: { languages: both(item.path) } },
      { url: `${base}/en${item.path}`, lastModified: dated, changeFrequency: "weekly", priority: 0.7, alternates: { languages: both(item.path) } },
    ]),
    ...SEO_PAGES.map((p) => ({
      url: `${base}${p.path}`,
      lastModified: dated,
      changeFrequency: p.kind === "post" ? "monthly" : "weekly",
      priority: p.kind === "landing" ? 0.9 : 0.8,
    })),
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
