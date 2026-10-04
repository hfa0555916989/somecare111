"use client";
import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { BRAND_THEME, BRAND_ASSETS, FONTS, LATIN_FONTS, isFont, fontsHref, SITE_URL, SIZE_FIELDS, RATIOS, RATIO_FIELDS, DEFAULT_SIZES, sizeVars, docTotals, validIban, siteUrl } from "@/lib/defaults";
import { ICONS, SOCIALS, Icon } from "../Icons";
import { BrandLogo, BrandText, FooterBrand } from "../SiteChrome";

// مسودة التعديلات على هذا الجهاز (تُحفظ تلقائياً حتى لا تضيع قبل الضغط على «حفظ التغييرات»)
const DRAFT_KEY = "admin-draft";
const readDraft = () => {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    return null;
  }
};
const writeDraft = (v) => {
  try {
    if (v) localStorage.setItem(DRAFT_KEY, JSON.stringify(v));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {}
};

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

// inherit: نص خيار «نفس الخط الافتراضي» (القيمة الفارغة)
function FontPick({ label, value, onChange, inherit }) {
  const ok = isFont(value);
  const opt = (f) => (
    <option key={f} value={f} style={{ fontFamily: `"${f}"` }}>{f}</option>
  );
  return (
    <label>
      {label}
      <select value={ok ? value : ""} onChange={(e) => onChange(e.target.value)}>
        {inherit ? <option value="">{inherit}</option> : !ok && <option value="">اختر خطاً</option>}
        <optgroup label="خطوط عربية">{Object.keys(FONTS).filter((f) => !LATIN_FONTS.includes(f)).map(opt)}</optgroup>
        <optgroup label="خطوط إنجليزية">{LATIN_FONTS.map(opt)}</optgroup>
      </select>
    </label>
  );
}

function Img({ label, value, onChange, accept = "image/*", isVideo, file, presets }) {
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
      {!isVideo && !file && value ? <img src={value} alt="" /> : null}
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
        {presets && (
          <div className="adm-presets">
            {presets.map(([src, name, bg]) => (
              <button type="button" key={src} className={value === src ? "on" : ""} onClick={() => onChange(src)} title={src}>
                <img src={src} alt="" style={{ background: bg }} />
                <span>{name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// الشعارات الجاهزة المرفوعة في المشروع على GitHub (تُختار بضغطة)
const LOGOS = [
  ["/images/brand-icon.svg", "الأيقونة (مربع كحلي)", "#0b1628"],
  ["/images/brand-mark-light.svg", "الرمز بدون خلفية (ليلي، H أبيض)", "#0b1628"],
  ["/images/brand-mark-dark.svg", "الرمز بدون خلفية (نهاري، H كحلي)", "#f6f4ef"],
  ["/images/logo-horizontal-dark.svg", "الشعار الكامل الليلي", "#0b1628"],
  ["/images/logo-horizontal-light.svg", "الشعار الكامل النهاري", "#f6f4ef"],
];

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

// شريط لتكبير وتصغير قيمة، مع خانة رقم وزر إرجاع الافتراضي
function Range({ field, value, onChange }) {
  const [key, label, min, max, step, unit] = field;
  const v = Number.isFinite(Number(value)) ? Number(value) : DEFAULT_SIZES[key];
  return (
    <label className="adm-range">
      <span className="adm-range-h">
        {label}
        {v !== DEFAULT_SIZES[key] && (
          <button type="button" className="mini" onClick={() => onChange(DEFAULT_SIZES[key])} title={`الافتراضي ${DEFAULT_SIZES[key]}${unit}`}>
            افتراضي
          </button>
        )}
      </span>
      <span className="adm-range-row">
        <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => onChange(Number(e.target.value))} />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={v}
          dir="ltr"
          onChange={(e) => e.target.value !== "" && onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
        />
        <span className="adm-hint">{unit}</span>
      </span>
    </label>
  );
}

function Sizes({ d, set, reset, setTheme }) {
  const s = { ...DEFAULT_SIZES, ...d.sizes };
  const t = d.theme;
  const fam = (f, fallback) => `"${isFont(f) ? f : fallback}", system-ui, sans-serif`;
  // نفس متغيرات الموقع لكن على المعاينة فقط، فترى التغيير قبل الحفظ
  const vars = {
    ...Object.fromEntries(sizeVars(s)),
    "--font-brand": fam(t.brandFont, t.headingFont || BRAND_THEME.headingFont),
    "--font-tag": fam(t.taglineFont, t.bodyFont || BRAND_THEME.bodyFont),
  };
  const fonts = fontsHref([t.brandFont, t.taglineFont, t.headingFont, t.bodyFont]);
  const ratio = ([key, label]) => (
    <label key={key}>
      {label}
      <select value={RATIOS[s[key]] ? s[key] : DEFAULT_SIZES[key]} onChange={(e) => set(key, e.target.value)}>
        {Object.entries(RATIOS).map(([k, l]) => (
          <option key={k} value={k}>{l}</option>
        ))}
      </select>
    </label>
  );
  return (
    <>
      {fonts && <link rel="stylesheet" href={fonts} />}
      <div className="note info">
        حرّك الشريط أو اكتب الرقم. المعاينة تتغير فوراً، والتعديل يظهر في الموقع بعد «حفظ التغييرات».
      </div>
      <div className="adm-card">
        <div className="adm-card-h">
          <b>الهيدر (أعلى الموقع)</b>
          <button type="button" className="mini" onClick={() => {
              reset(SIZE_FIELDS.header.map((f) => f[0]).concat("showBrandText"));
              setTheme("brandFont", "");
              setTheme("taglineFont", "");
            }}>إرجاع الكل</button>
        </div>
        {[
          ["على الكمبيوتر", vars],
          // نفس قواعد الجوال في globals.css
          ["على الجوال", { ...vars, "--logo-h": vars["--logo-h-m"], "--brand-name": `calc(${vars["--brand-name"]} * .85)`, "--brand-tag": `calc(${vars["--brand-tag"]} * .9)`, maxWidth: 380 }],
        ].map(([l, st]) => (
          <div key={l}>
            <span className="adm-hint">معاينة {l}</span>
            <div className="adm-preview" style={st}>
              <span className="brand">
                <BrandLogo b={d.brand} alt="" />
                {s.showBrandText !== false && <BrandText b={d.brand} />}
              </span>
            </div>
          </div>
        ))}
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={s.showBrandText !== false} onChange={(e) => set("showBrandText", e.target.checked)} />
          إظهار الاسم والسطر الإنجليزي بجانب الشعار (أخفِه إذا كان الشعار نفسه فيه كتابة)
        </label>
        <div className="row">
          <FontPick label="خط اسم الموقع بجانب الشعار" value={t.brandFont} onChange={(v) => setTheme("brandFont", v)} inherit={`نفس خط العناوين (${t.headingFont || BRAND_THEME.headingFont})`} />
          <FontPick label="خط السطر الإنجليزي تحت الاسم" value={t.taglineFont} onChange={(v) => setTheme("taglineFont", v)} inherit={`نفس خط النصوص (${t.bodyFont || BRAND_THEME.bodyFont})`} />
        </div>
        <span className="adm-hint">خط الاسم يُستخدم أيضاً في الفوتر. للسطر الإنجليزي جرّب الخطوط الإنجليزية مثل Montserrat أو Cinzel.</span>
        {SIZE_FIELDS.header.map((f) => (
          <Range key={f[0]} field={f} value={s[f[0]]} onChange={(v) => set(f[0], v)} />
        ))}
      </div>
      <div className="adm-card">
        <div className="adm-card-h">
          <b>الفوتر (أسفل الموقع)</b>
          <button type="button" className="mini" onClick={() => reset(SIZE_FIELDS.footer.map((f) => f[0]))}>إرجاع الكل</button>
        </div>
        <div className="adm-preview" style={{ ...vars, justifyContent: "center" }}>
          <FooterBrand c={{ ...d, sizes: s }} as="span" />
        </div>
        {SIZE_FIELDS.footer.map((f) => (
          <Range key={f[0]} field={f} value={s[f[0]]} onChange={(v) => set(f[0], v)} />
        ))}
      </div>
      <div className="adm-card">
        <div className="adm-card-h">
          <b>الصور</b>
          <button type="button" className="mini" onClick={() => reset(SIZE_FIELDS.images.map((f) => f[0]).concat(RATIO_FIELDS.map((f) => f[0])))}>إرجاع الكل</button>
        </div>
        <div className="row">{RATIO_FIELDS.map(ratio)}</div>
        <span className="adm-hint">«الشكل الأصلي» يعرض الصورة كاملة بدون قص، والأشكال الأخرى تقص أطراف الصورة لتناسب الشكل.</span>
        {SIZE_FIELDS.images.map((f) => (
          <Range key={f[0]} field={f} value={s[f[0]]} onChange={(v) => set(f[0], v)} />
        ))}
      </div>
    </>
  );
}

const TABS = [
  ["brand", "الهوية والشعار"],
  ["sizes", "الأحجام والخطوط"],
  ["inquiries", "الاستفسارات"],
  ["docs", "العقود وعروض الأسعار"],
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

/* ---------- العقود وعروض الأسعار ---------- */
const DOC_TYPES = { quote: "عرض سعر", contract: "عقد" };
const DOC_STATUS = { draft: "مسودة", sent: "مُرسل", accepted: "تمت الموافقة", cancelled: "ملغي" };
// تاريخ اليوم بتوقيت جهاز المستخدم (وليس UTC)
const today = () => new Date().toLocaleDateString("en-CA");
const money = (n) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
const toLines = (v) => (v || []).join("\n");
const fromLines = (v) => v.split("\n").map((x) => x.trim()).filter(Boolean);

// يقرأ الملف كـ base64 بدون بادئة data:
const readB64 = (f) =>
  new Promise((ok, no) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1] || "");
    r.onerror = no;
    r.readAsDataURL(f);
  });

function blankDoc(type, k) {
  return {
    type,
    number: "",
    date: today(),
    validDays: type === "quote" ? Number(k.validDays) || 15 : 0,
    title: "",
    subtitle: "",
    intro: "",
    client: { name: "", company: "", idNumber: "", phone: "", email: "", city: "" },
    sections: [],
    discount: 0,
    vatRate: Number(k.vatRate) || 0,
    recurring: [],
    duration: "",
    terms: [...((type === "contract" ? k.contractTerms : k.quoteTerms) || [])],
    annex: [],
    attachments: [],
    ref: "",
    status: "draft",
  };
}

function DocEditor({ doc, setDoc, k, items, onSave, onCancel, saving }) {
  const set = (key, v) => setDoc({ ...doc, [key]: v });
  const setClient = (key, v) => setDoc({ ...doc, client: { ...doc.client, [key]: v } });
  const t = docTotals(doc);
  // وثيقة أخرى بنفس الرقم (مثلاً عند إعادة استيراد نفس العرض مع ملف الخصائص)
  const num = String(doc.number || "").trim().toUpperCase();
  const dup = num && (items || []).find((x) => x.id !== doc.id && String(x.number || "").trim().toUpperCase() === num);
  const canReplace = dup && dup.status !== "accepted" && dup.status !== "cancelled";
  return (
    <div className="adm-card" style={{ borderColor: "#d4a84b88" }}>
      <div className="adm-card-h">
        <b>{doc.id ? `تعديل ${doc.number}` : `${DOC_TYPES[doc.type]} جديد`}</b>
        <button type="button" className="mini" onClick={onCancel}>إغلاق بدون حفظ</button>
      </div>
      <div className="row">
        <label>
          النوع
          <select value={doc.type} onChange={(e) => set("type", e.target.value)}>
            <option value="quote">عرض سعر</option>
            <option value="contract">عقد تقديم خدمات</option>
          </select>
        </label>
        <Text label="رقم الوثيقة (اتركه فارغاً للترقيم التلقائي)" ltr value={doc.number} onChange={(v) => set("number", v)} />
      </div>
      {dup && (
        <div className="note">
          الرقم {dup.number} مستخدم في وثيقة محفوظة ({DOC_STATUS[dup.status]}).
          {canReplace
            ? " إذا هذا نفس العرض بعد التحديث، حدّث الوثيقة الموجودة فيبقى نفس الرابط اللي أرسلته للعميل. أو غيّر الرقم لإنشاء وثيقة مستقلة."
            : " غيّر الرقم لإنشاء وثيقة جديدة، لأن الوثيقة الموجودة مقفلة."}
          {canReplace && (
            <div style={{ marginTop: 8 }}>
              <button type="button" className="mini" onClick={() => setDoc({ ...doc, id: dup.id, token: dup.token, status: dup.status })}>
                تحديث الوثيقة الموجودة {dup.number} بهذه البيانات (نفس الرابط)
              </button>
            </div>
          )}
        </div>
      )}
      <div className="row">
        <label>
          التاريخ
          <input type="date" value={doc.date} onChange={(e) => set("date", e.target.value)} />
        </label>
        {doc.type === "quote" ? (
          <label>
            صلاحية العرض بالأيام (0 = بدون صلاحية)
            <input type="number" min="0" max="365" value={doc.validDays} onChange={(e) => set("validDays", Number(e.target.value))} />
          </label>
        ) : (
          <Text label="مبني على عرض رقم (اختياري)" ltr value={doc.ref} onChange={(v) => set("ref", v)} />
        )}
      </div>
      <Text label="العنوان (مثل: موقع سبا متكامل)" value={doc.title} onChange={(v) => set("title", v)} />
      <Text label="سطر تحت العنوان (مثل: مع الدفع الإلكتروني)" value={doc.subtitle} onChange={(v) => set("subtitle", v)} />
      <Text label="وصف مختصر" area rows={2} value={doc.intro} onChange={(v) => set("intro", v)} />

      <div className="adm-card">
        <b>العميل</b>
        <div className="row">
          <Text label="اسم العميل / الممثل" value={doc.client.name} onChange={(v) => setClient("name", v)} />
          <Text label="المنشأة (اختياري)" value={doc.client.company} onChange={(v) => setClient("company", v)} />
        </div>
        <div className="row">
          <Text label="رقم الهوية / السجل التجاري (للعقود)" ltr value={doc.client.idNumber} onChange={(v) => setClient("idNumber", v)} />
          <Text label="الجوال (لإرسال الرابط واتساب)" ltr value={doc.client.phone} onChange={(v) => setClient("phone", v)} />
        </div>
        <div className="row">
          <Text label="البريد" ltr value={doc.client.email} onChange={(v) => setClient("email", v)} />
          <Text label="المدينة" value={doc.client.city} onChange={(v) => setClient("city", v)} />
        </div>
      </div>

      <b>البنود والأسعار</b>
      <List
        items={doc.sections}
        onChange={(v) => set("sections", v)}
        addLabel="إضافة بند"
        title={(s, i) => `${i + 1}. ${s.title || "بند"} · ${money(s.price * (s.qty || 1))} ريال`}
        newItem={() => ({ title: "", desc: "", qty: 1, price: 0, note: "", features: [], tags: [] })}
        render={(s, setS) => (
          <>
            <Text label="اسم البند" value={s.title} onChange={(v) => setS("title", v)} />
            <Text label="وصف مختصر" value={s.desc} onChange={(v) => setS("desc", v)} />
            <div className="row">
              <label>
                السعر (ريال)
                <input type="number" min="0" value={s.price} onChange={(e) => setS("price", Number(e.target.value))} />
              </label>
              <label>
                الكمية
                <input type="number" min="1" value={s.qty || 1} onChange={(e) => setS("qty", Math.max(1, Number(e.target.value)))} />
              </label>
            </div>
            <Text label="ملاحظة قصيرة (مثل: اشتراك سنوي يُدفع مع الموقع)" value={s.note} onChange={(v) => setS("note", v)} />
            <Text label="المزايا (كل ميزة في سطر)" area rows={5} value={toLines(s.features)} onChange={(v) => setS("features", fromLines(v))} />
            <Text label="شارات صغيرة (كل شارة في سطر، مثل مدى / Visa)" area rows={2} value={toLines(s.tags)} onChange={(v) => setS("tags", fromLines(v))} />
          </>
        )}
      />
      <div className="row">
        <label>
          خصم (ريال)
          <input type="number" min="0" value={doc.discount} onChange={(e) => set("discount", Number(e.target.value))} />
        </label>
        <label>
          ضريبة القيمة المضافة % (0 إذا غير مسجّل)
          <input type="number" min="0" max="100" value={doc.vatRate} onChange={(e) => set("vatRate", Number(e.target.value))} />
        </label>
      </div>
      <div className="note info">
        المجموع {money(t.subtotal)}{t.discount > 0 && ` − خصم ${money(t.discount)}`}{t.vat > 0 && ` + ضريبة ${money(t.vat)}`} = <b style={{ color: "#d4a84b" }}>الإجمالي {money(t.total)} ريال</b>
      </div>
      <Text label="رسوم متكررة / تجديد (كل سطر منفصل)" area rows={2} value={toLines(doc.recurring)} onChange={(v) => set("recurring", fromLines(v))} />
      <Text label="مدة التنفيذ" value={doc.duration} onChange={(v) => set("duration", v)} hint="مثال: من 21 إلى 30 يوم عمل من استلام المحتوى والدفعة الأولى" />
      <Text label={doc.type === "contract" ? "بنود العقد (كل بند في سطر)" : "الشروط والملاحظات (كل شرط في سطر)"} area rows={8} value={toLines(doc.terms)} onChange={(v) => set("terms", fromLines(v))} />
      <button type="button" className="mini" style={{ justifySelf: "start" }} onClick={() => confirm("استبدال البنود الحالية بالبنود الافتراضية من الإعدادات؟") && set("terms", [...((doc.type === "contract" ? k.contractTerms : k.quoteTerms) || [])])}>
        استعادة البنود الافتراضية
      </button>

      <b>الملحق الفني (الخصائص والمواصفات)</b>
      <List
        items={doc.annex}
        onChange={(v) => set("annex", v)}
        addLabel="إضافة قسم للملحق"
        title={(a, i) => `${i + 1}. ${a.title || "قسم"}`}
        newItem={() => ({ title: "", intro: "", points: [] })}
        render={(a, setA) => (
          <>
            <Text label="عنوان القسم" value={a.title} onChange={(v) => setA("title", v)} />
            <Text label="وصف القسم" area rows={2} value={a.intro} onChange={(v) => setA("intro", v)} />
            <Text label="النقاط (كل نقطة في سطر، واكتب «العنوان: الوصف» ليظهر العنوان بخط عريض)" area rows={6} value={toLines(a.points)} onChange={(v) => setA("points", fromLines(v))} />
          </>
        )}
      />

      <b>المرفقات (PDF أو صور)</b>
      <List
        items={doc.attachments}
        onChange={(v) => set("attachments", v)}
        addLabel="إضافة مرفق"
        title={(a) => a.title || "مرفق"}
        newItem={() => ({ title: "", url: "" })}
        render={(a, setA) => (
          <>
            <Text label="اسم المرفق" value={a.title} onChange={(v) => setA("title", v)} />
            <Img label="الملف" file accept="application/pdf,image/*" value={a.url} onChange={(v) => setA("url", v)} />
          </>
        )}
      />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" className="primary" onClick={onSave} disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ الوثيقة"}</button>
        <button type="button" className="mini" onClick={onCancel}>إلغاء</button>
      </div>
    </div>
  );
}

function Docs({ k, setK, about, site }) {
  const [items, setItems] = useState(null);
  const [info, setInfo] = useState({ db: true, ai: false });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");
  const importRef = useRef(null);

  async function load() {
    const r = await fetch("/api/docs");
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setMsg(j.error || "تعذر التحميل");
    setItems(j.items);
    setInfo({ db: j.db, ai: j.ai });
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!editing.sections.length && !confirm("لا توجد بنود أسعار. حفظ الوثيقة مع ذلك؟")) return;
    setSaving(true);
    setMsg("");
    const r = await fetch("/api/docs", { method: editing.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    const j = await r.json().catch(() => ({}));
    setSaving(false);
    if (!r.ok) return setMsg(j.error || "تعذر الحفظ");
    setEditing(null);
    setMsg(`تم حفظ ${j.item.number} ✓`);
    load();
  }

  async function setStatus(d, status) {
    const r = await fetch("/api/docs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: d.id, status, statusOnly: true }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) setMsg(j.error || "تعذر التحديث");
    load();
  }

  async function remove(d) {
    if (!confirm(`حذف ${d.number} نهائياً؟ سيتوقف رابطه عن العمل.`)) return;
    await fetch(`/api/docs?id=${encodeURIComponent(d.id)}`, { method: "DELETE" });
    load();
  }

  async function importPdf(e) {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    if (!files.length) return;
    setImporting(true);
    setMsg("");
    try {
      const payload = await Promise.all(files.slice(0, 4).map(async (f) => ({ name: f.name, data: await readB64(f) })));
      const r = await fetch("/api/docs/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ files: payload }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "تعذر الاستيراد");
      const base = blankDoc(j.doc.type, k);
      setEditing({
        ...base,
        ...j.doc,
        number: j.doc.number || "",
        terms: j.doc.terms?.length ? j.doc.terms : base.terms,
        validDays: j.doc.validDays || base.validDays,
        status: "draft",
      });
      setMsg("تمت قراءة الملف. راجع كل الحقول والأسعار قبل الحفظ.");
    } catch (x) {
      setMsg(x.message);
    }
    setImporting(false);
  }

  const copyOf = (d, type) => {
    const { id, token, createdAt, updatedAt, acceptance, provider, ...rest } = d;
    const base = blankDoc(type, k);
    return {
      ...rest,
      type,
      number: "",
      date: today(),
      status: "draft",
      validDays: type === "quote" ? d.validDays || base.validDays : 0,
      ...(type !== d.type ? { ref: d.number, terms: base.terms } : {}),
    };
  };

  const link = (d) => `${site}/doc/${d.token}`;
  const wa = (d) => {
    let p = String(d.client?.phone || "").replace(/\D/g, "");
    if (p.startsWith("05")) p = "966" + p.slice(1);
    const text = `السلام عليكم ${d.client?.name || ""}\nمرفق ${DOC_TYPES[d.type]} رقم ${d.number}${d.title ? ` (${d.title})` : ""}:\n${link(d)}\nيمكنك مراجعته والموافقة عليه من نفس الرابط، وفيه روابط التحقق من وثيقة العمل الحر وملكية النطاق.`;
    return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
  };
  const ibanOk = !k.iban || validIban(k.iban);
  const sk = (key) => (v) => setK(key, v);
  const list = (items || []).filter((d) => {
    const s = q.trim();
    return !s || [d.number, d.title, d.client?.name, d.client?.company, d.client?.phone].some((v) => String(v || "").includes(s));
  });

  return (
    <>
      {!info.db && <div className="note">قاعدة البيانات غير مربوطة، لذلك لا يمكن حفظ الوثائق.</div>}
      {msg && <div className="note info">{msg}</div>}

      {editing ? (
        <DocEditor doc={editing} setDoc={setEditing} k={k} items={items} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
      ) : (
        <>
          <div className="adm-docs-h">
            <button type="button" className="gold" onClick={() => setEditing(blankDoc("quote", k))}>+ عرض سعر جديد</button>
            <button type="button" className="gold" onClick={() => setEditing(blankDoc("contract", k))}>+ عقد جديد</button>
            <button type="button" className="gold" disabled={!info.ai || importing} onClick={() => importRef.current?.click()} title={info.ai ? "" : "يتطلب ANTHROPIC_API_KEY في Vercel"}>
              {importing ? "جارٍ قراءة الملف... (حتى دقيقة)" : "استيراد من PDF بالذكاء الاصطناعي"}
            </button>
            <input ref={importRef} type="file" accept="application/pdf" multiple hidden onChange={importPdf} />
          </div>
          <span className="adm-hint">
            {info.ai
              ? "ارفع ملف عرض السعر، ويمكنك اختيار ملف الخصائص معه (حتى 4 ملفات و3MB) فتُعبّأ البنود والأسعار والشروط والملحق تلقائياً لتراجعها."
              : "لتفعيل الاستيراد من PDF أضف المتغير ANTHROPIC_API_KEY في Vercel ثم أعد النشر."}
          </span>

          <Text label="بحث (رقم، عنوان، عميل، جوال)" value={q} onChange={setQ} />
          {items === null ? (
            <p>جارٍ التحميل...</p>
          ) : list.length === 0 ? (
            <p className="adm-hint">لا توجد وثائق بعد.</p>
          ) : (
            list.map((d) => (
              <div key={d.id} className="adm-card adm-inq">
                <div className="adm-inq-h">
                  <b>{d.number}</b>
                  <span className="adm-pill">{DOC_TYPES[d.type]}</span>
                  <span className={"adm-pill " + d.status}>{DOC_STATUS[d.status] || d.status}</span>
                  <time>{d.date}</time>
                </div>
                <div>
                  <strong>{d.title || "بدون عنوان"}</strong>
                  {(d.client?.company || d.client?.name) && <span className="adm-hint"> · {d.client.company || d.client.name}</span>}
                  <span style={{ color: "#d4a84b", marginInlineStart: 10 }}>{money(docTotals(d).total)} ريال</span>
                </div>
                {d.acceptance && (
                  <span className="ok">
                    وافق {d.acceptance.name} في {new Date(d.acceptance.at).toLocaleString("ar-SA-u-nu-latn-ca-gregory", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                )}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <a className="mini" href={link(d)} target="_blank" rel="noopener" style={{ color: "#d4a84b" }}>فتح ↗</a>
                  <button type="button" className="mini" onClick={() => navigator.clipboard.writeText(link(d)).then(() => setMsg("تم نسخ الرابط ✓"))}>نسخ الرابط</button>
                  {d.client?.phone && (
                    <a className="mini" href={wa(d)} target="_blank" rel="noopener" style={{ color: "#7dffb0" }} onClick={() => d.status === "draft" && setStatus(d, "sent")}>
                      إرسال للعميل واتساب
                    </a>
                  )}
                  {d.status !== "accepted" && d.status !== "cancelled" && (
                    <button type="button" className="mini" onClick={() => setEditing(structuredClone(d))}>تعديل</button>
                  )}
                  <button type="button" className="mini" onClick={() => setEditing(copyOf(d, d.type))}>نسخة جديدة</button>
                  {d.type === "quote" && <button type="button" className="mini" onClick={() => setEditing(copyOf(d, "contract"))}>تحويل لعقد</button>}
                  {d.status === "draft" && <button type="button" className="mini" onClick={() => setStatus(d, "sent")}>تعليم كمُرسل</button>}
                  {d.status !== "cancelled" && (
                    <button type="button" className="mini danger" onClick={() => confirm(`إلغاء ${d.number}؟ سيظهر للعميل أنه ملغي.`) && setStatus(d, "cancelled")}>إلغاء</button>
                  )}
                  {d.status !== "accepted" && <button type="button" className="mini danger" onClick={() => remove(d)}>حذف</button>}
                </div>
              </div>
            ))
          )}

          <div className="adm-card">
            <b>بيانات تظهر في كل عرض سعر وعقد (تُحفظ بزر «حفظ التغييرات» أعلى الصفحة)</b>
            <div className="note info">
              بيانات وثيقة العمل الحر (الرقم والصلاحية والصورة ورابط التحقق) تُؤخذ من تبويب «من أنا والترخيص». بعد موافقة العميل تُثبَّت هذه البيانات داخل وثيقته ولا تتغير بتعديلها هنا.
              {!about.certNumber && <span className="err"> رقم وثيقة العمل الحر فارغ.</span>}
            </div>
            <Text label="اسم مقدّم الخدمة (كما في وثيقة العمل الحر)" value={k.providerName} onChange={sk("providerName")} />
            <div className="row">
              <Text label="البنك" value={k.bankName} onChange={sk("bankName")} />
              <Text label="اسم المستفيد في الحساب" value={k.accountName} onChange={sk("accountName")} />
            </div>
            <Text
              label="رقم الآيبان"
              ltr
              value={k.iban}
              onChange={(v) => setK("iban", v.toUpperCase().replace(/[^A-Z0-9 ]/g, ""))}
              hint={k.iban ? (ibanOk ? "✓ آيبان سعودي صحيح" : "✗ الآيبان غير صحيح، تأكد من الأرقام (SA + 22 رقماً)") : "مثال: SA00 0000 0000 0000 0000 0000"}
            />
            <Img label="شهادة الآيبان من البنك (PDF، تُرفق تلقائياً مع كل عرض وعقد)" file accept="application/pdf,image/*" value={k.ibanCert} onChange={sk("ibanCert")} />
            {k.accountName && k.providerName && k.accountName.trim() !== k.providerName.trim() && (
              <span className="err">تنبيه: اسم المستفيد يختلف عن اسم مقدّم الخدمة، والتطابق بينهما من أهم ما يطمئن العميل.</span>
            )}
            <div className="adm-card">
              <b>إثبات ملكية النطاق</b>
              <Text label="جهة التسجيل" value={k.domainRegistrar} onChange={sk("domainRegistrar")} />
              <div className="row">
                <Text label="تاريخ التسجيل" ltr value={k.domainRegistered} onChange={sk("domainRegistered")} />
                <Text label="تاريخ الانتهاء" ltr value={k.domainExpiry} onChange={sk("domainExpiry")} />
              </div>
              <Img label="كتاب إثبات تسجيل النطاق (PDF)" file accept="application/pdf" value={k.domainProof} onChange={sk("domainProof")} />
              <Text label="رابط بحث WHOIS" ltr value={k.whoisUrl} onChange={sk("whoisUrl")} />
            </div>
            <div className="row">
              <label>
                صلاحية عرض السعر الافتراضية (أيام)
                <input type="number" min="0" value={k.validDays} onChange={(e) => setK("validDays", Number(e.target.value))} />
              </label>
              <label>
                ضريبة القيمة المضافة الافتراضية %
                <input type="number" min="0" max="100" value={k.vatRate} onChange={(e) => setK("vatRate", Number(e.target.value))} />
              </label>
            </div>
            <Text label="الشروط الافتراضية لعروض الأسعار (كل شرط في سطر)" area rows={6} value={toLines(k.quoteTerms)} onChange={(v) => setK("quoteTerms", fromLines(v))} />
            <Text label="البنود الافتراضية للعقود (كل بند في سطر)" area rows={10} value={toLines(k.contractTerms)} onChange={(v) => setK("contractTerms", fromLines(v))} />
            <span className="adm-hint">البنود الافتراضية نموذج عام؛ راجعها بما يناسب طبيعة عملك قبل استخدامها.</span>
          </div>
        </>
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
  const [storage, setStorage] = useState("redis");
  // آخر نسخة محفوظة في الموقع (لمعرفة هل توجد تعديلات لم تُحفظ)
  const [savedJson, setSavedJson] = useState("");
  const [draft, setDraft] = useState(null);
  const importRef = useRef(null);

  async function load() {
    const r = await fetch("/api/content");
    if (r.status === 401) return setState("login");
    const j = await r.json();
    setData(j.content);
    setDb(j.dbConnected);
    setStorage(j.storage || (j.dbConnected ? "redis" : null));
    const json = JSON.stringify(j.content);
    setSavedJson(json);
    const dr = readDraft();
    if (dr?.data && JSON.stringify(dr.data) !== json) setDraft(dr);
    else writeDraft(null);
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

  const dirty = !!data && !!savedJson && JSON.stringify(data) !== savedJson;

  // حفظ تلقائي على هذا الجهاز عند كل تعديل (لا يُكتب فوق مسودة سابقة لم يُقرَّر بشأنها بعد)
  useEffect(() => {
    if (state !== "ready" || draft) return;
    const t = setTimeout(() => writeDraft(dirty ? { data, at: Date.now() } : null), 400);
    return () => clearTimeout(t);
  }, [data, dirty, state, draft]);

  // تنبيه قبل إغلاق الصفحة إذا توجد تعديلات لم تُحفظ في الموقع
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function restoreDraft() {
    setData(draft.data);
    setDraft(null);
  }
  function discardDraft() {
    writeDraft(null);
    setDraft(null);
  }

  // نسخة احتياطية كملف على جهازك
  function exportBackup() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `hassandev-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function importBackup(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      if (!j || typeof j !== "object" || !j.brand || !j.hero) throw new Error();
      if (!confirm("استبدال كل المحتوى في اللوحة بمحتوى الملف؟ لن يُنشر حتى تضغط «حفظ التغييرات».")) return;
      setData({ ...data, ...j, sizes: { ...DEFAULT_SIZES, ...j.sizes } });
      setMsg("");
    } catch {
      setMsg("الملف غير صالح، اختر ملف نسخة احتياطية من هذه اللوحة.");
    }
  }

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
    if (r.ok) {
      setSavedJson(JSON.stringify(data));
      writeDraft(null);
      setDraft(null);
    }
    setSaving(false);
  }

  const u = (path) => (v) => setData((d) => setIn(d, path, v));
  const setSize = (k, v) => setData((d) => ({ ...d, sizes: { ...DEFAULT_SIZES, ...d.sizes, [k]: v } }));
  const resetSizes = (keys) =>
    setData((d) => ({ ...d, sizes: { ...DEFAULT_SIZES, ...d.sizes, ...Object.fromEntries(keys.map((k) => [k, DEFAULT_SIZES[k]])) } }));

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
        {msg === "ok" && !dirty && <span className="ok">تم الحفظ{storage === "file" ? " في الملف المحلي .data/content.json" : ""} ✓</span>}
        {msg && msg !== "ok" && <span className="err">{msg}</span>}
        {dirty && !saving && <span className="adm-hint">تعديلات لم تُنشر بعد (محفوظة مؤقتاً على هذا الجهاز)</span>}
        <span className="adm-top-tools">
          <button className="mini" onClick={exportBackup} title="تنزيل كل المحتوى كملف على جهازك">تنزيل نسخة احتياطية</button>
          <button className="mini" onClick={() => importRef.current?.click()} title="استرجاع المحتوى من ملف نسخة احتياطية">استيراد نسخة</button>
          <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={importBackup} />
        </span>
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
        {draft && (
          <div className="note">
            توجد تعديلات محفوظة على هذا الجهاز ولم تُنشر في الموقع
            {draft.at ? ` (${new Date(draft.at).toLocaleString("ar-SA-u-nu-latn", { dateStyle: "medium", timeStyle: "short" })})` : ""}.
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="button" className="mini" onClick={restoreDraft}>استعادتها</button>
              <button type="button" className="mini danger" onClick={discardDraft}>تجاهلها</button>
            </div>
          </div>
        )}

        {!db && (
          <div className="note">
            قاعدة البيانات غير مربوطة بعد، لذلك لن يُحفظ أي تعديل. من Vercel: Storage ← Create Database ← Upstash Redis، ثم اربطها بالمشروع وأعد النشر.
          </div>
        )}

        {storage === "file" && (
          <div className="note info">
            تعمل الآن على جهازك بدون Upstash، لذلك «حفظ التغييرات» يحفظ في الملف المحلي <span dir="ltr">.data/content.json</span> داخل مجلد المشروع.
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
            <div className="adm-card">
              <b>الشعار في الأعلى (الهيدر)</b>
              <Img label="الوضع الليلي" value={d.brand.logo} onChange={u(["brand", "logo"])} presets={LOGOS} />
              <Img label="الوضع النهاري (اتركه فارغاً لاستخدام نفس الشعار)" value={d.brand.logoLight} onChange={u(["brand", "logoLight"])} presets={LOGOS} />
              <span className="adm-hint">إذا اخترت «الرمز بدون خلفية (نهاري)» لليلي، يُستبدل تلقائياً بنسخته ذات H الأبيض حتى لا يختفي.</span>
            </div>
            <div className="adm-card">
              <b>الشعار في الأسفل (الفوتر)</b>
              <Img label="الوضع الليلي (اتركه فارغاً لاستخدام شعار الهيدر)" value={d.brand.footerLogo} onChange={u(["brand", "footerLogo"])} presets={LOGOS} />
              <Img label="الوضع النهاري" value={d.brand.footerLogoLight} onChange={u(["brand", "footerLogoLight"])} presets={LOGOS} />
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={!!d.brand.footerShowName} onChange={(e) => u(["brand", "footerShowName"])(e.target.checked)} />
                إظهار اسم الموقع بجانب شعار الفوتر (أطفئه مع الشعار الكامل لأنه يحتوي الاسم)
              </label>
            </div>
            <button type="button" className="gold" onClick={() => setTab("sizes")}>حجم وخط الشعار والكتابة بجانبه ←</button>
            <Img label="أيقونة المتصفح Favicon (مربعة، SVG أو PNG)" value={d.brand.favicon} onChange={u(["brand", "favicon"])} />
            <Img label="أيقونة الجوال عند الإضافة للشاشة الرئيسية (PNG مربع)" value={d.brand.appleIcon} onChange={u(["brand", "appleIcon"])} />
            <Text label="نص الفوتر" value={d.footer.text} onChange={u(["footer", "text"])} />
          </>
        )}

        {tab === "sizes" && <Sizes d={d} set={setSize} reset={resetSizes} setTheme={(k, v) => u(["theme", k])(v)} />}

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
            <div className="adm-card">
              <b>قسم «عقود موثّقة وعروض أسعار رسمية» في الصفحة الرئيسية</b>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={d.trust?.show !== false} onChange={(e) => u(["trust", "show"])(e.target.checked)} />
                إظهار القسم (يظهر بعد «ماذا ستحصل عليه» وقبل «من أنا»)
              </label>
              <Text label="العنوان (الكلمة بين { } تظهر بالذهبي)" value={d.trust?.title} onChange={u(["trust", "title"])} />
              <Text label="النص تحت العنوان" area rows={2} value={d.trust?.subtitle} onChange={u(["trust", "subtitle"])} />
              <List
                items={d.trust?.points || []}
                onChange={u(["trust", "points"])}
                addLabel="إضافة نقطة"
                title={(p) => p.title || "نقطة"}
                newItem={() => ({ icon: "shield", title: "", desc: "" })}
                render={(p, set) => (
                  <>
                    <IconPick value={p.icon} onChange={(v) => set("icon", v)} />
                    <Text label="العنوان" value={p.title} onChange={(v) => set("title", v)} />
                    <Text label="الوصف" area rows={2} value={p.desc} onChange={(v) => set("desc", v)} />
                  </>
                )}
              />
              <Text label="جملة قبل الزر" value={d.trust?.note} onChange={u(["trust", "note"])} />
              <Text label="نص الزر (يفتح واتساب، اتركه فارغاً لإخفائه)" value={d.trust?.button} onChange={u(["trust", "button"])} />
            </div>
          </>
        )}

        {tab === "docs" && (
          <Docs
            k={d.contracts || {}}
            setK={(key, v) => setData((x) => ({ ...x, contracts: { ...x.contracts, [key]: v } }))}
            about={d.about || {}}
            site={siteUrl(d)}
          />
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
