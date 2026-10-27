"use client";
import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { saveAttribution, e164 } from "@/lib/attribution";

// يسمح فقط بالحروف والأرقام والشرطات لمنع حقن أكواد
const clean = (v) => String(v || "").trim().replace(/[^A-Za-z0-9_\-]/g, "");

export default function Tracking({ t = {} }) {
  const ga4 = clean(t.ga4);
  const ads = clean(t.googleAds);
  const label = clean(t.googleAdsLabel);
  const formLabel = clean(t.googleAdsFormLabel);
  const callLabel = clean(t.googleAdsCallLabel);
  const snap = clean(t.snap);
  const tiktok = clean(t.tiktok);
  const x = clean(t.xPixel);
  const xEvent = clean(t.xEventId);
  const gtagId = ga4 || ads;

  // تحويل Google Ads بتصنيفه (كل إجراء له تصنيف مستقل في Google Ads)
  const adsConversion = (lbl, extra = {}) => {
    if (window.gtag && ads && lbl) window.gtag("event", "conversion", { send_to: `${ads}/${lbl}`, ...extra });
  };

  // تسجيل نقرات واتساب والاتصال كتحويل في كل الأدوات المفعّلة
  useEffect(() => {
    saveAttribution(window.location.href);
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href*="wa.me"], a[href^="tel:"]');
      if (!a) return;
      const call = a.getAttribute("href").startsWith("tel:");
      try {
        if (window.gtag && ga4) window.gtag("event", call ? "phone_click" : "whatsapp_click", { method: call ? "phone" : "whatsapp" });
        adsConversion(call ? callLabel : label);
        if (window.snaptr) window.snaptr("track", "SIGN_UP");
        if (window.ttq) window.ttq.track("Contact");
        if (window.twq && xEvent) window.twq("event", xEvent, {});
      } catch (_) {}
    };
    // إرسال نموذج الاستفسار بنجاح (يطلقه ContactForm): أهم تحويل
    const onLead = (e) => {
      const { id, email, phone } = e.detail || {};
      try {
        if (window.gtag) {
          if (ga4) window.gtag("event", "generate_lead", { method: "form" });
          // التحويلات المحسّنة: Google يشفّر البريد والجوال قبل إرسالها
          const user = { ...(email ? { email } : {}), ...(e164(phone) ? { phone_number: e164(phone) } : {}) };
          if (ads && formLabel && Object.keys(user).length) window.gtag("set", "user_data", user);
          adsConversion(formLabel, id ? { transaction_id: id } : {});
        }
        if (window.snaptr) window.snaptr("track", "SIGN_UP");
        if (window.ttq) window.ttq.track("SubmitForm");
        if (window.twq && xEvent) window.twq("event", xEvent, {});
      } catch (_) {}
    };
    document.addEventListener("click", onClick);
    window.addEventListener("hd:lead", onLead);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hd:lead", onLead);
    };
  }, [ga4, ads, label, formLabel, callLabel, xEvent]);

  // روابط العقود وعروض الأسعار خاصة بالعميل، فلا نرسلها لأدوات التتبع والإعلانات
  if (usePathname()?.startsWith("/doc/")) return null;

  return (
    <>
      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">{`
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('js',new Date());
${ga4 ? `gtag('config','${ga4}');` : ""}
${ads ? `gtag('config','${ads}');` : ""}`}</Script>
        </>
      )}
      {snap && (
        <Script id="snap-pixel" strategy="afterInteractive">{`
(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');
snaptr('init','${snap}',{});snaptr('track','PAGE_VIEW');`}</Script>
      )}
      {tiktok && (
        <Script id="tiktok-pixel" strategy="afterInteractive">{`
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktok}');ttq.page();}(window,document,'ttq');`}</Script>
      )}
      {x && (
        <Script id="x-pixel" strategy="afterInteractive">{`
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments)},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('config','${x}');`}</Script>
      )}
    </>
  );
}
