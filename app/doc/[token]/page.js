import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { getContent } from "@/lib/content";
import { getDocByToken, liveProvider, totals, expiresAt, isExpired, fingerprint, TYPES } from "@/lib/docs";
import { PrintButton, CopyButton, AcceptForm } from "./DocActions";

export const dynamic = "force-dynamic";

// روابط الوثائق خاصة بالعميل: لا تُفهرس في محركات البحث
export async function generateMetadata({ params }) {
  const doc = await getDocByToken(params.token);
  if (!doc) return { robots: { index: false, follow: false } };
  return {
    title: `${TYPES[doc.type]} ${doc.number}${doc.title ? " | " + doc.title : ""}`,
    robots: { index: false, follow: false, nocache: true },
  };
}

const money = (n) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
const fmtDate = (d) => {
  const t = d instanceof Date ? d : new Date(String(d));
  if (isNaN(t)) return "";
  const p = (x) => String(x).padStart(2, "0");
  // بتوقيت الرياض
  const s = new Date(t.getTime() + 3 * 3600 * 1000);
  return `${p(s.getUTCDate())} / ${p(s.getUTCMonth() + 1)} / ${s.getUTCFullYear()}`;
};
const fmtTime = (iso) => new Date(iso).toLocaleString("ar-SA-u-nu-latn-ca-gregory", { timeZone: "Asia/Riyadh", dateStyle: "long", timeStyle: "short" });
const groupIban = (s) => String(s || "").replace(/(.{4})/g, "$1 ").trim();
const http = (u) => /^(https?:\/\/|\/)/i.test(String(u || ""));

