"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { KINDS, CATS, CHANNELS } from "@/lib/finance";
import { AIcon } from "./AdminIcons";
import { uploadPrivate, patchFile, fileUrl } from "./upload";

const money = (n) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
const size = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const CAT_ICON = { contract: "file", quote: "file", invoice: "expense", ads: "ads", income: "income", bank: "funding", gov: "badge", project: "box", image: "image", other: "pages" };
const SECTION_NAMES = { brand: "الهوية والشعار", hero: "الواجهة", gallery: "الصور والعروض", packages: "الباقات", about: "من أنا", seo: "SEO", video: "الفيديو", trust: "قسم العقود الموثّقة", contracts: "العقود" };
const FIELD_NAMES = { logo: "الشعار الليلي", logoLight: "الشعار النهاري", footerLogo: "شعار الفوتر", footerLogoLight: "شعار الفوتر النهاري", favicon: "أيقونة المتصفح", appleIcon: "أيقونة الجوال", image: "الصورة", src: "الصورة", photo: "الصورة الشخصية", certImage: "صورة الشهادة", badgeImage: "بطاقة العمل الحر", ogImage: "صورة المشاركة", url: "الفيديو", ibanCert: "شهادة الآيبان", domainProof: "إثبات النطاق" };
const fieldLabel = (path) =>
  path
    .map((p, i) => (i === 0 ? SECTION_NAMES[p] || p : typeof p === "number" ? `#${p + 1}` : FIELD_NAMES[p] || p))
    .join(" · ");
const isImg = (u) => /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(u) || /blob\.vercel-storage\.com/.test(u);

