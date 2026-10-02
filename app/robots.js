import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/defaults";

export const dynamic = "force-dynamic";

// لا نذكر مسار لوحة التحكم هنا عمداً، لأن robots.txt ملف علني.
// منع الفهرسة للوحة يتم عبر ترويسة X-Robots-Tag في middleware.js.
export default async function robots() {
  const base = siteUrl(await getContent());
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
