"use client";
import { useEffect, useState } from "react";
import { AIcon } from "./AdminIcons";
import { useVoice } from "./voice";

const AS = [
  ["proposal", "مقترح مبدئي", "فكرة مرتبة بدون أسعار"],
  ["requirements", "وثيقة متطلبات", "كل الصفحات والخصائص بالتفصيل"],
  ["quote", "عرض سعر", "بنود مسعّرة حسب باقاتك"],
];
const blank = () => ({ title: "", client: "", phone: "", text: "" });

export default function Ideas({ onNavigate }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);
  const v = useVoice();

  async function load() {
    const r = await fetch("/api/ideas");
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setErr(j.error || "تعذر التحميل");
    setData(j);
  }
  useEffect(() => {
    load();
    fetch("/api/voice/tts").then((r) => (r.ok ? r.json() : null)).then((j) => j && setVoiceOn(j.enabled)).catch(() => {});
  }, []);

  async function save() {
    setBusy("جارٍ الحفظ...");
    const r = await fetch("/api/ideas", { method: form.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const j = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) return setErr(j.error || "تعذر الحفظ");
    setForm(null);
    load();
  }
  async function draft(idea, as) {
    setBusy(`جارٍ كتابة ${AS.find((x) => x[0] === as)[1]}... (حتى دقيقة)`);
    setErr("");
    const r = await fetch("/api/ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "draft", id: idea.id, as }) });
    const j = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) return setErr(j.error || "تعذرت الكتابة");
    load();
    if (confirm(`تم إنشاء المسودة ${j.doc.number} في «العقود وعروض الأسعار». افتحها الآن لمراجعتها وإرسالها للعميل؟`)) onNavigate?.("docs");
  }
  async function remove(idea) {
    if (!confirm(`حذف الفكرة «${idea.title}»؟`)) return;
    await fetch(`/api/ideas?id=${encodeURIComponent(idea.id)}`, { method: "DELETE" });
    load();
  }
  async function dictate() {
    v.unlock();
    v.reset();
    try {
      const t = await v.listenOnce();
      if (t) setForm((f) => ({ ...f, text: (f.text ? f.text + "\n" : "") + t }));
    } catch (x) {
      setErr(x.message);
    }
    v.stop();
  }

  if (!data) return err ? <div className="note">{err}</div> : <p>جارٍ التحميل...</p>;

  return (
    <div className="acc">
      {err && <div className="note">{err}</div>}
      {busy && <div className="note info">{busy}</div>}
      {!data.ai && <div className="note info">لتحويل الأفكار إلى وثائق أضف ANTHROPIC_API_KEY في Vercel.</div>}

      {form ? (
        <div className="adm-card">
          <b>{form.id ? "تعديل الفكرة" : "فكرة جديدة"}</b>
          <div className="row">
            <label>عنوان الفكرة<input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: تطبيق حجوزات لصالون" /></label>
            <label>العميل<input type="text" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></label>
          </div>
          <label>جوال العميل (لإرسال الوثيقة واتساب)<input type="text" dir="ltr" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label>
            الفكرة (اكتبها أو قلها بصوتك كما تشرحها لشخص)
            <textarea rows={7} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          </label>
          <div className="acc-row">
            <button type="button" className="mini acc-file" disabled={!voiceOn || !v.supported || v.state !== "idle"} onClick={dictate}>
              <AIcon name="mic" size={18} /> {v.state === "idle" ? "إملاء بالصوت" : v.state === "transcribing" ? "أكتب كلامك..." : "أسمعك... (توقف عن الكلام للإنهاء)"}
            </button>
          </div>
          <div className="acc-row">
            <button type="button" className="primary" disabled={!!busy || !form.text.trim()} onClick={save}>حفظ الفكرة</button>
            <button type="button" className="mini" onClick={() => setForm(null)}>إلغاء</button>
          </div>
        </div>
      ) : (
        <button type="button" className="primary" style={{ justifySelf: "start" }} onClick={() => setForm(blank())}>+ فكرة جديدة</button>
      )}

      {data.items.length === 0 && !form && <p className="adm-hint">احفظ أي فكرة يطلبها عميل، ثم حوّلها بضغطة إلى مقترح أو وثيقة متطلبات أو عرض سعر يُرسل له برابط.</p>}

      {data.items.map((idea) => (
        <div key={idea.id} className="adm-card">
          <div className="adm-card-h">
            <b>{idea.title}</b>
            <span className={"adm-pill " + (idea.status === "drafted" ? "progress" : idea.status === "sent" ? "done" : "new")}>{data.statuses[idea.status]}</span>
          </div>
          {idea.client && <span className="adm-hint">{idea.client}{idea.phone ? ` · ${idea.phone}` : ""}</span>}
          <div className="acc-answer" style={{ maxHeight: 160, overflow: "auto" }}>{idea.text}</div>
          <span className="acc-lbl">حوّلها إلى:</span>
          <div className="acc-quick idea-as">
            {AS.map(([k, l, d]) => (
              <button key={k} type="button" disabled={!data.ai || !!busy} onClick={() => draft(idea, k)}>
                <AIcon name={k === "quote" ? "file" : k === "requirements" ? "list" : "bulb"} size={20} />
                {l}
                <small>{d}</small>
              </button>
            ))}
          </div>
          {idea.docs?.length > 0 && (
            <span className="adm-hint">
              الوثائق: {idea.docs.map((d) => d.number).join("، ")} ·{" "}
              <button type="button" className="mini" onClick={() => onNavigate?.("docs")}>افتح العقود والعروض</button>
            </span>
          )}
          <div className="acc-row">
            <button type="button" className="mini" onClick={() => setForm({ ...idea })}>تعديل</button>
            {idea.status !== "sent" && <button type="button" className="mini" onClick={async () => { await fetch("/api/ideas", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: idea.id, status: "sent" }) }); load(); }}>أُرسلت للعميل</button>}
            <button type="button" className="mini danger" onClick={() => remove(idea)}>حذف</button>
          </div>
        </div>
      ))}
    </div>
  );
}
