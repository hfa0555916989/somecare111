// المحتوى الافتراضي للموقع. أي تعديل من لوحة التحكم يُحفظ في قاعدة البيانات ويتغلّب على هذه القيم.
export const defaultContent = {
  seo: {
    title: "تصميم مواقع وتطبيقات احترافية | موقع تعريفي بـ 1,100 ريال",
    description:
      "نصمم مواقع تعريفية وتطبيقات جوال ومتاجر إلكترونية لشركتك، مع لوحة تحكم كاملة وسرعة فائقة. تواصل معنا واتساب على مدار الساعة.",
  },
  theme: {
    bg: "#070d1f",
    surface: "#0e1733",
    text: "#eaf0ff",
    primary: "#00e5ff",
    price: "#e6b84a",
  },
  brand: {
    name: "اسم شركتك",
    tagline: "مواقع وتطبيقات ومتاجر",
    logo: "/images/logo.png",
  },
  contact: {
    phone: "0530779934",
    whatsapp: "966530779934",
    availability: "لا تتردد في التواصل، نرد عليك ٢٤ ساعة على مدار الأسبوع",
    message: "السلام عليكم، أبغى أستفسر عن خدماتكم",
  },
  hero: {
    title: "موقع تعريفي احترافي لشركتك، بتحكم كامل وسرعة فائقة",
    subtitle:
      "نبني لك موقعاً يعكس هوية شركتك، متجاوباً مع كل الأجهزة، ومهيّأ لمحركات البحث، وتسلّمه خلال أيام.",
    image: "/images/hero.jpg",
    badge: "1,100 ريال شامل الدومين والاستضافة لأول سنة",
    primaryButton: "اطلب الآن عبر واتساب",
    secondaryButton: "استعرض الباقات",
  },
  titles: {
    packages: "الباقات والأسعار",
    packagesSub: "اختر الباقة المناسبة لمشروعك، والسعر يختلف حسب حجم العمل.",
    addons: "إضافات اختيارية لكل الباقات",
    features: "ماذا ستحصل عليه",
    gallery: "عروضنا",
    video: "شاهد كيف نعمل",
    contact: "جاهز نبدأ مشروعك؟",
  },
  packages: [
    {
      name: "موقع تعريفي احترافي",
      pricePrefix: "",
      price: "1,100",
      unit: "ريال فقط",
      desc: "شامل الدومين والاستضافة لأول سنة",
      features: [
        "لوحة تحكم كاملة",
        "سرعة فائقة",
        "متجاوب لكل الأجهزة",
        "تهيئة SEO",
        "تحليلات جوجل",
        "تسليم خلال أيام",
      ],
      image: "",
      featured: true,
    },
    {
      name: "باقة تطبيق خدمات",
      pricePrefix: "",
      price: "8,500",
      unit: "ريال",
      desc: "تطبيق (iOS + Android) مع لوحة تحكم كاملة",
      features: [
        "تطبيق جوال + لوحة تحكم لإدارة الطلبات والمحتوى",
        "موقع تعريفي مرافق بنفس الهوية",
        "إشعارات فورية",
        "تصميم متجاوب وسريع",
      ],
      image: "",
      featured: false,
    },
    {
      name: "متجر صغير",
      pricePrefix: "يبدأ من",
      price: "12,000",
      unit: "ريال",
      desc: "حتى 100 منتج، حتى 10 قنات، متغير واحد للمنتج كاللون أو المقاس",
      features: ["سلة شراء + إدارة مخزون", "تطبيق جوال", "لوحة تحكم + موقع تعريفي"],
      image: "",
      featured: false,
    },
    {
      name: "متجر متوسط",
      pricePrefix: "",
      price: "16,000 - 18,000",
      unit: "ريال",
      desc: "حتى 500 منتج، متغيرات متعددة، كوبونات وخصومات، تقارير مبيعات",
      features: ["سلة شراء + إدارة مخزون", "تطبيق جوال", "لوحة تحكم + موقع تعريفي"],
      image: "",
      featured: false,
    },
    {
      name: "متجر كبير",
      pricePrefix: "",
      price: "22,000",
      unit: "ريال فأكثر",
      desc: "فوق 500 منتج، بحث وفلترة متقدمة، برنامج ولاء، تكامل محاسبة",
      features: ["سلة شراء + إدارة مخزون", "تطبيق جوال", "لوحة تحكم + موقع تعريفي"],
      image: "",
      featured: false,
    },
  ],
  addons: [
    {
      title: "بوابة دفع",
      desc: "تشمل ميزة استرجاع المبلغ للعميل",
      price: "750 ريال",
    },
    {
      title: "ربط شركة شحن واحدة",
      desc: "كل شركة إضافية 300 ريال",
      price: "500 ريال",
    },
    {
      title: "الدعم الفني الشهري",
      desc: "أمان وتحديثات مستمرة",
      price: "230 ريال / شهر",
    },
  ],
  features: [
    { icon: "⚡", title: "سرعة فائقة", desc: "صفحات تفتح بسرعة وتحافظ على زوّارك." },
    { icon: "📱", title: "متجاوب لكل الأجهزة", desc: "يظهر بشكل مرتب على الجوال والتابلت والكمبيوتر." },
    { icon: "🎛️", title: "تحكم كامل بالمحتوى", desc: "تعدّل النصوص والصور والأسعار بنفسك بدون خبرة تقنية." },
    { icon: "🔎", title: "تهيئة SEO", desc: "أساسات قوية لظهور موقعك في نتائج البحث." },
    { icon: "📊", title: "تحليلات جوجل", desc: "تعرف من يزور موقعك وماذا يبحث." },
    { icon: "🛡️", title: "أمان وتحديثات", desc: "دعم فني ومتابعة مستمرة." },
  ],
  gallery: [
    { src: "/images/offer-website.jpg", caption: "عرض الموقع التعريفي" },
    { src: "/images/offer-apps.jpg", caption: "التطبيقات والمتاجر" },
    { src: "/images/coding.jpg", caption: "برمجة بعناية" },
  ],
  video: { url: "" },
  footer: { text: "جميع الحقوق محفوظة" },
};

export function mergeContent(stored) {
  if (!stored || typeof stored !== "object") return defaultContent;
  const out = {};
  for (const key of Object.keys(defaultContent)) {
    const d = defaultContent[key];
    const s = stored[key];
    if (s === undefined || s === null) out[key] = d;
    else if (Array.isArray(d)) out[key] = Array.isArray(s) ? s : d;
    else if (typeof d === "object") out[key] = { ...d, ...s };
    else out[key] = s;
  }
  return out;
}
