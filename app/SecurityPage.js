import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { localize, ui, prefix } from "@/lib/i18n";
import { siteUrl } from "@/lib/defaults";
import { SiteHeader, SiteFooter } from "./SiteChrome";
import { plain, xHandle } from "./Icons";
import { Security, Contact, WaIcon, makeWaLink } from "./HomePage";

// صفحة مستقلة لباقة الأمن السيبراني (/security و /en/security)، لها عنوان ووصف وصورة مشاركة خاصة
// لأن الرابط hassandev.sa/#security لا يصل منه للخادم إلا الصفحة الرئيسية، فتظهر بياناتها عند المشاركة.
const shown = (s) => s && s.show !== false && !!s.title;

export async function securityMetadata(lang) {
  const raw = await getContent();
  const c = localize(raw, lang);
  const s = c.security;
  if (!shown(s)) return {};
  // في الإنجليزية: إن لم يُترجم عنوان/وصف المشاركة نأخذ عنوان الباقة ووصفها المترجمين بدل النص العربي
  const tr = c.lang === "en" ? raw.en?.security || {} : s;
  const name = plain(tr.seoTitle || s.title);
  const title = `${name} | ${c.brand.name}`;
  const description = tr.seoDescription || s.subtitle || c.seo.description;
  const image = s.ogImage || s.image || c.seo.ogImage;
  const images = image ? [{ url: image, alt: name }] : undefined;
  const path = `${prefix(c.lang)}/security`;
  const handle = xHandle(c);
  return {
    title,
    description,
    alternates: { canonical: path, languages: { "ar-SA": "/security", en: "/en/security", "x-default": "/security" } },
    openGraph: { type: "website", locale: ui(c.lang).locale, siteName: c.brand.name, url: path, title, description, images },
    twitter: { card: "summary_large_image", title, description, images, ...(handle ? { site: handle, creator: handle } : {}) },
  };
}

export default async function SecurityPage({ lang }) {
  const c = localize(await getContent(), lang);
  const s = c.security;
  if (!shown(s)) notFound();
  const t = ui(c.lang);
  const waLink = makeWaLink(c);
  const service = plain(s.navLabel || s.title);
  const site = siteUrl(c);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: plain(s.title),
    serviceType: service,
    description: s.subtitle || undefined,
    url: `${site}${prefix(c.lang)}/security`,
    areaServed: { "@type": "Country", name: "SA" },
    inLanguage: t.htmlLang,
    provider: { "@type": "ProfessionalService", name: c.brand.name, url: site },
    ...(s.partner?.name ? { brand: { "@type": "Organization", name: s.partner.name, url: s.partner.url || undefined } } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: plain(s.title),
      itemListElement: (s.services || [])
        .filter((x) => x?.title)
        .map((x) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: x.title, description: x.desc || undefined } })),
    },
  };

  return (
    <>
      <SiteHeader c={c} icon={<WaIcon size={18} />} altPath="/security" />
      <main>
        <Security s={s} t={t} waLink={waLink} heading="h1" />
        <Contact c={c} t={t} waLink={waLink} service={service} />
      </main>
      <SiteFooter c={c} />
      <a className="wa-float" href={waLink(service)} target="_blank" rel="noopener" aria-label={t.whatsapp}>
        <WaIcon size={30} />
      </a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </>
  );
}
