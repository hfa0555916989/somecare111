import { socialLinks } from "./Icons";
import ThemeToggle from "./ThemeToggle";
import { ui, prefix } from "@/lib/i18n";
import { SITE_NAV, navHref, RESERVED_SLUGS } from "@/lib/sitelinks";
import { MobileNav } from "./MobileNav";

const digits = (s) => String(s || "").replace(/\D/g, "");
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
              ...SITE_NAV.map((item) => ({ href: navHref(item, c.lang), label: c.lang === "en" ? item.en : item.ar })),
              ...(sec.show !== false && sec.title ? [{ href: `${home}/security`, label: sec.navLabel || t.nav.security }] : []),
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

export function SiteFooter({ c }) {
  const links = live(c, "showInFooter").filter((p) => !RESERVED_SLUGS.has(p.slug));
  const home = prefix(c.lang);
  const city = c.footer.city;
  const sec = c.security || {};
  const en = c.lang === "en";
  const label = en ? "Footer" : "روابط التذييل";
  return (
    <footer className="foot" data-nosnippet>
      <div className="wrap">
        <FooterBrand c={c} />
        <nav className="foot-nav" aria-label={label}>
          {SITE_NAV.map((item) => (
            <a key={item.id} href={navHref(item, c.lang)}>{en ? item.en : item.ar}</a>
          ))}
          {sec.show !== false && sec.title && (
            <a href={`${home}/security`}>{sec.navLabel || (en ? "Cybersecurity" : "الأمن السيبراني")}</a>
          )}
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
