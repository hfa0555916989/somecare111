// المحتوى الافتراضي للموقع. أي تعديل من لوحة التحكم يُحفظ في قاعدة البيانات ويتغلّب على هذه القيم.

// الرابط الرسمي المعتمد للموقع (يُستخدم في خريطة الموقع وrobots والرابط الأساسي canonical)
export const SITE_URL = "https://www.hassandev.sa";

// الخطوط العربية المتاحة في لوحة التحكم، مع الأوزان المتوفرة لكل خط في Google Fonts
export const FONTS = {
  "Readex Pro": "wght@400;500;600;700",
  "IBM Plex Sans Arabic": "wght@400;500;600;700",
  "Reem Kufi": "wght@400;500;600;700",
  Cairo: "wght@400;500;600;700",
  Tajawal: "wght@400;500;700;800",
  Almarai: "wght@400;700;800",
  "Noto Kufi Arabic": "wght@400;500;600;700",
};

// هوية «المطوّر حسن»: كحلي #0B1628 وذهبي #D4A84B
export const BRAND_THEME = {
  bg: "#0b1628",
  surface: "#13213d",
  text: "#ffffff",
  muted: "#9aa6bf",
  primary: "#d4a84b",
  buttonText: "#0b1628",
  price: "#d4a84b",
  headingFont: "Readex Pro",
  bodyFont: "IBM Plex Sans Arabic",
};

export const BRAND_ASSETS = {
  name: "المطوّر حسن",
  tagline: "Hassan Developer",
  logo: "/images/brand-icon.svg",
  favicon: "/images/brand-icon.svg",
  appleIcon: "/images/brand-icon.png",
};

