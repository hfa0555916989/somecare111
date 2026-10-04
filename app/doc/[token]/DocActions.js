"use client";
import { useState } from "react";

export function PrintButton() {
  return (
    <button type="button" className="docv-btn" onClick={() => window.print()}>
      طباعة / حفظ PDF
    </button>
  );
}

export function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {}
  }
  return (
    <button type="button" className="copy no-print" onClick={copy}>
      {done ? "تم النسخ ✓" : "نسخ"}
    </button>
  );
}

// موافقة العميل: الاسم الكامل + تأكيد الاطلاع، ثم تُقفل الوثيقة وتُثبَّت بصمتها
export function AcceptForm({ token, kind, total }) {
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!confirm(`تأكيد الموافقة على ${kind} بإجمالي ${total} ريال باسم «${name.trim()}»؟`)) return;
    setBusy(true);
    try {
      const r = await fetch("/api/doc/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, agree }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "تعذرت الموافقة");
      window.location.reload();
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  }

  return (
    <form className="accept-form no-print" onSubmit={submit}>
      <h3>الموافقة على {kind}</h3>
      <label>
        اسمك الكامل (كما في الهوية أو السجل)
        <input value={name} onChange={(e) => setName(e.target.value)} required minLength={3} maxLength={120} autoComplete="name" />
      </label>
      <label className="chk">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
        اطلعت على {kind} وبنوده وملحقه وأوافق عليه، وأقر بأن موافقتي الإلكترونية هذه تُعد توقيعاً مني.
      </label>
      <button className="docv-btn" type="submit" disabled={busy || !agree || name.trim().length < 3}>
        {busy ? "جارٍ التسجيل..." : `أوافق على ${kind}`}
      </button>
      {err && <p className="err2">{err}</p>}
      <p className="small muted">يُسجَّل اسمك ووقت الموافقة وبصمة الوثيقة، وتُقفل الوثيقة فلا يمكن تعديلها بعد ذلك.</p>
    </form>
  );
}
