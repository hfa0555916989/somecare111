"use client";
import { useEffect, useState } from "react";
import { AIcon } from "./AdminIcons";

const daysTo = (d) => Math.round((new Date(d + "T12:00:00") - new Date()) / 86400000);
const money = (n) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

// ما يجب ضبطه في Vercel: [المفتاح في حالة الخدمات، الاسم، ماذا يفعل، كيف تفعّله]
const SERVICES = [
  ["admin", "كلمة مرور اللوحة", "دخول لوحة التحكم.", "Vercel ← المشروع ← Settings ← Environment Variables ← ADMIN_PASSWORD."],
  ["authSecret", "مفتاح الجلسة", "يؤمّن جلسة الدخول.", "أضف AUTH_SECRET نصاً عشوائياً طويلاً."],
  ["db", "قاعدة البيانات", "يحفظ المحتوى والمحاسبة والعقود والمشاريع والأفكار.", "Storage ← Create ← Upstash Redis ← Connect to Project."],
  ["publicBlob", "التخزين العام (صور الموقع)", "رفع صور وفيديو الموقع من اللوحة.", "Storage ← Create ← Blob ← Public ← Connect (البادئة الافتراضية BLOB)."],
  ["privateBlob", "التخزين الخاص (العقود والفواتير)", "أرشيف الملفات والفواتير والأرشفة الإجبارية للعقود الموقّعة. لا يُفتح أي ملف إلا بعد دخولك.", "Storage ← Create ← Blob ← Private، وعند Connect افتح Advanced Options واكتب البادئة PRIVATE_BLOB (تظهر متغيرات تبدأ بـ PRIVATE_BLOB_ مثل PRIVATE_BLOB_STORE_ID)."],
  ["vaultKey", "مفتاح تشفير المشاريع", "يشفّر مفاتيح مشاريع العملاء (.env).", "أضف VAULT_KEY نصاً عشوائياً طويلاً قبل حفظ أول مشروع، واحفظه عندك ولا تغيّره أبداً."],
  ["ai", "الذكاء الاصطناعي (Claude)", "المساعد، المحاسب الذكي، فرز الملفات، التسعير، تحويل الأفكار لوثائق، الاستيراد من PDF.", "أضف ANTHROPIC_API_KEY من console.anthropic.com."],
  ["voice", "المحادثة الصوتية (ElevenLabs)", "تكلّم المساعد صوتياً ويرد عليك بصوت.", "أنشئ حساباً في elevenlabs.io ← API Keys، وأضف ELEVENLABS_API_KEY (صلاحيات Speech to Text و Text to Speech و Voices)."],
  ["mail", "إرسال الإيميل (Resend)", "يرسل لك إيميل عند كل استفسار وكل موافقة على عرض أو عقد.", "أنشئ حساباً في resend.com ← Domains ← أضف hassandev.sa وأضف سجلات DNS التي يعطيك إياها، ثم API Keys ← أضف RESEND_API_KEY. اختياري: MAIL_FROM مثل «المطوّر حسن <noreply@hassandev.sa>»."],
  ["mailTo", "إيميل الإشعارات", "العنوان الذي تصلك عليه الإشعارات.", "لوحة التحكم ← الاستفسارات ← إيميل الإشعارات، ثم «حفظ التغييرات»."],
  ["turnstile", "حماية النموذج من الروبوتات", "يمنع رسائل السبام في «تواصل معنا».", "أضف TURNSTILE_SITE_KEY و TURNSTILE_SECRET_KEY من Cloudflare."],
];

