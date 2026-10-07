"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  KINDS, CATS, CAT_LABEL, CHANNELS, AD_CHANNELS, EXPENSE_CATS, FUNDING_SOURCES, PERIODS,
  summarize, periodRange, inRange, receivables, riyadhToday, toAmount,
} from "@/lib/finance";
import { AIcon } from "./AdminIcons";

const money = (n) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
const sar = (n) => `${money(n)} ر.س`;
const pctText = (v) => (v == null ? "—" : `${Math.round(v * 100)}%`);
const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const monthName = (ym) => MONTHS[Number(ym.slice(5, 7)) - 1] || ym;
const KIND_ICON = { income: "income", expense: "expense", funding: "funding", withdraw: "withdraw" };
const catName = (e) => CATS[e.kind]?.[e.cat] || e.cat;

const readB64 = (f) =>
  new Promise((ok, no) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1] || "");
    r.onerror = no;
    r.readAsDataURL(f);
  });

const blank = (kind = "expense", extra = {}) => ({ kind, cat: kind === "expense" ? "tools" : kind === "income" ? "project" : "personal", amount: "", date: riyadhToday(), note: "", client: "", channel: "", docRef: "", ...extra });

async function api(method, body, query = "") {
  const r = await fetch("/api/accounting" + query, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "تعذر الحفظ");
  return j;
}

/* ---------- قطع صغيرة ---------- */
function Chips({ value, options, onChange, small }) {
  return (
    <div className={"acc-chips" + (small ? " small" : "")}>
      {Object.entries(options).map(([k, l]) => (
        <button key={k} type="button" className={value === k ? "on" : ""} onClick={() => onChange(k)}>{l}</button>
      ))}
    </div>
  );
}

function Kpi({ label, value, sub, tone }) {
  return (
    <div className={"acc-kpi" + (tone ? " " + tone : "")}>
      <span>{label}</span>
      <b dir="ltr">{value}</b>
      {sub && <small>{sub}</small>}
    </div>
  );
}

// أعمدة أفقية لتوزيع مبلغ على بنود (لون واحد، القيمة مكتوبة بجانب كل عمود)
function Bars({ rows, labels, color }) {
  const max = Math.max(...rows.map((r) => r[1]), 1);
  const total = rows.reduce((s, r) => s + r[1], 0);
  if (!rows.length) return <p className="adm-hint">لا توجد بيانات في هذه الفترة.</p>;
  return (
    <div className="acc-bars">
      {rows.map(([k, v]) => (
        <div key={k} className="acc-bar" title={`${labels[k] || k || "غير محدد"}: ${sar(v)}`}>
          <span className="acc-bar-l">{labels[k] || k || "غير محدد"}</span>
          <span className="acc-bar-t"><i style={{ width: `${(v / max) * 100}%`, background: color }} /></span>
          <span className="acc-bar-v" dir="ltr">{money(v)} <small>{Math.round((v / total) * 100)}%</small></span>
        </div>
      ))}
    </div>
  );
}

// إيرادات ومصروفات آخر 6 أشهر، الضغط على الشهر يعرض تفاصيله
function MonthChart({ months }) {
  const list = months.slice(-6);
  const [sel, setSel] = useState(list[list.length - 1]?.month);
  const max = Math.max(...list.flatMap((m) => [m.income, m.expense]), 1);
  const cur = list.find((m) => m.month === sel) || list[list.length - 1];
  return (
    <div className="acc-chart">
      <div className="acc-legend">
        <span><i style={{ background: "var(--c-inc)" }} />الإيرادات</span>
        <span><i style={{ background: "var(--c-exp)" }} />المصروفات</span>
      </div>
      <div className="acc-cols" role="list">
        {list.map((m) => (
          <button key={m.month} type="button" role="listitem" className={"acc-col" + (m.month === cur.month ? " on" : "")} onClick={() => setSel(m.month)} aria-label={`${monthName(m.month)}: إيرادات ${money(m.income)}، مصروفات ${money(m.expense)}`}>
            <span className="acc-col-bars">
              <i style={{ height: `${(m.income / max) * 100}%`, background: "var(--c-inc)" }} />
              <i style={{ height: `${(m.expense / max) * 100}%`, background: "var(--c-exp)" }} />
            </span>
            <span className="acc-col-l">{monthName(m.month)}</span>
          </button>
        ))}
      </div>
      <div className="acc-chart-d">
        <b>{monthName(cur.month)} {cur.month.slice(0, 4)}</b>
        <span>إيرادات <b dir="ltr">{money(cur.income)}</b></span>
        <span>مصروفات <b dir="ltr">{money(cur.expense)}</b></span>
        <span>إعلانات <b dir="ltr">{money(cur.ads)}</b></span>
        <span>صافي <b dir="ltr" className={cur.net < 0 ? "err" : "ok"}>{money(cur.net)}</b></span>
      </div>
    </div>
  );
}

