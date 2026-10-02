import "./globals.css";
import { getContent } from "@/lib/content";
import { BRAND_THEME, isFont, fontsHref, siteUrl, safeColor, sizesCss, themeCss } from "@/lib/defaults";
import { socialLinks, xHandle, plain } from "./Icons";
import Tracking from "./Tracking";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const c = await getContent();
  const title = plain(c.seo.title);
  const description = c.seo.description;
  const images = c.seo.ogImage ? [c.seo.ogImage] : undefined;
  const handle = xHandle(c);
  return {
    metadataBase: new URL(siteUrl(c)),
    title,
    description,
    applicationName: c.brand.name,
    openGraph: { type: "website", locale: "ar_SA", siteName: c.brand.name, title, description, images },
    twitter: { card: "summary_large_image", title, description, images, ...(handle ? { site: handle, creator: handle } : {}) },
    icons: {
      icon: c.brand.favicon || c.brand.logo || "/icon.png",
      ...(c.brand.appleIcon ? { apple: c.brand.appleIcon } : {}),
    },
    ...(c.tracking?.searchConsole ? { verification: { google: String(c.tracking.searchConsole).replace(/[^\w-]/g, "") } } : {}),
  };
}

export async function generateViewport() {
  const c = await getContent();
  const t = c.theme;
  const dark = safeColor(t.bg, BRAND_THEME.bg);
  const light = safeColor(t.light?.bg, BRAND_THEME.light.bg);
  return {
    width: "device-width",
    initialScale: 1,
    themeColor:
      t.mode === "light" ? light : t.mode === "dark" ? dark : [
        { media: "(prefers-color-scheme: light)", color: light },
        { media: "(prefers-color-scheme: dark)", color: dark },
      ],
  };
}

const font = (name, fallback) => `"${isFont(name) ? name : fallback}", system-ui, sans-serif`;

// يُنفَّذ قبل رسم الصفحة: يطبّق اختيار الزائر المحفوظ (ليلي/نهاري) لتجنّب وميض الألوان
const initScript = (mode) =>
  `(function(){try{var s=localStorage.getItem("theme");var d=document.documentElement;if(s==="dark"||s==="light")d.dataset.theme=s;else if(${JSON.stringify(mode)}==="light")d.dataset.theme="light";}catch(e){}})();`;

export default async function RootLayout({ children }) {
  const c = await getContent();
  const t = c.theme;
  const site = siteUrl(c);
  const css =
    themeCss(t) +
    sizesCss(c.sizes) +
    `:root{--font-head:${font(t.headingFont, BRAND_THEME.headingFont)};--font-body:${font(t.bodyFont, BRAND_THEME.bodyFont)};` +
    // خط الكتابة بجانب الشعار، وإذا لم يُختر يتبع خط العناوين / النصوص
    `--font-brand:${isFont(t.brandFont) ? font(t.brandFont) : "var(--font-head)"};--font-tag:${isFont(t.taglineFont) ? font(t.taglineFont) : "var(--font-body)"}}`;
  const fonts = fontsHref([t.headingFont, t.bodyFont, t.brandFont, t.taglineFont, BRAND_THEME.headingFont, BRAND_THEME.bodyFont]);
  const abs = (p) => (p ? new URL(p, site).href : undefined);
  const digits = String(c.contact.whatsapp || "").replace(/\D/g, "");
  const a = c.about || {};
  const ld = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: c.brand.name,
    alternateName: c.brand.tagline || undefined,
    url: site,
    logo: abs(c.brand.appleIcon || c.brand.logo),
    image: abs(c.seo.ogImage),
    description: c.seo.description,
    inLanguage: "ar-SA",
    telephone: digits ? `+${digits}` : undefined,
    areaServed: { "@type": "Country", name: "SA" },
    address: { "@type": "PostalAddress", addressLocality: c.footer.city || undefined, addressCountry: "SA" },
    sameAs: socialLinks(c).filter((s) => s.key !== "email").map((s) => s.href),
    ...(a.show !== false && a.name
      ? { founder: { "@type": "Person", name: a.name, jobTitle: a.role || undefined, image: abs(a.photo) } }
      : {}),
  };
  return (
    <html lang="ar-SA" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript(t.mode || "auto") }} />
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {fonts && <link href={fonts} rel="stylesheet" />}
      </head>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\u003c") }} />
        <Tracking t={c.tracking} />
      </body>
    </html>
  );
}
