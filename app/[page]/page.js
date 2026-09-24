import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { SiteHeader, SiteFooter } from "../SiteChrome";

export const dynamic = "force-dynamic";

const findPage = (c, slug) => (c.pages || []).find((p) => p.slug === slug && p.published !== false);

// # عنوان  |  - نقطة  |  سطر عادي = فقرة
function blocks(body) {
  const out = [];
  let list = null;
  for (const raw of String(body || "").split("\n")) {
    const t = raw.trim();
    if (!t) { list = null; continue; }
    if (t.startsWith("- ")) {
      if (!list) { list = []; out.push({ type: "ul", items: list }); }
      list.push(t.slice(2));
      continue;
    }
    list = null;
    if (t.startsWith("# ")) out.push({ type: "h2", text: t.slice(2) });
    else out.push({ type: "p", text: t });
  }
  return out;
}

export async function generateMetadata({ params }) {
  const c = await getContent();
  const p = findPage(c, params.page);
  if (!p) return {};
  const first = String(p.body || "").split("\n").find((l) => l.trim() && !l.startsWith("#")) || p.subtitle || "";
  return { title: `${p.title} | ${c.brand.name}`, description: first.replace(/^- /, "").slice(0, 150) };
}

export default async function DynamicPage({ params }) {
  const c = await getContent();
  const p = findPage(c, params.page);
  if (!p) notFound();
  const wa = String(c.contact.whatsapp || "").replace(/\D/g, "");

  return (
    <>
      <SiteHeader c={c} />
      <main style={{ padding: "56px 0 80px" }}>
        <div className="wrap narrow">
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>{p.title}</h1>
          {p.subtitle && <p style={{ opacity: 0.7, marginTop: 6 }}>{p.subtitle}</p>}
          <div style={{ marginTop: 28, display: "grid", gap: 18 }}>
            {blocks(p.body).map((b, i) =>
              b.type === "h2" ? (
                <h2 key={i} style={{ fontSize: "1.35rem", marginTop: 10 }}>{b.text}</h2>
              ) : b.type === "ul" ? (
                <ul key={i} style={{ margin: 0, paddingInlineStart: 22, display: "grid", gap: 6 }}>
                  {b.items.map((t, j) => <li key={j}>{t}</li>)}
                </ul>
              ) : (
                <p key={i} style={{ margin: 0 }}>{b.text}</p>
              )
            )}
            {p.contactLabel && (
              <p style={{ margin: 0 }}>
                {p.contactLabel}{" "}
                <a href={`https://wa.me/${wa}`} dir="ltr" style={{ color: "var(--primary)", fontWeight: 600 }}>
                  {c.contact.phone}
                </a>
              </p>
            )}
          </div>
        </div>
      </main>
      <SiteFooter c={c} />
    </>
  );
}
