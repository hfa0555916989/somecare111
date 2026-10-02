import "./globals.css";
import { getContent } from "@/lib/content";
import { BRAND_THEME, FONTS, fontsHref, siteUrl } from "@/lib/defaults";
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
  return { width: "device-width", initialScale: 1, themeColor: c.theme.bg };
}

const font = (name, fallback) => `"${FONTS[name] ? name : fallback}", system-ui, sans-serif`;

export default async function RootLayout({ children }) {
  const c = await getContent();
  const t = c.theme;
  const site = siteUrl(c);
  const style = {
    "--bg": t.bg,
    "--surface": t.surface,
    "--text": t.text,
    "--muted": t.muted || BRAND_THEME.muted,
    "--primary": t.primary,
    "--on-primary": t.buttonText || BRAND_THEME.buttonText,
    "--price": t.price,
    "--font-head": font(t.headingFont, BRAND_THEME.headingFont),
    "--font-body": font(t.bodyFont, BRAND_THEME.bodyFont),
  };
  const fonts = fontsHref([t.headingFont, t.bodyFont, BRAND_THEME.headingFont, BRAND_THEME.bodyFont]);
  const abs = (p) => (p ? new URL(p, site).href : undefined);
  const digits = String(c.contact.whatsapp || "").replace(/\D/g, "");
  const ld = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: c.brand.name,
    alternateName: c.brand.tagline || undefined,
    url: site,
    logo: abs(c.brand.appleIcon || c.brand.logo),
    image: abs(c.seo.ogImage),
    description: c.seo.description,
    telephone: digits ? `+${digits}` : undefined,
    areaServed: "SA",
    address: { "@type": "PostalAddress", addressLocality: c.footer.city || undefined, addressCountry: "SA" },
    sameAs: socialLinks(c).filter((s) => s.key !== "email").map((s) => s.href),
  };
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {fonts && <link href={fonts} rel="stylesheet" />}
      </head>
      <body style={style}>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
        <Tracking t={c.tracking} />
      </body>
    </html>
  );
}
