import { socialLinks } from "./Icons";
import ThemeToggle from "./ThemeToggle";
import { ui, prefix } from "@/lib/i18n";
import { e164 } from "@/lib/attribution";
import { SITE_NAV, navHref, RESERVED_SLUGS } from "@/lib/sitelinks";
import { MobileNav } from "./MobileNav";

const digits = (s) => String(s || "").replace(/\D/g, "");
const telHref = (phone) => `tel:${e164(phone) || "+966555916989"}`;
const waHref = (c, extra) => {
  const wa = digits(c.contact?.whatsapp);
  const text = extra ? `${c.contact?.message || ""} - ${extra}` : (c.contact?.message || "");
  return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
};

function PhoneIcon({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

function WaFloatIcon({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function FloatingButtons({ c, waExtra }) {
  const t = ui(c.lang);
  return (
    <div className="float-btns">
      <a className="float-btn call-float" href={telHref(c.contact.phone)} aria-label={t.callUs}>
        <PhoneIcon size={30} />
      </a>
      <a className="float-btn wa-float" href={waHref(c, waExtra)} target="_blank" rel="noopener" aria-label={t.whatsapp}>
        <WaFloatIcon size={30} />
      </a>
    </div>
  );
}
const live = (c, key) => (c.pages || []).filter((p) => p.published !== false && p[key] && p.slug);

// data-nosnippet: يمنع جوجل من أخذ نص القائمة والفوتر في وصف نتيجة البحث، لأن روابط القائمة تلتصق ببعضها فيه
// altPath: مسار الصفحة نفسها في اللغة الأخرى (بدون /en)، والافتراضي الصفحة الرئيسية
export function SiteHeader({ c, icon, altPath = "/" }) {
  const extra = live(c, "showInHeader").filter((p) => !RESERVED_SLUGS.has(p.slug));
  const t = ui(c.lang);
  const home = prefix(c.lang) || "";
  const other = c.lang === "en" ? altPath : "/en" + (altPath === "/" ? "" : altPath);
  const sec = c.security || {};
  const wa = `https://wa.me/${digits(c.contact.whatsapp)}?text=${encodeURIComponent(c.contact.message || "")}`;
  return (
    <>
      <header className="nav" data-nosnippet>
        <div className="wrap nav-in">
          <a className="brand" href={home || "/"} aria-label={c.brand.name}>
            <BrandLogo b={c.brand} alt={c.brand.name} />
            {c.sizes?.showBrandText !== false && <BrandText b={c.brand} />}
          </a>
          <MobileNav
            openLabel={t.menu}
            closeLabel={t.menuClose}
            navLabel={c.lang === "en" ? "Main" : "القائمة الرئيسية"}
            links={[
              ...SITE_NAV.map((item) => ({ href: navHref(item, c.lang), label: item.id === "security" && sec.navLabel ? sec.navLabel : (c.lang === "en" ? item.en : item.ar) })),
              ...extra.map((p) => ({ href: `${home}/${p.slug}`, label: p.title })),
            ]}
          />
          <a className="lang-btn" href={other} hrefLang={c.lang === "en" ? "ar" : "en"} title={t.switchTitle}>
            {t.switchLabel}
          </a>
          <ThemeToggle mode={c.theme.mode} label={t.themeToggle} title={t.themeTitle} />
          <a className="btn btn-sm" href={wa} target="_blank" rel="noopener" aria-label={t.whatsapp}>
            {icon} <span className="nav-wa-txt">{t.whatsapp}</span>
          </a>
        </div>
      </header>
      {extra.length > 0 && (
        <style>{`@media(max-width:760px){.nav-in{flex-wrap:wrap;gap:6px 14px}.links-wrap{display:flex;order:3;width:100%;overflow-x:auto;gap:18px;margin:0;padding-bottom:4px;font-size:.92rem;white-space:nowrap}}`}</style>
      )}
    </>
  );
}

export function SocialRow({ c }) {
  const list = socialLinks(c);
  if (!list.length) return null;
  return (
    <div className="social">
      {list.map((s) => (
        <a key={s.key} href={s.href} target={s.key === "email" ? undefined : "_blank"} rel="noopener me" aria-label={s.label} title={s.label}>
          {s.icon}
        </a>
      ))}
    </div>
  );
}

export function SiteFooter({ c, waExtra }) {
  const links = live(c, "showInFooter").filter((p) => !RESERVED_SLUGS.has(p.slug));
  const home = prefix(c.lang);
  const city = c.footer.city;
  const sec = c.security || {};
  const en = c.lang === "en";
  const label = en ? "Footer" : "روابط التذييل";
  return (
    <>
    <footer className="foot" data-nosnippet>
      <div className="wrap">
        <FooterBrand c={c} />
        <nav className="foot-nav" aria-label={label}>
          {SITE_NAV.map((item) => (
            <a key={item.id} href={navHref(item, c.lang)}>{item.id === "security" && sec.navLabel ? sec.navLabel : (en ? item.en : item.ar)}</a>
          ))}
        </nav>
        <SocialRow c={c} />
        {links.length > 0 && (
          <p style={{ margin: 0 }}>
            {links.map((p, i) => (
              <span key={p.slug}>
                {i > 0 && " | "}
                <a href={`${home}/${p.slug}`} style={{ textDecoration: "underline" }}>{p.title}</a>
              </span>
            ))}
          </p>
        )}
        <span>© {new Date().getFullYear()} {c.brand.name}{city ? ` · ${city}` : ""}. {c.footer.text}</span>
      </div>
    </footer>
    <FloatingButtons c={c} waExtra={waExtra} />
    </>
  );
}

// شعار الفوتر واسم الموقع بجانبه (تُستخدم أيضاً في معاينة لوحة التحكم)
// إذا اختير شعار خاص للفوتر يُستخدم، وإلا نفس شعار الهيدر
export function FooterBrand({ c, as: Tag = "a" }) {
  const b = c.brand;
  const logos = b.footerLogo
    ? { logo: b.footerLogo, logoLight: b.footerLogoLight || "" }
    : { logo: b.logo, logoLight: b.logoLight };
  const showName = b.footerLogo ? !!b.footerShowName : c.sizes?.showBrandText !== false;
  return (
    <Tag className="brand foot-brand" {...(Tag === "a" ? { href: prefix(c.lang) || "/", "aria-label": b.name } : {})}>
      <BrandLogo b={logos} alt={showName ? "" : b.name} />
      {showName && <span>{b.name}</span>}
    </Tag>
  );
}

// اسم الموقع والسطر الإنجليزي بجانب الشعار (تُستخدم أيضاً في معاينة لوحة التحكم)
// تباعد الحروف والأحرف الكبيرة للسطر الإنجليزي فقط، لأنها تقطّع الحروف العربية المتصلة
export function BrandText({ b }) {
  const en = b.tagline && !/[\u0600-\u06FF]/.test(b.tagline);
  return (
    <span className="brand-txt">
      <span className="brand-name">{b.name}</span>
      {b.tagline && <small dir="auto" className={en ? "en" : undefined}>{b.tagline}</small>}
    </span>
  );
}

// الرمز بدون خلفية: حرف H كحلي يختفي على الخلفية الليلية، فنستخدم نسخته البيضاء ليلاً تلقائياً
const MARK_DARK = "/images/brand-mark-dark.svg";
const MARK_LIGHT = "/images/brand-mark-light.svg";

// الشعار: نسخة للوضع الليلي ونسخة اختيارية للوضع النهاري
export function BrandLogo({ b, alt }) {
  let dark = b.logo;
  let light = b.logoLight;
  if (dark === MARK_DARK) {
    light = light || MARK_DARK;
    dark = MARK_LIGHT;
  }
  if (!dark && !light) return null;
  if (!dark || !light || light === dark) return <img src={dark || light} alt={alt} />;
  return (
    <>
      <img className="logo-dark" src={dark} alt={alt} />
      <img className="logo-light" src={light} alt={alt} />
    </>
  );
}
