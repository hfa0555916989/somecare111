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
    notifyEmail: "",
  },
  // الدليل الإجرائي: إجراءاتك الخاصة (تُعدّل من لوحة التحكم ← الدليل)
  guide: { procedures: [] },
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
  // باقة الأمن السيبراني للشركات الكبرى بالشراكة مع Security Professionals Group (أستراليا)
  security: {
    show: true,
    navLabel: "الأمن السيبراني",
    badge: "شريك في المملكة العربية السعودية",
    title: "الأمن السيبراني {للشركات والجهات الكبرى}",
    subtitle:
      "باقة مؤسسية نقدّمها في المملكة بالشراكة مع Security Professionals Group الأسترالية: هندسة أمنية، حوكمة وامتثال، واختبارات اختراق، بخبرة دولية وتعاقد ومتابعة محلية.",
    image: "",
    partner: {
      name: "Security Professionals Group",
      country: "أستراليا · بيرث",
      url: "https://securitypro.com.au",
      logo: "",
      text: "شريكنا التقني في خدمات الأمن السيبراني، ونحن شريكه في المملكة العربية السعودية: نتولى التواصل والعقود والمتابعة محلياً، ويتولى فريقه المتخصص التنفيذ التقني.",
    },
    services: [
      {
        icon: "shield",
        title: "هندسة الأمن السيبراني",
        desc: "تصميم بنية أمنية متينة لأنظمتكم وشبكاتكم وخدماتكم السحابية.",
        points: ["مراجعة البنية الحالية وتحديد نقاط الضعف", "تصميم بنية Zero Trust وتقسيم الشبكات", "أمن البيئات السحابية والهجينة"],
        image: "",
        url: "",
      },
      {
        icon: "award",
        title: "الحوكمة والمخاطر والامتثال (GRC)",
        desc: "نساعدكم على بناء السياسات وإدارة المخاطر والاستعداد للتدقيق.",
        points: [
          "تقييم الفجوات مقابل الضوابط الأساسية للأمن السيبراني (NCA ECC)",
          "إطار ساما للقطاع المالي ونظام حماية البيانات الشخصية",
          "سياسات وإجراءات وخطط استمرارية وفق ISO 27001",
        ],
        image: "",
        url: "",
      },
      {
        icon: "search",
        title: "الأمن الهجومي واختبارات الاختراق",
        desc: "نختبر أنظمتكم كما يفعل المهاجم الحقيقي قبل أن يصل إليها.",
        points: [
          "اختبار اختراق تطبيقات الويب والجوال والـ API",
          "اختبار الشبكات الداخلية والخارجية",
          "تمارين الفريق الأحمر (Red Team)",
          "تقرير مفصّل بالثغرات وخطة معالجة",
        ],
        image: "",
        url: "",
      },
    ],
    solutionsTitle: "منصات وحلول الشريك",
    solutions: [
      { name: "Defend360", desc: "منصة حماية ومراقبة أمنية شاملة.", image: "", url: "" },
      { name: "RedScope Offensive", desc: "منصة للاختبارات الهجومية المستمرة.", image: "", url: "" },
      { name: "Clyvra Code Review", desc: "مراجعة أمنية للكود المصدري مدعومة بالذكاء الاصطناعي.", image: "", url: "" },
      { name: "SMB UTM", desc: "إدارة موحّدة للتهديدات (UTM) للمنشآت المتوسطة والصغيرة.", image: "", url: "" },
    ],
    frameworksTitle: "أطر وأنظمة نساعدكم على الالتزام بها",
    frameworks: ["NCA ECC", "NCA CCC", "SAMA CSF", "PDPL", "ISO 27001", "PCI DSS"],
    sectorsTitle: "لمن هذه الباقة",
    sectors: ["البنوك والتقنية المالية", "الشركات الكبرى والمجموعات", "القطاع الصحي", "الطاقة والصناعة", "التجزئة والتجارة الإلكترونية", "شركات التقنية والبرمجيات"],
    stepsTitle: "كيف نعمل",
    steps: [
      { title: "اجتماع تعريفي", desc: "نفهم بيئتكم وأولوياتكم ومتطلبات الجهات التنظيمية عليكم." },
      { title: "تحديد النطاق وعرض السعر", desc: "عرض فني ومالي رسمي بنطاق واضح ومدة تنفيذ، مع اتفاقية عدم إفصاح (NDA)." },
      { title: "التنفيذ", desc: "يعمل الفريق المتخصص على التقييم أو الاختبار أو البناء حسب النطاق المتفق عليه." },
      { title: "التقرير والمعالجة", desc: "تقرير للإدارة وآخر تقني، مع خطة معالجة وإعادة اختبار بعد الإصلاح." },
    ],
    priceLabel: "السعر",
    price: "حسب نطاق العمل",
    priceNote: "عرض سعر رسمي خلال أيام من الاجتماع التعريفي",
    button: "اطلب استشارة أمنية",
    // صور إضافية للباقة (مثل صور من موقع الشريك بعد موافقته)
    gallery: [],
  },
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
  // النسخة الإنجليزية (/en): ترجمة النصوص فقط. القوائم تُطابَق بالترتيب مع العربية،
  // وأي خانة فارغة تأخذ النص العربي، والأسعار والصور والأيقونات تُؤخذ من العربية دائماً.
  en: {
    seo: {
      title: "Hassan Developer | Mobile Apps, Websites, E-commerce & Cybersecurity",
      description:
        "Mobile apps (iOS + Android), professional business websites and full e-commerce stores with a complete admin panel, plus enterprise cybersecurity services in Saudi Arabia.",
    },
    brand: { name: "Hassan Developer", tagline: "المطوّر حسن" },
    contact: {
      availability: "Feel free to reach out, we reply 24/7",
      message: "Hello, I'd like to ask about your services",
    },
    form: {
      title: "Or send us your inquiry and we'll get back to you",
      success: "We received your inquiry no. {number} and will contact you soon.",
    },
    hero: {
      title: "Mobile apps + {professional websites} for your business",
      subtitle:
        "We build your mobile app (iOS + Android) with a complete admin panel and a companion website, or a full e-commerce store tailored to your project.",
      badge: "Digital solutions for companies and stores",
      primaryButton: "Order now on WhatsApp",
      secondaryButton: "View packages",
    },
    titles: {
      packages: "Packages {& pricing}",
      packagesSub: "Choose the package that fits your project; the price depends on the scope of work.",
      addons: "Optional {add-ons}",
      addonsSub: "Available with every package",
      features: "What you get",
      gallery: "Our work",
      video: "See how we work",
      contact: "Ready to start your project?",
    },
    packages: [
      {
        label: "Special offer",
        name: "Professional business website",
        desc: "Includes domain and hosting for the first year",
        features: ["Complete admin panel", "Blazing-fast speed", "Responsive on every device", "SEO setup", "Google Analytics", "Delivered within days"],
      },
      {
        label: "Package 1",
        name: "Services app package",
        desc: "iOS + Android app with a complete admin panel",
        features: [
          "Mobile app + admin panel to manage orders and content",
          "Companion website with the same identity",
          "Instant push notifications",
          "Fast, responsive design",
        ],
      },
      {
        label: "Package 2 · E-commerce",
        name: "Small store",
        desc: "Up to 100 products, up to 10 channels, one variant per product such as color or size",
        features: ["Shopping cart + inventory management", "Mobile app", "Admin panel + business website"],
      },
      {
        label: "Package 2 · E-commerce",
        name: "Medium store",
        desc: "Up to 500 products, multiple variants, coupons and discounts, sales reports",
        features: ["Shopping cart + inventory management", "Mobile app", "Admin panel + business website"],
      },
      {
        label: "Package 2 · E-commerce",
        name: "Large store",
        desc: "500+ products, advanced search and filtering, loyalty program, accounting integration",
        features: ["Shopping cart + inventory management", "Mobile app", "Admin panel + business website"],
      },
    ],
    addons: [
      { title: "Payment gateway", desc: "Includes customer refunds" },
      { title: "Shipping company integration", desc: "Each additional company: 300 SAR" },
      { title: "Monthly technical support", desc: "Ongoing maintenance and follow-up" },
    ],
    security: {
      navLabel: "Cybersecurity",
      badge: "Partner in the Kingdom of Saudi Arabia",
      title: "Cybersecurity for {enterprises and large organizations}",
      subtitle:
        "An enterprise package we deliver in Saudi Arabia in partnership with Australia's Security Professionals Group: security architecture, governance and compliance, and penetration testing, with international expertise and local contracting and support.",
      partner: {
        country: "Perth, Australia",
        text: "Our technical partner for cybersecurity services, and we are its partner in Saudi Arabia: we handle communication, contracts and follow-up locally, while its specialist team delivers the technical work.",
      },
      services: [
        {
          title: "Security architecture",
          desc: "Designing a robust security architecture for your systems, networks and cloud services.",
          points: ["Review of your current architecture and its weak points", "Zero Trust design and network segmentation", "Cloud and hybrid environment security"],
        },
        {
          title: "Governance, risk & compliance (GRC)",
          desc: "Helping you build policies, manage risk and get ready for audits.",
          points: [
            "Gap assessment against the NCA Essential Cybersecurity Controls (ECC)",
            "SAMA framework for the financial sector and the Personal Data Protection Law (PDPL)",
            "Policies, procedures and continuity plans aligned with ISO 27001",
          ],
        },
        {
          title: "Offensive security & penetration testing",
          desc: "We test your systems the way a real attacker would, before one gets there.",
          points: [
            "Web, mobile and API penetration testing",
            "Internal and external network testing",
            "Red Team exercises",
            "Detailed vulnerability report with a remediation plan",
          ],
        },
      ],
      solutionsTitle: "Partner platforms & solutions",
      solutions: [
        { desc: "A comprehensive security protection and monitoring platform." },
        { desc: "A platform for continuous offensive testing." },
        { desc: "AI-powered security review of source code." },
        { desc: "Unified threat management (UTM) for small and medium businesses." },
      ],
      frameworksTitle: "Frameworks and regulations we help you comply with",
      sectorsTitle: "Who this package is for",
      sectors: ["Banks and fintech", "Large companies and groups", "Healthcare", "Energy and industry", "Retail and e-commerce", "Technology and software companies"],
      stepsTitle: "How we work",
      steps: [
        { title: "Discovery meeting", desc: "We understand your environment, priorities and regulatory requirements." },
        { title: "Scope and quotation", desc: "An official technical and financial proposal with a clear scope and timeline, plus an NDA." },
        { title: "Delivery", desc: "The specialist team carries out the assessment, testing or build within the agreed scope." },
        { title: "Report and remediation", desc: "An executive report and a technical report, with a remediation plan and retesting after fixes." },
      ],
      priceLabel: "Price",
      price: "Based on scope of work",
      priceNote: "Official quotation within days of the discovery meeting",
      button: "Request a security consultation",
    },
    features: [
      { title: "Delivered in just a few days", desc: "We start as soon as requirements are confirmed and deliver fast." },
      { title: "Full control of your content", desc: "Edit text, images and prices yourself, no technical skills needed." },
      { title: "Security and ongoing updates", desc: "Continuous technical support and follow-up." },
      { title: "Blazing-fast speed", desc: "Pages load quickly and keep your visitors." },
      { title: "SEO setup", desc: "Strong foundations for showing up in search results." },
      { title: "Google Analytics", desc: "Know who visits your site and what they look for." },
    ],
    trust: {
      title: "{Documented} contracts and 100% official quotations",
      subtitle:
        "Working with me is clear and secure from the first quote to delivery, and you can verify every document yourself without taking my word for it.",
      points: [
        { title: "An official quote and contract for every project", desc: "Issued with a number and date on the official site hassandev.sa; open it on your phone, print it or save it as PDF anytime." },
        { title: "Linked to my freelance document", desc: "Every quote and contract states the freelance document number issued by the Ministry of Human Resources, with its image and verification link." },
        { title: "A Saudi domain registered in my name", desc: "hassandev.sa is officially registered in my name with a licensed registrar, and the registration proof is attached to every contract." },
        { title: "A bank account in my name only", desc: "Transfers go to an IBAN in my name matching the freelance document, with the bank's IBAN certificate attached. No middlemen, no other accounts." },
        { title: "Electronic approval and a digital fingerprint", desc: "You approve the quote or contract in your name, and the document is locked with a digital fingerprint so no price or clause can change." },
        { title: "Clear from start to finish", desc: "Scope, prices, timeline and payments are written in detail before you pay a single riyal, and stay a reference for both of us." },
      ],
      note: "Request your quote now and receive an official link to review and approve from your phone.",
      button: "Request an official quote",
    },
    about: {
      title: "About {me}",
      name: "Hassan Fayez Al-Asmari",
      role: "Web & app developer · Licensed freelancer",
      bio:
        "I help companies and stores build a professional digital presence: business websites, mobile apps and e-commerce stores with a complete admin panel.\nI work with you directly from idea to launch, and keep supporting you afterwards with maintenance and updates.",
      highlights: [
        "Registered freelancer with the Ministry of Human Resources and Social Development",
        "Specialization: website programming and development",
        "Direct dealing, no middlemen",
      ],
      certTitle: "Freelance document",
      certText:
        "Registered with the Ministry of Human Resources and Social Development as a freelancer in the specialized services category, profession: website programming and development.",
      certExpiry: "28 September 2027",
    },
    gallery: [
      { caption: "Mobile apps and business websites" },
      { caption: "Services app package" },
      { caption: "E-commerce store package" },
      { caption: "Optional add-ons" },
    ],
    footer: { text: "All rights reserved", city: "Riyadh" },
  },
};

