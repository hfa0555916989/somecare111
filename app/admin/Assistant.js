"use client";
import { useEffect, useRef, useState } from "react";
import { AIcon } from "./AdminIcons";
import { useVoice } from "./voice";

const STORE = "assistant-chat";
const READ_LABELS = {
  get_finance_summary: "قرأ ملخص المحاسبة",
  search_entries: "بحث في العمليات",
  list_documents: "قرأ العقود والعروض",
  get_pricing_reference: "قرأ الباقات والأسعار السابقة",
  list_projects: "قرأ المشاريع",
  list_files: "بحث في الأرشيف",
  list_ideas: "قرأ أفكار العملاء",
  open_section: "فتح قسماً",
};
const YES = /^(نعم|ايوه|أيوه|ايوا|إيه|اي|أي|تمام|نفذ|نفّذ|موافق|اوكي|أوكي|ok|okay|yes|يلا|توكل)/i;
const NO = /^(لا|لأ|لاء|الغ|ألغ|إلغ|ارفض|رفض|no|cancel|وقف)/i;
const STATE_TEXT = { listening: "أسمعك... تكلّم", hearing: "أسمعك...", transcribing: "أكتب كلامك...", speaking: "المساعد يتكلم (اضغط للمقاطعة)", thinking: "المساعد يفكر..." };

const textOf = (m) =>
  typeof m.content === "string" ? m.content : (m.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORE) || "null") || { messages: [], pending: null };
  } catch {
    return { messages: [], pending: null };
  }
}

// تنسيق بسيط لرد المساعد: **عريض** والأسطر
function Rich({ text }) {
  return (
    <div className="as-text">
      {text.split("\n").map((line, i) => (
        <p key={i}>{line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => (part.startsWith("**") ? <b key={j}>{part.slice(2, -2)}</b> : part))}</p>
      ))}
    </div>
  );
}

