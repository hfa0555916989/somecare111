"use client";
import { useEffect, useState } from "react";

// متاجر العملاء: كل عميل نسخة مستقلة (مستودع + تطبيق Laravel Cloud + قاعدة بيانات). خاصة بك فقط
const VIEWS = [
  ["list", "المتاجر"],
  ["new", "متجر جديد"],
  ["updates", "التحديثات"],
  ["backups", "النسخ الاحتياطية"],
  ["log", "السجل"],
];
const OPS = [
  ["migrate", "تحديث قاعدة البيانات (migrate)"],
  ["optimize", "تحسين الأداء (optimize)"],
  ["clear-cache", "مسح الكاش"],
  ["queue-restart", "إعادة تشغيل الطوابير"],
  ["redeploy", "إعادة النشر"],
];
const HEALTH = { ok: ["يعمل", "ok"], degraded: ["تنبيه", "warn"], down: ["متوقف", "bad"] };
const fmt = (d) => (d ? new Date(d).toLocaleString("ar-SA-u-nu-latn", { timeZone: "Asia/Riyadh", dateStyle: "medium", timeStyle: "short" }) : "—");
const size = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round((b || 0) / 1024)) + " KB");
const daysTo = (d) => (d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null);

async function api(body) {
  const r = await fetch("/api/stores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok && !j.result) throw new Error(j.error || "تعذر التنفيذ");
  return j;
}

function Health({ s }) {
  if (s.dryRun) return <span className="st-pill">تجربة</span>;
  const h = HEALTH[s.status?.health];
  if (!h) return <span className="st-pill">لم يُفحص</span>;
  return <span className={`st-pill ${h[1]}`} title={s.status?.error || ""}>{h[0]}</span>;
}

function StoreForm({ init, onSave, onCancel, onDelete }) {
  const [s, setS] = useState({ name: "", nameEn: "", slug: "", domain: "", baseUrl: "", repo: "", client: "", phone: "", renewal: "", plan: "", notes: "", templateSha: "", cpSecret: "", ...init });
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));
  return (
    <div className="adm-card">
      <b>{init?.id ? `تعديل: ${init.name}` : "إضافة متجر موجود (بُني يدوياً)"}</b>
      <div className="row">
        <label>اسم المتجر<input type="text" value={s.name} onChange={(e) => set("name", e.target.value)} /></label>
        <label>المعرّف (slug)<input type="text" dir="ltr" value={s.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} placeholder="alnakheel" /></label>
        <label>الدومين<input type="text" dir="ltr" value={s.domain} onChange={(e) => set("domain", e.target.value)} placeholder="store.example.sa" /></label>
        <label>رابط المتجر الفعلي<input type="text" dir="ltr" value={s.baseUrl} onChange={(e) => set("baseUrl", e.target.value)} placeholder="https://...laravel.cloud" /></label>
        <label>المستودع<input type="text" dir="ltr" value={s.repo} onChange={(e) => set("repo", e.target.value)} placeholder="owner/store-alnakheel" /></label>
        <label>نسخة القالب الأساسية (commit)<input type="text" dir="ltr" value={s.templateSha || ""} onChange={(e) => set("templateSha", e.target.value.trim())} placeholder="sha من مستودع القالب" /></label>
        <label>العميل<input type="text" value={s.client} onChange={(e) => set("client", e.target.value)} /></label>
        <label>جوال العميل<input type="text" dir="ltr" value={s.phone} onChange={(e) => set("phone", e.target.value)} /></label>
        <label>الاشتراك / الباقة<input type="text" value={s.plan} onChange={(e) => set("plan", e.target.value)} placeholder="1500 ريال سنوي" /></label>
        <label>تاريخ التجديد<input type="date" value={s.renewal} onChange={(e) => set("renewal", e.target.value)} /></label>
      </div>
      <label>
        مفتاح لوحة المطوّر للمتجر (CONTROL_PLANE_SECRET) 🔒
        <input type="password" dir="ltr" autoComplete="off" value={s.cpSecret} onChange={(e) => set("cpSecret", e.target.value)} placeholder={init?.hasSecret ? "محفوظ مشفّراً. اكتب مفتاحاً جديداً لتغييره" : "64 حرفاً من openssl rand -hex 32"} />
        <span className="adm-hint">يُحفظ مشفّراً على الخادم ولا يظهر هنا مرة ثانية.</span>
      </label>
      <label>ملاحظات<textarea rows={3} value={s.notes} onChange={(e) => set("notes", e.target.value)} /></label>
      <div className="acc-row">
        <button type="button" className="primary" onClick={() => onSave(s)}>حفظ</button>
        <button type="button" className="mini" onClick={onCancel}>رجوع</button>
        {init?.id && <button type="button" className="mini danger" onClick={onDelete}>إزالة من اللوحة</button>}
      </div>
    </div>
  );
}

