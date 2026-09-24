const BASE = process.env.SITE_URL || "https://www.somecare.shop";

// لا نذكر مسار لوحة التحكم هنا عمداً، لأن robots.txt ملف علني.
// منع الفهرسة للوحة يتم عبر ترويسة X-Robots-Tag في middleware.js.
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
