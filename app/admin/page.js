"use client";
import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";

/* ---------- helpers ---------- */
const setIn = (obj, path, val) => {
  const c = structuredClone(obj);
  let o = c;
  for (let i = 0; i < path.length - 1; i++) o = o[path[i]];
  o[path[path.length - 1]] = val;
  return c;
};

function Text({ label, value, onChange, area, ltr, hint }) {
  const P = area ? "textarea" : "input";
  return (
    <label>
      {label}
      <P type={area ? undefined : "text"} value={value ?? ""} dir={ltr ? "ltr" : undefined} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="adm-hint">{hint}</span>}
    </label>
  );
}

function Img({ label, value, onChange, accept = "image/*", isVideo }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      const blob = await upload(f.name, f, { access: "public", handleUploadUrl: "/api/upload" });
      onChange(blob.url);
    } catch (x) {
      setErr("فشل الرفع. تأكد من ربط Vercel Blob بالمشروع.");
    }
    setBusy(false);
    e.target.value = "";
  }
  return (
    <div className="adm-img">
      {!isVideo && value ? <img src={value} alt="" /> : null}
      <div className="grow">
        <span style={{ fontSize: ".92rem", color: "#b6c0de" }}>{label}</span>
        <input type="text" dir="ltr" value={value ?? ""} placeholder="رابط أو ارفع ملف" onChange={(e) => onChange(e.target.value)} />
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input type="file" accept={accept} onChange={pick} disabled={busy} />
          {busy && <span className="adm-hint">جارٍ الرفع...</span>}
          {value && !busy && (
            <button type="button" className="mini danger" onClick={() => onChange("")}>
              إزالة
            </button>
          )}
        </div>
        {err && <span className="err">{err}</span>}
      </div>
    </div>
  );
}

function ItemCard({ title, index, total, onMove, onDelete, children }) {
  return (
    <div className="adm-card">
      <div className="adm-card-h">
        <b>{title}</b>
        <button type="button" className="mini" disabled={index === 0} onClick={() => onMove(-1)}>▲</button>
        <button type="button" className="mini" disabled={index === total - 1} onClick={() => onMove(1)}>▼</button>
        <button type="button" className="mini danger" onClick={onDelete}>حذف</button>
      </div>
      {children}
    </div>
  );
}

function List({ items, onChange, newItem, addLabel, title, render }) {
  const move = (i, d) => {
    const a = [...items];
    [a[i], a[i + d]] = [a[i + d], a[i]];
    onChange(a);
  };
  const patch = (i, key, val) => onChange(items.map((it, j) => (j === i ? { ...it, [key]: val } : it)));
  return (
    <>
      {items.map((it, i) => (
        <ItemCard
          key={i}
          index={i}
          total={items.length}
          title={title(it, i)}
          onMove={(d) => move(i, d)}
          onDelete={() => confirm("حذف هذا العنصر؟") && onChange(items.filter((_, j) => j !== i))}
        >
          {render(it, (k, v) => patch(i, k, v))}
        </ItemCard>
      ))}
      <button type="button" className="mini" onClick={() => onChange([...items, newItem()])}>
        + {addLabel}
      </button>
    </>
  );
}

const TABS = [
  ["brand", "الهوية والشعار"],
  ["hero", "الواجهة"],
  ["packages", "الباقات والأسعار"],
  ["addons", "الإضافات"],
  ["features", "المميزات"],
  ["gallery", "الصور والعروض"],
  ["video", "الفيديو"],
  ["contact", "التواصل"],
  ["titles", "العناوين"],
  ["theme", "الألوان"],
  ["seo", "SEO"],
  ["tracking", "التتبع والإعلانات"],
];