export default function Assistant({ onNavigate }) {
  const [chat, setChat] = useState({ messages: [], pending: null });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [conv, setConv] = useState(false); // المحادثة الصوتية شغالة
  const [settings, setSettings] = useState(null);
  const [voices, setVoices] = useState([]);
  const [voiceOn, setVoiceOn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [openHint, setOpenHint] = useState("");
  const v = useVoice();
  const convRef = useRef(false);
  const chatRef = useRef(chat);
  const endRef = useRef(null);

  useEffect(() => {
    setChat(load());
    fetch("/api/voice/tts")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && (setSettings(j.settings), setVoices(j.voices), setVoiceOn(j.enabled)))
      .catch(() => {});
    return () => {
      convRef.current = false;
    };
  }, []);
  useEffect(() => {
    chatRef.current = chat;
    try {
      localStorage.setItem(STORE, JSON.stringify(chat));
    } catch {}
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [chat]);

  async function call(body) {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "تعذر الاتصال بالمساعد");
      const next = { messages: j.messages, pending: j.pending || null };
      setChat(next);
      // فتح القسم المناسب للتقرير؛ أثناء المحادثة الصوتية يظهر زر بدل الانتقال حتى لا تنقطع
      for (const a of j.actions || [])
        if (a.type === "open" && a.section !== "assistant") convRef.current ? setOpenHint(a.section) : onNavigate?.(a.section, true);
      if (j.notice) setErr(j.notice);
      return next;
    } catch (x) {
      setErr(x.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  // رسالة جديدة: إذا كانت هناك إجراءات تنتظر، تُعتبر مرفوضة وتُرسل الرسالة معها
  async function send(msg) {
    const t = String(msg || "").trim();
    if (!t || busy) return null;
    setText("");
    const c = chatRef.current;
    if (c.pending?.length) {
      const decisions = Object.fromEntries(c.pending.map((p) => [p.id, "reject"]));
      return call({ messages: c.messages, decisions, text: t });
    }
    const messages = [...c.messages, { role: "user", content: t }];
    setChat({ messages, pending: null });
    return call({ messages });
  }

  async function decide(approve) {
    const c = chatRef.current;
    const decisions = Object.fromEntries(c.pending.map((p) => [p.id, approve ? "approve" : "reject"]));
    return call({ messages: c.messages, decisions });
  }

  const lastReply = (c) => {
    const m = [...(c?.messages || [])].reverse().find((x) => x.role === "assistant" && textOf(x));
    return m ? textOf(m) : "";
  };

  // حلقة المحادثة الصوتية: يسمع ← يرسل ← يرد بصوت ← يسمع من جديد
  async function conversation() {
    v.unlock();
    v.reset();
    convRef.current = true;
    setConv(true);
    try {
      while (convRef.current) {
        const heard = await v.listenOnce();
        if (!convRef.current) break;
        if (!heard) continue;
        let res;
        const c = chatRef.current;
        if (c.pending?.length && YES.test(heard.trim())) res = await decide(true);
        else if (c.pending?.length && NO.test(heard.trim())) res = await decide(false);
        else res = await send("🎤 " + heard);
        if (!convRef.current || !res) continue;
        if (settings?.speak !== false) {
          let say = lastReply(res);
          if (res.pending?.length) say += `\n${res.pending.map((p) => p.title).join("، ")}. هل أنفّذ؟ قل نعم أو لا.`;
          await v.speak(say);
        }
      }
    } catch (x) {
      setErr(x.name === "NotAllowedError" ? "اسمح للموقع باستخدام المايكروفون من إعدادات المتصفح." : x.message);
    }
    convRef.current = false;
    setConv(false);
    v.stop();
  }
  function endConversation() {
    convRef.current = false;
    v.stop();
    setConv(false);
  }

  // إملاء رسالة واحدة في خانة الكتابة
  async function dictate() {
    v.unlock();
    v.reset();
    try {
      const heard = await v.listenOnce();
      if (heard) setText((t) => (t ? t + " " : "") + heard);
    } catch (x) {
      setErr(x.name === "NotAllowedError" ? "اسمح للموقع باستخدام المايكروفون من إعدادات المتصفح." : x.message);
    }
    v.stop();
  }

  async function saveSettings(next) {
    setSettings(next);
    await fetch("/api/voice/tts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) }).catch(() => {});
  }

  function newChat() {
    if (chat.messages.length && !confirm("بدء محادثة جديدة؟ المحادثة الحالية ستُمسح من هذا الجهاز.")) return;
    setChat({ messages: [], pending: null });
  }

  // عرض المحادثة: نصوص المالك والمساعد، وما قرأه المساعد من بيانات
  const items = [];
  for (const m of chat.messages) {
    if (m.role === "user") {
      const t = textOf(m);
      if (t) items.push({ who: "me", text: t });
      for (const b of Array.isArray(m.content) ? m.content : []) if (b.type === "tool_result" && /^رفض المالك/.test(String(b.content))) items.push({ who: "note", text: "رفضتَ الإجراء" });
    } else {
      for (const b of m.content || []) {
        if (b.type === "text" && b.text.trim()) items.push({ who: "ai", text: b.text.trim() });
        else if (b.type === "tool_use" && READ_LABELS[b.name]) items.push({ who: "note", text: "🔎 " + READ_LABELS[b.name] });
      }
    }
  }
  const status = busy ? "thinking" : v.state;

  return (
    <div className="as">
      {!voiceOn && <div className="note info">للمحادثة الصوتية أضف ELEVENLABS_API_KEY في Vercel ثم أعد النشر. الكتابة تعمل الآن.</div>}

      <div className="as-head">
        <button type="button" className={"as-talk" + (conv ? " on" : "")} disabled={!voiceOn || !v.supported} onClick={conv ? endConversation : conversation}>
          <span className="as-ring" style={{ transform: `scale(${1 + v.level * 0.6})` }} />
          <AIcon name={conv ? "close" : "mic"} size={30} />
          <b>{conv ? "إنهاء المحادثة" : "محادثة صوتية"}</b>
        </button>
        <div className="as-state">
          {conv || busy ? <span>{STATE_TEXT[status] || "..."}</span> : <span className="adm-hint">اضغط وتكلّم كأنك تكلّم مساعدك: «كم صرفت على سناب هذا الشهر؟»، «سجّل 500 فاتورة استضافة»، «جهّز عرض سعر لمتجر عطور».</span>}
          {v.state === "speaking" && <button type="button" className="mini" onClick={v.interrupt}>قاطع</button>}
        </div>
        <span className="as-tools">
          <button type="button" className="mini" onClick={() => setShowSettings(!showSettings)}>الإعدادات</button>
          <button type="button" className="mini" onClick={newChat}>محادثة جديدة</button>
        </span>
      </div>

      {showSettings && settings && (
        <div className="adm-card">
          <b>إعدادات الصوت</b>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={settings.speak !== false} onChange={(e) => saveSettings({ ...settings, speak: e.target.checked })} />
            يرد المساعد بصوت في المحادثة الصوتية
          </label>
          {voices.length > 0 && (
            <label>
              صوت المساعد
              <select value={settings.voiceId} onChange={(e) => saveSettings({ ...settings, voiceId: e.target.value })}>
                <option value="">الافتراضي</option>
                {voices.map((x) => <option key={x.id} value={x.id}>{x.name}{x.labels?.accent ? ` (${x.labels.accent})` : ""}</option>)}
              </select>
            </label>
          )}
          <label>
            كلمات يجب أن يفهمها جيداً (أسماء عملاء، مصطلحات، منصات) — كل سطر كلمة أو عبارة
            <textarea rows={4} value={settings.vocabulary} onChange={(e) => setSettings({ ...settings, vocabulary: e.target.value })} onBlur={() => saveSettings(settings)} placeholder={"سناب شات\nفيرسل\nريسند\nمتجر الورد"} />
          </label>
          <span className="adm-hint">أسماء العملاء من العقود والمشاريع تُضاف تلقائياً. كلما أضفت مصطلحاتك صار فهمه لنطقك أدق.</span>
        </div>
      )}

      {err && <div className="note">{err}</div>}

      <div className="as-chat">
        {items.length === 0 && (
          <div className="as-empty">
            <AIcon name="sparkle" size={30} />
            <p>أنا مساعدك. أقرأ محاسبتك وعقودك ومشاريعك وأرشيفك، أناقشك في الميزانية والتمويل، وأنفّذ بعد موافقتك.</p>
            <div className="acc-chips small">
              {["كيف وضعي المالي هذا الشهر؟", "كم أعيد من الأرباح للميزانية؟", "قارن سناب وتيك توك", "ساعدني أسعّر متجر إلكتروني", "وش التزاماتي القادمة؟"].map((s) => (
                <button key={s} type="button" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {items.map((it, i) => (
          <div key={i} className={"as-msg " + it.who}>
            {it.who === "ai" ? <Rich text={it.text} /> : it.text.replace(/^🎤 /, "🎤 ")}
          </div>
        ))}
        {chat.pending?.length > 0 && (
          <div className="as-pending">
            {chat.pending.map((p) => (
              <div key={p.id}>
                <b>{p.title}</b>
                {p.lines?.length > 0 && <ul>{p.lines.map((l, i) => <li key={i}>{l}</li>)}</ul>}
              </div>
            ))}
            <div className="acc-row">
              <button type="button" className="primary" disabled={busy} onClick={() => decide(true)}>نفّذ</button>
              <button type="button" className="mini danger" disabled={busy} onClick={() => decide(false)}>رفض</button>
              <span className="adm-hint">أو اكتب ما تريد تعديله</span>
            </div>
          </div>
        )}
        {openHint && !conv && (
          <button type="button" className="gold" style={{ justifySelf: "center" }} onClick={() => { const k = openHint; setOpenHint(""); onNavigate?.(k); }}>عرض القسم الذي ذكره المساعد ←</button>
        )}
        {busy && <div className="as-msg note">المساعد يفكر...</div>}
        <div ref={endRef} />
      </div>

      <form
        className="as-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(text);
            }
          }}
          placeholder="اكتب رسالتك..."
        />
        <button type="button" className="as-mic" disabled={!voiceOn || !v.supported || conv || v.state !== "idle"} onClick={dictate} aria-label="إملاء بالصوت">
          <AIcon name="mic" size={20} />
        </button>
        <button type="submit" className="primary" disabled={busy || !text.trim()}>إرسال</button>
      </form>
    </div>
  );
}