export default function Archive({ onRestore }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [view, setView] = useState("files");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [smart, setSmart] = useState(true);
  const [busy, setBusy] = useState("");
  const [editing, setEditing] = useState(null);
  const [pending, setPending] = useState([]); // عمليات مقترحة من الفواتير
  const inputRef = useRef(null);

  async function load() {
    const r = await fetch("/api/files");
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setErr(j.error || "تعذر التحميل");
    setData(j);
  }
  useEffect(() => {
    load();
  }, []);

  const years = useMemo(() => {
    const ys = new Set((data?.items || []).map((f) => f.year));
    ys.add(String(new Date().getFullYear()));
    return [...ys].sort().reverse();
  }, [data]);

  async function classify(item) {
    const r = await fetch("/api/files/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "تعذر الفرز");
    const s = j.suggestion;
    const next = await patchFile(item.id, { title: s.title, cat: s.cat, date: s.date, client: s.client, docRef: s.docRef, amount: s.amount, note: s.summary });
    if (s.entries?.length) setPending((p) => [...p, ...s.entries.map((e) => ({ ...e, fileId: item.id, fileTitle: next.title }))]);
    return next;
  }

  async function onFiles(e) {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    if (!files.length) return;
    setErr("");
    let n = 0;
    for (const f of files) {
      n++;
      setBusy(`جارٍ رفع ${n} من ${files.length}: ${f.name}`);
      try {
        const item = await uploadPrivate(f, { cat: cat !== "all" ? cat : f.type.startsWith("image/") ? "image" : "other" });
        if (smart && data.ai && (f.type === "application/pdf" || f.type.startsWith("image/"))) {
          setBusy(`جارٍ قراءة وفرز ${f.name}...`);
          await classify(item).catch((x) => setErr(`${f.name}: ${x.message}`));
        }
      } catch (x) {
        setErr(`${f.name}: ${x.message}`);
      }
    }
    setBusy("");
    setMsg(`تم رفع ${files.length} ملف ✓`);
    load();
  }

  async function savePending() {
    setBusy("جارٍ حفظ العمليات...");
    try {
      const r = await fetch("/api/accounting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entries: pending }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "تعذر الحفظ");
      // ربط كل فاتورة بالعمليات التي سُجلت منها
      const byFile = {};
      for (const e of j.items) if (e.fileId) (byFile[e.fileId] ||= []).push(e.id);
      for (const [id, ids] of Object.entries(byFile)) {
        const f = data.items.find((x) => x.id === id);
        await patchFile(id, { entryIds: [...(f?.entryIds || []), ...ids] }).catch(() => {});
      }
      setPending([]);
      setMsg(`تم تسجيل ${j.items.length} عملية في المحاسبة ✓`);
      load();
    } catch (x) {
      setErr(x.message);
    }
    setBusy("");
  }

  async function saveEdit() {
    try {
      await patchFile(editing.id, editing);
      setEditing(null);
      load();
    } catch (x) {
      setErr(x.message);
    }
  }
  async function remove(f) {
    if (!confirm(`حذف «${f.title || f.name}» نهائياً من التخزين؟`)) return;
    const r = await fetch(`/api/files?id=${encodeURIComponent(f.id)}`, { method: "DELETE" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setErr(j.error || "تعذر الحذف");
    load();
  }
  async function archiveOld() {
    setBusy("جارٍ أرشفة العقود والعروض الموافق عليها...");
    const r = await fetch("/api/files", { method: "PATCH" });
    const j = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) return setErr(j.error || "تعذرت الأرشفة");
    setMsg(j.done.length ? `تمت أرشفة: ${j.done.join("، ")}${j.remaining > 0 ? ` (بقي ${j.remaining}، اضغط مرة أخرى)` : ""}` : "كل الوثائق الموافق عليها مؤرشفة ✓");
    load();
  }

  if (!data) return err ? <div className="note">{err}</div> : <p>جارٍ التحميل...</p>;

  const cats = data.cats;
  const inYear = data.items.filter((f) => f.year === year);
  const list = inYear.filter((f) => {
    if (cat !== "all" && f.cat !== cat) return false;
    const t = q.trim();
    return !t || [f.title, f.name, f.client, f.docRef, f.note].some((v) => String(v || "").includes(t));
  });
  const counts = inYear.reduce((m, f) => ((m[f.cat] = (m[f.cat] || 0) + 1), m), {});

  return (
    <div className="acc">
      {!data.privateBlob && (
        <div className="note">
          المخزن الخاص غير مربوط بعد، لذلك لا يمكن رفع العقود والفواتير. من Vercel: Storage ← Create ← Blob ← اختر <b>Private</b>، وعند ربطه بالمشروع اكتب في Advanced Options البادئة <b dir="ltr">PRIVATE_BLOB</b>، ثم أعد النشر. التفاصيل في «الدليل».
        </div>
      )}
      {err && <div className="note">{err}</div>}
      {msg && <div className="note info">{msg}</div>}
      {busy && <div className="note info">{busy}</div>}

      <div className="acc-views two">
        <button type="button" className={view === "files" ? "on" : ""} onClick={() => setView("files")}><AIcon name="pages" size={22} />الملفات والفواتير</button>
        <button type="button" className={view === "images" ? "on" : ""} onClick={() => setView("images")}><AIcon name="image" size={22} />سجل الصور القديمة</button>
      </div>

      {view === "files" && (
        <>
          <div className="adm-card">
            <b>رفع ملفات</b>
            <span className="adm-hint">ارفع أي PDF أو صورة (فواتير، عقود قديمة، كشوف بنك...). مع الفرز الذكي يقرأ الملف ويضعه في سنته وتصنيفه الصحيح، ويقترح تسجيل الفواتير في المحاسبة.</span>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={smart && data.ai} disabled={!data.ai} onChange={(e) => setSmart(e.target.checked)} />
              فرز ذكي تلقائي {data.ai ? "" : "(يتطلب ANTHROPIC_API_KEY)"}
            </label>
            <div className="acc-row">
              <button type="button" className="primary" disabled={!data.privateBlob || !!busy} onClick={() => inputRef.current?.click()}>اختيار ملفات</button>
              <button type="button" className="mini" disabled={!data.privateBlob || !!busy} onClick={archiveOld} title="للعروض والعقود التي وافق عليها العملاء قبل ربط المخزن الخاص">أرشفة العقود الموقّعة السابقة</button>
            </div>
            <input ref={inputRef} type="file" multiple hidden accept="image/*,application/pdf,.docx,.xlsx,.csv,.txt,.zip,.json" onChange={onFiles} />
          </div>

          {pending.length > 0 && (
            <div className="adm-card" style={{ borderColor: "#d4a84b88" }}>
              <b>عمليات قرأها الذكاء الاصطناعي من الفواتير ({pending.length})</b>
              {pending.map((e, i) => (
                <div key={i} className="acc-item">
                  <span className="acc-item-b">
                    <b>{KINDS[e.kind]} · {CATS[e.kind]?.[e.cat]}{e.channel ? ` · ${CHANNELS[e.channel]}` : ""}</b>
                    <small>{[e.date, e.note, e.fileTitle].filter(Boolean).join(" · ")}</small>
                  </span>
                  <span className="acc-item-a">
                    <b dir="ltr">{money(e.amount)}</b>
                    <button type="button" className="mini danger" onClick={() => setPending((p) => p.filter((_, j) => j !== i))}>×</button>
                  </span>
                </div>
              ))}
              <div className="acc-row">
                <button type="button" className="primary" disabled={!!busy} onClick={savePending}>حفظها في المحاسبة</button>
                <button type="button" className="mini" onClick={() => setPending([])}>تجاهل</button>
              </div>
            </div>
          )}

          <div className="acc-chips">
            {years.map((y) => (
              <button key={y} type="button" className={year === y ? "on" : ""} onClick={() => setYear(y)}>{y}</button>
            ))}
          </div>
          <div className="adm-tiles arc-tiles">
            <button type="button" className={"adm-tile" + (cat === "all" ? " hl" : "")} onClick={() => setCat("all")}>
              <AIcon name="list" size={24} />
              <span>الكل</span>
              <small>{inYear.length}</small>
            </button>
            {Object.entries(cats).map(([k, l]) => (
              <button key={k} type="button" className={"adm-tile" + (cat === k ? " hl" : "")} onClick={() => setCat(k)}>
                <AIcon name={CAT_ICON[k]} size={24} />
                <span>{l}</span>
                <small>{counts[k] || 0}</small>
              </button>
            ))}
          </div>
          <input type="text" placeholder="بحث: عنوان، عميل، رقم عقد..." value={q} onChange={(e) => setQ(e.target.value)} />

          {list.length === 0 ? (
            <p className="adm-hint">لا توجد ملفات هنا.</p>
          ) : (
            <div className="acc-list">
              {list.map((f) =>
                editing?.id === f.id ? (
                  <div key={f.id} className="adm-card">
                    <label>العنوان<input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></label>
                    {!f.locked && (
                      <div className="acc-chips small">
                        {Object.entries(cats).map(([k, l]) => (
                          <button key={k} type="button" className={editing.cat === k ? "on" : ""} onClick={() => setEditing({ ...editing, cat: k })}>{l}</button>
                        ))}
                      </div>
                    )}
                    <div className="row">
                      <label>التاريخ<input type="date" disabled={f.locked} value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></label>
                      <label>العميل<input type="text" value={editing.client} onChange={(e) => setEditing({ ...editing, client: e.target.value })} /></label>
                    </div>
                    <div className="row">
                      <label>رقم العرض / العقد<input type="text" disabled={f.locked} value={editing.docRef} onChange={(e) => setEditing({ ...editing, docRef: e.target.value })} /></label>
                      <label>المبلغ<input type="text" inputMode="decimal" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: e.target.value })} /></label>
                    </div>
                    <label>ملاحظة<input type="text" value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} /></label>
                    <div className="acc-row">
                      <button type="button" className="primary" onClick={saveEdit}>حفظ</button>
                      <button type="button" className="mini" onClick={() => setEditing(null)}>إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <div key={f.id} className="acc-item arc-item">
                    <span className="acc-item-ic">
                      {f.type?.startsWith("image/") ? <img src={fileUrl(f.id)} alt="" loading="lazy" /> : <AIcon name={CAT_ICON[f.cat]} size={20} />}
                    </span>
                    <span className="acc-item-b">
                      <b>{f.locked ? "🔒 " : ""}{f.title || f.name}</b>
                      <small>{[cats[f.cat], f.date, f.client, f.docRef, f.amount ? `${money(f.amount)} ر.س` : "", size(f.size)].filter(Boolean).join(" · ")}</small>
                      {f.note && <small>{f.note}</small>}
                    </span>
                    <span className="arc-actions">
                      <a className="mini" href={fileUrl(f.id)} target="_blank" rel="noopener">فتح</a>
                      <a className="mini" href={fileUrl(f.id, true)}>تنزيل</a>
                      <button type="button" className="mini" onClick={() => setEditing({ ...f })}>تعديل</button>
                      {data.ai && !f.locked && (f.type === "application/pdf" || f.type?.startsWith("image/")) && (
                        <button type="button" className="mini" disabled={!!busy} onClick={async () => {
                          setBusy(`جارٍ فرز ${f.name}...`);
                          await classify(f).catch((x) => setErr(x.message));
                          setBusy("");
                          load();
                        }}>فرز ذكي</button>
                      )}
                      {!f.locked && <button type="button" className="mini danger" onClick={() => remove(f)}>حذف</button>}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}

      {view === "images" && (
        <>
          <div className="note info">كل صورة تستبدلها في أي خانة (الشعار، المعرض، الواجهة، الشهادات...) تُحفظ نسختها القديمة هنا تلقائياً عند «حفظ التغييرات». «استرجاع» يعيدها لخانتها، ثم اضغط «حفظ التغييرات».</div>
          {data.history.length === 0 ? (
            <p className="adm-hint">لا توجد صور قديمة بعد.</p>
          ) : (
            <div className="arc-gallery">
              {data.history.map((h, i) => (
                <div key={i} className="arc-shot">
                  {isImg(h.url) ? <img src={h.url} alt="" loading="lazy" /> : <span className="arc-file"><AIcon name="video" size={28} /></span>}
                  <b>{fieldLabel(h.path)}</b>
                  <small>{new Date(h.at).toLocaleDateString("ar-SA-u-nu-latn-ca-gregory", { dateStyle: "medium" })}</small>
                  <span className="acc-row">
                    <a className="mini" href={h.url} target="_blank" rel="noopener">فتح</a>
                    <button type="button" className="mini" onClick={() => onRestore(h.path, h.url)}>استرجاع</button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