const SECTIONS = [
  ["wallet", "المحاسبة", "سجّل كل إيراد ومصروف وإعلان وتمويل. «نظرة عامة» تعطيك الربح وعائد كل منصة إعلانية، و«الميزانية والتمويل» تفرق بين أموال البنك وأموال الأرباح وتقترح كم تعيد تمويل الميزانية. «المحاسب الذكي» يقرأ كلامك أو صورة الفاتورة ويعبّئ الحقول."],
  ["chat", "المساعد", "كلّمه كتابة أو صوتاً. يقرأ كل بياناتك، يناقشك ويعترض بالأرقام، وينفّذ (تسجيل عمليات، تعديل الميزانية، إنشاء مسودة عرض) بعد موافقتك فقط: اضغط «نفّذ» أو قل «نعم»."],
  ["bulb", "أفكار العملاء", "احفظ فكرة العميل كتابة أو بصوتك، ثم حوّلها بضغطة إلى مقترح مبدئي أو وثيقة متطلبات أو عرض سعر مسعّر حسب باقاتك. تظهر مسودة في «العقود وعروض الأسعار» لترسل رابطها."],
  ["file", "العقود وعروض الأسعار", "أنشئ وثيقة أو استوردها من PDF، واطلب «اقتراح السعر» ليقارنها بباقاتك وعروضك السابقة. عند موافقة العميل تُقفل الوثيقة وتُؤرشف إجبارياً ولا يمكن حذفها."],
  ["key", "المشاريع والمفاتيح", "لكل مشروع تعاقدت عليه: بياناته، مفاتيحه السرية مشفّرة (استيراد وتصدير .env)، مواعيد التجديد، وما التزمت به للعميل."],
  ["archive", "الأرشيف", "كل ملفاتك مرتبة حسب السنة والتصنيف. ارفع أي PDF أو صورة ويفرزه الذكاء الاصطناعي، ويقترح تسجيل الفواتير في المحاسبة. «سجل الصور القديمة» يحتفظ بكل صورة استبدلتها في الموقع مع زر استرجاع."],
  ["inbox", "الاستفسارات", "رسائل نموذج «تواصل معنا»، وتصلك على الإيميل أيضاً بعد تفعيل Resend."],
];

const PROCEDURES = [
  ["عند وصول استفسار جديد", ["رد خلال 24 ساعة (هذا ما يعد به الموقع).", "غيّر حالته إلى «قيد المتابعة» واكتب ملاحظتك.", "إذا كان طلب مشروع: احفظه في «أفكار العملاء» وحوّله لمقترح أو عرض سعر."]],
  ["قبل إرسال عرض سعر", ["اضغط «اقتراح السعر» وتأكد أن السعر قريب من باقاتك وعروضك السابقة.", "راجع البنود والمدة والتجديدات السنوية.", "غيّر الحالة إلى «مُرسل» وأرسل الرابط واتساب."]],
  ["عند موافقة العميل", ["تصلك رسالة على الإيميل، وتُؤرشف الوثيقة تلقائياً في «الأرشيف ← عقود موقّعة».", "أنشئ المشروع في «المشاريع والمفاتيح» واربطه بالعقد.", "أصدر الفاتورة من زر «إصدار فاتورة» على العقد وأرسلها للعميل.", "عند استلام المبلغ اضغط «تم الدفع» على الفاتورة، فيُسجَّل إيراداً في المحاسبة ويُخصم من المتبقي على العميل."]],
  ["عند كل مصروف أو فاتورة", ["صوّر الفاتورة وارفعها في «الأرشيف» (أو قل للمساعد) ليقرأها ويسجلها.", "مصروف الإعلان: حدّد المنصة، وعند تسجيل إيراد عميل حدّد من أين جاء ليُحسب عائد كل منصة."]],
  ["نهاية كل شهر", ["افتح المحاسبة ← نظرة عامة ← «هذا الشهر».", "اطلب من المساعد «حلّل وضعي المالي» أو «كم أعيد للميزانية؟».", "سجّل إعادة التمويل من الأرباح وأي سحب شخصي.", "راجع التجديدات القادمة في «التزاماتي»."]],
  ["عقد من ملف نطاق عمل (PDF)", ["في «العقود وعروض الأسعار» ← «استيراد من PDF» اختر «عقد».", "فعّل «إضافة دعم فني لمدة محددة» وحدد تاريخ البداية والمدة والسعر.", "اختر ملف نطاق العمل، وراجع البنود والتواريخ ثم احفظ وأرسل الرابط للعميل."]],
  ["عند تسليم مشروع", ["غيّر حالة المشروع إلى «منجز» أو «دعم وصيانة».", "تأكد أن كل مفاتيحه محفوظة، وصدّر نسخة .env احتياطية.", "أضف مواعيد التجديد (الدومين، الاستضافة، الدعم) حتى تذكّرك هنا."]],
];

