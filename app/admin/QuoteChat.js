"use client";
import { useEffect, useRef, useState } from "react";
import { docTotals } from "@/lib/defaults";

// محادثة مع الذكاء الاصطناعي عن فكرة العميل، تنتهي بعرض سعر جاهز بأسعار الباقات الثابتة
const STORE = "quote-chat";
const money = (n) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
const EMPTY = { messages: [], result: null };

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORE) || "null") || EMPTY;
  } catch {
    return EMPTY;
  }
}

export default function QuoteChat({ ai, onOpen }) {
  const [chat, setChat] = useState(EMPTY);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef(null);
  useEffect(() => {
    setChat(load());
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [chat]);
  // تُحفظ المحادثة على هذا الجهاز عند كل تغيير (وليس عند فتح الصفحة، حتى لا تُستبدل بمحادثة فارغة)
  function update(next) {
    setChat(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {}
  }

  async function send(t) {
    const msg = t.trim();
    if (!msg || busy) return;
    const messages = [...chat.messages, { role: "user", content: msg }];
    update({ ...chat, messages });
    setText("");
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/docs/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages, draft: chat.result?.draft || null }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "تعذر الرد");
      update({ messages: [...messages, { role: "assistant", content: j.reply }], result: j });
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  }

  const res = chat.result;
  const supportTotal = res?.support ? res.support.months * res.support.monthly : 0;
  // نفس حساب المحرر: الدعم الفني بند من البنود، والخصم على المجموع كله
  const t = res?.doc ? docTotals({ ...res.doc, sections: [...res.doc.sections, { price: supportTotal, qty: 1 }] }) : null;

  return (
    <div className="adm-card">
      <div className="adm-card-h">
        <b>عرض سعر من فكرة العميل (بالذكاء الاصطناعي)</b>
        {chat.messages.length > 0 && (
          <button type="button" className="mini" onClick={() => confirm("بدء محادثة جديدة؟ ستُمسح المحادثة الحالية.") && update(EMPTY)}>محادثة جديدة</button>
        )}
      </div>
      <span className="adm-hint">
        اكتب فكرة العميل وناقشها، ويختار الذكاء الاصطناعي الباقة والإضافات المناسبة ويكتب وصف المشروع. الأسعار والدعم الفني تؤخذ من باقات موقعك كما هي، والشروط والصلاحية من الإعدادات.
      </span>
      {!ai && <span className="err">يتطلب ANTHROPIC_API_KEY في Vercel.</span>}

      <div className="as-chat" style={{ minHeight: chat.messages.length ? 160 : 0, maxHeight: "50vh" }}>
        {chat.messages.length === 0 && (
          <div className="as-empty">
            <p>مثال: «عميل عنده مغسلة سيارات متنقلة، يبي العميل يطلب من التطبيق والعامل يستقبل الطلب ويروح له، مع دفع إلكتروني»</p>
          </div>
        )}
        {chat.messages.map((m, i) => (
          <div key={i} className={"as-msg " + (m.role === "user" ? "me" : "ai")}>{m.content}</div>
        ))}
        {busy && <div className="as-msg note">يفكر في الفكرة...</div>}
        <div ref={endRef} />
      </div>

      {err && <span className="err">{err}</span>}

      <form
        className="as-input"
        style={{ gridTemplateColumns: "1fr auto", position: "static", background: "none" }}
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(text);
            }
          }}
          placeholder={chat.messages.length ? "رد أو عدّل (مثل: أضف بوابة دفع، أو دعم فني سنة)" : "اكتب فكرة العميل..."}
        />
        <button type="submit" className="primary" disabled={!ai || busy || !text.trim()}>إرسال</button>
      </form>

      {res?.doc?.sections?.length > 0 && (
        <div className="adm-card">
          <b>{res.doc.title || "عرض السعر"}{res.ready ? " ✓ جاهز" : " (مسودة)"}</b>
          {res.doc.sections.map((s, i) => (
            <div key={i} className="acc-recv">
              <span>
                <b>{s.title}</b>{s.qty > 1 ? ` × ${s.qty}` : ""}
                <small>{s.desc}</small>
              </span>
              <b>{money(s.price * s.qty)}</b>
            </div>
          ))}
          {res.support && (
            <div className="acc-recv">
              <span>
                <b>{res.support.name} لمدة {res.support.months} شهراً</b>
                <small>{money(res.support.monthly)} ريال × {res.support.months} شهر</small>
              </span>
              <b>{money(supportTotal)}</b>
            </div>
          )}
          {t.discount > 0 && <span>خصم {res.doc.discountType === "percent" ? `${res.doc.discount}%` : ""} − {money(t.discount)} ريال</span>}
          <span>
            الإجمالي <b style={{ color: "#d4a84b" }}>{money(t.total)} ريال</b>
          </span>
          {res.gaps?.length > 0 && (
            <div className="note">
              طلبات خارج الباقات (سعّرها بنفسك في المحرر):
              <ul>{res.gaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
            </div>
          )}
          <button type="button" className="gold" style={{ justifySelf: "start" }} onClick={() => onOpen(res)}>
            فتح عرض السعر في المحرر للمراجعة
          </button>
        </div>
      )}
    </div>
  );
}
