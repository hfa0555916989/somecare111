import { DEMO_SHOTS, DEMO_URL } from "@/lib/demo-media";
import { PREVIOUS_WORK } from "@/lib/previous-work";
import { isBigStorePackage } from "@/lib/big-store";

// عناصر التصميم البرمجي المشتركة: ترقيم الأقسام، نافذة الأوامر، بطاقة الكود، وصور بطاقات الباقات.
// النوافذ البرمجية زخرفية (aria-hidden)، والمعلومة نفسها مكتوبة في نص الصفحة.

const host = (url) => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
};

// نقاط شريط النافذة
export const Dots = () => (
  <span className="dots" aria-hidden="true"><i /><i /><i /></span>
);

// سطر ترقيم القسم: الرقم، خط، ثم مسار القسم بخط الكود
export function SecTag({ n, path }) {
  return (
    <div className="sec-tag" aria-hidden="true">
      <b>{String(n).padStart(2, "0")}</b>
      <i />
      <span dir="ltr">/{path}</span>
    </div>
  );
}

// نافذة الأوامر في الواجهة
export function Terminal({ lines }) {
  return (
    <div className="term" dir="ltr" aria-hidden="true">
      <div className="term-bar"><Dots /><span>terminal</span></div>
      <div className="term-body">
        <div><span className="t-ps">$</span> git push origin main</div>
        {lines.map((l) => (
          <div key={l}><span className="t-ok">✓</span> <bdi>{l}</bdi></div>
        ))}
        <div><span className="t-ps">$</span> <span className="term-cur" /></div>
      </div>
    </div>
  );
}

// بطاقة كود تكتب العرض كملف إعدادات. كل نص عربي داخل <bdi> حتى يبقى ترتيب السطر من اليسار لليمين
export function CodeCard({ code }) {
  const str = (v) => <bdi className="s">&quot;{v}&quot;</bdi>;
  const list = (items) => items.map((v, i) => <span key={v}>{i > 0 && ", "}{str(v)}</span>);
  const rows = [
    <span className="c">{"// "}<bdi>{code.comment}</bdi></span>,
    <span><span className="k">const</span> project = <span className="f">defineProject</span>{"({"}</span>,
    <span className="in">client: {str(code.client)},</span>,
    <span className="in">build: [{list(code.build)}],</span>,
    <span className="in">payments: [{list(code.payments)}],</span>,
    <span className="in">price: {str(code.price)},</span>,
    <span className="in">subscription: <span className="k">false</span>,</span>,
    <span>{"});"}</span>,
    <span>&nbsp;</span>,
    <span><span className="k">await</span> hassan.<span className="f">launch</span>(project);</span>,
  ];
  return (
    <div className="code" dir="ltr" aria-hidden="true">
      <div className="term-bar"><Dots /><span>project.config.js</span></div>
      <div className="code-body">
        {rows.map((r, i) => (
          <div key={i}><i>{i + 1}</i>{r}</div>
        ))}
      </div>
      <div className="code-foot"><span><b />ready</span><span>JavaScript</span></div>
    </div>
  );
}

// إطار متصفح حول صورة أو معرض
export function Frame({ url, children }) {
  return (
    <div className="frame">
      <div className="frame-bar"><Dots /><span>{host(url)}</span></div>
      {children}
    </div>
  );
}

// الصورة أعلى بطاقة الباقة في الرئيسية: صورة الباقة من لوحة التحكم إن وُجدت،
// وإلا واجهة المتجر التجريبي للمتجر، ومواقع منشورة داخل إطار جوال لبقية الباقات
export function PackageVisual({ p, lang }) {
  if (p.image) {
    return (
      <div className="pk-vis"><img className="pk-cover" src={p.image} alt="" loading="lazy" /></div>
    );
  }
  const en = lang === "en";
  const phone = (w, cls = "") => (
    <span key={w.id} className={"phone" + cls}>
      <img src={w.image} alt={en ? w.nameEn : w.nameAr} width={390} height={844} loading="lazy" decoding="async" />
    </span>
  );
  if (isBigStorePackage(p)) {
    const shot = DEMO_SHOTS[0];
    return (
      <div className="pk-vis">
        <Frame url={DEMO_URL}>
          <img src={shot.src} srcSet={shot.srcSet} sizes="(max-width: 700px) 90vw, 380px" alt={en ? shot.altEn : shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" />
        </Frame>
      </div>
    );
  }
  const [a, b, c] = PREVIOUS_WORK;
  return (
    <div className="pk-vis">
      {/تعريفي|business/i.test(p.name) ? phone(a) : [phone(b, " sm"), phone(c, " sm")]}
    </div>
  );
}