export const defaultContent = {
  seo: {
    title: "المطوّر حسن | تطبيقات جوال ومواقع تعريفية ومتاجر إلكترونية",
    description:
      "نبني تطبيقات جوال (iOS + Android) ومواقع تعريفية احترافية ومتاجر إلكترونية متكاملة لشركتك، مع لوحة تحكم كاملة وسرعة فائقة. تواصل معنا واتساب.",
    siteUrl: SITE_URL,
    ogImage: "/images/brand-og.png",
  },
  theme: { ...BRAND_THEME },
  brand: { ...BRAND_ASSETS },
  contact: {
    phone: "0530779934",
    whatsapp: "966530779934",
    availability: "لا تتردد في التواصل، نرد عليك ٢٤ ساعة على مدار الأسبوع",
    message: "السلام عليكم، أبغى أستفسر عن خدماتكم",
  },
  social: {
    x: "",
    instagram: "",
    snapchat: "",
    tiktok: "",
    linkedin: "",
    youtube: "",
    email: "",
  },
  hero: {
    title: "تطبيقات جوال + {مواقع تعريفية احترافية} لشركتك",
    subtitle:
      "نبني لك تطبيق جوال (iOS + Android) مع لوحة تحكم كاملة وموقع تعريفي مرافق، أو متجر إلكتروني متكامل حسب احتياج مشروعك.",
    image: "/images/brand-logo.png",
    badge: "حلول رقمية للشركات والمتاجر",
    primaryButton: "اطلب الآن عبر واتساب",
    secondaryButton: "استعرض الباقات",
  },
  titles: {
    packages: "الباقات {والأسعار}",
    packagesSub: "اختر الباقة المناسبة لمشروعك، والسعر يختلف حسب حجم العمل.",
    addons: "إضافات {اختيارية}",
    addonsSub: "متاحة لكل الباقات",
    features: "ماذا ستحصل عليه",
    gallery: "عروضنا",
    video: "شاهد كيف نعمل",
    contact: "جاهز نبدأ مشروعك؟",
  },
  packages: [
    {
      label: "عرض خاص",
      icon: "monitor",
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
      label: "الباقة الأولى",
      icon: "phone",
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
      label: "الباقة الثانية · متجر إلكتروني",
      icon: "store",
      name: "متجر صغير",
      pricePrefix: "يبدأ من",
      price: "12,000",
      unit: "ريال",
      desc: "حتى 100 منتج، حتى 10 قنوات، متغير واحد للمنتج كاللون أو المقاس",
      features: ["سلة شراء + إدارة مخزون", "تطبيق جوال", "لوحة تحكم + موقع تعريفي"],
      image: "",
      featured: false,
    },
    {
      label: "الباقة الثانية · متجر إلكتروني",
      icon: "cart",
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
      label: "الباقة الثانية · متجر إلكتروني",
      icon: "box",
      name: "متجر كبير",
      pricePrefix: "",
      price: "22,000",
      unit: "ريال فأكثر",
      desc: "فوق 500 منتج، بحث وفلترة متقدمة، برنامج ولاء، تكامل محاسبي",
      features: ["سلة شراء + إدارة مخزون", "تطبيق جوال", "لوحة تحكم + موقع تعريفي"],
      image: "",
      featured: false,
    },
  ],
  addons: [
    {
      icon: "card",
      title: "بوابة دفع",
      desc: "تشمل ميزة استرجاع المبلغ للعميل",
      price: "750 ريال",
    },
    {
      icon: "truck",
      title: "ربط شركة شحن",
      desc: "كل شركة إضافية 300 ريال",
      price: "500 ريال",
    },
    {
      icon: "headset",
      title: "الدعم الفني الشهري",
      desc: "صيانة ومتابعة مستمرة",
      price: "230 ريال / شهر",
    },
  ],
  features: [
    { icon: "clock", title: "تسليم خلال أيام قليلة", desc: "نبدأ فور تأكيد المتطلبات ونسلّمك بسرعة." },
    { icon: "gear", title: "تحكم كامل بالمحتوى", desc: "تعدّل النصوص والصور والأسعار بنفسك بدون خبرة تقنية." },
    { icon: "shield", title: "أمان وتحديثات مستمرة", desc: "دعم فني ومتابعة مستمرة." },
    { icon: "bolt", title: "سرعة فائقة", desc: "صفحات تفتح بسرعة وتحافظ على زوّارك." },
    { icon: "search", title: "تهيئة SEO", desc: "أساسات قوية لظهور موقعك في نتائج البحث." },
    { icon: "chart", title: "تحليلات جوجل", desc: "تعرف من يزور موقعك وماذا يبحث." },
  ],
  gallery: [
    { src: "/images/card-01-cover.jpg", caption: "تطبيقات جوال ومواقع تعريفية" },
    { src: "/images/card-02-app.jpg", caption: "باقة تطبيق خدمات" },
    { src: "/images/card-03-store.jpg", caption: "باقة متجر إلكتروني" },
    { src: "/images/card-04-addons.jpg", caption: "إضافات اختيارية" },
  ],
  video: { url: "" },
  footer: {
    text: "جميع الحقوق محفوظة",
    city: "الرياض",
    privacyLabel: "سياسة الخصوصية",
    termsLabel: "الشروط والأحكام",
  },
  legal: {
    privacy: {
      title: "سياسة الخصوصية",
      subtitle: "موقع hassandev.sa",
      body:
        "نجمع البيانات التي ترسلها عند طلب الخدمة، مثل الاسم ورقم التواصل وتفاصيل المشروع، من أجل الرد عليك وتنفيذ الطلب فقط.\nلا نبيع بياناتك لطرف ثالث.\nقد نستخدم أدوات تحليل بسيطة لمعرفة زيارات الموقع.",
      contactLabel: "للتواصل بشأن البيانات: واتساب",
    },
    terms: {
      title: "الشروط والأحكام",
      subtitle: "شروط الخدمة",
      body:
        "الخدمة المعروضة هي تصميم موقع تعريفي بالسعر الموضح في الصفحة.\nالسعر 1,100 ريال يشمل تصميم الموقع والدومين والاستضافة لسنة واحدة، ما لم يُذكر غير ذلك في الباقة المختارة.\nمدة التسليم تقريبية وتبدأ بعد تأكيد المتطلبات ودفع المبلغ المتفق عليه.\nأي إضافات مثل المتجر أو التطبيق لها سعر منفصل ظاهر في الموقع.",
      contactLabel: "للتواصل:",
    },
  },
  tracking: {
    ga4: "",
    googleAds: "",
    googleAdsLabel: "",
    searchConsole: "",
    snap: "",
    tiktok: "",
    xPixel: "",
    xEventId: "",
  },
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

// الرابط الأساسي للموقع بدون شرطة في النهاية: من لوحة التحكم، ثم SITE_URL في Vercel، ثم الافتراضي
export function siteUrl(c) {
  const raw = String(c?.seo?.siteUrl || process.env.SITE_URL || SITE_URL).trim().replace(/\/+$/, "");
  try {
    const u = new URL(raw);
    return /^https?:$/.test(u.protocol) ? u.origin : SITE_URL;
  } catch {
    return SITE_URL;
  }
}

// رابط Google Fonts للخطوط المختارة (من القائمة المسموحة فقط)
export function fontsHref(names) {
  const fams = [...new Set(names.filter((f) => FONTS[f]))];
  if (!fams.length) return null;
  return `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f.replace(/ /g, "+")}:${FONTS[f]}`).join("&")}&display=swap`;
}
