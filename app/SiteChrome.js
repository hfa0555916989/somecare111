import { socialLinks } from "./Icons";
import ThemeToggle from "./ThemeToggle";

const digits = (s) => String(s || "").replace(/\D/g, "");
const live = (c, key) => (c.pages || []).filter((p) => p.published !== false && p[key] && p.slug);

export function SiteHeader({ c, icon }) {
  const extra = live(c, "showInHeader");
  const wa = `https://wa.me/${digits(c.contact.whatsapp)}?text=${encodeURIComponent(c.contact.message || "")}`;
  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <a className="brand" href="/" aria-label={c.brand.name}>
            <BrandLogo b={c.brand} alt={c.brand.name} />
            {c.sizes?.showBrandText !== false && <BrandText b={c.brand} />}
          </a>
          <nav className={"links" + (extra.length ? " links-wrap" : "")}>
            <a href="/#packages">الباقات</a>
            <a href="/#addons">الإضافات</a>
            {c.about?.show !== false && c.about?.name && <a href="/#about">من أنا</a>}
            <a href="/#gallery">عروضنا</a>
            <a href="/#contact">تواصل معنا</a>
            {extra.map((p) => (
              <a key={p.slug} href={`/${p.slug}`}>{p.title}</a>
            ))}
          </nav>
          <ThemeToggle mode={c.theme.mode} />
          <a className="btn btn-sm" href={wa} target="_blank" rel="noopener" aria-label="واتساب">
            {icon} <span className="nav-wa-txt">واتساب</span>
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
  const links = live(c, "showInFooter");
  const city = c.footer.city;
  return (
    <footer className="foot">
      <div className="wrap">
        <FooterBrand c={c} />
        <SocialRow c={c} />
        {(links.length > 0 || city) && (
          <p style={{ margin: "0 0 6px" }}>
            {links.map((p, i) => (
              <span key={p.slug}>
                {i > 0 && " | "}
                <a href={`/${p.slug}`} style={{ textDecoration: "underline" }}>{p.title}</a>
              </span>
            ))}
            {city ? (links.length ? " | " : "") + city : ""}
          </p>
        )}
        <span>© {new Date().getFullYear()} {c.brand.name}. {c.footer.text}</span>
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
    <Tag className="brand foot-brand" {...(Tag === "a" ? { href: "/", "aria-label": b.name } : {})}>
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

// الشعار: نسخة للوضع الليلي ونسخة اختيارية للوضع النهاري
export function BrandLogo({ b, alt }) {
  if (!b.logo && !b.logoLight) return null;
  if (!b.logo || !b.logoLight || b.logoLight === b.logo) return <img src={b.logo || b.logoLight} alt={alt} />;
  return (
    <>
      <img className="logo-dark" src={b.logo} alt={alt} />
      <img className="logo-light" src={b.logoLight} alt={alt} />
    </>
  );
}