// النصوص الافتراضية القديمة (قبل اعتماد hassandev.sa وهوية «المطوّر حسن»).
// المحتوى المحفوظ في قاعدة البيانات قبل التغيير يحمل هذه القيم فتتغلّب على الافتراضي الجديد
// ويبقى عنوان جوجل والوصف القديم ظاهراً. أي خانة ما زالت مطابقة للقيمة القديمة تماماً
// (أي لم يعدّلها صاحب الموقع) تُستبدل بالقيمة الجديدة.
const LEGACY_DEFAULTS = {
  seo: {
    title: ["تصميم مواقع وتطبيقات احترافية | موقع تعريفي بـ 1,100 ريال"],
    description: [
      "نصمم مواقع تعريفية وتطبيقات جوال ومتاجر إلكترونية لشركتك، مع لوحة تحكم كاملة وسرعة فائقة. تواصل معنا واتساب على مدار الساعة.",
    ],
  },
  brand: {
    name: ["اسم شركتك"],
    tagline: ["مواقع وتطبيقات ومتاجر"],
  },
  hero: {
    title: ["موقع تعريفي احترافي لشركتك، بتحكم كامل وسرعة فائقة"],
    subtitle: ["نبني لك موقعاً يعكس هوية شركتك، متجاوباً مع كل الأجهزة، ومهيّأ لمحركات البحث، وتسلّمه خلال أيام."],
    badge: ["1,100 ريال شامل الدومين والاستضافة لأول سنة"],
  },
};

