"use client";
import { useEffect, useRef, useState } from "react";
import { parseEnv, stringifyEnv } from "@/lib/envfile";
import { AIcon } from "./AdminIcons";

const blank = () => ({
  name: "", client: "", docRef: "", status: "active", domain: "", siteUrl: "", repo: "", hosting: "", startDate: "", endDate: "",
  renewals: [], links: [], obligations: "", env: [], notes: "",
});
const ENV_SCOPES = { all: "الكل", production: "Production", preview: "Preview", development: "Development" };
const daysTo = (d) => Math.round((new Date(d + "T12:00:00") - new Date()) / 86400000);

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function Editor({ p, setP, contracts, statuses, onSave, onCancel, onDelete, busy }) {
  const set = (k, v) => setP({ ...p, [k]: v });
  const [show, setShow] = useState({});
  const [paste, setPaste] = useState(null);
  const [scope, setScope] = useState("all");
  const fileRef = useRef(null);

  function importEnv(text) {
    const vars = parseEnv(text);
    if (!vars.length) return alert("لم أجد متغيرات بصيغة KEY=VALUE في النص.");
    const env = [...p.env];
    for (const v of vars) {
      const i = env.findIndex((x) => x.key === v.key);
      if (i >= 0) env[i] = { ...env[i], value: v.value, note: v.note || env[i].note };
      else env.push({ ...v, env: "all" });
    }
    set("env", env);
    setPaste(null);
  }
  const exportEnv = () => {
    const vars = p.env.filter((v) => scope === "all" || v.env === "all" || v.env === scope);
    download(scope === "all" || scope === "production" ? ".env" : `.env.${scope}`, stringifyEnv(vars, `${p.name}${p.client ? " - " + p.client : ""}\nتصدير من لوحة التحكم ${new Date().toLocaleDateString("en-CA")}`));
  };
  const setRow = (key, i, field, v) => set(key, p[key].map((x, j) => (j === i ? { ...x, [field]: v } : x)));
  const delRow = (key, i) => set(key, p[key].filter((_, j) => j !== i));

  return (
    <div className="acc">
      {p.locked && <div className="note">تعذر فك تشفير مفاتيح هذا المشروع لأن مفتاح التشفير (VAULT_KEY أو AUTH_SECRET) تغيّر في Vercel. أرجعه كما كان لتظهر المفاتيح. الحفظ متوقف حتى لا تُمسح.</div>}
      <div className="adm-card">
        <b>بيانات المشروع</b>
        <div className="row">
          <label>اسم المشروع<input type="text" value={p.name} onChange={(e) => set("name", e.target.value)} /></label>
          <label>العميل<input type="text" value={p.client} onChange={(e) => set("client", e.target.value)} /></label>
        </div>
        {contracts.length > 0 && (
          <label>
            العقد / العرض الموافق عليه
            <select value={p.docRef} onChange={(e) => {
              const c = contracts.find((x) => x.number === e.target.value);
              setP({ ...p, docRef: e.target.value, client: p.client || c?.client || "", name: p.name || c?.title || "", startDate: p.startDate || c?.date || "" });
            }}>
              <option value="">بدون ربط</option>
              {contracts.map((c) => <option key={c.number} value={c.number}>{c.number} · {c.client || c.title}</option>)}
            </select>
          </label>
        )}
        <div className="acc-chips small">
          {Object.entries(statuses).map(([k, l]) => (
            <button key={k} type="button" className={p.status === k ? "on" : ""} onClick={() => set("status", k)}>{l}</button>
          ))}
        </div>
        <div className="row">
          <label>النطاق (الدومين)<input type="text" dir="ltr" value={p.domain} onChange={(e) => set("domain", e.target.value)} /></label>
          <label>الاستضافة<input type="text" value={p.hosting} onChange={(e) => set("hosting", e.target.value)} placeholder="Vercel / Hostinger..." /></label>
        </div>
        <div className="row">
          <label>رابط الموقع<input type="text" dir="ltr" value={p.siteUrl} onChange={(e) => set("siteUrl", e.target.value)} placeholder="https://" /></label>
          <label>المستودع (GitHub)<input type="text" dir="ltr" value={p.repo} onChange={(e) => set("repo", e.target.value)} placeholder="https://github.com/..." /></label>
        </div>
        <div className="row">
          <label>تاريخ البدء<input type="date" value={p.startDate} onChange={(e) => set("startDate", e.target.value)} /></label>
          <label>تاريخ التسليم<input type="date" value={p.endDate} onChange={(e) => set("endDate", e.target.value)} /></label>
        </div>
      </div>

      <div className="adm-card">
        <b>المفاتيح والمتغيرات (.env) 🔒</b>
        <span className="adm-hint">تُحفظ مشفّرة. مفاتيح Resend و Cloudflare و Stripe وقواعد البيانات وأي متغير يحتاجه المشروع.</span>
        {p.env.map((v, i) => (
          <div key={i} className="env-row">
            <input type="text" dir="ltr" className="env-k" value={v.key} placeholder="KEY" onChange={(e) => setRow("env", i, "key", e.target.value.replace(/\s/g, "_"))} />
            <input type={show[i] ? "text" : "password"} dir="ltr" className="env-v" value={v.value} placeholder="value" autoComplete="off" onChange={(e) => setRow("env", i, "value", e.target.value)} />
            <button type="button" className="mini" onClick={() => setShow({ ...show, [i]: !show[i] })}>{show[i] ? "إخفاء" : "إظهار"}</button>
            <button type="button" className="mini" onClick={() => navigator.clipboard?.writeText(v.value)}>نسخ</button>
            <button type="button" className="mini danger" onClick={() => delRow("env", i)}>×</button>
            <input type="text" className="env-n" value={v.note} placeholder="ملاحظة (من أين المفتاح؟ متى ينتهي؟)" onChange={(e) => setRow("env", i, "note", e.target.value)} />
            <div className="acc-chips small env-s">
              {Object.entries(ENV_SCOPES).map(([k, l]) => (
                <button key={k} type="button" className={(v.env || "all") === k ? "on" : ""} onClick={() => setRow("env", i, "env", k)}>{l}</button>
              ))}
            </div>
          </div>
        ))}
        <div className="acc-row" style={{ flexWrap: "wrap" }}>
          <button type="button" className="mini" onClick={() => set("env", [...p.env, { key: "", value: "", note: "", env: "all" }])}>+ متغير</button>
          <button type="button" className="mini" onClick={() => fileRef.current?.click()}>استيراد ملف .env</button>
          <button type="button" className="mini" onClick={() => setPaste("")}>لصق .env</button>
          <input ref={fileRef} type="file" hidden accept=".env,text/plain,*/*" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) importEnv(await f.text()); }} />
        </div>
        {paste !== null && (
          <>
            <textarea rows={6} dir="ltr" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={"RESEND_API_KEY=re_xxx\nCLOUDFLARE_API_TOKEN=..."} />
            <div className="acc-row">
              <button type="button" className="gold" onClick={() => importEnv(paste)}>إضافة المتغيرات</button>
              <button type="button" className="mini" onClick={() => setPaste(null)}>إلغاء</button>
            </div>
          </>
        )}
        {p.env.length > 0 && (
          <div className="acc-row" style={{ flexWrap: "wrap" }}>
            <span className="adm-hint">تصدير:</span>
            <div className="acc-chips small">
              {Object.entries(ENV_SCOPES).map(([k, l]) => (
                <button key={k} type="button" className={scope === k ? "on" : ""} onClick={() => setScope(k)}>{l}</button>
              ))}
            </div>
            <button type="button" className="gold" onClick={exportEnv}>تنزيل .env</button>
            <button type="button" className="mini" onClick={() => navigator.clipboard?.writeText(stringifyEnv(p.env))}>نسخ الكل</button>
          </div>
        )}
        <label>
          ملاحظات سرية (حسابات، كلمات مرور لوحات العميل، أكواد استرجاع...)
          <textarea rows={3} value={p.notes} onChange={(e) => set("notes", e.target.value)} />
        </label>
      </div>

      <div className="adm-card">
        <b>التجديدات والمواعيد</b>
        <span className="adm-hint">تجديد الدومين والاستضافة والدعم الفني... تظهر في «الدليل ← التزاماتي» قبل موعدها.</span>
        {p.renewals.map((r, i) => (
          <div key={i} className="row3">
            <input type="text" value={r.title} placeholder="مثال: تجديد الدومين" onChange={(e) => setRow("renewals", i, "title", e.target.value)} />
            <input type="date" value={r.date} onChange={(e) => setRow("renewals", i, "date", e.target.value)} />
            <input type="text" inputMode="decimal" dir="ltr" value={r.amount || ""} placeholder="المبلغ" onChange={(e) => setRow("renewals", i, "amount", e.target.value)} />
            <button type="button" className="mini danger" onClick={() => delRow("renewals", i)}>×</button>
          </div>
        ))}
        <button type="button" className="mini" onClick={() => set("renewals", [...p.renewals, { title: "", date: "", amount: 0, note: "" }])}>+ موعد</button>
      </div>

      <div className="adm-card">
        <b>روابط المشروع</b>
        {p.links.map((l, i) => (
          <div key={i} className="row3">
            <input type="text" value={l.title} placeholder="مثال: لوحة Cloudflare" onChange={(e) => setRow("links", i, "title", e.target.value)} />
            <input type="text" dir="ltr" value={l.url} placeholder="https://" onChange={(e) => setRow("links", i, "url", e.target.value)} />
            <button type="button" className="mini danger" onClick={() => delRow("links", i)}>×</button>
          </div>
        ))}
        <button type="button" className="mini" onClick={() => set("links", [...p.links, { title: "", url: "" }])}>+ رابط</button>
      </div>

      <div className="adm-card">
        <b>ما التزمت به لهذا العميل</b>
        <textarea rows={4} value={p.obligations} onChange={(e) => set("obligations", e.target.value)} placeholder={"مثال:\nدعم فني مجاني 3 أشهر بعد التسليم\nتجديد الدومين على حسابي حتى 2027"} />
      </div>

      <div className="acc-row">
        <button type="button" className="primary" disabled={busy || p.locked} onClick={onSave}>{busy ? "جارٍ الحفظ..." : "حفظ المشروع"}</button>
        <button type="button" className="mini" onClick={onCancel}>رجوع</button>
        {p.id && <button type="button" className="mini danger" onClick={onDelete}>حذف المشروع</button>}
      </div>
    </div>
  );
}

