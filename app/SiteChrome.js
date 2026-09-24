const digits = (s) => String(s || "").replace(/\D/g, "");
const live = (c, key) => (c.pages || []).filter((p) => p.published !== false && p[key] && p.slug);

export function SiteHeader({ c, icon }) {
  const extra = live(c, "showInHeader");
  const wa = `https://wa.me/${digits(c.contact.whatsapp)}?text=${encodeURIComponent(c.contact.message || "")}`;
  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <a className="brand" href="/">
            {c.brand.logo && <img src={c.brand.logo} alt="" />}
            <span>{c.brand.name}</span>
          </a>
          <nav className={"links" + (extra.length ? " links-wrap" : "")}>
            <a href="/#packages">الباقات</a>
            <a href="/#addons">الإضافات</a>
            <a href="/#gallery">عروضنا</a>
            <a href="/#contact">تواصل معنا</a>
            {extra.map((p) => (
              <a key={p.slug} href={`/${p.slug}`}>{p.title}</a>
            ))}
          </nav>
          <a className="btn btn-sm" href={wa} target="_blank" rel="noopener">
            {icon} واتساب
          </a>
        </div>
      </header>
      {extra.length > 0 && (
        <style>{`@media(max-width:760px){.nav-in{flex-wrap:wrap;gap:6px 14px}.links-wrap{display:flex;order:3;width:100%;overflow-x:auto;gap:18px;margin:0;padding-bottom:4px;font-size:.92rem;white-space:nowrap}}`}</style>
      )}
    </>
  );
}

export function SiteFooter({ c }) {
  const links = live(c, "showInFooter");
  const city = c.footer.city;
  return (
    <footer className="foot">
      <div className="wrap">
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