const OLD_DOMAIN = /somecare\.shop/i;

function upgradeLegacy(key, value) {
  const legacy = LEGACY_DEFAULTS[key];
  if (!legacy && key !== "seo") return value;
  const out = { ...value };
  for (const [field, oldValues] of Object.entries(legacy || {})) {
    const v = String(out[field] ?? "").trim();
    // عنوان ووصف جوجل لا يُتركان فارغين، أما بقية الخانات فقد يفرّغها صاحب الموقع عمداً
    if (oldValues.includes(v) || (!v && key === "seo")) out[field] = defaultContent[key][field];
  }
  // الرابط المعتمد القديم يجعل canonical وخريطة الموقع تشير إلى somecare.shop
  if (key === "seo" && OLD_DOMAIN.test(String(out.siteUrl || ""))) out.siteUrl = SITE_URL;
  return out;
}

export function mergeContent(stored) {
  if (!stored || typeof stored !== "object") return defaultContent;
  const out = {};
  for (const key of Object.keys(defaultContent)) {
    const d = defaultContent[key];
    const s = stored[key];
    if (s === undefined || s === null) out[key] = d;
    else if (Array.isArray(d)) out[key] = Array.isArray(s) ? s : d;
    else if (typeof d === "object") out[key] = upgradeLegacy(key, { ...d, ...s });
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

// الأرقام العربية (٠١٢) والفارسية (۰۱۲) إلى أرقام لاتينية، لأن لوحة المفاتيح العربية تكتبها هكذا
export const latinDigits = (v) =>
  String(v || "")
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

// الآيبان بصيغة موحّدة: أرقام لاتينية، حروف كبيرة، بدون مسافات أو رموز
export const normalizeIban = (v) => latinDigits(v).toUpperCase().replace(/[^A-Z0-9]/g, "");

// التحقق من صحة الآيبان السعودي (SA + 22 رقم، مع رقم التحقق mod 97)
export function validIban(v) {
  const s = normalizeIban(v);
  if (!/^SA\d{22}$/.test(s)) return false;
  const r = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, (ch) => ch.charCodeAt(0) - 55);
  let m = 0;
  for (const ch of r) m = (m * 10 + Number(ch)) % 97;
  return m === 1;
}
