"use client";
import { useState } from "react";
import Script from "next/script";
import { ui } from "@/lib/i18n";

export default function ContactForm({ title, services = [], siteKey, lang = "ar" }) {
  const t = ui(lang).form;
  const [state, setState] = useState("idle"); // idle | sending | done
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setState("sending");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, lang }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || t.failed);
      setMsg(j.message || t.sent);
      setState("done");
    } catch (x) {
      setErr(x.message);
      setState("idle");
      try {
        window.turnstile?.reset();
      } catch (_) {}
    }
  }

  if (state === "done")
    return (
      <div className="cf cf-done" role="status">
        <p>{msg}</p>
      </div>
    );

  return (
    <form className="cf" onSubmit={submit}>
      {title && <h3>{title}</h3>}
      <div className="cf-row">
        <label>
          {t.name}
          <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
        </label>
        <label>
          {t.phone}
          <input name="phone" type="tel" dir="ltr" maxLength={20} autoComplete="tel" placeholder="05xxxxxxxx" />
        </label>
      </div>
      <div className="cf-row">
        <label>
          {t.email}
          <input name="email" type="email" dir="ltr" maxLength={120} autoComplete="email" />
        </label>
        <label>
          {t.service}
          <select name="service" defaultValue="">
            <option value="">{t.pickService}</option>
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value={t.other}>{t.other}</option>
          </select>
        </label>
      </div>
      <label>
        {t.message}
        <textarea name="message" required minLength={5} maxLength={2000} rows={4} />
      </label>
      {/* حقل مخفي لاصطياد الروبوتات */}
      <input name="website" tabIndex={-1} autoComplete="off" className="cf-hp" aria-hidden="true" />
      {siteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
          <div className="cf-turnstile" data-sitekey={siteKey} data-language={lang} data-theme="auto" />
        </>
      )}
      {err && <p className="cf-err">{err}</p>}
      <button className="btn" type="submit" disabled={state === "sending"}>
        {state === "sending" ? t.sending : t.send}
      </button>
    </form>
  );
}
