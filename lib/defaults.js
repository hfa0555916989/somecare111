// المحتوى الافتراضي للموقع. أي تعديل من لوحة التحكم يُحفظ في قاعدة البيانات ويتغلّب على هذه القيم.

// الرابط الرسمي المعتمد للموقع (يُستخدم في خريطة الموقع وrobots والرابط الأساسي canonical)
export const SITE_URL = "https://www.hassandev.sa";

// الخطوط المتاحة في لوحة التحكم، مع الأوزان المتوفرة لكل خط في Google Fonts
// (القيمة الفارغة = خط بوزن واحد فقط). أي وزن غير موجود يُفشل تحميل كل الخطوط، فتأكد منه قبل الإضافة.
export const FONTS = {
  "Readex Pro": "wght@400;500;600;700;800",
  "IBM Plex Sans Arabic": "wght@400;500;600;700",
  "Reem Kufi": "wght@400;500;600;700",
  Cairo: "wght@400;500;600;700;800",
  Tajawal: "wght@400;500;700;800",
  Almarai: "wght@400;700;800",
  "Noto Kufi Arabic": "wght@400;500;600;700;800",
  "El Messiri": "wght@400;500;600;700",
  Changa: "wght@400;500;600;700;800",
  Alexandria: "wght@400;500;600;700;800",
  "Baloo Bhaijaan 2": "wght@400;500;600;700;800",
  Lemonada: "wght@400;500;600;700",
  Marhey: "wght@400;500;600;700",
  Amiri: "wght@400;700",
  "Aref Ruqaa": "wght@400;700",
  Lalezar: "",
  Rakkas: "",
  // خطوط إنجليزية (مناسبة للسطر الإنجليزي تحت الاسم مثل Hassan Developer)
  Montserrat: "wght@400;500;600;700;800",
  Poppins: "wght@400;500;600;700;800",
  Inter: "wght@400;500;600;700;800",
  Raleway: "wght@400;500;600;700;800",
  Cinzel: "wght@400;500;600;700;800",
  Oswald: "wght@400;500;600;700",
  Orbitron: "wght@400;500;600;700;800",
  "Space Grotesk": "wght@400;500;600;700",
  "Bebas Neue": "",
};
export const isFont = (f) => typeof f === "string" && Object.hasOwn(FONTS, f);
export const LATIN_FONTS = ["Montserrat", "Poppins", "Inter", "Raleway", "Cinzel", "Oswald", "Orbitron", "Space Grotesk", "Bebas Neue"];

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
  // خط الاسم والسطر الإنجليزي بجانب الشعار (فارغ = نفس خط العناوين / النصوص)
  brandFont: "",
  taglineFont: "",
  // الوضع الافتراضي للزائر: auto يتبع إعداد جهازه، أو dark / light
  mode: "auto",
  // ألوان الوضع النهاري (خلفية كريمية مثل الشعار الأفقي الفاتح)
  light: {
    bg: "#f6f4ef",
    surface: "#ffffff",
    text: "#0b1628",
    muted: "#5b6577",
    primary: "#d4a84b",
    buttonText: "#0b1628",
    price: "#9a6f14",
  },
};

export const THEME_COLORS = ["bg", "surface", "text", "muted", "primary", "buttonText", "price"];

export const BRAND_ASSETS = {
  name: "المطوّر حسن",
  tagline: "Hassan Developer",
  logo: "/images/brand-icon.svg",
  logoLight: "/images/brand-mark-dark.svg",
  // شعار الفوتر: الشعار الكامل (ليلي بكتابة بيضاء، ونهاري بكتابة كحلية)
  footerLogo: "/images/logo-horizontal-dark.svg",
  footerLogoLight: "/images/logo-horizontal-light.svg",
  footerShowName: false,
  favicon: "/images/brand-icon.svg",
  appleIcon: "/images/brand-icon.png",
};

