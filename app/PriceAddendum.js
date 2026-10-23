import { OFFER_DESC_AR, OFFER_DESC_EN } from "@/lib/platform-offer";

// يُضاف تحت النص الأصلي للصفحات. لا يستبدل العنوان ولا الفقرات التي ترتب في البحث.
export default function PriceAddendum({ lang = "ar" }) {
  const en = lang === "en";
  return (
    <section className="sec" id="current-offer">
      <h2>{en ? "Current price ranges" : "النطاق السعري الحالي"}</h2>
      <p>{en ? OFFER_DESC_EN : OFFER_DESC_AR}</p>
    </section>
  );
}
