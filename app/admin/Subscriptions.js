"use client";
import { useEffect, useMemo, useState } from "react";
import { ANNUAL_AR, PLANS, POLICY_AR, STATUS, riyadhToday } from "@/lib/subscription-plans";

const money = (n) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
const blank = () => ({ storeName: "", phone: "", plan: "basic", customAmount: "", cycle: "monthly", startDate: riyadhToday() });

async function api(method, body, query = "") {
  const r = await fetch("/api/subscriptions" + query, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "تعذر الحفظ");
  return j;
}

function Kpi({ label, value, sub, tone }) {
  return (
    <div className={"sub-kpi" + (tone ? " " + tone : "")}>
      <span>{label}</span>
      <b dir="ltr">{value}</b>
      {sub && <small>{sub}</small>}
    </div>
  );
}

export default function Subscriptions({ onCount }) {
  const [items, setItems] = useState(null);
  const [summary, setSummary] = useState(null);
  const [storage, setStorage] = useState("file");
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pay, setPay] = useState(null);

  async function load() {
    try {
      const j = await api("GET");
      setItems(j.items || []);
      setSummary(j.summary || null);
      setStorage(j.storage || null);
      setErr("");
      onCount?.(j.summary?.overdue || 0);
    } catch (e) {
      setErr(e.message);
      setItems([]);
    }
  }
  useEffect(() => { load(); }, []);

  const query = q.trim();
  const matches = useMemo(() => {
    const list = items || [];
    if (!query) return list;
    const digits = query.replace(/\D/g, "");
    return list.filter((x) => `${x.storeName} ${x.phone} ${x.planName}`.includes(query) || (digits && String(x.phone || "").includes(digits)));
  }, [items, query]);
  const shown = useMemo(() => {
    if (filter === "due") return matches.filter((x) => x.status === "due_soon");
    if (filter === "late") return matches.filter((x) => x.status !== "active" && x.status !== "due_soon");
    return matches;
  }, [matches, filter]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function saveForm(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const body = { ...form, customAmount: form.customAmount };
      if (form.id) await api("PUT", body);
      else await api("POST", body);
      setForm(null);
      await load();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  async function markPaid(item) {
    setBusy(true);
    setErr("");
    try {
      await api("PUT", { id: item.id, action: "pay", date: pay?.date || riyadhToday(), amount: pay?.amount ?? item.periodAmount });
      setPay(null);
      await load();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  async function removePayment(item, paymentId) {
    if (!confirm("حذف هذه الدفعة؟ تاريخ التجديد يُحسب من جديد.")) return;
    setBusy(true);
    try {
      await api("PUT", { id: item.id, action: "unpay", paymentId });
      await load();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeClient(item) {
    if (!confirm(`حذف اشتراك «${item.storeName}»؟`)) return;
    setBusy(true);
    try {
      await api("DELETE", null, "?id=" + encodeURIComponent(item.id));
      await load();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sub-board">
      <p className="adm-hint">{POLICY_AR} {ANNUAL_AR}</p>
      {storage === "file" && <p className="adm-hint">الحفظ على هذا الجهاز في الملف المحلي <span dir="ltr">.data/subscriptions.json</span>. على Vercel تُحفظ الاشتراكات في Upstash Redis نفسه المستخدم لبقية اللوحة.</p>}
      {err && <p className="err">{err}</p>}

      <div className="sub-kpis">
        <Kpi label="الإيراد الشهري المتكرر" value={summary ? money(summary.mrr) : "—"} sub="ريال" />
        <Kpi label="مستحق خلال 3 أيام" value={summary ? summary.dueSoon : "—"} tone="soon" />
        <Kpi label="متأخر" value={summary ? summary.overdue : "—"} tone="late" />
        <Kpi label="العملاء" value={summary ? summary.clients : "—"} />
      </div>

      <label className="sub-search">
        هل هذا العميل مسدد؟
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="اسم المتجر أو رقم الجوال" />
      </label>

      {query && (
        <div className="adm-card">
          <b>نتيجة البحث</b>
          {!matches.length && <p className="adm-hint">لا يوجد عميل بهذا الاسم أو الرقم.</p>}
          {matches.map((item) => (
            <p key={item.id} className={"sub-answer " + (STATUS[item.status]?.tone || "")}>
              <strong>{item.storeName}</strong>
              {" — "}
              {item.answer}
            </p>
          ))}
        </div>
      )}

      <div className="sub-filters">
        {[
          ["all", "الكل"],
          ["due", "مستحق قريباً"],
          ["late", "متأخر"],
        ].map(([k, label]) => (
          <button key={k} type="button" className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{label}</button>
        ))}
        <button type="button" className="primary" onClick={() => { setForm(blank()); setPay(null); }}>إضافة عميل</button>
      </div>

      {form && (
        <form className="adm-card" onSubmit={saveForm}>
          <b>{form.id ? "تعديل الاشتراك" : "عميل جديد"}</b>
          <div className="row">
            <label>اسم المتجر<input value={form.storeName} onChange={(e) => setField("storeName", e.target.value)} required /></label>
            <label>الجوال / واتساب<input dir="ltr" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="05xxxxxxxx" /></label>
          </div>
          <div className="row">
            <label>
              الباقة
              <select value={form.plan} onChange={(e) => setField("plan", e.target.value)}>
                {PLANS.map((p) => <option key={p.id} value={p.id}>{p.nameAr}{p.monthly ? ` — ${p.monthly}` : ""}</option>)}
              </select>
            </label>
            <label>
              الدورة
              <select value={form.cycle} onChange={(e) => setField("cycle", e.target.value)}>
                <option value="monthly">شهري</option>
                <option value="annual">سنوي (شهران مجاناً)</option>
              </select>
            </label>
          </div>
          <div className="row">
            {form.plan === "custom" && (
              <label>المبلغ الشهري بالريال<input type="number" min="1" value={form.customAmount} onChange={(e) => setField("customAmount", e.target.value)} required /></label>
            )}
            <label>تاريخ البداية<input type="date" value={form.startDate} onChange={(e) => setField("startDate", e.target.value)} required /></label>
          </div>
          <div className="sub-actions">
            <button className="primary" type="submit" disabled={busy}>{busy ? "جارٍ الحفظ..." : "حفظ"}</button>
            <button className="mini" type="button" onClick={() => setForm(null)}>إلغاء</button>
          </div>
        </form>
      )}

      {!items && !err && <p>جارٍ التحميل...</p>}
      {items && !shown.length && !query && <p className="adm-hint">لا يوجد عملاء في هذا العرض. أضف أول اشتراك من الزر أعلاه.</p>}

      <div className="sub-list">
        {shown.map((item) => {
          const tone = STATUS[item.status]?.tone || "";
          const paying = pay?.id === item.id;
          return (
            <article key={item.id} className="adm-card sub-card">
              <div className="adm-card-h">
                <b>{item.storeName}</b>
                <span className={"sub-pill " + tone}>{STATUS[item.status]?.ar || item.status}</span>
              </div>
              <p className={"sub-answer " + tone}>{item.answer}</p>
              <dl className="sub-meta">
                <div><dt>الباقة</dt><dd>{item.planName}{item.plan === "custom" ? ` (${money(item.monthly)} ر.س)` : ` — ${money(item.monthly)} ر.س`}</dd></div>
                <div><dt>الدورة</dt><dd>{item.cycle === "annual" ? `سنوي، الدفعة ${money(item.periodAmount)} ر.س` : "شهري"}</dd></div>
                <div><dt>البداية</dt><dd dir="ltr">{item.startDate}</dd></div>
                <div><dt>التجديد القادم</dt><dd dir="ltr">{item.nextRenewal || "—"}</dd></div>
                <div><dt>الجوال</dt><dd>{item.phone ? <a href={item.wa} target="_blank" rel="noopener">{item.phone}</a> : "—"}</dd></div>
              </dl>
              {paying && (
                <div className="row">
                  <label>تاريخ الدفعة<input type="date" value={pay.date} onChange={(e) => setPay({ ...pay, date: e.target.value })} /></label>
                  <label>المبلغ<input type="number" min="0" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></label>
                </div>
              )}
              <div className="sub-actions">
                {paying ? (
                  <>
                    <button className="primary" type="button" disabled={busy} onClick={() => markPaid(item)}>تأكيد السداد</button>
                    <button className="mini" type="button" onClick={() => setPay(null)}>إلغاء</button>
                  </>
                ) : (
                  <button className="primary" type="button" onClick={() => setPay({ id: item.id, date: riyadhToday(), amount: item.periodAmount })}>تسجيل دفعة</button>
                )}
                <button className="mini" type="button" onClick={() => { setForm({ ...item, customAmount: item.customAmount || "" }); setPay(null); }}>تعديل</button>
                <button className="mini danger" type="button" onClick={() => removeClient(item)}>حذف</button>
              </div>
              {item.payments?.length > 0 && (
                <ul className="sub-pays">
                  {[...item.payments].reverse().map((p) => (
                    <li key={p.id}>
                      <span dir="ltr">{p.date}</span>
                      <b dir="ltr">{money(p.amount)} ر.س</b>
                      <button type="button" className="mini danger" onClick={() => removePayment(item, p.id)}>حذف</button>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
