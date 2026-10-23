import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { localize } from "@/lib/i18n";
import { SEO_PAGES, articleJsonLd, getSeoPage } from "@/lib/seo-pages";
import { DEMO_ADMIN_URL, DEMO_EMAIL, DEMO_PASSWORD, DEMO_URL } from "@/lib/demo-media";
import { SiteHeader, SiteFooter } from "./SiteChrome";
import { DemoGallery } from "./StoreShowcase";
import { makeWaLink, WaIcon } from "./HomePage";
import PriceAddendum from "./PriceAddendum";

function Parts({ parts }) {
  return (
    <p>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <a key={i} href={part.href}>
            {part.text}
          </a>
        )
      )}
    </p>
  );
}

function Blocks({ blocks }) {
  return blocks.map((b, i) => {
    if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
    if (b.type === "ul")
      return (
        <ul key={i}>
          {b.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      );
    if (b.type === "ol")
      return (
        <ol key={i}>
          {b.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      );
    if (b.type === "rows")
      return (
        <table key={i} className="price-table">
          <tbody>
            {b.rows.map((row) => (
              <tr key={row[0]}>
                <th scope="row">{row[0]}</th>
                <td>{row[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    if (b.type === "faq")
      return (
        <div key={i} className="faq">
          {b.items.map((item) => (
            <details key={item[0]}>
              <summary>{item[0]}</summary>
              <p>{item[1]}</p>
            </details>
          ))}
        </div>
      );
    if (b.type === "parts") return <Parts key={i} parts={b.parts} />;
    return <p key={i}>{b.text}</p>;
  });
}

export default async function SeoArticle({ id }) {
  const page = getSeoPage(id);
  if (!page) notFound();
  const c = localize(await getContent(), "ar");
  const wa = makeWaLink(c)(page.h1);
  const related = SEO_PAGES.filter((p) => p.id !== page.id);

  return (
    <>
      <SiteHeader c={c} icon={<WaIcon size={18} />} />
      <main className="article">
        <article className="wrap narrow">
          <nav className="crumbs" aria-label="مسار التنقل">
            <a href="/">الرئيسية</a>
            {page.kind === "post" && (
              <>
                <span aria-hidden="true">/</span>
                <a href="/blog">المدونة</a>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span aria-current="page">{page.h1}</span>
          </nav>
          <p className="kicker">{page.kicker}</p>
          <h1>{page.h1}</h1>
          <DemoGallery lang="ar" />
          <aside className="demo-login">
            <p>لوحة التحكم التجريبية</p>
            <p>
              البريد: <b dir="ltr">{DEMO_EMAIL}</b>
            </p>
            <p>
              كلمة المرور: <b dir="ltr">{DEMO_PASSWORD}</b>
            </p>
            <a href={DEMO_URL} target="_blank" rel="noopener">
              افتح المتجر التجريبي
            </a>
            {" · "}
            <a href={DEMO_ADMIN_URL} target="_blank" rel="noopener">
              لوحة التحكم
            </a>
          </aside>
          <div className="prose">
            <Blocks blocks={page.blocks} />
            <PriceAddendum lang="ar" />
          </div>
          <p>
            <a className="btn" href={wa} target="_blank" rel="noopener">
              <WaIcon /> اطلب باقة 1500 ريال
            </a>
          </p>
          <section className="related">
            <h2>صفحات ذات صلة</h2>
            <ul>
              {related.map((p) => (
                <li key={p.id}>
                  <a href={p.path}>{p.h1}</a>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(page)).replace(/</g, "\\u003c") }} />
      <SiteFooter c={c} />
    </>
  );
}