// أحجام الشعار والصور (تُعدَّل من لوحة التحكم ← الأحجام)
// [المفتاح, العنوان, الحد الأدنى, الحد الأعلى, الخطوة, الوحدة, متغير CSS]
export const SIZE_FIELDS = {
  header: [
    ["headerLogo", "ارتفاع الشعار في الهيدر", 20, 140, 1, "px", "--logo-h"],
    ["headerLogoMobile", "ارتفاع الشعار في الهيدر على الجوال", 20, 100, 1, "px", "--logo-h-m"],
    ["logoRadius", "استدارة زوايا الشعار", 0, 50, 1, "px", "--logo-r"],
    ["logoGap", "المسافة بين الشعار والكتابة", 0, 40, 1, "px", "--logo-gap"],
    ["brandName", "حجم اسم الموقع بجانب الشعار", 12, 40, 1, "px", "--brand-name"],
    ["brandWeight", "سماكة خط الاسم", 400, 800, 100, "", "--brand-w"],
    ["brandTagline", "حجم السطر الإنجليزي تحت الاسم", 8, 24, 0.5, "px", "--brand-tag"],
    ["taglineWeight", "سماكة خط السطر الإنجليزي", 400, 800, 100, "", "--brand-tag-w"],
    ["taglineSpacing", "تباعد حروف السطر الإنجليزي", 0, 40, 1, "%", "--brand-tag-ls"],
    ["brandLines", "المسافة بين الاسم والسطر الإنجليزي", 0, 16, 1, "px", "--brand-lines"],
  ],
  footer: [
    ["footerLogo", "ارتفاع الشعار في الفوتر", 20, 160, 1, "px", "--foot-logo-h"],
    ["footerName", "حجم اسم الموقع في الفوتر", 12, 40, 1, "px", "--foot-name"],
  ],
  images: [
    ["heroImage", "عرض صورة الواجهة (من مساحتها)", 30, 100, 1, "%", "--hero-w"],
    ["heroRadius", "استدارة زوايا صورة الواجهة", 0, 60, 1, "px", "--hero-r"],
    ["aboutPhoto", "عرض الصورة الشخصية", 120, 520, 5, "px", "--about-w"],
    ["galleryCol", "عرض كل صورة في قسم العروض", 140, 700, 10, "px", "--gal-col"],
    ["packageImage", "ارتفاع صور الباقات", 80, 480, 10, "px", "--pk-img-h"],
    ["certImage", "عرض صورة شهادة العمل الحر", 30, 100, 1, "%", "--cert-w"],
    ["badgeImage", "عرض بطاقة العمل الحر", 120, 600, 10, "px", "--badge-w"],
  ],
};

// أشكال قص الصور (original = بدون قص بالحجم الأصلي)
export const RATIOS = {
  original: "الشكل الأصلي بدون قص",
  "1/1": "مربع 1:1",
  "4/3": "أفقي 4:3",
  "16/9": "عريض 16:9",
  "3/4": "طولي 3:4",
};
export const RATIO_FIELDS = [
  ["heroRatio", "شكل صورة الواجهة", "--hero-ratio"],
  ["aboutRatio", "شكل الصورة الشخصية", "--about-ratio"],
  ["galleryRatio", "شكل صور العروض", "--gal-ratio"],
];

export const DEFAULT_SIZES = {
  showBrandText: true,
  headerLogo: 40,
  headerLogoMobile: 34,
  logoRadius: 10,
  logoGap: 12,
  brandName: 20,
  brandWeight: 700,
  brandTagline: 11.5,
  taglineWeight: 500,
  taglineSpacing: 18,
  brandLines: 3,
  footerLogo: 80,
  footerName: 18,
  heroImage: 100,
  heroRadius: 28,
  heroRatio: "1/1",
  aboutPhoto: 320,
  aboutRatio: "1/1",
  galleryCol: 260,
  galleryRatio: "original",
  packageImage: 170,
  certImage: 100,
  badgeImage: 300,
};

// متغيرات CSS للأحجام [اسم المتغير, القيمة] (كل قيمة تُحصر بين الحد الأدنى والأعلى لتبقى آمنة)
export function sizeVars(s = {}) {
  const out = [];
  for (const [key, , min, max, , unit, cssVar] of Object.values(SIZE_FIELDS).flat()) {
    const n = Number(s[key]);
    const v = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : DEFAULT_SIZES[key];
    // تباعد الحروف نسبةً لحجم الخط: 18% = 0.18em
    out.push([cssVar, cssVar === "--brand-tag-ls" ? v / 100 + "em" : v + unit]);
  }
  for (const [key, , cssVar] of RATIO_FIELDS) {
    const r = RATIOS[s[key]] ? s[key] : DEFAULT_SIZES[key];
    out.push([cssVar, r === "original" ? "auto" : r]);
  }
  return out;
}

export const sizesCss = (s) => `:root{${sizeVars(s).map(([k, v]) => `${k}:${v}`).join(";")}}`;