/* ---------- نموذج إضافة / تعديل عملية ---------- */
function EntryForm({ entry, docs, onSave, onDelete, onClose, busy }) {
  const [e, setE] = useState(entry);
  const set = (k, v) => setE((x) => ({ ...x, [k]: v }));
  const setKind = (kind) => setE((x) => ({ ...blank(kind), amount: x.amount, date: x.date, note: x.note, id: x.id, _p: x._p }));
  const showChannel = e.kind === "income" || (e.kind === "expense" && e.cat === "ads");
  const channels = e.kind === "income" ? CHANNELS : AD_CHANNELS;
  return (
    <div className="acc-sheet" onClick={(ev) => ev.target === ev.currentTarget && onClose()}>
      <form
        className="acc-sheet-in"
        onSubmit={(ev) => {
          ev.preventDefault();
          onSave(e);
        }}
      >
        <div className="acc-sheet-h">
          <b>{e.id ? "تعديل العملية" : "عملية جديدة"}</b>
          <button type="button" className="acc-x" onClick={onClose} aria-label="إغلاق"><AIcon name="close" size={20} /></button>
        </div>
        <div className="acc-kinds">
          {Object.entries(KINDS).map(([k, l]) => (
            <button key={k} type="button" className={"k-" + k + (e.kind === k ? " on" : "")} onClick={() => setKind(k)}>
              <AIcon name={KIND_ICON[k]} size={22} />
              {l}
            </button>
          ))}
        </div>
        <label>
          المبلغ (ريال)
          <input type="text" inputMode="decimal" className="acc-amount" value={e.amount} onChange={(ev) => set("amount", ev.target.value)} placeholder="0" autoFocus={!e.id} dir="ltr" />
        </label>
        <div>
          <span className="acc-lbl">{CAT_LABEL[e.kind]}</span>
          <Chips value={e.cat} options={CATS[e.kind]} onChange={(v) => set("cat", v)} small />
        </div>
        {showChannel && (
          <div>
            <span className="acc-lbl">{e.kind === "income" ? "من أين جاء العميل؟ (لحساب عائد الإعلانات)" : "منصة الإعلان"}</span>
            <Chips value={e.channel} options={channels} onChange={(v) => set("channel", e.channel === v ? "" : v)} small />
          </div>
        )}
        <div className="row">
          <label>
            التاريخ
            <input type="date" value={e.date} onChange={(ev) => set("date", ev.target.value)} />
          </label>
          {e.kind === "income" && (
            <label>
              العميل
              <input type="text" value={e.client} onChange={(ev) => set("client", ev.target.value)} />
            </label>
          )}
        </div>
        {e.kind === "income" && docs.length > 0 && (
          <label>
            مرتبط بعرض سعر / عقد (لحساب المتبقي على العميل)
            <select value={e.docRef} onChange={(ev) => set("docRef", ev.target.value)}>
              <option value="">بدون ربط</option>
              {docs.map((d) => (
                <option key={d.number} value={d.number}>{d.number} · {d.client || d.title} · {money(d.total)}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          وصف (اختياري)
          <input type="text" value={e.note} onChange={(ev) => set("note", ev.target.value)} placeholder={e.kind === "expense" ? "مثال: اشتراك Vercel Pro" : ""} />
        </label>
        <div className="acc-sheet-f">
          <button type="submit" className="primary" disabled={busy || !(toAmount(e.amount) > 0)}>{busy ? "جارٍ الحفظ..." : "حفظ"}</button>
          {e.id && onDelete && (
            <button type="button" className="mini danger" onClick={() => onDelete(e)}>حذف</button>
          )}
        </div>
      </form>
    </div>
  );
}

/* ---------- المحاسبة ---------- */
const VIEWS = [
  ["overview", "نظرة عامة", "pie"],
  ["entries", "العمليات", "list"],
  ["budget", "الميزانية والتمويل", "funding"],
  ["ai", "المحاسب الذكي", "sparkle"],
];

export default function Accounting() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [view, setView] = useState("overview");
  const [period, setPeriod] = useState("month");
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [kindF, setKindF] = useState("all");
  const [q, setQ] = useState("");
  const [settings, setSettings] = useState(null);
  const [reinvestAmt, setReinvestAmt] = useState("");
  // المحاسب الذكي
  const [aiText, setAiText] = useState("");
  const [aiFile, setAiFile] = useState(null);
  const [aiBusy, setAiBusy] = useState("");
  const [proposed, setProposed] = useState(null);
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const fileRef = useRef(null);

  async function load() {
    try {
      const r = await fetch("/api/accounting");
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "تعذر التحميل");
      setData(j);
      setSettings((s) => s || j.settings);
    } catch (x) {
      setErr(x.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const today = riyadhToday();
  const s = useMemo(() => data && summarize(data.items, periodRange(period, today), data.settings, today), [data, period, today]);
  const recv = useMemo(() => (data ? receivables(data.docs.filter((d) => d.status === "accepted"), data.items).filter((d) => d.due > 0) : []), [data]);

  function flash(t) {
    setMsg(t);
    setTimeout(() => setMsg((m) => (m === t ? "" : m)), 3500);
  }

  async function saveEntry(e) {
    setBusy(true);
    setErr("");
    try {
      if (e.id) await api("PUT", e);
      else await api("POST", e);
      // عند الحفظ من اقتراحات الذكاء الاصطناعي تُزال العملية من القائمة
      if (e._p != null) setProposed((p) => p && p.filter((_, i) => i !== e._p));
      setForm(null);
      flash("تم الحفظ ✓");
      await load();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  }
  async function removeEntry(e) {
    if (!confirm(`حذف عملية ${sar(e.amount)} نهائياً؟`)) return;
    try {
      await api("DELETE", null, `?id=${encodeURIComponent(e.id)}`);
      setForm(null);
      await load();
    } catch (x) {
      setErr(x.message);
    }
  }
  async function reinvest(amount) {
    const n = toAmount(amount);
    if (!(n > 0)) return;
    if (!confirm(`نقل ${sar(n)} من الأرباح إلى ميزانية المشروع؟`)) return;
    try {
      await api("POST", { kind: "funding", cat: "reinvest", amount: n, date: today, note: "إعادة تمويل الميزانية من الأرباح" });
      setReinvestAmt("");
      flash("تمت إعادة تمويل الميزانية ✓");
      await load();
    } catch (x) {
      setErr(x.message);
    }
  }
  async function saveSettings(next = settings) {
    try {
      const j = await api("PUT", { settings: next });
      setSettings(j.settings);
      setData((d) => ({ ...d, settings: j.settings }));
      flash("تم حفظ الإعدادات ✓");
    } catch (x) {
      setErr(x.message);
    }
  }

  async function aiParse() {
    setAiBusy("parse");
    setErr("");
    setProposed(null);
    try {
      const file = aiFile ? { type: aiFile.type, data: await readB64(aiFile) } : null;
      const r = await fetch("/api/accounting/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "parse", text: aiText, file }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "تعذر القراءة");
      setProposed({ entries: j.entries, reply: j.reply });
    } catch (x) {
      setErr(x.message);
    }
    setAiBusy("");
  }
  async function saveProposed() {
    setBusy(true);
    try {
      await api("POST", { entries: proposed.entries });
      flash(`تم حفظ ${proposed.entries.length} عملية ✓`);
      setProposed(null);
      setAiText("");
      setAiFile(null);
      await load();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  }
  async function aiAnalyze() {
    setAiBusy("analyze");
    setErr("");
    try {
      const r = await fetch("/api/accounting/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "analyze", text: question }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "تعذر التحليل");
      setAnalysis(j.analysis);
    } catch (x) {
      setErr(x.message);
    }
    setAiBusy("");
  }
  function applyPlan(plan) {
    const total = Math.round(plan.reduce((a, p) => a + (Number(p.amount) || 0), 0));
    const ads = Math.round(plan.filter((p) => /إعلان|اعلان|ads/i.test(p.item)).reduce((a, p) => a + (Number(p.amount) || 0), 0));
    if (!confirm(`اعتماد ميزانية شهرية ${sar(total)}${ads ? ` منها ${sar(ads)} للإعلانات` : ""}؟`)) return;
    const next = { ...settings, monthlyBudget: total, adsBudget: ads || settings.adsBudget };
    setSettings(next);
    saveSettings(next);
  }

  function exportCsv() {
    const rows = [["التاريخ", "النوع", "البند / المصدر", "المبلغ", "المنصة / مصدر العميل", "العميل", "رقم العرض / العقد", "الوصف"]];
    for (const e of data.items) rows.push([e.date, KINDS[e.kind], catName(e), e.amount, CHANNELS[e.channel] || "", e.client || "", e.docRef || "", e.note || ""]);
    const csv = "﻿" + rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `hassandev-accounting-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!data) return err ? <div className="note">{err}</div> : <p>جارٍ التحميل...</p>;

  const docs = data.docs || [];
  const add = (kind, extra) => setForm(blank(kind, extra));
  const range = periodRange(period, today);
  const list = data.items.filter((e) => {
    if (!inRange(e, range)) return false;
    if (kindF === "ads" ? !(e.kind === "expense" && e.cat === "ads") : kindF !== "all" && e.kind !== kindF) return false;
    const t = q.trim();
    return !t || [e.note, e.client, e.docRef, catName(e), CHANNELS[e.channel], String(e.amount)].some((v) => String(v || "").includes(t));
  });
  const listTotal = list.reduce((a, e) => a + (e.kind === "income" || e.kind === "funding" ? 1 : -1) * e.amount, 0);
  const st = settings || data.settings;
  const budgetUse = st.monthlyBudget ? s.monthExpense / st.monthlyBudget : null;
  const adsUse = st.adsBudget ? s.monthAds / st.adsBudget : null;

  return (
    <div className="acc">
      {!data.db && <div className="note">قاعدة البيانات غير مربوطة، لذلك لن تُحفظ العمليات.</div>}
      {err && <div className="note">{err}</div>}
      {msg && <div className="acc-toast ok">{msg}</div>}

      <div className="acc-views">
        {VIEWS.map(([k, l, ic]) => (
          <button key={k} type="button" className={view === k ? "on" : ""} onClick={() => setView(k)}>
            <AIcon name={ic} size={22} />
            {l}
          </button>
        ))}
      </div>

      {(view === "overview" || view === "entries") && <Chips value={period} options={PERIODS} onChange={setPeriod} />}

      {view === "overview" && (
        <>
          <div className="acc-quick">
            <button type="button" className="k-income" onClick={() => add("income")}><AIcon name="income" />+ إيراد</button>
            <button type="button" className="k-expense" onClick={() => add("expense")}><AIcon name="expense" />+ مصروف</button>
            <button type="button" className="k-ads" onClick={() => add("expense", { cat: "ads", channel: "snap" })}><AIcon name="ads" />+ إعلان</button>
            <button type="button" className="k-funding" onClick={() => add("funding")}><AIcon name="funding" />+ تمويل</button>
          </div>

          <div className="acc-kpis">
            <Kpi label="الإيرادات" value={money(s.income)} />
            <Kpi label="المصروفات" value={money(s.expense)} />
            <Kpi label="صافي الربح" value={money(s.net)} sub={`هامش الربح ${pctText(s.margin)}`} tone={s.net < 0 ? "bad" : s.net > 0 ? "good" : ""} />
            <Kpi label="مصروف الإعلانات" value={money(s.ads)} sub={`${pctText(s.adShare)} من المصروفات`} />
            <Kpi label="عائد الإعلانات" value={s.roas == null ? "—" : `${s.roas.toFixed(1)}x`} sub={s.ads ? `${money(s.adIncome)} دخل من عملاء الإعلانات` : "سجّل مصروف إعلان أولاً"} tone={s.roas == null ? "" : s.roas >= 1 ? "good" : "bad"} />
            <Kpi label="مستحقات على العملاء" value={money(recv.reduce((a, d) => a + d.due, 0))} sub={`${recv.length} عقد / عرض موافق عليه`} />
          </div>

          <div className="adm-card acc-pots">
            <b>الأرصدة الآن</b>
            <div className="acc-pots-g">
              <Kpi label="رصيد الميزانية" value={money(s.budget)} sub="التمويل − المصروفات" tone={s.budget < 0 ? "bad" : ""} />
              <Kpi label="الأرباح المتاحة" value={money(s.profits)} sub="الدخل − إعادة التمويل − السحوبات" tone={s.profits < 0 ? "bad" : ""} />
              <Kpi label="إجمالي النقد" value={money(s.cash)} />
            </div>
            {s.suggestReinvest > 0 && (
              <div className="acc-suggest">
                <span>
                  {s.deficit > 0 ? `الميزانية بالسالب ${sar(s.deficit)}. ` : `صافي ربح هذا الشهر ${sar(s.monthNet)}. `}
                  المقترح: أعد تمويل الميزانية بـ <b dir="ltr">{sar(s.suggestReinvest)}</b> من الأرباح
                  {s.deficit > 0 ? "." : ` (${st.reinvestPct}% من الربح).`}
                </span>
                <button type="button" className="gold" onClick={() => reinvest(s.suggestReinvest)}>سجّل إعادة التمويل</button>
              </div>
            )}
          </div>

          <div className="adm-card">
            <b>آخر 6 أشهر</b>
            <MonthChart months={s.months} />
          </div>

          <div className="adm-card">
            <b>أين تذهب المصروفات؟ ({PERIODS[period]})</b>
            <Bars rows={s.expenseByCat} labels={EXPENSE_CATS} color="var(--c-exp)" />
          </div>

          <div className="adm-card">
            <b>الإعلانات: المصروف مقابل الدخل ({PERIODS[period]})</b>
            {s.platforms.length ? (
              <div className="acc-table">
                <div className="acc-tr th"><span>المنصة</span><span>المصروف</span><span>دخل العملاء</span><span>العائد</span></div>
                {s.platforms.map((p) => (
                  <div key={p.key} className="acc-tr">
                    <span>{AD_CHANNELS[p.key] || "غير محدد"}</span>
                    <span dir="ltr">{money(p.spend)}</span>
                    <span dir="ltr">{money(p.revenue)}</span>
                    <span dir="ltr" className={p.roas == null ? "" : p.roas >= 1 ? "ok" : "err"}>{p.roas == null ? "—" : `${p.roas.toFixed(1)}x`}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="adm-hint">لا توجد إعلانات في هذه الفترة.</p>
            )}
            <span className="adm-hint">العائد = دخل العملاء الذين جاؤوا من المنصة ÷ ما صرفته عليها. اختر «من أين جاء العميل؟» عند تسجيل كل إيراد ليُحسب بدقة.</span>
          </div>
        </>
      )}

      {view === "entries" && (
        <>
          <Chips value={kindF} options={{ all: "الكل", income: "الإيرادات", expense: "المصروفات", ads: "الإعلانات", funding: "التمويل", withdraw: "السحوبات" }} onChange={setKindF} small />
          <div className="acc-row">
            <input type="text" placeholder="بحث: وصف، عميل، مبلغ..." value={q} onChange={(e) => setQ(e.target.value)} />
            <button type="button" className="mini" onClick={exportCsv} disabled={!data.items.length}>تصدير Excel</button>
          </div>
          <div className="acc-quick small">
            <button type="button" className="k-income" onClick={() => add("income")}>+ إيراد</button>
            <button type="button" className="k-expense" onClick={() => add("expense")}>+ مصروف</button>
            <button type="button" className="k-funding" onClick={() => add("funding")}>+ تمويل</button>
            <button type="button" className="k-withdraw" onClick={() => add("withdraw")}>+ سحب</button>
          </div>
          <span className="adm-hint">{list.length} عملية · صافي الحركة (داخل − خارج) <b dir="ltr">{money(listTotal)}</b> ر.س</span>
          {list.length === 0 ? (
            <p className="adm-hint">لا توجد عمليات هنا.</p>
          ) : (
            <div className="acc-list">
              {list.map((e) => (
                <button key={e.id} type="button" className={"acc-item k-" + e.kind} onClick={() => setForm({ ...e })}>
                  <span className="acc-item-ic"><AIcon name={e.kind === "expense" && e.cat === "ads" ? "ads" : KIND_ICON[e.kind]} size={20} /></span>
                  <span className="acc-item-b">
                    <b>{catName(e)}{e.channel ? ` · ${CHANNELS[e.channel]}` : ""}</b>
                    <small>{[e.client, e.note, e.docRef].filter(Boolean).join(" · ") || KINDS[e.kind]}</small>
                  </span>
                  <span className="acc-item-a">
                    <b dir="ltr">{e.kind === "income" || e.kind === "funding" ? "+" : "−"}{money(e.amount)}</b>
                    <small>{e.date}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {view === "budget" && (
        <>
          <div className="note info">
            للمشروع وعاءان: <b>الميزانية</b> يدخلها التمويل وتُدفع منها المصروفات، و<b>الأرباح</b> يدخلها دخل العملاء. «إعادة تمويل الميزانية» تنقل جزءاً من الأرباح إلى الميزانية، و«السحب» يخرج من الأرباح إليك أو لسداد قرض.
          </div>
          <div className="acc-kpis">
            <Kpi label="رصيد الميزانية" value={money(s.budget)} tone={s.budget < 0 ? "bad" : ""} />
            <Kpi label="الأرباح المتاحة" value={money(s.profits)} tone={s.profits < 0 ? "bad" : ""} />
            <Kpi label="إجمالي التمويل" value={money(s.fundingTotal)} sub={`خارجي ${money(s.external)} · من الأرباح ${money(s.reinvested)}`} />
            <Kpi label="المسحوب من الأرباح" value={money(s.withdrawn)} />
          </div>

          <div className="adm-card">
            <b>إعادة تمويل الميزانية من الأرباح</b>
            <span className="adm-hint">
              المقترح الآن: <b dir="ltr">{sar(s.suggestReinvest)}</b>
              {s.deficit > 0 ? " لتغطية عجز الميزانية." : ` (${st.reinvestPct}% من صافي ربح هذا الشهر ${sar(s.monthNet)}، بعد خصم ما أعدته هذا الشهر ${sar(s.monthReinvested)}).`}
            </span>
            <div className="acc-row">
              <input type="text" inputMode="decimal" dir="ltr" placeholder={String(s.suggestReinvest || 0)} value={reinvestAmt} onChange={(e) => setReinvestAmt(e.target.value)} />
              <button type="button" className="gold" onClick={() => reinvest(reinvestAmt || s.suggestReinvest)}>إعادة التمويل</button>
            </div>
            <div className="acc-quick small">
              <button type="button" className="k-funding" onClick={() => add("funding")}>+ تمويل من مصدر خارجي</button>
              <button type="button" className="k-withdraw" onClick={() => add("withdraw")}>+ سحب من الأرباح</button>
            </div>
          </div>

          <div className="adm-card">
            <b>مصادر التمويل (منذ البداية)</b>
            <Bars rows={s.fundingBySource} labels={FUNDING_SOURCES} color="var(--c-fund)" />
          </div>

          <div className="adm-card">
            <b>خطة الشهر ({monthName(today.slice(0, 7))})</b>
            {[
              ["المصروفات", s.monthExpense, st.monthlyBudget, budgetUse],
              ["الإعلانات", s.monthAds, st.adsBudget, adsUse],
            ].map(([l, used, cap, use]) => (
              <div key={l} className="acc-prog">
                <span>{l}: <b dir="ltr">{money(used)}</b>{cap ? <> من <b dir="ltr">{money(cap)}</b></> : " (بدون حد)"}</span>
                {cap > 0 && (
                  <span className="acc-prog-t"><i className={use > 1 ? "over" : use > 0.85 ? "near" : ""} style={{ width: `${Math.min(100, use * 100)}%` }} /></span>
                )}
                {use > 1 && <small className="err">تجاوزت الحد بـ {sar(used - cap)}</small>}
              </div>
            ))}
            <div className="row">
              <label>
                الميزانية الشهرية للمصروفات (0 = بدون حد)
                <input type="text" inputMode="decimal" dir="ltr" value={st.monthlyBudget} onChange={(e) => setSettings({ ...st, monthlyBudget: e.target.value })} />
              </label>
              <label>
                الحد الشهري للإعلانات (0 = بدون حد)
                <input type="text" inputMode="decimal" dir="ltr" value={st.adsBudget} onChange={(e) => setSettings({ ...st, adsBudget: e.target.value })} />
              </label>
            </div>
            <label>
              نسبة إعادة استثمار صافي الربح في الميزانية (%)
              <input type="text" inputMode="decimal" dir="ltr" value={st.reinvestPct} onChange={(e) => setSettings({ ...st, reinvestPct: e.target.value })} />
            </label>
            <button type="button" className="gold" onClick={() => saveSettings()}>حفظ الخطة</button>
          </div>

          <div className="adm-card">
            <b>المستحقات من العقود وعروض الأسعار الموافق عليها</b>
            {recv.length ? (
              recv.map((d) => (
                <div key={d.number} className="acc-recv">
                  <span>
                    <b>{d.number}</b> · {d.client || d.title}
                    <small>الإجمالي {money(d.total)} · المدفوع {money(d.paid)}</small>
                  </span>
                  <b dir="ltr" className="err">{money(d.due)}</b>
                  <button type="button" className="mini" onClick={() => add("income", { docRef: d.number, client: d.client, amount: String(d.due), note: d.title })}>سجّل دفعة</button>
                </div>
              ))
            ) : (
              <p className="adm-hint">لا توجد مبالغ متبقية. عند تسجيل إيراد اربطه برقم العقد ليُخصم من المتبقي.</p>
            )}
          </div>
        </>
      )}

      {view === "ai" && (
        <>
          {!data.ai && <div className="note">لتفعيل المحاسب الذكي أضف المتغير ANTHROPIC_API_KEY في Vercel ثم أعد النشر.</div>}
          <div className="adm-card">
            <b>سجّل بالكلام أو بصورة الفاتورة</b>
            <textarea
              rows={3}
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder={"اكتب كما تتكلم، مثال:\nدفعت 350 إعلان سناب أمس، واستلمت 4000 دفعة أولى من مشروع متجر أبو خالد جاء من إعلان تيك توك"}
            />
            <div className="acc-row">
              <button type="button" className="mini acc-file" onClick={() => fileRef.current?.click()}>
                <AIcon name="camera" size={18} /> {aiFile ? aiFile.name : "صورة فاتورة / إيصال / رسالة البنك"}
              </button>
              {aiFile && <button type="button" className="mini danger" onClick={() => setAiFile(null)}>إزالة</button>}
              <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={(e) => { setAiFile(e.target.files?.[0] || null); e.target.value = ""; }} />
            </div>
            <button type="button" className="primary" disabled={!data.ai || aiBusy || (!aiText.trim() && !aiFile)} onClick={aiParse}>
              {aiBusy === "parse" ? "جارٍ القراءة..." : "اقرأ العمليات"}
            </button>
            {proposed && (
              <div className="acc-proposed">
                {proposed.reply && <p className="adm-hint">{proposed.reply}</p>}
                {proposed.entries.map((e, i) => (
                  <div key={i} className={"acc-item k-" + e.kind}>
                    <span className="acc-item-ic"><AIcon name={e.kind === "expense" && e.cat === "ads" ? "ads" : KIND_ICON[e.kind]} size={20} /></span>
                    <span className="acc-item-b">
                      <b>{KINDS[e.kind]} · {catName(e)}{e.channel ? ` · ${CHANNELS[e.channel]}` : ""}</b>
                      <small>{[e.date, e.client, e.note].filter(Boolean).join(" · ")}</small>
                    </span>
                    <span className="acc-item-a">
                      <b dir="ltr">{money(e.amount)}</b>
                      <span style={{ display: "flex", gap: 6 }}>
                        <button type="button" className="mini" onClick={() => setForm({ ...e, _p: i })}>تعديل</button>
                        <button type="button" className="mini danger" onClick={() => setProposed((p) => ({ ...p, entries: p.entries.filter((_, j) => j !== i) }))}>×</button>
                      </span>
                    </span>
                  </div>
                ))}
                {proposed.entries.length > 0 && (
                  <button type="button" className="primary" disabled={busy} onClick={saveProposed}>حفظ {proposed.entries.length === 1 ? "العملية" : `العمليات (${proposed.entries.length})`}</button>
                )}
              </div>
            )}
          </div>

          <div className="adm-card">
            <b>حلّل وضعي المالي</b>
            <span className="adm-hint">يقرأ كل عملياتك ويعطيك: وضع المشروع، أفضل وأسوأ منصة إعلانية، كم تعيد تمويل الميزانية، وميزانية مقترحة للشهر القادم.</span>
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="سؤال اختياري: هل أزيد ميزانية إعلانات سناب؟" />
            <button type="button" className="primary" disabled={!data.ai || aiBusy} onClick={aiAnalyze}>
              {aiBusy === "analyze" ? "جارٍ التحليل... (حتى دقيقة)" : "حلّل الآن"}
            </button>
          </div>

          {analysis && (
            <div className="adm-card acc-analysis">
              <div className="acc-an-h">
                <span className={"adm-pill " + (analysis.health === "good" ? "done" : analysis.health === "critical" ? "cancelled" : "progress")}>
                  {analysis.health === "good" ? "✓ وضع جيد" : analysis.health === "critical" ? "⚠ وضع حرج" : "! يحتاج انتباه"}
                </span>
                <b>{analysis.headline}</b>
              </div>
              {analysis.answer && <div className="acc-answer">{analysis.answer}</div>}
              {[
                ["ملاحظات", analysis.insights],
                ["تنبيهات", analysis.warnings],
                ["خطوات مقترحة", analysis.actions],
              ].map(([t, items]) =>
                items?.length ? (
                  <div key={t}>
                    <span className="acc-lbl">{t}</span>
                    <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
                  </div>
                ) : null
              )}
              {analysis.reinvest?.amount > 0 && (
                <div className="acc-suggest">
                  <span>إعادة التمويل المقترحة: <b dir="ltr">{sar(analysis.reinvest.amount)}</b> · {analysis.reinvest.reason}</span>
                  <button type="button" className="gold" onClick={() => reinvest(analysis.reinvest.amount)}>نفّذها</button>
                </div>
              )}
              {analysis.budgetPlan?.length > 0 && (
                <div>
                  <span className="acc-lbl">ميزانية مقترحة للشهر القادم</span>
                  <div className="acc-table">
                    {analysis.budgetPlan.map((p, i) => (
                      <div key={i} className="acc-tr plan">
                        <span>{p.item}<small>{p.why}</small></span>
                        <span dir="ltr">{money(p.amount)}</span>
                      </div>
                    ))}
                    <div className="acc-tr plan th"><span>الإجمالي</span><span dir="ltr">{money(analysis.budgetPlan.reduce((a, p) => a + (Number(p.amount) || 0), 0))}</span></div>
                  </div>
                  <button type="button" className="gold" onClick={() => applyPlan(analysis.budgetPlan)}>اعتمدها كخطة الشهر</button>
                </div>
              )}
              <span className="adm-hint">التحليل اقتراح مبني على ما سجّلته فقط، وليس استشارة مالية أو ضريبية رسمية.</span>
            </div>
          )}
        </>
      )}

      {form && <EntryForm key={form.id || form._p || form.kind} entry={form} docs={docs} busy={busy} onSave={saveEntry} onDelete={removeEntry} onClose={() => setForm(null)} />}
    </div>
  );
}