export default function Guide({ procedures = [], setProcedures }) {
  const [view, setView] = useState("procedures");
  const [s, setS] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((j) => (j.error ? setErr(j.error) : setS(j)))
      .catch(() => setErr("تعذر التحميل"));
  }, []);

  const c = s?.commitments;
  const upcoming = (c?.renewals || []).filter((r) => daysTo(r.date) >= -30);
  const missing = s ? SERVICES.filter(([k]) => !s.services[k]).length : 0;

  return (
    <div className="acc">
      <div className="acc-views two">
        <button type="button" className={view === "procedures" ? "on" : ""} onClick={() => setView("procedures")}><AIcon name="list" size={22} />الدليل الإجرائي والتزاماتي</button>
        <button type="button" className={view === "guide" ? "on" : ""} onClick={() => setView("guide")}><AIcon name="book" size={22} />الدليل الإرشادي{missing ? ` (${missing})` : ""}</button>
      </div>
      {err && <div className="note">{err}</div>}

      {view === "procedures" && (
        <>
          <div className="adm-card">
            <b>⏰ مواعيد وتجديدات قادمة</b>
            {!c ? <p>جارٍ التحميل...</p> : upcoming.length === 0 ? (
              <p className="adm-hint">لا توجد مواعيد. أضفها داخل كل مشروع في «المشاريع والمفاتيح».</p>
            ) : (
              upcoming.map((r, i) => {
                const d = daysTo(r.date);
                return (
                  <div key={i} className="acc-recv">
                    <span>
                      <b>{r.title}</b> · {r.project}{r.client ? ` (${r.client})` : ""}
                      <small dir="ltr" style={{ textAlign: "start" }}>{r.date}{r.amount ? ` · ${money(r.amount)} SAR` : ""}</small>
                    </span>
                    <b className={d < 0 ? "err" : d <= 30 ? "err" : ""}>{d < 0 ? `فات ${-d} يوم` : d === 0 ? "اليوم" : `بعد ${d} يوم`}</b>
                  </div>
                );
              })
            )}
          </div>

          {c?.contracts?.length > 0 && (
            <div className="adm-card">
              <b>📄 عقود وعروض وافق عليها العملاء</b>
              {c.contracts.map((k) => (
                <div key={k.number} className="acc-recv">
                  <span>
                    <b>{k.number}</b> · {k.title || k.type} · {k.client}
                    <small>
                      {k.acceptedAt && `موافقة ${k.acceptedAt}`}
                      {k.duration && ` · مدة التنفيذ: ${k.duration}`}
                      {k.recurring?.length > 0 && ` · ${k.recurring.join(" · ")}`}
                    </small>
                  </span>
                  <small className={k.archived ? "ok" : "err"}>{k.archived ? "مؤرشف ✓" : "غير مؤرشف"}</small>
                </div>
              ))}
            </div>
          )}

          {c?.projects?.length > 0 && (
            <div className="adm-card">
              <b>🤝 ما التزمت به لكل عميل</b>
              {c.projects.map((p, i) => (
                <div key={i}>
                  <span className="acc-lbl">{p.name}{p.client ? ` · ${p.client}` : ""} ({p.status})</span>
                  <div className="acc-answer">{p.obligations}</div>
                </div>
              ))}
            </div>
          )}

          {(c?.quoteTerms?.length > 0 || c?.contractTerms?.length > 0) && (
            <details className="adm-card">
              <summary><b>📜 الشروط التي تلتزم بها في كل عرض وعقد</b></summary>
              {c.quoteTerms.length > 0 && <><span className="acc-lbl">في عروض الأسعار</span><ol>{c.quoteTerms.map((t, i) => <li key={i}>{t}</li>)}</ol></>}
              {c.contractTerms.length > 0 && <><span className="acc-lbl">في العقود</span><ol>{c.contractTerms.map((t, i) => <li key={i}>{t}</li>)}</ol></>}
              {c.pages?.length > 0 && <span className="adm-hint">وصفحات منشورة في موقعك تلتزم بها أيضاً: {c.pages.map((p) => p.title).join("، ")}.</span>}
            </details>
          )}

          <div className="adm-card">
            <b>📋 إجراءات العمل</b>
            {PROCEDURES.map(([t, steps]) => (
              <details key={t}>
                <summary>{t}</summary>
                <ol>{steps.map((x, i) => <li key={i}>{x}</li>)}</ol>
              </details>
            ))}
          </div>

          <div className="adm-card">
            <b>✍️ إجراءاتي والتزاماتي الخاصة</b>
            <span className="adm-hint">اكتب أي شيء ألزمت نفسك به (مثل: «لا أبدأ أي مشروع بدون دفعة أولى 50%»). تُحفظ بزر «حفظ التغييرات».</span>
            {procedures.map((p, i) => (
              <div key={i} className="acc-row">
                <input type="text" value={p} onChange={(e) => setProcedures(procedures.map((x, j) => (j === i ? e.target.value : x)))} />
                <button type="button" className="mini danger" onClick={() => setProcedures(procedures.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
            <button type="button" className="mini" style={{ justifySelf: "start" }} onClick={() => setProcedures([...procedures, ""])}>+ إضافة</button>
          </div>
        </>
      )}

      {view === "guide" && (
        <>
          <div className="adm-card">
            <b>حالة الخدمات</b>
            <span className="adm-hint">بعد إضافة أي متغير في Vercel: Deployments ← آخر نشر ← ⋯ ← Redeploy.</span>
            {s?.services.blobErrors?.length > 0 && (
              <div className="note">المخزن {s.services.blobErrors.join(" و")} مربوط لكن الاتصال به فشل. في Vercel: Settings ← Security ← تأكد أن OIDC Federation مفعّل، ثم Redeploy.</div>
            )}
            {!s ? <p>جارٍ التحميل...</p> : SERVICES.map(([k, name, what, how]) => (
              <details key={k} className="svc" open={!s.services[k]}>
                <summary>
                  <span className={s.services[k] ? "ok" : "err"}>{s.services[k] ? "✓" : "✗"}</span> {name}
                </summary>
                <p>{what}</p>
                {!s.services[k] && <p className="adm-hint">طريقة التفعيل: {how}</p>}
                {k === "vaultKey" && !s.services.vaultKey && s.services.vaultKeySource && <p className="adm-hint">حالياً يُستخدم {s.services.vaultKeySource} للتشفير.</p>}
              </details>
            ))}
          </div>
          <div className="adm-card">
            <b>أقسام اللوحة</b>
            {SECTIONS.map(([ic, t, d]) => (
              <div key={t} className="guide-sec">
                <span className="acc-item-ic"><AIcon name={ic} size={20} /></span>
                <span><b>{t}</b><p>{d}</p></span>
              </div>
            ))}
          </div>
          <div className="adm-card">
            <b>نصائح الأمان</b>
            <ul>
              <li>المخزن الخاص لا يفتح أي ملف بدون دخولك، أما روابط الصور في المخزن العام فمفتوحة لمن يملك الرابط؛ لا ترفع فيه هويات أو عقود.</li>
              <li>احتفظ بنسخة من VAULT_KEY خارج Vercel (مثل مدير كلمات المرور). بدونه لا يمكن فك مفاتيح المشاريع.</li>
              <li>صدّر ملف .env لكل مشروع منجز واحتفظ به في مكان آمن كنسخة احتياطية.</li>
              <li>«تنزيل نسخة احتياطية» من أدوات اللوحة تحفظ محتوى الموقع، والأرشيف يحفظ الملفات في Vercel Blob.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