export const defaultContent = {
  sizes: { ...DEFAULT_SIZES },
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
  form: {
    show: true,
    title: "أو أرسل استفسارك وسنرد عليك",
    success: "تم استلام استفسارك برقم {number}، وسنتواصل معك قريباً.",
  },
  about: {
    show: true,
    title: "من {أنا}",
    name: "حسن فايز الأسمري",
    role: "مطوّر مواقع وتطبيقات · ممارس عمل حر مرخّص",
    photo: "/images/about-photo.jpg",
    bio:
      "أساعد الشركات والمتاجر على بناء حضور رقمي احترافي: مواقع تعريفية، تطبيقات جوال، ومتاجر إلكترونية بلوحة تحكم كاملة.\nأعمل معك مباشرة من الفكرة حتى الإطلاق، وأتابع معك بعده بالدعم والتحديثات.",
    highlights: [
      "ممارس عمل حر مسجّل لدى وزارة الموارد البشرية",
      "تخصص: برمجة وتطوير المواقع الإلكترونية",
      "تعامل مباشر بدون وسطاء",
    ],
    certTitle: "وثيقة العمل الحر",
    certText:
      "مسجّل لدى وزارة الموارد البشرية والتنمية الاجتماعية كممارس عمل حر في فئة الخدمات التخصصية، مهنة برمجة وتطوير المواقع الإلكترونية.",
    certNumber: "FL-273857775",
    certExpiry: "28 سبتمبر 2027",
    certImage: "/images/freelance-certificate.png",
    badgeImage: "/images/badge.png",
    badgePdf: "/images/freelance-badge.pdf",
    verifyUrl: "",
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
  // قسم «عقود موثّقة» في الصفحة الرئيسية
  trust: {
    show: true,
    title: "عقود {موثّقة} وعروض أسعار رسمية 100%",
    subtitle: "تعاملك معي واضح ومضمون من أول عرض سعر حتى التسليم، وكل وثيقة تقدر تتحقق منها بنفسك بدون ما تعتمد على كلامي.",
    points: [
      { icon: "monitor", title: "عرض سعر وعقد رسمي لكل مشروع", desc: "يصدر برقم وتاريخ على الموقع الرسمي hassandev.sa، تفتحه من جوالك وتطبعه أو تحفظه PDF متى ما احتجت." },
      { icon: "award", title: "مرتبط بوثيقة العمل الحر", desc: "كل عرض وعقد يذكر رقم وثيقة العمل الحر الصادرة من وزارة الموارد البشرية، مع صورتها ورابط التحقق منها." },
      { icon: "globe", title: "دومين سعودي مسجّل باسمي", desc: "النطاق hassandev.sa مسجّل رسمياً باسمي لدى وكيل مرخّص، ويُرفق كتاب إثبات التسجيل مع كل عقد." },
      { icon: "card", title: "حساب بنكي باسمي فقط", desc: "التحويل على آيبان باسمي مطابق لوثيقة العمل الحر، ومرفق معه شهادة الآيبان من البنك. بدون وسطاء ولا حسابات أخرى." },
      { icon: "shield", title: "موافقة إلكترونية وبصمة رقمية", desc: "توافق على العرض أو العقد باسمك، فتُقفل الوثيقة وتُثبَّت ببصمة رقمية، فلا يتغيّر بعدها سعر ولا بند." },
      { icon: "headset", title: "وضوح من البداية للنهاية", desc: "البنود والأسعار ومدة التنفيذ والدفعات مكتوبة بالتفصيل قبل ما تدفع ريال واحد، وتبقى مرجعاً لنا الاثنين." },
    ],
    note: "اطلب عرض سعرك الآن، ويوصلك رابط رسمي تراجعه وتوافق عليه من جوالك.",
    button: "اطلب عرض سعر رسمي",
  },
  // العقود وعروض الأسعار: بيانات مقدّم الخدمة والحساب البنكي وإثبات الدومين والنصوص الافتراضية
  contracts: {
    providerName: "حسن فايز عبدالرحمن الأسمري",
    bankName: "",
    accountName: "حسن فايز عبدالرحمن الأسمري",
    iban: "",
    // شهادة الآيبان من البنك (PDF) وتُرفق تلقائياً مع كل عرض وعقد
    ibanCert: "",
    domainRegistrar: "Souq T2 (وكيل مرخّص من هيئة الاتصالات والفضاء والتقنية)",
    domainRegistered: "04/10/2026",
    domainExpiry: "04/10/2027",
    domainProof: "",
    whoisUrl: "https://secure.nic.sa/whois",
    validDays: 15,
    vatRate: 0,
    quoteTerms: [
      "الدفع: 50% عند التعاقد، و50% عند التسليم والإطلاق.",
      "مدة التنفيذ تبدأ من استلام المحتوى والدفعة الأولى.",
      "لا يشمل العرض رسوم النطاق والاستضافة ولا عمولات بوابات الدفع ما لم يُذكر خلاف ذلك.",
      "المحتوى والبيانات وملكية النطاق تعود للعميل بالكامل.",
      "الخصائص الإضافية خارج هذا العرض تُسعّر بشكل مستقل.",
    ],
    contractTerms: [
      "يلتزم الطرف الأول بتنفيذ الأعمال الموضحة في نطاق العمل والملحق الفني وفق المواصفات المتفق عليها.",
      "يلتزم الطرف الثاني بتسليم المحتوى والبيانات اللازمة وسداد الدفعات في مواعيدها.",
      "الدفع: 50% عند توقيع العقد، و50% عند التسليم والإطلاق، بالتحويل البنكي على الحساب الموضح في هذا العقد فقط.",
      "مدة التنفيذ تبدأ من تاريخ استلام المحتوى والدفعة الأولى، ولا تُحتسب فترات تأخر الطرف الثاني في الرد أو التسليم.",
      "يحق للطرف الثاني طلب تعديلات ضمن نطاق العمل خلال مرحلة المراجعة، وأي إضافة خارج النطاق تُسعّر بعرض مستقل.",
      "تنتقل ملكية الموقع والمحتوى والنطاق للطرف الثاني بعد سداد كامل المستحقات.",
      "يلتزم الطرفان بالحفاظ على سرية البيانات والمعلومات المتبادلة بينهما.",
      "في حال إلغاء الطرف الثاني للعقد بعد بدء التنفيذ، لا تُسترد الدفعة الأولى مقابل ما تم إنجازه.",
      "يخضع هذا العقد لأنظمة المملكة العربية السعودية، ويُعد قبوله إلكترونياً عبر رابطه في الموقع الرسمي توقيعاً ملزماً للطرفين.",
    ],
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

// لون آمن لوضعه داخل CSS (يقبل #RGB و #RRGGBB فقط)
export const safeColor = (v, fallback) => (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(String(v || "")) ? v : fallback);

// متغيرات الألوان للوضعين الليلي والنهاري
export function themeCss(t = {}) {
  const vars = (src, base) =>
    THEME_COLORS.map((k) => `--${k}:${safeColor(src?.[k], base[k])};`).join("");
  // --show-dark / --show-light تتحكم بإظهار نسخة الشعار المناسبة لكل وضع
  const dark = vars(t, BRAND_THEME) + "--show-dark:block;--show-light:none;";
  const light = vars(t.light, BRAND_THEME.light) + "--show-dark:none;--show-light:block;";
  const mode = ["dark", "light"].includes(t.mode) ? t.mode : "auto";
  return (
    `:root{${dark}color-scheme:dark}` +
    `:root[data-theme=light]{${light}color-scheme:light}` +
    (mode === "auto" ? `@media(prefers-color-scheme:light){:root:not([data-theme=dark]){${light}color-scheme:light}}` : "")
  );
}

// رابط Google Fonts للخطوط المختارة (من القائمة المسموحة فقط)
export function fontsHref(names) {
  const fams = [...new Set(names.filter(isFont))];
  if (!fams.length) return null;
  return `https://fonts.googleapis.com/css2?${fams
    .map((f) => `family=${f.replace(/ /g, "+")}${FONTS[f] ? ":" + FONTS[f] : ""}`)
    .join("&")}&display=swap`;
}


// مجاميع عرض السعر / العقد (تُستخدم في الموقع ولوحة التحكم)
const toNum = (v) => {
  const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
export function docTotals(d) {
  const subtotal = (d.sections || []).reduce((s, x) => s + toNum(x.price) * (toNum(x.qty) || 1), 0);
  const discount = Math.min(toNum(d.discount), subtotal);
  const vat = Math.round((subtotal - discount) * toNum(d.vatRate)) / 100;
  return { subtotal, discount, vat, total: subtotal - discount + vat };
}

// التحقق من صحة الآيبان السعودي (SA + 22 رقم، مع رقم التحقق mod 97)
export function validIban(v) {
  const s = String(v || "").replace(/\s/g, "").toUpperCase();
  if (!/^SA\d{22}$/.test(s)) return false;
  const r = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, (ch) => ch.charCodeAt(0) - 55);
  let m = 0;
  for (const ch of r) m = (m * 10 + Number(ch)) % 97;
  return m === 1;
}