function Wizard({ data, reload, setErr }) {
  const [f, setF] = useState({ name: "", nameEn: "", slug: "", domain: "", primary: "#14325C", secondary: "#F2A93B", logoUrl: "", client: "", phone: "", plan: "", renewal: "" });
  const [dry, setDry] = useState(true);
  const [store, setStore] = useState(null);
  const [running, setRunning] = useState("");
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const steps = data.steps;
  const forced = data.config.forcedDry;

  async function start() {
    setErr("");
    if (!f.name || !f.slug) return setErr("اكتب اسم المتجر والمعرّف");
    if (!dry && !confirm(`سيُنشأ مستودع وتطبيق وقاعدة بيانات حقيقية للمتجر «${f.name}» وقد تترتب تكلفة على Laravel Cloud. متابعة؟`)) return;
    try {
      const j = await api({ action: "save", wizard: true, dryRun: dry, store: f });
      setStore(j.store);
      reload();
    } catch (e) {
      setErr(e.message);
    }
  }
  async function run(from = 0) {
    for (let i = from; i < steps.length; i++) {
      const [k] = steps[i];
      setRunning(k);
      const j = await api({ action: "step", id: store.id, step: k }).catch((e) => ({ error: e.message }));
      if (j.store) setStore(j.store);
      if (j.error) {
        setRunning("");
        setErr(`توقف عند «${steps[i][1]}»: ${j.error}`);
        return reload();
      }
    }
    setRunning("");
    reload();
  }
  const st = store?.prov?.steps || {};
  const firstPending = steps.findIndex(([k]) => !st[k]?.ok);

  if (!store)
    return (
      <div className="adm-card">
        <b>متجر جديد لعميل</b>
        <span className="adm-hint">ينسخ القالب {data.template.repo} لمستودع مستقل، ثم ينشئ له تطبيقاً وقاعدة بيانات على Laravel Cloud، ويربط الدومين.</span>
        <div className="row">
          <label>اسم المتجر (عربي)<input type="text" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="متجر النخيل" /></label>
          <label>الاسم بالإنجليزي<input type="text" dir="ltr" value={f.nameEn} onChange={(e) => set("nameEn", e.target.value)} placeholder="Alnakheel" /></label>
          <label>المعرّف (slug)<input type="text" dir="ltr" value={f.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="alnakheel" /><span className="adm-hint">المستودع: store-{f.slug || "…"}</span></label>
          <label>الدومين (اختياري)<input type="text" dir="ltr" value={f.domain} onChange={(e) => set("domain", e.target.value)} placeholder="alnakheel.sa" /></label>
          <label>اللون الأساسي<input type="color" value={f.primary} onChange={(e) => set("primary", e.target.value)} /></label>
          <label>اللون الثانوي<input type="color" value={f.secondary} onChange={(e) => set("secondary", e.target.value)} /></label>
          <label>رابط الشعار SVG (اختياري)<input type="text" dir="ltr" value={f.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://..." /><span className="adm-hint">أو يرفعه العميل من لوحة متجره لاحقاً.</span></label>
          <label>العميل<input type="text" value={f.client} onChange={(e) => set("client", e.target.value)} /></label>
          <label>الباقة<input type="text" value={f.plan} onChange={(e) => set("plan", e.target.value)} placeholder="1500 ريال شامل الاستضافة" /></label>
          <label>تاريخ التجديد<input type="date" value={f.renewal} onChange={(e) => set("renewal", e.target.value)} /></label>
        </div>
        <label className="st-check">
          <input type="checkbox" checked={dry || forced} disabled={forced} onChange={(e) => setDry(e.target.checked)} />
          تجربة فقط (Dry run): يعرض ما سيحدث بدون إنشاء أي شيء {forced && "— مفروضة من STORES_DRY_RUN"}
        </label>
        <button type="button" className="primary" onClick={start}>متابعة</button>
      </div>
    );

  return (
    <div className="adm-card">
      <b>إنشاء «{store.name}» {store.dryRun && <span className="st-pill">تجربة</span>}</b>
      <ol className="st-steps">
        {steps.map(([k, l]) => (
          <li key={k} className={st[k]?.ok ? "done" : st[k] ? "fail" : running === k ? "run" : ""}>
            <span className="st-dot" />
            <div>
              <b>{l}</b>
              {running === k && <small>جارٍ التنفيذ...</small>}
              {st[k] && <small dir="auto">{st[k].detail}</small>}
            </div>
          </li>
        ))}
      </ol>
      {store.dns?.length > 0 && (
        <div className="adm-card st-dns">
          <b>سجلات DNS للعميل</b>
          <span className="adm-hint">يضيفها عند مزوّد الدومين (نيم شيب، SaudiNIC...). الشهادة HTTPS تصدر تلقائياً بعدها.</span>
          <div className="st-table" dir="ltr">
            <div className="th"><span>Type</span><span>Name</span><span>Value</span></div>
            {store.dns.map((r, i) => (
              <div key={i}><span>{r.type}</span><span>{r.name}</span><span>{r.value}</span></div>
            ))}
          </div>
        </div>
      )}
      <div className="acc-row">
        {firstPending >= 0 ? (
          <button type="button" className="primary" disabled={!!running} onClick={() => run(firstPending)}>{running ? "جارٍ التنفيذ..." : firstPending === 0 ? "ابدأ" : "أكمل من الخطوة المتوقفة"}</button>
        ) : (
          <span className="st-pill ok">اكتمل</span>
        )}
        <button type="button" className="mini" disabled={!!running} onClick={() => setStore(null)}>متجر آخر</button>
      </div>
    </div>
  );
}

function Updates({ data, reload, setErr }) {
  const [sel, setSel] = useState([]);
  const [mode, setMode] = useState("pr");
  const [dry, setDry] = useState(true);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState("");
  const stores = data.stores;
  const toggle = (id) => setSel((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]));
  async function sync() {
    if (!sel.length) return setErr("اختر متجراً واحداً على الأقل");
    if (!dry && mode === "direct" && !confirm(`دفع تحديث القالب مباشرة إلى main في ${sel.length} متجر؟ سيُنشر تلقائياً.`)) return;
    setBusy("جارٍ مقارنة القالب بمستودعات العملاء...");
    try {
      setRes((await api({ action: "sync", ids: sel, mode, dryRun: dry })).results);
    } catch (e) {
      setErr(e.message);
    }
    setBusy("");
    reload();
  }
  async function op(o) {
    if (!sel.length) return setErr("اختر متجراً واحداً على الأقل");
    if (!dry && !confirm(`تنفيذ «${OPS.find((x) => x[0] === o)[1]}» على ${sel.length} متجر؟`)) return;
    setBusy("جارٍ التنفيذ...");
    try {
      setRes((await api({ action: "update", op: o, ids: sel, dryRun: dry })).results);
    } catch (e) {
      setErr(e.message);
    }
    setBusy("");
  }
  async function merge(s) {
    if (!confirm(`دمج طلب التحديث #${s.syncPr} في ${s.repo}؟ سيُنشر المتجر بعدها.`)) return;
    try {
      await api({ action: "mergePr", id: s.id });
      reload();
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <div className="adm-card">
      <b>تحديث المتاجر من القالب</b>
      <span className="adm-hint">آخر نسخة من القالب: {data.template.version || "?"}. التحديث ينسخ ملفات القالب المتغيرة فقط، ولا يلمس هوية العميل (brand/)، ويترك أي ملف عدّله العميل ويبلّغك عنه.</span>
      <div className="acc-row" style={{ flexWrap: "wrap" }}>
        <button type="button" className="mini" onClick={() => setSel(sel.length === stores.length ? [] : stores.map((s) => s.id))}>{sel.length === stores.length ? "إلغاء التحديد" : "تحديد الكل"}</button>
      </div>
      <div className="st-picks">
        {stores.map((s) => (
          <label key={s.id} className="st-check">
            <input type="checkbox" checked={sel.includes(s.id)} onChange={() => toggle(s.id)} />
            {s.name} <small dir="ltr">{s.status?.version || "?"}</small>
            {s.syncPr && (
              <>
                <a href={s.syncPrUrl} target="_blank" rel="noreferrer">طلب #{s.syncPr}</a>
                <button type="button" className="mini" onClick={() => merge(s)}>دمج</button>
              </>
            )}
          </label>
        ))}
      </div>
      <div className="acc-chips small">
        <button type="button" className={mode === "pr" ? "on" : ""} onClick={() => setMode("pr")}>طلب سحب للمراجعة (PR)</button>
        <button type="button" className={mode === "direct" ? "on" : ""} onClick={() => setMode("direct")}>دفع مباشر إلى main</button>
      </div>
      <label className="st-check">
        <input type="checkbox" checked={dry || data.config.forcedDry} disabled={data.config.forcedDry} onChange={(e) => setDry(e.target.checked)} />
        تجربة فقط: اعرض الملفات التي ستتغير بدون تنفيذ
      </label>
      <div className="acc-row" style={{ flexWrap: "wrap" }}>
        <button type="button" className="primary" disabled={!!busy} onClick={sync}>تحديث من القالب</button>
        {OPS.map(([k, l]) => (
          <button key={k} type="button" className="gold" disabled={!!busy} onClick={() => op(k)}>{l}</button>
        ))}
      </div>
      {busy && <div className="note info">{busy}</div>}
      {res && (
        <div className="st-results">
          {res.map((r) => (
            <div key={r.id} className={r.ok ? "ok" : "bad"}>
              <b>{r.name}</b>
              {r.ok ? (
                <span>
                  {{ uptodate: "محدّث مسبقاً", nothing: "لا ملفات تخصه", dry: "تجربة", pushed: "تم الدفع", pr: "طلب سحب مفتوح" }[r.status] || (r.result?.dry ? "تجربة" : "تم")}
                  {r.apply != null && ` · ${r.apply} ملف${r.remove ? ` · ${r.remove} حذف` : ""}`}
                  {r.prUrl && <> · <a href={r.prUrl} target="_blank" rel="noreferrer">#{r.pr}</a></>}
                  {r.result?.would && ` · ${r.result.would}`}
                </span>
              ) : (
                <span>{r.error}</span>
              )}
              {r.conflicts?.length > 0 && <small>عدّلها العميل فلم تُلمس: {r.conflicts.join("، ")}</small>}
              {r.skipped?.some((x) => x.why === "workflow") && <small>ملفات workflow تحتاج تحديثاً يدوياً.</small>}
              {r.files?.length > 0 && <details><summary>الملفات</summary><pre dir="ltr">{r.files.join("\n")}</pre></details>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Backups({ data, setErr }) {
  const [id, setId] = useState(data.stores[0]?.id || "");
  const [list, setList] = useState(null);
  const [busy, setBusy] = useState("");
  const [restore, setRestore] = useState(null);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(null);
  const s = data.stores.find((x) => x.id === id);
  async function load(i = id) {
    setList(null);
    if (!i) return;
    try {
      setList(await api({ action: "backups", id: i }));
    } catch (e) {
      setErr(e.message);
      setList({ backups: [], error: e.message });
    }
  }
  useEffect(() => {
    setDone(null);
    load();
  }, [id]);
  async function now() {
    setBusy("جارٍ أخذ نسخة...");
    try {
      await api({ action: "backupNow", id });
      await load();
    } catch (e) {
      setErr(e.message);
    }
    setBusy("");
  }
  async function doRestore() {
    setBusy("جارٍ الاسترجاع... لا تغلق الصفحة");
    try {
      const r = await api({ action: "restore", id, name: restore, confirm: restore, confirmSlug: typed });
      setDone(r);
      setRestore(null);
      setTyped("");
      await load();
    } catch (e) {
      setErr(e.message);
    }
    setBusy("");
  }
  if (!data.stores.length) return <div className="note info">لا توجد متاجر بعد.</div>;
  return (
    <div className="adm-card">
      <b>النسخ الاحتياطية</b>
      <div className="acc-row" style={{ flexWrap: "wrap" }}>
        <select value={id} onChange={(e) => setId(e.target.value)}>
          {data.stores.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <button type="button" className="gold" disabled={!!busy} onClick={now}>نسخة الآن</button>
        <button type="button" className="mini" onClick={() => load()}>تحديث</button>
      </div>
      {busy && <div className="note info">{busy}</div>}
      {done && (
        <div className="note info">
          {done.dry ? `تجربة: ${done.would}` : <>تم الاسترجاع ({done.tables} جدول، {done.rows} صف). نسخة ما قبل الاسترجاع: <b dir="ltr">{done.preRestoreBackup}</b>، استرجعها من القائمة للتراجع.</>}
        </div>
      )}
      {!list ? (
        <p>جارٍ التحميل...</p>
      ) : list.backups?.length ? (
        <div className="st-table">
          <div className="th"><span>النسخة</span><span>الوقت</span><span>الحجم</span><span /></div>
          {list.backups.map((b) => (
            <div key={b.name}>
              <span dir="ltr">{b.name}</span>
              <span>{fmt(b.at)}</span>
              <span dir="ltr">{size(b.sizeBytes)}</span>
              <span><button type="button" className="mini danger" onClick={() => { setRestore(b.name); setTyped(""); }}>استرجاع</button></span>
            </div>
          ))}
        </div>
      ) : (
        <div className="note info">{list.error || "لا توجد نسخ."}</div>
      )}
      {restore && (
        <div className="st-modal" role="dialog">
          <div className="adm-card">
            <b>⚠️ استرجاع نسخة في «{s?.name}»</b>
            <p>سيستبدل كل بيانات المتجر (الطلبات، العملاء، المنتجات...) بما في النسخة <b dir="ltr">{restore}</b>. المتجر يأخذ نسخة تلقائية قبل الاسترجاع تقدر ترجع لها. الصور المرفوعة لا تتأثر.</p>
            <label>
              للتأكيد اكتب معرّف المتجر: <b dir="ltr">{s?.slug}</b>
              <input type="text" dir="ltr" value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
            </label>
            <div className="acc-row">
              <button type="button" className="primary danger-bg" disabled={typed !== s?.slug || !!busy} onClick={doRestore}>استرجاع الآن</button>
              <button type="button" className="mini" onClick={() => setRestore(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Log() {
  const [log, setLog] = useState(null);
  useEffect(() => {
    fetch("/api/stores?what=log").then((r) => r.json()).then((j) => setLog(j.log || [])).catch(() => setLog([]));
  }, []);
  if (!log) return <p>جارٍ التحميل...</p>;
  if (!log.length) return <div className="note info">لا توجد عمليات بعد.</div>;
  return (
    <div className="adm-card">
      <b>سجل العمليات</b>
      <div className="st-table st-log">
        <div className="th"><span>الوقت</span><span>المتجر</span><span>العملية</span></div>
        {log.map((e, i) => (
          <div key={i} className={e.ok ? "" : "bad"}>
            <span>{fmt(e.at)}</span>
            <span>{e.store}</span>
            <span>{e.action}{e.detail && <small dir="auto">{e.detail}</small>}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Stores() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [view, setView] = useState("list");
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/stores");
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setErr(j.error || "تعذر التحميل");
    setData(j);
  }
  useEffect(() => {
    load();
  }, []);
  async function refresh() {
    setBusy(true);
    setErr("");
    try {
      await api({ action: "refresh" });
      await load();
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  }
  async function save(s) {
    setErr("");
    try {
      await api({ action: "save", id: edit.id || null, store: s });
      setEdit(null);
      load();
    } catch (e) {
      setErr(e.message);
    }
  }
  async function remove() {
    if (!confirm(`إزالة «${edit.name}» من اللوحة؟ المستودع والاستضافة لا يُحذفان.`)) return;
    await api({ action: "delete", id: edit.id }).catch((e) => setErr(e.message));
    setEdit(null);
    load();
  }

  if (!data) return err ? <div className="note">{err}</div> : <p>جارٍ التحميل...</p>;
  const c = data.config;
  const latest = data.template.version;

  return (
    <div className="acc st">
      <div className="acc-chips">
        {VIEWS.map(([k, l]) => (
          <button key={k} type="button" className={view === k ? "on" : ""} onClick={() => { setView(k); setErr(""); setEdit(null); }}>{l}</button>
        ))}
      </div>
      {(!c.github || !c.cloud || !c.vault) && (
        <div className="note info">
          ينقص في Vercel: {[!c.github && "STORES_GITHUB_TOKEN", !c.cloud && "LARAVEL_CLOUD_API_TOKEN", !c.vault && "VAULT_KEY"].filter(Boolean).join("، ")}
        </div>
      )}
      {c.forcedDry && <div className="note info">وضع التجربة مفعّل (STORES_DRY_RUN=1): لن يُنشأ أو يُعدَّل شيء فعلياً.</div>}
      {err && <div className="note">{err}</div>}

      {view === "list" && (edit ? (
        <StoreForm init={edit} onSave={save} onCancel={() => setEdit(null)} onDelete={remove} />
      ) : (
        <>
          <div className="acc-row" style={{ flexWrap: "wrap" }}>
            <button type="button" className="primary" onClick={() => setView("new")}>+ متجر جديد</button>
            <button type="button" className="gold" onClick={() => setEdit({})}>إضافة متجر موجود</button>
            <button type="button" className="mini" disabled={busy} onClick={refresh}>{busy ? "جارٍ الفحص..." : "فحص الكل الآن"}</button>
            <span className="adm-hint">آخر نسخة من القالب: <b dir="ltr">{latest || "?"}</b></span>
          </div>
          {!data.stores.length && <div className="note info">لا توجد متاجر بعد. ابدأ بـ«متجر جديد» أو أضف متجراً موجوداً بمفتاحه.</div>}
          <div className="st-grid">
            {data.stores.map((s) => {
              const d = daysTo(s.renewal);
              const old = s.status?.version && latest && s.status.version !== latest;
              return (
                <div key={s.id} className="adm-card st-card">
                  <div className="st-card-h">
                    <b>{s.name}</b>
                    <Health s={s} />
                  </div>
                  <dl>
                    <dt>الدومين</dt><dd dir="ltr">{s.domain || s.baseUrl?.replace(/^https:\/\//, "") || "—"}</dd>
                    <dt>المستودع</dt><dd dir="ltr">{s.repo ? <a href={`https://github.com/${s.repo}`} target="_blank" rel="noreferrer">{s.repo}</a> : "—"}</dd>
                    <dt>النسخة</dt><dd dir="ltr" className={old ? "warn" : ""}>{s.status?.version || "?"}{old && ` → ${latest}`}</dd>
                    <dt>آخر نسخة احتياطية</dt><dd>{fmt(s.status?.lastBackupAt)}</dd>
                    <dt>التجديد</dt><dd className={d != null && d < 30 ? "warn" : ""}>{s.renewal ? `${s.renewal}${d != null ? ` (${d < 0 ? "منتهي" : `بعد ${d} يوم`})` : ""}` : "—"}{s.plan && ` · ${s.plan}`}</dd>
                    {s.client && (<><dt>العميل</dt><dd>{s.client} {s.phone && <span dir="ltr">{s.phone}</span>}</dd></>)}
                  </dl>
                  {s.notes && <p className="adm-hint">{s.notes}</p>}
                  {s.status?.error && <small className="err">{s.status.error}</small>}
                  <div className="acc-row" style={{ flexWrap: "wrap" }}>
                    <button type="button" className="mini" onClick={() => setEdit(s)}>تعديل</button>
                    {s.baseUrl && <a className="mini-link" href={s.baseUrl} target="_blank" rel="noreferrer">فتح المتجر</a>}
                    {s.baseUrl && <a className="mini-link" href={s.baseUrl + "/admin"} target="_blank" rel="noreferrer">لوحة العميل</a>}
                    {s.adminEmail && <button type="button" className="mini" onClick={async () => { try { const c = await api({ action: "adminCredentials", id: s.id }); prompt(`دخول المالك: ${c.email}\nانسخ كلمة المرور:`, c.password || "(غير محفوظة)"); } catch (e) { setErr(e.message); } }}>بيانات دخول المالك</button>}
                  </div>
                  <small className="adm-hint">آخر فحص: {fmt(s.status?.at)} {!s.hasSecret && "· المفتاح غير محفوظ"}</small>
                </div>
              );
            })}
          </div>
        </>
      ))}
      {view === "new" && <Wizard data={data} reload={load} setErr={setErr} />}
      {view === "updates" && <Updates data={data} reload={load} setErr={setErr} />}
      {view === "backups" && <Backups data={data} setErr={setErr} />}
      {view === "log" && <Log />}
    </div>
  );
}