export default async function DocPage({ params }) {
  const doc = await getDocByToken(params.token);
  if (!doc) notFound();
  const c = await getContent();
  const accepted = doc.status === "accepted";
  // بعد الموافقة تُعرض بيانات مقدّم الخدمة كما كانت لحظة الموافقة
  const p = accepted && doc.provider ? doc.provider : liveProvider(c);
  const url = `${p.site}/doc/${doc.token}`;
  const qr = await QRCode.toString(url, { type: "svg", margin: 0, color: { dark: "#0b1628", light: "#ffffff" } });
  const t = totals(doc);
  const exp = expiresAt(doc);
  const expired = isExpired(doc);
  const hash = fingerprint(doc, p);
  const intact = !accepted || doc.acceptance?.hash === hash;
  const isContract = doc.type === "contract";
  const cl = doc.client || {};
  const logo = c.brand.footerLogoLight || c.brand.logoLight || c.brand.logo;
  // {الآيبان} {البنك} {المستفيد} داخل أي بند تُستبدل ببيانات الحساب الفعلية
  const fill = (s) =>
    String(s)
      .replace(/\{(الآيبان|الايبان|iban)\}/gi, groupIban(p.iban) || "—")
      .replace(/\{(البنك|bank)\}/gi, p.bankName || "—")
      .replace(/\{(المستفيد|beneficiary)\}/gi, p.accountName || p.name);
  const terms = (doc.terms || []).map(fill);
  // في العقود يُضاف بند حساب السداد تلقائياً، إلا إذا كُتب الآيبان في أحد البنود
  const payClause = isContract && !!p.iban && !(doc.terms || []).some((t) => /\{(الآيبان|الايبان|iban)\}/i.test(t));
  // المرفقات الرسمية الثابتة تُرفق مع كل وثيقة، ثم مرفقات هذه الوثيقة
  const attachments = [
    http(p.ibanCert) && { title: "شهادة الآيبان من البنك", url: p.ibanCert },
    http(p.domainProof) && { title: `كتاب إثبات تسجيل النطاق ${p.domain}`, url: p.domainProof },
    http(p.certImage) && { title: p.certTitle || "وثيقة العمل الحر", url: p.certImage },
    ...(doc.attachments || []),
  ].filter(Boolean);
  const waText =encodeURIComponent(`السلام عليكم، بخصوص ${TYPES[doc.type]} رقم ${doc.number}\n${url}`);

  return (
    <div className="docv">
      <div className="docv-bar no-print">
        <span className={"docv-status " + (expired ? "expired" : doc.status)}>
          {accepted ? "تمت الموافقة" : doc.status === "cancelled" ? "ملغاة" : expired ? "منتهي الصلاحية" : "بانتظار موافقتك"}
        </span>
        <PrintButton />
        {p.whatsapp && (
          <a className="docv-btn ghost" href={`https://wa.me/${p.whatsapp}?text=${waText}`} target="_blank" rel="noopener">
            تواصل واتساب
          </a>
        )}
      </div>

      <article className="paper">
        <header className="paper-head">
          {logo && <img className="paper-logo" src={logo} alt={c.brand.name} />}
          <div className="paper-meta">
            <h1>{TYPES[doc.type]}</h1>
            <dl>
              <div><dt>رقم {isContract ? "العقد" : "العرض"}</dt><dd dir="ltr">{doc.number}</dd></div>
              <div><dt>التاريخ</dt><dd dir="ltr">{fmtDate(doc.date)}</dd></div>
              {exp && <div><dt>صلاحية العرض</dt><dd>{doc.validDays} يوماً (حتى <span dir="ltr">{fmtDate(exp)}</span>)</dd></div>}
              {doc.ref && <div><dt>مبني على</dt><dd dir="ltr">{doc.ref}</dd></div>}
            </dl>
          </div>
        </header>

        {(doc.title || doc.subtitle) && (
          <section className="paper-title">
            {doc.title && <h2>{doc.title}</h2>}
            {doc.subtitle && <p className="sub2">{doc.subtitle}</p>}
            {doc.intro && <p className="intro">{doc.intro}</p>}
          </section>
        )}

        <section className="parties">
          <div>
            <h3>{isContract ? "الطرف الأول (مقدّم الخدمة)" : "مقدّم العرض"}</h3>
            <p><b>{p.name}</b></p>
            <p>ممارس عمل حر مرخّص{p.certNumber && <> · وثيقة رقم <span dir="ltr">{p.certNumber}</span></>}</p>
            <p>الموقع الرسمي: <a href={p.site} dir="ltr">{p.domain}</a></p>
            {p.phone && <p>الجوال: <span dir="ltr">{p.phone}</span></p>}
          </div>
          <div>
            <h3>{isContract ? "الطرف الثاني (العميل)" : "مقدّم إلى"}</h3>
            {cl.name || cl.company ? (
              <>
                {cl.company && <p><b>{cl.company}</b></p>}
                {cl.name && <p>{cl.company ? "يمثلها: " : ""}<b>{cl.name}</b></p>}
                {cl.idNumber && <p>رقم الهوية / السجل: <span dir="ltr">{cl.idNumber}</span></p>}
                {cl.phone && <p>الجوال: <span dir="ltr">{cl.phone}</span></p>}
                {cl.email && <p>البريد: <span dir="ltr">{cl.email}</span></p>}
                {cl.city && <p>المدينة: {cl.city}</p>}
              </>
            ) : (
              <p className="muted">العميل الكريم</p>
            )}
          </div>
        </section>

        {doc.sections?.length > 0 && (
          <section>
            <h3 className="paper-h">{isContract ? "نطاق العمل" : "تفاصيل العرض"}</h3>
            <div className="items">
              {doc.sections.map((s, i) => (
                <div className="item" key={i}>
                  <div className="item-head">
                    <span className="item-n">{i + 1}</span>
                    <div className="item-t">
                      <h4>{s.title}</h4>
                      {s.desc && <p>{s.desc}</p>}
                      {s.note && <p className="note2">{s.note}</p>}
                    </div>
                    <div className="item-price">
                      <strong>{money(s.price * (s.qty || 1))}</strong>
                      <span>ريال{s.qty > 1 ? ` (${s.qty} × ${money(s.price)})` : ""}</span>
                    </div>
                  </div>
                  {s.tags?.length > 0 && (
                    <div className="tags">{s.tags.map((x, j) => <span key={j}>{x}</span>)}</div>
                  )}
                  {s.features?.length > 0 && (
                    <ul className="feats">{s.features.map((f, j) => <li key={j}>{f}</li>)}</ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {doc.sections?.length > 0 && (
          <section className="sum">
            <table>
              <tbody>
                {doc.sections.map((s, i) => (
                  <tr key={i}><td>{s.title}</td><td dir="ltr">{money(s.price * (s.qty || 1))}</td></tr>
                ))}
                {(t.discount > 0 || t.vat > 0) && <tr className="sub"><td>المجموع</td><td dir="ltr">{money(t.subtotal)}</td></tr>}
                {t.discount > 0 && <tr><td>الخصم</td><td dir="ltr">- {money(t.discount)}</td></tr>}
                {t.vat > 0 && <tr><td>ضريبة القيمة المضافة ({doc.vatRate}%)</td><td dir="ltr">{money(t.vat)}</td></tr>}
                <tr className="total"><td>الإجمالي</td><td><span dir="ltr">{money(t.total)}</span> ريال</td></tr>
              </tbody>
            </table>
            {doc.vatRate == 0 && <p className="muted small">الأسعار بالريال السعودي، ومقدّم الخدمة غير مسجّل في ضريبة القيمة المضافة.</p>}
            {doc.recurring?.map((r, i) => <p key={i} className="recurring">{r}</p>)}
            {doc.duration && <p className="recurring">مدة التنفيذ: {doc.duration}</p>}
          </section>
        )}

        {(p.iban || p.bankName) && (
          <section className="bank">
            <h3 className="paper-h">طريقة الدفع: تحويل بنكي</h3>
            <dl>
              {p.bankName && <div><dt>البنك</dt><dd>{p.bankName}</dd></div>}
              {p.accountName && <div><dt>اسم المستفيد</dt><dd>{p.accountName}</dd></div>}
              {p.iban && (
                <div>
                  <dt>رقم الآيبان</dt>
                  <dd className="iban"><span dir="ltr">{groupIban(p.iban)}</span> <CopyButton text={p.iban} /></dd>
                </div>
              )}
            </dl>
            {http(p.ibanCert) && (
              <p style={{ marginTop: 8 }}>
                <a href={p.ibanCert} target="_blank" rel="noopener">شهادة الآيبان الصادرة من البنك باسم {p.accountName || p.name} ↗</a>
              </p>
            )}
            <p className="warn">
              لحمايتك: حوّل فقط على هذا الحساب، واسم المستفيد مطابق لاسم صاحب وثيقة العمل الحر وصاحب النطاق {p.domain}. أي حساب آخر يُرسل لك لا يُعتد به.
            </p>
          </section>
        )}

        {(terms.length > 0 || payClause) && (
          <section>
            <h3 className="paper-h">{isContract ? "بنود العقد" : "الشروط والملاحظات"}</h3>
            <ol className="terms">
              {terms.map((x, i) => <li key={i}>{x}</li>)}
              {payClause && (
                <li>
                  <b>حساب السداد المعتمد:</b> يتم السداد بالتحويل البنكي حصراً إلى حساب الطرف الأول
                  {p.bankName && <> لدى {p.bankName}</>} باسم المستفيد {p.accountName || p.name}، رقم الآيبان{" "}
                  <b dir="ltr" style={{ whiteSpace: "nowrap" }}>{groupIban(p.iban)}</b>
                  ، ولا يُعتد بأي تحويل إلى حساب آخر.{http(p.ibanCert) && " وشهادة الآيبان الصادرة من البنك مرفقة بهذا العقد."}
                </li>
              )}
            </ol>
          </section>
        )}

        {doc.annex?.length > 0 && (
          <section className="annex">
            <h3 className="paper-h">الملحق الفني: الخصائص والمواصفات</h3>
            <p className="muted small">هذا الملحق جزء لا يتجزأ من {isContract ? "العقد" : "العرض"}.</p>
            {doc.annex.map((a, i) => (
              <div key={i} className="annex-sec">
                <h4><span className="item-n">{i + 1}</span> {a.title}</h4>
                {a.intro && <p>{a.intro}</p>}
                {a.points?.length > 0 && (
                  <ul className="feats">
                    {a.points.map((x, j) => {
                      const k = x.indexOf(":");
                      return <li key={j}>{k > 0 && k < 60 ? <><b>{x.slice(0, k)}:</b>{x.slice(k + 1)}</> : x}</li>;
                    })}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {attachments.length > 0 && (
          <section>
            <h3 className="paper-h">المرفقات</h3>
            <ul className="links-list">
              {attachments.map((a, i) => (
                <li key={i}><a href={a.url} target="_blank" rel="noopener">{a.title || "مرفق"} ↗</a></li>
              ))}
            </ul>
          </section>
        )}

        <section className="verify">
          <h3 className="paper-h">التحقق من موثوقية هذه الوثيقة</h3>
          <div className="verify-grid">
            <div className="qr">
              <div dangerouslySetInnerHTML={{ __html: qr }} />
              <span dir="ltr">{p.domain}</span>
            </div>
            <ul>
              <li>
                <b>منشورة على الموقع الرسمي:</b> هذه الوثيقة محفوظة على <span dir="ltr">{p.domain}</span>. امسح الرمز أو افتح الرابط للتأكد أن النسخة التي معك مطابقة.
                <div className="mono" dir="ltr">{url}</div>
              </li>
              {p.certNumber && (
                <li>
                  <b>{p.certTitle}:</b> رقم <span dir="ltr">{p.certNumber}</span>{p.certExpiry && <> سارية حتى {p.certExpiry}</>} باسم {p.name}.
                  {" "}{http(p.certImage) && <a href={p.certImage} target="_blank" rel="noopener">عرض الوثيقة ↗</a>}
                  {" "}{/^https?:\/\//i.test(p.certVerify || "") && <a href={p.certVerify} target="_blank" rel="noopener">التحقق من المنصة ↗</a>}
                </li>
              )}
              <li>
                <b>ملكية النطاق:</b> النطاق <span dir="ltr">{p.domain}</span> مسجّل رسمياً باسم {p.name}
                {p.domainRegistrar && <> لدى {p.domainRegistrar}</>}
                {p.domainExpiry && <>، وصلاحيته حتى <span dir="ltr">{p.domainExpiry}</span></>}.
                {" "}{http(p.domainProof) && <a href={p.domainProof} target="_blank" rel="noopener">كتاب إثبات تسجيل النطاق ↗</a>}
                {" "}{/^https?:\/\//i.test(p.whoisUrl || "") && <a href={p.whoisUrl} target="_blank" rel="noopener">بحث WHOIS في المركز السعودي لمعلومات الشبكة ↗</a>}
              </li>
              {p.iban && (
                <li>
                  <b>الحساب البنكي:</b> الآيبان المذكور باسم {p.accountName || p.name}، مطابق لاسم صاحب وثيقة العمل الحر.
                  {" "}{http(p.ibanCert) && <a href={p.ibanCert} target="_blank" rel="noopener">شهادة الآيبان من البنك ↗</a>}
                </li>
              )}
              <li>
                <b>بصمة الوثيقة (SHA-256):</b> أي تعديل على البنود أو الأسعار أو الحساب البنكي يغيّر هذه البصمة.
                <div className="mono" dir="ltr">{hash}</div>
              </li>
            </ul>
          </div>
        </section>

        <section className="accept">
          {accepted ? (
            <div className={"stamp" + (intact ? "" : " bad")}>
              <b>{intact ? "✓ تمت الموافقة إلكترونياً" : "⚠ تغيّر محتوى الوثيقة بعد الموافقة"}</b>
              <p>
                وافق <b>{doc.acceptance.name}</b> على هذا {isContract ? "العقد" : "العرض"} بتاريخ {fmtTime(doc.acceptance.at)} (بتوقيت الرياض).
              </p>
              <p className="mono" dir="ltr">{doc.acceptance.hash}</p>
            </div>
          ) : doc.status === "cancelled" ? (
            <div className="stamp bad"><b>هذه الوثيقة ملغاة</b></div>
          ) : expired ? (
            <div className="stamp bad"><b>انتهت صلاحية هذا العرض</b><p>تواصل معنا لإصدار عرض محدّث.</p></div>
          ) : (
            <AcceptForm token={doc.token} kind={isContract ? "العقد" : "العرض"} total={money(t.total)} />
          )}
        </section>

        <footer className="paper-foot">
          <span>{c.brand.name}{c.brand.tagline ? ` · ${c.brand.tagline}` : ""}</span>
          <span dir="ltr">{p.domain}</span>
          {p.phone && <span dir="ltr">{p.phone}</span>}
        </footer>
      </article>
    </div>
  );
}
