import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

const PAGES = {
  privacy: {
    title: "سياسة الخصوصية",
    subtitle: "موقع somecare.shop",
    description: "سياسة الخصوصية لموقع somecare.shop: كيف نتعامل مع البيانات التي ترسلها عند طلب الخدمة.",
    lines: [
      "نجمع البيانات التي ترسلها عند طلب الخدمة، مثل الاسم ورقم التواصل وتفاصيل المشروع، من أجل الرد عليك وتنفيذ الطلب فقط.",
      "لا نبيع بياناتك لطرف ثالث.",
      "قد نستخدم أدوات تحليل بسيطة لمعرفة زيارات الموقع.",
    ],
    contactLabel: "للتواصل بشأن البيانات: واتساب",
  },
  terms: {
    title: "الشروط والأحكام",
    subtitle: "شروط الخدمة",
    description: "شروط الخدمة لموقع somecare.shop: السعر وما يشمله ومدة التسليم والإضافات.",
    lines: [
      "الخدمة المعروضة هي تصميم موقع تعريفي بالسعر الموضح في الصفحة.",
      "السعر 1,100 ريال يشمل تصميم الموقع والدومين والاستضافة لسنة واحدة، ما لم يُذكر غير ذلك في الباقة المختارة.",
      "مدة التسليم تقريبية وتبدأ بعد تأكيد المتطلبات ودفع المبلغ المتفق عليه.",
      "أي إضافات مثل المتجر أو التطبيق لها سعر منفصل ظاهر في الموقع.",
    ],
    contactLabel: "للتواصل:",
  },
};

export async function generateMetadata({ params }) {
  const p = PAGES[params.page];
  if (!p) return {};
  return { title: `${p.title} | somecare.shop`, description: p.description };
}

export default async function LegalPage({ params }) {
  const p = PAGES[params.page];
  if (!p) notFound();
  const c = await getContent();
  const wa = String(c.contact.whatsapp || "").replace(/\D/g, "");

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <a className="brand" href="/">
            {c.brand.logo && <img src={c.brand.logo} alt="" />}
            <span>{c.brand.name}</span>
          </a>
          <a className="btn btn-sm btn-ghost" href="/" style={{ marginInlineStart: "auto" }}>
            الرئيسية
          </a>
        </div>
      </header>

      <main style={{ padding: "56px 0 80px" }}>
        <div className="wrap narrow">
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>{p.title}</h1>
          <p style={{ opacity: 0.7, marginTop: 6 }}>{p.subtitle}</p>
          <div style={{ marginTop: 28, display: "grid", gap: 18 }}>
            {p.lines.map((t, i) => (
              <p key={i} style={{ margin: 0 }}>{t}</p>
            ))}
            <p style={{ margin: 0 }}>
              {p.contactLabel}{" "}
              <a href={`https://wa.me/${wa}`} dir="ltr" style={{ color: "var(--primary)", fontWeight: 600 }}>
                {c.contact.phone}
              </a>
            </p>
          </div>
        </div>
      </main>

      <footer className="foot">
        <div className="wrap">
          <p style={{ margin: "0 0 6px" }}>
            <a href="/privacy" style={{ textDecoration: "underline" }}>سياسة الخصوصية</a>
            {" | "}
            <a href="/terms" style={{ textDecoration: "underline" }}>الشروط والأحكام</a>
            {" | "}
            <span>الرياض</span>
          </p>
          <span>© {new Date().getFullYear()} {c.brand.name}. {c.footer.text}</span>
        </div>
      </footer>
    </>
  );
}