/* ---------- page ---------- */
export default function Admin() {
  const [state, setState] = useState("loading"); // loading | login | ready
  const [data, setData] = useState(null);
  const [db, setDb] = useState(true);
  const [tab, setTab] = useState("brand");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/content");
    if (r.status === 401) return setState("login");
    const j = await r.json();
    setData(j.content);
    setDb(j.dbConnected);
    setState("ready");
  }
  useEffect(() => {
    load();
  }, []);

  async function login(e) {
    e.preventDefault();
    setMsg("");
    const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (r.ok) load();
    else setMsg((await r.json()).error || "خطأ");
  }
  async function logout() {
    await fetch("/api/login", { method: "DELETE" });
    setState("login");
  }
  async function save() {
    setSaving(true);
    setMsg("");
    const r = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? "ok" : j.error || "تعذر الحفظ");
    setSaving(false);
  }

  const u = (path) => (v) => setData((d) => setIn(d, path, v));

  if (state === "loading") return <div className="adm"><p style={{ padding: 30 }}>جارٍ التحميل...</p></div>;

  if (state === "login")
    return (
      <div className="adm">
        <form className="adm-login" onSubmit={login}>
          <h1>لوحة التحكم</h1>
          <label>
            كلمة المرور
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
          </label>
          <button className="primary" type="submit">دخول</button>
          {msg && <span className="err">{msg}</span>}
        </form>
      </div>
    );

  const d = data;
  return (
    <div className="adm">
      <div className="adm-top">
        <strong>لوحة التحكم</strong>
        <a href="/" target="_blank" className="mini" style={{ color: "#00e5ff" }}>عرض الموقع</a>
        <button className="mini" onClick={logout}>خروج</button>
        <button className="primary" onClick={save} disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}</button>
        {msg === "ok" && <span className="ok">تم الحفظ ✓</span>}
        {msg && msg !== "ok" && <span className="err">{msg}</span>}
      </div>
      <div className="adm-tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="adm-body">
        {!db && (
          <div className="note">
            قاعدة البيانات غير مربوطة بعد، لذلك لن يُحفظ أي تعديل. من Vercel: Storage ← Create Database ← Upstash Redis، ثم اربطها بالمشروع وأعد النشر.
          </div>
        )}

        {tab === "brand" && (
          <>
            <Text label="اسم الشركة / الموقع" value={d.brand.name} onChange={u(["brand", "name"])} />
            <Text label="وصف قصير" value={d.brand.tagline} onChange={u(["brand", "tagline"])} />
            <Img label="الشعار (يفضّل PNG شفاف)" value={d.brand.logo} onChange={u(["brand", "logo"])} />
            <Text label="نص الفوتر" value={d.footer.text} onChange={u(["footer", "text"])} />
          </>
        )}

        {tab === "hero" && (
          <>
            <Text label="الشارة أعلى العنوان (مثل السعر)" value={d.hero.badge} onChange={u(["hero", "badge"])} />
            <Text label="العنوان الرئيسي" area value={d.hero.title} onChange={u(["hero", "title"])} />
            <Text label="النص التعريفي" area value={d.hero.subtitle} onChange={u(["hero", "subtitle"])} />
            <Img label="صورة الواجهة" value={d.hero.image} onChange={u(["hero", "image"])} />
            <div className="row">
              <Text label="نص الزر الرئيسي" value={d.hero.primaryButton} onChange={u(["hero", "primaryButton"])} />
              <Text label="نص الزر الثانوي" value={d.hero.secondaryButton} onChange={u(["hero", "secondaryButton"])} />
            </div>
          </>
        )}

        {tab === "packages" && (
          <List
            items={d.packages}
            onChange={u(["packages"])}
            addLabel="إضافة باقة"
            title={(p) => p.name || "باقة"}
            newItem={() => ({ name: "باقة جديدة", pricePrefix: "", price: "0", unit: "ريال", desc: "", features: [], image: "", featured: false })}
            render={(p, set) => (
              <>
                <Text label="اسم الباقة" value={p.name} onChange={(v) => set("name", v)} />
                <div className="row">
                  <Text label="قبل السعر (مثل: يبدأ من)" value={p.pricePrefix} onChange={(v) => set("pricePrefix", v)} />
                  <Text label="السعر (يقبل نطاق مثل 16,000 - 18,000)" value={p.price} onChange={(v) => set("price", v)} />
                </div>
                <Text label="بعد السعر (ريال / ريال فأكثر)" value={p.unit} onChange={(v) => set("unit", v)} />
                <Text label="وصف" area value={p.desc} onChange={(v) => set("desc", v)} />
                <Text label="المزايا (كل ميزة في سطر)" area value={(p.features || []).join("\n")} onChange={(v) => set("features", v.split("\n").filter((x) => x.trim()))} />
                <Img label="صورة للباقة (اختياري)" value={p.image} onChange={(v) => set("image", v)} />
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="checkbox" checked={!!p.featured} onChange={(e) => set("featured", e.target.checked)} />
                  باقة مميزة (تظهر بعرض كامل)
                </label>
              </>
            )}
          />
        )}

        {tab === "addons" && (
          <List
            items={d.addons}
            onChange={u(["addons"])}
            addLabel="إضافة خدمة"
            title={(a) => a.title || "إضافة"}
            newItem={() => ({ title: "إضافة جديدة", desc: "", price: "" })}
            render={(a, set) => (
              <>
                <Text label="العنوان" value={a.title} onChange={(v) => set("title", v)} />
                <Text label="الوصف" value={a.desc} onChange={(v) => set("desc", v)} />
                <Text label="السعر (مع الوحدة)" value={a.price} onChange={(v) => set("price", v)} />
              </>
            )}
          />
        )}

        {tab === "features" && (
          <List
            items={d.features}
            onChange={u(["features"])}
            addLabel="إضافة ميزة"
            title={(f) => f.title || "ميزة"}
            newItem={() => ({ icon: "✨", title: "ميزة جديدة", desc: "" })}
            render={(f, set) => (
              <>
                <div className="row">
                  <Text label="الأيقونة (إيموجي)" value={f.icon} onChange={(v) => set("icon", v)} />
                  <Text label="العنوان" value={f.title} onChange={(v) => set("title", v)} />
                </div>
                <Text label="الوصف" area value={f.desc} onChange={(v) => set("desc", v)} />
              </>
            )}
          />
        )}

        {tab === "gallery" && (
          <List
            items={d.gallery}
            onChange={u(["gallery"])}
            addLabel="إضافة صورة"
            title={(g) => g.caption || "صورة"}
            newItem={() => ({ src: "", caption: "" })}
            render={(g, set) => (
              <>
                <Img label="الصورة" value={g.src} onChange={(v) => set("src", v)} />
                <Text label="التعليق" value={g.caption} onChange={(v) => set("caption", v)} />
              </>
            )}
          />
        )}

        {tab === "video" && (
          <>
            <Text label="رابط يوتيوب أو رابط فيديو مباشر" ltr value={d.video.url} onChange={u(["video", "url"])} hint="اتركه فارغاً لإخفاء قسم الفيديو." />
            <Img label="أو ارفع فيديو" isVideo accept="video/*" value={d.video.url} onChange={u(["video", "url"])} />
          </>
        )}

        {tab === "contact" && (
          <>
            <Text label="رقم الجوال (للعرض)" ltr value={d.contact.phone} onChange={u(["contact", "phone"])} />
            <Text label="رقم واتساب بالصيغة الدولية بدون + (مثال: 966530779934)" ltr value={d.contact.whatsapp} onChange={u(["contact", "whatsapp"])} />
            <Text label="نص التواصل" value={d.contact.availability} onChange={u(["contact", "availability"])} />
            <Text label="رسالة واتساب الجاهزة" area value={d.contact.message} onChange={u(["contact", "message"])} />
          </>
        )}

        {tab === "titles" &&
          [
            ["packages", "عنوان الباقات"],
            ["packagesSub", "وصف الباقات"],
            ["addons", "عنوان الإضافات"],
            ["features", "عنوان المميزات"],
            ["gallery", "عنوان العروض"],
            ["video", "عنوان الفيديو"],
            ["contact", "عنوان التواصل"],
          ].map(([k, l]) => <Text key={k} label={l} value={d.titles[k]} onChange={u(["titles", k])} />)}

        {tab === "theme" && (
          <div className="row">
            {[
              ["bg", "لون الخلفية"],
              ["surface", "لون البطاقات"],
              ["text", "لون النص"],
              ["primary", "اللون الرئيسي (الأزرار)"],
              ["price", "لون الأسعار"],
            ].map(([k, l]) => (
              <label key={k}>
                {l}
                <input type="color" value={d.theme[k]} onChange={(e) => u(["theme", k])(e.target.value)} />
              </label>
            ))}
          </div>
        )}

        {tab === "seo" && (
          <>
            <Text label="عنوان الصفحة في جوجل" value={d.seo.title} onChange={u(["seo", "title"])} />
            <Text label="وصف الصفحة في جوجل" area value={d.seo.description} onChange={u(["seo", "description"])} />
          </>
        )}

        {tab === "tracking" && (
          <>
            <div className="note" style={{ background: "#0f1730", borderColor: "#ffffff26", color: "#b6c0de" }}>
              الصق المعرّفات فقط (وليس الكود كامل). اترك الحقل فارغاً لتعطيل الأداة. بعد الحفظ تُفعَّل الأدوات على الموقع، وتُسجَّل نقرات واتساب كحدث تحويل.
            </div>
            <Text label="Google Analytics 4 (Measurement ID مثل G-XXXXXXXXXX)" ltr value={d.tracking.ga4} onChange={u(["tracking", "ga4"])} />
            <div className="row">
              <Text label="Google Ads (Conversion ID مثل AW-1234567890)" ltr value={d.tracking.googleAds} onChange={u(["tracking", "googleAds"])} />
              <Text label="Google Ads Conversion Label (اختياري)" ltr value={d.tracking.googleAdsLabel} onChange={u(["tracking", "googleAdsLabel"])} hint="لتحويل نقرة واتساب" />
            </div>
            <Text label="Google Search Console (قيمة content من وسم التحقق فقط)" ltr value={d.tracking.searchConsole} onChange={u(["tracking", "searchConsole"])} hint="إذا تحققت عبر سجل DNS فلا تحتاجه." />
            <Text label="Snapchat Pixel ID" ltr value={d.tracking.snap} onChange={u(["tracking", "snap"])} />
            <Text label="TikTok Pixel ID" ltr value={d.tracking.tiktok} onChange={u(["tracking", "tiktok"])} />
            <div className="row">
              <Text label="X (Twitter) Pixel ID" ltr value={d.tracking.xPixel} onChange={u(["tracking", "xPixel"])} />
              <Text label="X Event ID للتحويل (اختياري، مثل tw-xxxx-xxxx)" ltr value={d.tracking.xEventId} onChange={u(["tracking", "xEventId"])} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
