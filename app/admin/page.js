"use client";
import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import { BRAND_THEME, BRAND_ASSETS, FONTS, SITE_URL } from "@/lib/defaults";
import { ICONS, SOCIALS, Icon } from "../Icons";

/* ---------- helpers ---------- */
const setIn = (obj, path, val) => {
  const c = structuredClone(obj);
  let o = c;
  for (let i = 0; i < path.length - 1; i++) o = o[path[i]];
  o[path[path.length - 1]] = val;
  return c;
};

function Text({ label, value, onChange, area, ltr, hint, rows }) {
  const P = area ? "textarea" : "input";
  return (
    <label>
      {label}
      <P {...(area ? { rows: rows || 4 } : { type: "text" })} value={value ?? ""} dir={ltr ? "ltr" : undefined} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="adm-hint">{hint}</span>}
    </label>
  );
}

function IconPick({ value, onChange }) {
  const custom = value && !ICONS[value];
  return (
    <label>
      الأيقونة
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span className="adm-ic"><Icon name={value} size={22} /></span>
        <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">بدون أيقونة</option>
          {custom && <option value={value}>{value} (إيموجي قديم)</option>}
          {Object.entries(ICONS).map(([k, [l]]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </select>
      </div>
    </label>
  );
}

function FontPick({ label, value, onChange }) {
  return (
    <label>
      {label}
      <select value={FONTS[value] ? value : ""} onChange={(e) => onChange(e.target.value)}>
        {!FONTS[value] && <option value="">اختر خطاً</option>}
        {Object.keys(FONTS).map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
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
      setErr("فشل الرفع: تخزين الصور (Vercel Blob) غير مربوط بالمشروع، أو انتهت جلسة الدخول. يمكنك مؤقتاً لصق رابط صورة في الحقل.");
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
  ["inquiries", "الاستفسارات"],
  ["hero", "الواجهة"],
  ["packages", "الباقات والأسعار"],
  ["addons", "الإضافات"],
  ["features", "المميزات"],
  ["about", "من أنا والترخيص"],
  ["gallery", "الصور والعروض"],
  ["video", "الفيديو"],
  ["contact", "التواصل"],
  ["social", "وسائل التواصل"],
  ["titles", "العناوين"],
  ["theme", "الألوان"],
  ["seo", "SEO"],
  ["pages", "الصفحات والفوتر"],
  ["tracking", "التتبع والإعلانات"],
];

const COLOR_FIELDS = [
  ["bg", "لون الخلفية"],
  ["surface", "لون البطاقات"],
  ["text", "لون النص"],
  ["muted", "لون النص الثانوي"],
  ["primary", "اللون الرئيسي (الأزرار)"],
  ["buttonText", "لون نص الأزرار"],
  ["price", "لون الأسعار والأيقونات"],
];

const STATUS = { new: "جديد", progress: "قيد المتابعة", done: "تم الحل", archived: "مؤرشف" };

/* ---------- الاستفسارات ---------- */
function Inquiries({ form, setForm, onCount }) {
  const [items, setItems] = useState(null);
  const [info, setInfo] = useState({ db: true, turnstile: false });
  const [filter, setFilter] = useState("open");
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    const r = await fetch("/api/inquiries");
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setErr(j.error || "تعذر التحميل");
    setItems(j.items);
    setInfo({ db: j.db, turnstile: j.turnstile });
    onCount(j.items.filter((i) => i.status === "new").length);
  }
  useEffect(() => {
    load();
  }, []);

  async function patch(id, body) {
    const r = await fetch("/api/inquiries", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }) });
    if (r.ok) load();
    else setErr("تعذر التحديث");
  }
  async function remove(id) {
    if (!confirm(`حذف الاستفسار ${id} نهائياً؟`)) return;
    const r = await fetch(`/api/inquiries?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (r.ok) load();
  }

  const list = (items || []).filter((i) => {
    if (filter === "open" && (i.status === "done" || i.status === "archived")) return false;
    if (filter !== "open" && filter !== "all" && i.status !== filter) return false;
    const t = q.trim();
    return !t || [i.id, i.name, i.phone, i.email, i.message, i.service].some((v) => String(v || "").includes(t));
  });
  const wa = (p) => {
    const d = String(p || "").replace(/\D/g, "");
    return d ? `https://wa.me/${d.startsWith("0") ? "966" + d.slice(1) : d}` : null;
  };

  return (
    <>
      <div className="adm-card">
        <b>إعدادات نموذج «تواصل معنا»</b>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={form.show !== false} onChange={(e) => setForm("show", e.target.checked)} />
          إظهار النموذج في قسم التواصل
        </label>
        <Text label="عنوان النموذج" value={form.title} onChange={(v) => setForm("title", v)} />
        <Text label="رسالة النجاح ({number} = رقم الاستفسار)" value={form.success} onChange={(v) => setForm("success", v)} />
        <span className="adm-hint">
          التحقق من الروبوتات (Cloudflare Turnstile):{" "}
          {info.turnstile ? <span className="ok">مفعّل ✓</span> : <span className="err">غير مفعّل، أضف TURNSTILE_SITE_KEY و TURNSTILE_SECRET_KEY في Vercel</span>}
        </span>
        <span className="adm-hint">الاستفسارات تصل هنا فقط (بدون بريد). إعدادات النموذج تُحفظ بزر «حفظ التغييرات» أعلى الصفحة، أما حالة الاستفسار والملاحظة فتُحفظ فوراً.</span>
      </div>

      {!info.db && <div className="note">قاعدة البيانات غير مربوطة، لذلك لن تُحفظ الاستفسارات.</div>}
      {err && <span className="err">{err}</span>}

      <div className="row">
        <label>
          عرض
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="open">المفتوحة (جديد + قيد المتابعة)</option>
            {Object.entries(STATUS).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
            <option value="all">الكل</option>
          </select>
        </label>
        <Text label="بحث (رقم، اسم، جوال...)" value={q} onChange={setQ} />
      </div>

      {items === null ? (
        <p>جارٍ التحميل...</p>
      ) : list.length === 0 ? (
        <p className="adm-hint">لا توجد استفسارات هنا.</p>
      ) : (
        list.map((i) => (
          <div key={i.id} className="adm-card adm-inq">
            <div className="adm-inq-h">
              <b>{i.id}</b>
              <span className={"adm-pill " + i.status}>{STATUS[i.status] || i.status}</span>
              <time>{new Date(i.createdAt).toLocaleString("ar-SA-u-nu-latn", { dateStyle: "medium", timeStyle: "short" })}</time>
            </div>
            <div>
              <strong>{i.name}</strong>
              {i.service && <span className="adm-hint"> · {i.service}</span>}
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {i.phone && <a href={`tel:${i.phone}`} dir="ltr" style={{ color: "#d4a84b" }}>{i.phone}</a>}
              {wa(i.phone) && <a href={wa(i.phone)} target="_blank" rel="noopener" style={{ color: "#7dffb0" }}>واتساب</a>}
              {i.email && (
                <a href={`mailto:${i.email}?subject=${encodeURIComponent("بخصوص استفسارك " + i.id)}`} dir="ltr" style={{ color: "#7cc4ff" }}>{i.email}</a>
              )}
            </div>
            <div className="msg">{i.message}</div>
            <div className="row">
              <label>
                الحالة
                <select value={i.status} onChange={(e) => patch(i.id, { status: e.target.value })}>
                  {Object.entries(STATUS).map(([k, l]) => (
                    <option key={k} value={k}>{l}</option>
                  ))}
                </select>
              </label>
              <label>
                ملاحظة داخلية (لا تظهر للعميل)
                <input type="text" defaultValue={i.note} onBlur={(e) => e.target.value !== (i.note || "") && patch(i.id, { note: e.target.value })} />
              </label>
            </div>
            <div>
              <button type="button" className="mini danger" onClick={() => remove(i.id)}>حذف</button>
            </div>
          </div>
        ))
      )}
    </>
  );
}

/* ---------- page ---------- */
export default function Admin() {
  const [state, setState] = useState("loading"); // loading | login | ready
  const [data, setData] = useState(null);
  const [db, setDb] = useState(true);
  const [tab, setTab] = useState("brand");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [blob, setBlob] = useState(true);

  async function load() {
    const r = await fetch("/api/content");
    if (r.status === 401) return setState("login");
    const j = await r.json();
    setData(j.content);
    setDb(j.dbConnected);
    setState("ready");
    fetch("/api/upload")
      .then((x) => (x.ok ? x.json() : null))
      .then((x) => x && setBlob(x.blob))
      .catch(() => {});
    fetch("/api/inquiries")
      .then((x) => (x.ok ? x.json() : null))
      .then((x) => x && setNewCount(x.items.filter((i) => i.status === "new").length))
      .catch(() => {});
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
    const RESERVED = ["admin", "api", "_next", "images", "icon.png", "robots.txt", "sitemap.xml", "favicon.ico", "admin552255"];
    const seen = new Set();
    for (const p of data.pages || []) {
      if (!p.slug) return setMsg(`الصفحة "${p.title || ""}" ليس لها رابط. اكتب رابطاً إنجليزياً مثل refund.`);
      if (RESERVED.includes(p.slug)) return setMsg(`الرابط "${p.slug}" محجوز، اختر رابطاً آخر.`);
      if (seen.has(p.slug)) return setMsg(`الرابط "${p.slug}" مكرر في أكثر من صفحة.`);
      seen.add(p.slug);
    }
    setSaving(true);
    setMsg("");
    const r = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? "ok" : j.error || "تعذر الحفظ");
    setSaving(false);
  }

  const u = (path) => (v) => setData((d) => setIn(d, path, v));

  function applyBrand() {
    if (!confirm("تطبيق هوية «المطوّر حسن» (الشعار والأيقونة والألوان والخطوط)؟ لن تُحفظ حتى تضغط «حفظ التغييرات».")) return;
    setData((d) => ({ ...d, theme: { ...BRAND_THEME }, brand: { ...d.brand, ...BRAND_ASSETS } }));
  }

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
        <a href="/" target="_blank" className="mini" style={{ color: "#d4a84b" }}>عرض الموقع</a>
        <button className="mini" onClick={logout}>خروج</button>
        <button className="primary" onClick={save} disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}</button>
        {msg === "ok" && <span className="ok">تم الحفظ ✓</span>}
        {msg && msg !== "ok" && <span className="err">{msg}</span>}
      </div>
      <div className="adm-tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
            {l}
            {k === "inquiries" && newCount > 0 && <span className="count">{newCount}</span>}
          </button>
        ))}
      </div>
      <div className="adm-body">
        {!db && (
          <div className="note">
            قاعدة البيانات غير مربوطة بعد، لذلك لن يُحفظ أي تعديل. من Vercel: Storage ← Create Database ← Upstash Redis، ثم اربطها بالمشروع وأعد النشر.
          </div>
        )}

        {!blob && (
          <div className="note info">
            صور الموقع محفوظة في المشروع على GitHub وتعمل طبيعي. زر «اختيار ملف» للرفع من اللوحة غير مفعّل لأن Vercel Blob غير مربوط؛ لتفعيله أنشئ Blob بنوع <b>Public</b> (وليس Private) واربطه بالمشروع ثم أعد النشر. ويمكنك دائماً كتابة مسار صورة موجودة مثل /images/about-photo.jpg.
          </div>
        )}

        {tab === "brand" && (
          <>
            <div className="note info">
              لإرجاع هوية «المطوّر حسن» الأصلية (الشعار الذهبي والكحلي والأيقونة والألوان والخطوط) بضغطة واحدة:
            </div>
            <button type="button" className="gold" onClick={applyBrand}>تطبيق هوية المطوّر حسن</button>
            <Text label="اسم الشركة / الموقع" value={d.brand.name} onChange={u(["brand", "name"])} />
            <Text label="سطر تحت الاسم (مثل Hassan Developer)" value={d.brand.tagline} onChange={u(["brand", "tagline"])} />
            <Img label="الشعار في أعلى الموقع وأسفله (الوضع الليلي)" value={d.brand.logo} onChange={u(["brand", "logo"])} />
            <Img label="الشعار في الوضع النهاري (اختياري، اتركه فارغاً لاستخدام نفس الشعار)" value={d.brand.logoLight} onChange={u(["brand", "logoLight"])} />
            <Img label="أيقونة المتصفح Favicon (مربعة، SVG أو PNG)" value={d.brand.favicon} onChange={u(["brand", "favicon"])} />
            <Img label="أيقونة الجوال عند الإضافة للشاشة الرئيسية (PNG مربع)" value={d.brand.appleIcon} onChange={u(["brand", "appleIcon"])} />
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
            newItem={() => ({ label: "", icon: "", name: "باقة جديدة", pricePrefix: "", price: "0", unit: "ريال", desc: "", features: [], image: "", featured: false })}
            render={(p, set) => (
              <>
                <div className="row">
                  <Text label="اسم الباقة" value={p.name} onChange={(v) => set("name", v)} />
                  <Text label="عنوان صغير فوق الاسم (مثل: الباقة الأولى)" value={p.label} onChange={(v) => set("label", v)} />
                </div>
                <IconPick value={p.icon} onChange={(v) => set("icon", v)} />
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
            newItem={() => ({ icon: "", title: "إضافة جديدة", desc: "", price: "" })}
            render={(a, set) => (
              <>
                <IconPick value={a.icon} onChange={(v) => set("icon", v)} />
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
            newItem={() => ({ icon: "star", title: "ميزة جديدة", desc: "" })}
            render={(f, set) => (
              <>
                <IconPick value={f.icon} onChange={(v) => set("icon", v)} />
                <Text label="العنوان" value={f.title} onChange={(v) => set("title", v)} />
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

        {tab === "titles" && (
          <>
            <div className="note info">
              ضع أي كلمة بين أقواس {"{ }"} لتظهر باللون الذهبي، مثال: إضافات {"{اختيارية}"}. يعمل أيضاً في العنوان الرئيسي للواجهة.
            </div>
            {[
              ["packages", "عنوان الباقات"],
              ["packagesSub", "وصف الباقات"],
              ["addons", "عنوان الإضافات"],
              ["addonsSub", "وصف الإضافات"],
              ["features", "عنوان المميزات"],
              ["gallery", "عنوان العروض"],
              ["video", "عنوان الفيديو"],
              ["contact", "عنوان التواصل"],
            ].map(([k, l]) => <Text key={k} label={l} value={d.titles[k]} onChange={u(["titles", k])} />)}
          </>
        )}

        {tab === "theme" && (
          <>
            <button type="button" className="gold" onClick={applyBrand}>إرجاع ألوان وخطوط هوية المطوّر حسن</button>
            <b>ألوان الوضع الليلي</b>
            <div className="row">
              {COLOR_FIELDS.map(([k, l]) => (
                <label key={k}>
                  {l}
                  <input type="color" value={d.theme[k] || BRAND_THEME[k]} onChange={(e) => u(["theme", k])(e.target.value)} />
                </label>
              ))}
            </div>
            <div className="row">
              <FontPick label="خط العناوين" value={d.theme.headingFont} onChange={u(["theme", "headingFont"])} />
              <FontPick label="خط النصوص" value={d.theme.bodyFont} onChange={u(["theme", "bodyFont"])} />
            </div>
            <label>
              الوضع الافتراضي للزائر (يستطيع تغييره بزر الشمس/القمر أعلى الموقع)
              <select value={d.theme.mode || "auto"} onChange={(e) => u(["theme", "mode"])(e.target.value)}>
                <option value="auto">تلقائي حسب جهاز الزائر</option>
                <option value="dark">ليلي دائماً</option>
                <option value="light">نهاري دائماً</option>
              </select>
            </label>
            <div className="adm-card">
              <b>ألوان الوضع النهاري</b>
              <div className="row">
                {COLOR_FIELDS.map(([k, l]) => (
                  <label key={k}>
                    {l}
                    <input
                      type="color"
                      value={d.theme.light?.[k] || BRAND_THEME.light[k]}
                      onChange={(e) => setData((x) => ({ ...x, theme: { ...x.theme, light: { ...BRAND_THEME.light, ...x.theme.light, [k]: e.target.value } } }))}
                    />
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "about" && (
          <>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={d.about.show !== false} onChange={(e) => u(["about", "show"])(e.target.checked)} />
              إظهار قسم «من أنا» في الموقع
            </label>
            <div className="row">
              <Text label="عنوان القسم (الكلمة بين { } تظهر بالذهبي)" value={d.about.title} onChange={u(["about", "title"])} />
              <Text label="الاسم" value={d.about.name} onChange={u(["about", "name"])} />
            </div>
            <Text label="المسمى / التخصص" value={d.about.role} onChange={u(["about", "role"])} />
            <Img label="صورتك الشخصية (مربعة)" value={d.about.photo} onChange={u(["about", "photo"])} />
            <Text label="نبذة عنك (كل فقرة في سطر)" area rows={5} value={d.about.bio} onChange={u(["about", "bio"])} />
            <Text
              label="نقاط مميزة (كل نقطة في سطر)"
              area
              value={(d.about.highlights || []).join("\n")}
              onChange={(v) => u(["about", "highlights"])(v.split("\n").filter((x) => x.trim()))}
            />
            <div className="adm-card">
              <b>وثيقة العمل الحر</b>
              <div className="note">انتبه: لا ترفع صورة الوثيقة ورقم الهوية الوطنية ظاهر فيها. الصورة الحالية مخفي فيها رقم الهوية.</div>
              <Text label="عنوان الوثيقة" value={d.about.certTitle} onChange={u(["about", "certTitle"])} />
              <Text label="وصف الوثيقة" area value={d.about.certText} onChange={u(["about", "certText"])} />
              <div className="row">
                <Text label="رقم الوثيقة" ltr value={d.about.certNumber} onChange={u(["about", "certNumber"])} />
                <Text label="تاريخ الانتهاء" value={d.about.certExpiry} onChange={u(["about", "certExpiry"])} />
              </div>
              <Text label="رابط التحقق من الوثيقة (اختياري، الرابط الذي يفتحه الباركود)" ltr value={d.about.verifyUrl} onChange={u(["about", "verifyUrl"])} />
              <Img label="صورة شهادة العمل الحر" value={d.about.certImage} onChange={u(["about", "certImage"])} />
              <Img label="بطاقة العمل الحر (تظهر تحت الشهادة)" value={d.about.badgeImage} onChange={u(["about", "badgeImage"])} />
              <Text
                label="ملف PDF للبطاقة (زر تحميل تحت البطاقة)"
                ltr
                value={d.about.badgePdf}
                onChange={u(["about", "badgePdf"])}
                hint="الملف الحالي: /images/freelance-badge.pdf. اتركه فارغاً لإخفاء الزر."
              />
            </div>
          </>
        )}

        {tab === "inquiries" && <Inquiries form={d.form} setForm={(k, v) => u(["form", k])(v)} onCount={setNewCount} />}

        {tab === "seo" && (
          <>
            <div className="note info">
              الموقع عربي (lang=ar)، لذلك يُفهرس في جوجل كموقع عربي. خريطة الموقع وملف robots يُبنيان تلقائياً على الرابط المعتمد أدناه:
              {" "}<span dir="ltr">/sitemap.xml</span> و <span dir="ltr">/robots.txt</span>
            </div>
            <Text label="الرابط المعتمد للموقع" ltr value={d.seo.siteUrl} onChange={u(["seo", "siteUrl"])} hint={`مثال: ${SITE_URL}`} />
            <Text label="عنوان الصفحة في جوجل" value={d.seo.title} onChange={u(["seo", "title"])} />
            <Text label="وصف الصفحة في جوجل" area value={d.seo.description} onChange={u(["seo", "description"])} />
            <Img label="صورة المشاركة (تظهر عند مشاركة الرابط في واتساب وتويتر، يفضّل 1200×630)" value={d.seo.ogImage} onChange={u(["seo", "ogImage"])} />
          </>
        )}

        {tab === "social" && (
          <>
            <div className="note info">
              اكتب الرابط كاملاً أو اسم الحساب فقط (مثل @hassandev). اترك الحقل فارغاً لإخفاء الأيقونة. تظهر الأيقونات في قسم التواصل وأسفل الموقع، ويُستخدم حساب X في بطاقات تويتر عند مشاركة الرابط.
            </div>
            {SOCIALS.map(([k, l]) => (
              <Text key={k} label={l} ltr value={d.social?.[k]} onChange={u(["social", k])} />
            ))}
          </>
        )}

        {tab === "pages" && (
          <>
            <div className="adm-card">
              <b>الفوتر (أسفل الموقع)</b>
              <Text label="نص حقوق النشر" value={d.footer.text} onChange={u(["footer", "text"])} />
              <Text label="المدينة (اتركها فارغة لإخفائها)" value={d.footer.city} onChange={u(["footer", "city"])} />
            </div>
            <div className="note info">
              كل صفحة تضيفها تفتح على رابط الموقع مباشرة (مثال: الرابط refund يفتح hassandev.sa/refund) وتُضاف تلقائياً لخريطة الموقع. اختر أين تظهر: الفوتر أو الهيدر أو الاثنين. في النص: سطر يبدأ بـ # يصير عنوان فرعي، وسطر يبدأ بـ - يصير نقطة.
            </div>
            <List
              items={d.pages}
              onChange={u(["pages"])}
              addLabel="إضافة صفحة"
              title={(p) => p.title || "صفحة"}
              newItem={() => ({ slug: "", title: "صفحة جديدة", subtitle: "", body: "", contactLabel: "", showInHeader: false, showInFooter: true, published: true })}
              render={(p, set) => (
                <>
                  <Text label="عنوان الصفحة" value={p.title} onChange={(v) => set("title", v)} />
                  <Text
                    label="الرابط (إنجليزي صغير وأرقام وشرطة فقط)"
                    ltr
                    value={p.slug}
                    onChange={(v) => set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    hint={p.slug ? "الرابط: /" + p.slug : "مثال: refund"}
                  />
                  <Text label="عنوان فرعي (اختياري)" value={p.subtitle} onChange={(v) => set("subtitle", v)} />
                  <Text label="النص (كل فقرة في سطر)" area rows={8} value={p.body} onChange={(v) => set("body", v)} />
                  <Text label="جملة التواصل (اتركها فارغة لإخفاء رقم الجوال)" value={p.contactLabel} onChange={(v) => set("contactLabel", v)} />
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="checkbox" checked={p.published !== false} onChange={(e) => set("published", e.target.checked)} />
                    الصفحة منشورة
                  </label>
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="checkbox" checked={!!p.showInFooter} onChange={(e) => set("showInFooter", e.target.checked)} />
                    تظهر في الفوتر (أسفل الموقع)
                  </label>
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="checkbox" checked={!!p.showInHeader} onChange={(e) => set("showInHeader", e.target.checked)} />
                    تظهر في الهيدر (أعلى الموقع)
                  </label>
                </>
              )}
            />
          </>
        )}

        {tab === "tracking" && (
          <>
            <div className="note info">
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
