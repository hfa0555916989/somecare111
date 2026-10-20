import "./globals.css";
import { headers } from "next/headers";
import { getContent } from "@/lib/content";
import { localize, langOf, ui } from "@/lib/i18n";
import { BRAND_THEME, isFont, fontsHref, siteUrl, safeColor, sizesCss, themeCss } from "@/lib/defaults";
import { socialLinks, xHandle, plain } from "./Icons";
import Tracking from "./Tracking";
import { SITE_NAV, navHref } from "@/lib/sitelinks";

export const dynamic = "force-dynamic";

// لغة الصفحة يحددها middleware.js (/en إنجليزي، والباقي عربي)
const pageLang = () => langOf(headers().get("x-site-lang"));
const localContent = async () => localize(await getContent(), pageLang());

export async function generateMetadata() {
  const c = await localContent();
  const title = plain(c.seo.title);
  const description = c.seo.description;
  const images = c.seo.ogImage ? [c.seo.ogImage] : undefined;
  const handle = xHandle(c);
  return {
    metadataBase: new URL(siteUrl(c)),
    title,
    description,
    ...(c.seo.keywords ? { keywords: String(c.seo.keywords) } : {}),
    applicationName: c.brand.name,
    openGraph: { type: "website", locale: ui(c.lang).locale, siteName: c.brand.name, title, description, images },
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
  const c = await localContent();
  const L = ui(c.lang);
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
  const sameAs = socialLinks(c).filter((s) => s.key !== "email").map((s) => s.href);
  const founder = a.show !== false && a.name
    ? { "@type": "Person", name: a.name, alternateName: c.lang === "en" ? undefined : "Developer Hassan", jobTitle: a.role || undefined, image: abs(a.photo) }
    : undefined;
  const knowsAbout = [
    ...(c.security?.show !== false && c.security?.title
      ? [plain(c.security.navLabel), ...(c.security.services || []).map((x) => x?.title)]
      : []),
    ...(c.packages || []).map((p) => p?.name),
  ].filter(Boolean);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site}/#organization`,
        name: c.brand.name,
        alternateName: c.brand.tagline || undefined,
        url: site,
        logo: abs(c.brand.appleIcon || c.brand.logo),
        image: abs(c.seo.ogImage),
        description: c.seo.description,
        telephone: digits ? `+${digits}` : undefined,
        address: { "@type": "PostalAddress", addressLocality: c.footer.city || undefined, addressCountry: "SA" },
        sameAs,
        ...(founder ? { founder } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${site}/#website`,
        name: c.brand.name,
        url: site,
        inLanguage: ["ar", "en"],
        publisher: { "@id": `${site}/#organization` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${site}/#business`,
        name: c.brand.name,
        alternateName: c.brand.tagline || undefined,
        url: site,
        logo: abs(c.brand.appleIcon || c.brand.logo),
        image: abs(c.seo.ogImage),
        description: c.seo.description,
        inLanguage: L.htmlLang,
        telephone: digits ? `+${digits}` : undefined,
        areaServed: { "@type": "Country", name: "SA" },
        address: { "@type": "PostalAddress", addressLocality: c.footer.city || undefined, addressCountry: "SA" },
        sameAs,
        knowsAbout,
        parentOrganization: { "@id": `${site}/#organization` },
        ...(founder ? { founder } : {}),
      },
      ...SITE_NAV.map((item, i) => ({
        "@type": "SiteNavigationElement",
        "@id": `${site}/#nav-${item.id}`,
        position: i + 1,
        name: c.lang === "en" ? item.en : item.ar,
        url: new URL(navHref(item, c.lang), site).href,
      })),
    ],
  };
  return (
    <html lang={L.htmlLang} dir={L.dir} suppressHydrationWarning>
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