export default function Projects() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");

  async function load() {
    const r = await fetch("/api/projects");
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setErr(j.error || "تعذر التحميل");
    setData(j);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setBusy(true);
    setErr("");
    const r = await fetch("/api/projects", { method: edit.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(j.error || "تعذر الحفظ");
    setEdit(null);
    load();
  }
  async function remove() {
    if (!confirm(`حذف مشروع «${edit.name}» ومفاتيحه نهائياً؟ صدّر ملف .env أولاً إذا كنت تحتاجه.`)) return;
    await fetch(`/api/projects?id=${encodeURIComponent(edit.id)}`, { method: "DELETE" });
    setEdit(null);
    load();
  }

  if (!data) return err ? <div className="note">{err}</div> : <p>جارٍ التحميل...</p>;
  if (edit)
    return (
      <>
        {err && <div className="note">{err}</div>}
        <Editor p={edit} setP={setEdit} contracts={data.contracts} statuses={data.statuses} busy={busy} onSave={save} onCancel={() => setEdit(null)} onDelete={remove} />
      </>
    );

  const list = data.items.filter((p) => filter === "all" || p.status === filter);
  return (
    <div className="acc">
      {!data.db && <div className="note">قاعدة البيانات غير مربوطة.</div>}
      {data.keySource !== "VAULT_KEY" && (
        <div className="note info">
          المفاتيح تُشفّر الآن بـ {data.keySource || "—"}. للأمان أضف متغيراً مستقلاً <b dir="ltr">VAULT_KEY</b> (نص عشوائي طويل) في Vercel <b>قبل</b> حفظ أول مشروع، ولا تغيّره بعدها.
        </div>
      )}
      {err && <div className="note">{err}</div>}
      <div className="acc-row">
        <button type="button" className="primary" onClick={() => setEdit(blank())}>+ مشروع جديد</button>
      </div>
      <div className="acc-chips">
        <button type="button" className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>الكل ({data.items.length})</button>
        {Object.entries(data.statuses).map(([k, l]) => (
          <button key={k} type="button" className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="adm-hint">لا توجد مشاريع بعد. أضف كل مشروع تعاقدت عليه، واحفظ فيه مفاتيحه وتجديداته والتزاماتك.</p>
      ) : (
        <div className="adm-tiles proj-tiles">
          {list.map((p) => {
            const next = (p.renewals || []).filter((r) => r.date && daysTo(r.date) >= -7).sort((a, b) => a.date.localeCompare(b.date))[0];
            return (
              <button key={p.id} type="button" className="adm-tile proj-tile" onClick={() => setEdit({ ...blank(), ...p })}>
                <AIcon name="box" size={26} />
                <span>{p.name}</span>
                <small>{p.client}</small>
                <small className={"adm-pill " + (p.status === "done" ? "done" : p.status === "active" ? "progress" : "")}>{data.statuses[p.status]}</small>
                <small>🔑 {p.locked ? "مقفل" : p.env?.length || 0}{next ? ` · ⏰ ${next.title} ${daysTo(next.date)} يوم` : ""}</small>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
