// المحتوى الافتراضي للموقع. أي تعديل من لوحة التحكم يُحفظ في قاعدة البيانات ويتغلّب على هذه القيم.
import SECURITY_V1 from "./security-v1.json";
import {
  BIG_STORE_DESC,
  BIG_STORE_DESC_EN,
  BIG_STORE_FEATURES,
  BIG_STORE_FEATURES_EN,
  BIG_STORE_NAME,
  BIG_STORE_NAME_EN,
} from "./big-store.js";

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
    title: "خدمات الأمن السيبراني في السعودية | اختبار اختراق | المطوّر حسن",
    description:
      "خدمات أمن سيبراني للشركات والجهات في السعودية: اختبار اختراق، حوكمة وامتثال لضوابط الهيئة الوطنية للأمن السيبراني وساما، أمن الأنظمة الصناعية، وDefend360 AI. الشريك الرسمي لـ SPG.",
    siteUrl: SITE_URL,
    ogImage: "/images/brand-og.png",
    // كلمات البحث وطرق كتابتها المختلفة (يقرؤها Bing، وجوجل يتعرف على الأشكال المختلفة للكلمة تلقائياً)
    keywords:
      "أمن سيبراني, الأمن السيبراني, خدمات الأمن السيبراني, شركة أمن سيبراني, امن سيبراني, الامن السيبراني, حماية سيبرانية, سايبر سكيورتي, اختبار اختراق, اختبارات الاختراق, ضوابط الهيئة الوطنية للأمن السيبراني, NCA ECC, Cybersecurity, Cyber Security, Penetration Testing, السعودية, الرياض",
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
    name: "المطور حسن",
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
    title: "خدمات الأمن السيبراني {تحمي أعمالك} قبل أن يبدأ الهجوم",
    subtitle:
      "نقدّم خدمات أمن سيبراني متكاملة للشركات والجهات في المملكة: نكشف ثغراتك قبل المهاجمين باختبارات الاختراق، ونبني الحوكمة والامتثال لضوابط الهيئة الوطنية للأمن السيبراني وساما، ونحمي أنظمتك الصناعية، مع دفاع ذكي بمنصة Defend360 AI. ونطوّر مواقعك وتطبيقاتك آمنة من أول سطر.",
    image: "/images/brand-logo.png",
    badge: "الشريك الرسمي لـ Security Professionals Group في السعودية",
    primaryButton: "اطلب استشارة أمنية",
    secondaryButton: "استعرض خدمات الأمن السيبراني",
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
      label: "الباقة الثانية · متجر إلكتروني",
      icon: "box",
      name: BIG_STORE_NAME,
      pricePrefix: "",
      price: "1,500",
      unit: "ريال",
      desc: BIG_STORE_DESC,
      features: BIG_STORE_FEATURES,
      image: "",
      featured: true,
    },
  ],
  addons: [
    {
      icon: "card",
      title: "بوابة دفع",
      desc: "مدى و Apple Pay و STC Pay داخل باقة المتجر الكبير شامل التطبيق",
      price: "مجاناً",
    },
    {
      icon: "truck",
      title: "ربط شركة شحن",
      desc: "داخل باقة المتجر الكبير شامل التطبيق",
      price: "مجاناً",
    },
    {
      icon: "headset",
      title: "الدعم الفني الشهري",
      desc: "صيانة ومتابعة مستمرة",
      price: "230 ريال / شهر",
    },
  ],
  // باقة الأمن السيبراني للشركات الكبرى: نحن الشريك الرسمي لـ Security Professionals Group (أستراليا) في المملكة.
  // المحتوى والصور مأخوذة من الملف التعريفي للشريك (public/files/spg-company-profile.pdf)
  security: {
    show: true,
    navLabel: "الأمن السيبراني",
    badge: "الشريك الرسمي في المملكة العربية السعودية",
    title: "الأمن السيبراني {للشركات والجهات الكبرى}",
    subtitle:
      "بصفتنا الشريك الرسمي لشركة Security Professionals Group الأسترالية في المملكة، نقدّم استشارات وحلول أمن سيبراني متكاملة: من اختبارات الاختراق والحوكمة والامتثال، إلى حماية الأنظمة الصناعية والدفاع السيبراني بالذكاء الاصطناعي.",
    image: "/images/spg/cover.jpg",
    // صورة إعلان الشراكة (شعارنا وشعار الشريك): تظهر بعد بطاقة الشريك مكان صورة الغلاف
    announcement: "/images/spg/partnership.jpg",
    partner: {
      name: "Security Professionals Group",
      headline: "الشريك الرسمي لشركة {Security Professionals Group} في المملكة العربية السعودية",
      country: "المقر الرئيسي: بيرث، أستراليا",
      url: "https://securitypro.com.au",
      logo: "/images/spg/spg-logo.png",
      text: "شركة أسترالية متخصصة في الأمن السيبراني يقودها خبراء حاصلون على شهادات CISSP وCISA وCISM وCEH، ولها مشاريع في أستراليا والشرق الأوسط. نتولى في المملكة التواصل والتعاقد والمتابعة، ويتولى فريقها المتخصص التنفيذ التقني.",
      // الملف التعريفي للشريك (زر تحميل في القسم)
      profile: "/files/spg-company-profile.pdf",
    },
    services: [
      {
        icon: "headset",
        title: "الخدمات الأمنية المُدارة",
        desc: "فريق أمن سيبراني ومستشار متخصص يعملان مع منشأتكم بشكل مستمر.",
        points: ["فريق أمن سيبراني مُدار", "مستشار أمن سيبراني مخصص لمنشأتكم", "متابعة ودعم تشغيلي مستمر"],
        image: "/images/spg/managed.jpg",
        url: "",
      },
      {
        icon: "shield",
        title: "هندسة وتصميم الأمن السيبراني",
        desc: "بنية أمنية تدمج الحماية في كل طبقة من بيئتكم التقنية، قابلة للتوسع ومتوافقة مع الأنظمة.",
        points: ["تقييم وتدقيق البنية الحالية", "تصميم وتنفيذ البنية الأمنية", "حماية السحابة والشبكات والأجهزة الطرفية"],
        image: "/images/spg/architecture.jpg",
        url: "",
      },
      {
        icon: "gear",
        title: "أمن الأنظمة التشغيلية والصناعية (OT)",
        desc: "حماية الأنظمة الصناعية مثل SCADA وICS لتقليل التوقف ومنع التخريب وضمان سلامة التشغيل.",
        points: ["تقييم أمن البيئات الصناعية", "تنفيذ الضوابط الأمنية وفق IEC 62443", "حماية أجهزة إنترنت الأشياء (IoT)"],
        image: "/images/spg/ot.jpg",
        url: "",
      },
      {
        icon: "search",
        title: "الأمن الهجومي واختبارات الاختراق",
        desc: "اختبارات دقيقة تكشف الثغرات قبل أن يصل إليها المهاجمون.",
        points: [
          "اختبار اختراق الويب والجوال والـ API والشبكات",
          "مراجعة أمنية للكود المصدري",
          "اختبارات الامتثال وتمارين الفريق الأحمر",
          "تقرير مفصّل بالثغرات وخطة معالجة",
        ],
        image: "/images/spg/offensive.jpg",
        url: "",
      },
      {
        icon: "award",
        title: "الحوكمة والمخاطر والامتثال (GRC)",
        desc: "مواءمة الأمن السيبراني مع أهداف أعمالكم، والالتزام بالأنظمة، وإدارة المخاطر.",
        points: [
          "تقييم الفجوات مقابل الضوابط الأساسية للأمن السيبراني (NCA ECC)",
          "إطار ساما للقطاع المالي ونظام حماية البيانات الشخصية",
          "السياسات والإجراءات وإدارة المخاطر وفق ISO 27001 وNIST",
        ],
        image: "/images/spg/grc.jpg",
        url: "",
      },
    ],
    solutionsTitle: "حلول ومنصات الشريك",
    solutions: [
      {
        name: "Defend360 AI",
        desc: "منصة الشريك الرئيسية للدفاع السيبراني بالذكاء الاصطناعي: الحوكمة والامتثال، والاستجابة للحوادث، وإدارة الثغرات والتحديثات، واستخبارات التهديدات في لوحة واحدة، سحابياً أو داخل منشأتكم.",
        image: "/images/spg/defend360.jpg",
        url: "https://defend360.ai",
      },
      {
        name: "Cybersecurity AI",
        desc: "حلول أمنية بالذكاء الاصطناعي: اختبارات هجومية ذكية (AI Offensive)، ووكيل أمني (AI Agent)، ومحلل أمني (AI Analyst).",
        image: "/images/spg/ai.jpg",
        url: "",
      },
      {
        name: "SMB Solutions",
        desc: "للمنشآت الصغيرة والمتوسطة: شبكات VPN آمنة، وجدران حماية وموجّهات، وحلول أمنية متكاملة.",
        image: "/images/spg/smb.jpg",
        url: "",
      },
    ],
    frameworksTitle: "أطر وأنظمة نساعدكم على الالتزام بها",
    frameworks: ["NCA ECC", "NCA CCC", "SAMA CSF", "PDPL", "ISO 27001", "NIST CSF", "PCI DSS", "IEC 62443"],
    credentialsTitle: "فريق معتمد دولياً",
    credentials: ["CISSP", "CISA", "CISM", "CRISC", "CEH", "SANS", "CREST"],
    sectorsTitle: "لمن هذه الباقة",
    sectors: ["البنوك والقطاع المالي", "الجهات الحكومية وشبه الحكومية", "القطاع الصحي", "الطاقة والصناعة", "الشركات الكبرى والمجموعات", "المنشآت الصغيرة والمتوسطة"],
    stepsTitle: "كيف نعمل",
    steps: [
      { title: "اجتماع تعريفي", desc: "نفهم بيئتكم وأولوياتكم ومتطلبات الجهات التنظيمية عليكم." },
      { title: "تحديد النطاق وعرض السعر", desc: "عرض فني ومالي رسمي بنطاق واضح ومدة تنفيذ، مع اتفاقية عدم إفصاح (NDA)." },
      { title: "التنفيذ", desc: "يعمل الفريق المتخصص على التقييم أو الاختبار أو البناء حسب النطاق المتفق عليه." },
      { title: "التقرير والمعالجة", desc: "تقرير للإدارة وآخر تقني، مع خطة معالجة وإعادة اختبار بعد الإصلاح." },
    ],
    faqTitle: "أسئلة شائعة عن الأمن السيبراني",
    faq: [
      {
        q: "ما خدمات الأمن السيبراني التي تقدمونها؟",
        a: "نقدّم للشركات والجهات في المملكة: اختبارات الاختراق والأمن الهجومي، والحوكمة والمخاطر والامتثال (GRC)، وهندسة وتصميم الأمن السيبراني، وأمن الأنظمة الصناعية (OT)، والخدمات الأمنية المُدارة، ومنصة Defend360 AI للدفاع السيبراني بالذكاء الاصطناعي.",
      },
      {
        q: "ما هو اختبار الاختراق ولماذا تحتاجه منشأتي؟",
        a: "اختبار الاختراق محاكاة منظّمة لهجوم حقيقي على أنظمتك وتطبيقاتك وشبكاتك، يكشف الثغرات قبل أن يستغلها المهاجمون، وينتهي بتقرير مفصّل وخطة معالجة. وهو أيضاً من متطلبات الضوابط الأساسية للأمن السيبراني (ECC).",
      },
      {
        q: "هل تساعدوننا على الالتزام بضوابط الهيئة الوطنية للأمن السيبراني؟",
        a: "نعم. نقيّم الفجوات مقابل الضوابط الأساسية للأمن السيبراني (NCA ECC) وضوابط الحوسبة السحابية، ونجهّز السياسات والإجراءات وخطة المعالجة استعداداً للتدقيق، وكذلك إطار ساما للقطاع المالي ونظام حماية البيانات الشخصية.",
      },
      {
        q: "هل تقدمون خدمات أمن سيبراني للمنشآت الصغيرة والمتوسطة؟",
        a: "نعم، عبر حلول SMB: شبكات VPN آمنة، وجدران حماية وموجّهات، وحلول أمنية متكاملة تناسب حجم المنشأة وميزانيتها.",
      },
      {
        q: "كم تكلفة خدمات الأمن السيبراني؟",
        a: "تختلف التكلفة حسب نطاق العمل وحجم الأنظمة. نبدأ باجتماع تعريفي، ثم نرسل عرضاً فنياً ومالياً رسمياً بنطاق واضح ومدة تنفيذ، مع اتفاقية عدم إفصاح.",
      },
      {
        q: "من ينفّذ الخدمات؟",
        a: "ينفّذها فريق Security Professionals Group المتخصص الحاصل على شهادات دولية مثل CISSP وCISA وCISM وCEH، ونتولى بصفتنا الشريك الرسمي في المملكة التواصل والتعاقد والمتابعة محلياً.",
      },
    ],
    priceLabel: "السعر",
    price: "حسب نطاق العمل",
    priceNote: "عرض سعر رسمي خلال أيام من الاجتماع التعريفي",
    button: "اطلب استشارة أمنية",
    // صور إضافية للباقة
    gallery: [],
    // بيانات صفحة /security في جوجل وعند مشاركة رابطها (واتساب وX ولينكدإن)
    seoTitle: "أمن سيبراني للشركات: اختبار اختراق وامتثال NCA وساما",
    seoDescription:
      "خدمات الأمن السيبراني للشركات في السعودية مع الشريك الرسمي لـ Security Professionals Group: اختبار الاختراق، الحوكمة والامتثال، أمن OT، الخدمات الأمنية المُدارة، وDefend360 AI.",
    ogImage: "/images/security-og.png",
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
    { src: "/images/card-02-app.jpg", caption: "باقة المتجر الكبير شامل التطبيق" },
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
        "الخدمة المعروضة هي تصميم موقع تعريفي بالسعر الموضح في الصفحة.\nالسعر 1,100 ريال يشمل تصميم الموقع والدومين والاستضافة لسنة واحدة، ما لم يُذكر غير ذلك في الباقة المختارة.\nمدة التسليم تقريبية وتبدأ بعد تأكيد المتطلبات ودفع المبلغ المتفق عليه.\nباقة المتجر الكبير شامل التطبيق بـ 1,500 ريال، وداخلها بوابة الدفع والشحن والدومين وواتساب مجاناً.",
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
    providerName: "المطور حسن",
    bankName: "",
    accountName: "المطور حسن",
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
      title: "Cybersecurity Services in Saudi Arabia | Penetration Testing | Hassan Developer",
      description:
        "Cybersecurity services for organizations in Saudi Arabia: penetration testing, NCA and SAMA compliance, OT security and Defend360 AI. Official partner of Australia's SPG.",
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
      title: "Cybersecurity services that {protect your business} before the attack begins",
      subtitle:
        "End-to-end cybersecurity services for organizations in Saudi Arabia: we find your vulnerabilities before attackers do with penetration testing, build governance and compliance with NCA and SAMA controls, protect your industrial systems, and add AI-driven defence with Defend360 AI. And we build your websites and apps secure from the first line of code.",
      badge: "Official partner of Security Professionals Group in Saudi Arabia",
      primaryButton: "Request a security consultation",
      secondaryButton: "Explore cybersecurity services",
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
        label: "Package 2 · E-commerce",
        name: BIG_STORE_NAME_EN,
        desc: BIG_STORE_DESC_EN,
        features: BIG_STORE_FEATURES_EN,
      },
    ],
    addons: [
      { title: "Payment gateway", desc: "Mada, Apple Pay and STC Pay, included in the large store package with the app", price: "Free" },
      { title: "Shipping company integration", desc: "Included in the large store package with the app", price: "Free" },
      { title: "Monthly technical support", desc: "Ongoing maintenance and follow-up" },
    ],
    security: {
      navLabel: "Cybersecurity",
      badge: "Official partner in the Kingdom of Saudi Arabia",
      title: "Cybersecurity for {enterprises and large organizations}",
      subtitle:
        "As the official partner of Australia's Security Professionals Group in Saudi Arabia, we deliver end-to-end cybersecurity consulting and solutions: from penetration testing, governance and compliance to OT protection and AI-driven cyber defence.",
      partner: {
        headline: "Official partner of {Security Professionals Group} in the Kingdom of Saudi Arabia",
        country: "Headquarters: Perth, Australia",
        text: "An Australian cybersecurity company led by experts holding CISSP, CISA, CISM and CEH credentials, with projects across Australia and the Middle East. In Saudi Arabia we handle communication, contracting and follow-up, while its specialist team delivers the technical work.",
      },
      services: [
        {
          title: "Managed security services",
          desc: "A cybersecurity team and a dedicated consultant working with your organization on an ongoing basis.",
          points: ["Managed cybersecurity team", "A cybersecurity consultant dedicated to your organization", "Continuous operational follow-up and support"],
        },
        {
          title: "Security architecture & design",
          desc: "An architecture that builds security into every layer of your IT environment, scalable and compliant.",
          points: ["Assessment and audit of your current architecture", "Security architecture design and implementation", "Cloud, network and endpoint protection"],
        },
        {
          title: "OT & industrial security",
          desc: "Securing industrial systems such as SCADA and ICS to minimize downtime, prevent sabotage and keep operations safe.",
          points: ["Industrial environment security assessment", "Implementing controls aligned with IEC 62443", "IoT device protection"],
        },
        {
          title: "Offensive security & penetration testing",
          desc: "Precision testing that uncovers vulnerabilities before attackers do.",
          points: [
            "Web, mobile, API and network penetration testing",
            "Secure source code review",
            "Compliance testing and Red Team exercises",
            "Detailed vulnerability report with a remediation plan",
          ],
        },
        {
          title: "Governance, risk & compliance (GRC)",
          desc: "Aligning cybersecurity with your business objectives, regulatory compliance and risk management.",
          points: [
            "Gap assessment against the NCA Essential Cybersecurity Controls (ECC)",
            "SAMA framework for the financial sector and the Personal Data Protection Law (PDPL)",
            "Policies, procedures and risk management aligned with ISO 27001 and NIST",
          ],
        },
      ],
      solutionsTitle: "Partner solutions & platforms",
      solutions: [
        { desc: "SPG's flagship AI-native cyber defence platform: governance and compliance, incident response, vulnerability and patch management, and threat intelligence in one command centre, as SaaS or on-premises." },
        { desc: "AI-powered security: AI Offensive testing, an AI security Agent and an AI security Analyst." },
        { desc: "For small and medium businesses: secure VPN, firewalls and routers, and integrated security solutions." },
      ],
      frameworksTitle: "Frameworks and regulations we help you comply with",
      credentialsTitle: "Internationally certified team",
      sectorsTitle: "Who this package is for",
      sectors: ["Banks and financial services", "Government and semi-government entities", "Healthcare", "Energy and industry", "Large companies and groups", "Small and medium businesses"],
      stepsTitle: "How we work",
      steps: [
        { title: "Discovery meeting", desc: "We understand your environment, priorities and regulatory requirements." },
        { title: "Scope and quotation", desc: "An official technical and financial proposal with a clear scope and timeline, plus an NDA." },
        { title: "Delivery", desc: "The specialist team carries out the assessment, testing or build within the agreed scope." },
        { title: "Report and remediation", desc: "An executive report and a technical report, with a remediation plan and retesting after fixes." },
      ],
      faqTitle: "Cybersecurity FAQ",
      faq: [
        {
          q: "Which cybersecurity services do you offer?",
          a: "For organizations in Saudi Arabia we offer penetration testing and offensive security, governance, risk and compliance (GRC), security architecture and design, OT security, managed security services, and the Defend360 AI cyber defence platform.",
        },
        {
          q: "What is penetration testing and why does my organization need it?",
          a: "A penetration test is a structured simulation of a real attack on your systems, applications and networks. It uncovers vulnerabilities before attackers exploit them and ends with a detailed report and remediation plan. It is also required by the NCA Essential Cybersecurity Controls (ECC).",
        },
        {
          q: "Can you help us comply with the NCA cybersecurity controls?",
          a: "Yes. We assess gaps against the NCA Essential Cybersecurity Controls (ECC) and Cloud Cybersecurity Controls, and prepare policies, procedures and a remediation plan ahead of audits, as well as the SAMA framework for the financial sector and the Personal Data Protection Law.",
        },
        {
          q: "Do you offer cybersecurity for small and medium businesses?",
          a: "Yes, through SMB solutions: secure VPN, firewalls and routers, and integrated security solutions that fit the size and budget of the business.",
        },
        {
          q: "How much do cybersecurity services cost?",
          a: "Cost depends on the scope of work and the size of your systems. We start with a discovery meeting, then send an official technical and financial proposal with a clear scope and timeline, plus an NDA.",
        },
        {
          q: "Who delivers the services?",
          a: "Security Professionals Group's specialist team, holding international credentials such as CISSP, CISA, CISM and CEH, delivers the work, while we handle communication, contracting and follow-up locally as its official partner in Saudi Arabia.",
        },
      ],
      priceLabel: "Price",
      price: "Based on scope of work",
      priceNote: "Official quotation within days of the discovery meeting",
      button: "Request a security consultation",
      seoTitle: "Cybersecurity for Enterprises: Penetration Testing & NCA Compliance",
      seoDescription:
        "Cybersecurity services for organizations in Saudi Arabia with the official partner of Security Professionals Group: penetration testing, GRC, OT security, managed security and Defend360 AI.",
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
      name: "Developer Hassan",
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
      { caption: "Large store package with the app" },
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
    title: ["المطوّر حسن | أمن سيبراني واختبارات اختراق للشركات في السعودية", "تصميم مواقع وتطبيقات احترافية | موقع تعريفي بـ 1,100 ريال", "المطوّر حسن | تطبيقات جوال ومواقع تعريفية ومتاجر إلكترونية"],
    description: ["دفاع سيبراني متكامل للشركات في السعودية: اختبارات اختراق، حوكمة وامتثال لضوابط NCA وساما، أمن الأنظمة الصناعية، وDefend360 AI. الشريك الرسمي لـ SPG الأسترالية، مع تطوير مواقع وتطبيقات آمنة.", 
      "نصمم مواقع تعريفية وتطبيقات جوال ومتاجر إلكترونية لشركتك، مع لوحة تحكم كاملة وسرعة فائقة. تواصل معنا واتساب على مدار الساعة.",
      "نبني تطبيقات جوال (iOS + Android) ومواقع تعريفية احترافية ومتاجر إلكترونية متكاملة لشركتك، مع لوحة تحكم كاملة وسرعة فائقة. تواصل معنا واتساب.",
    ],
  },
  brand: {
    name: ["اسم شركتك"],
    tagline: ["مواقع وتطبيقات ومتاجر"],
  },
  security: {
    seoTitle: ["الشريك الرسمي لـ SPG في السعودية | الأمن السيبراني للشركات"],
    seoDescription: ["الشريك الرسمي لشركة Security Professionals Group الأسترالية في المملكة: اختبارات الاختراق، الحوكمة والامتثال لضوابط NCA وساما، أمن الأنظمة الصناعية، وDefend360 AI."],
  },
  // نصوص الواجهة قبل اعتماد الأمن السيبراني كخدمة أساسية
  hero: {
    title: ["دفاع سيبراني {يحمي أعمالك} قبل أن يبدأ الهجوم", "موقع تعريفي احترافي لشركتك، بتحكم كامل وسرعة فائقة", "تطبيقات جوال + {مواقع تعريفية احترافية} لشركتك"],
    // وأي نص قديم عن بناء موقع تعريفي (حتى لو عدّله صاحب الموقع) يُستبدل بنص الأمن السيبراني
    subtitle: [/^نبني لك موقعاً يعكس هوية شركتك/, "نكشف ثغراتك قبل المهاجمين، ونبني لمنشأتك حماية متكاملة متوافقة مع ضوابط الهيئة الوطنية للأمن السيبراني وساما: اختبارات اختراق، حوكمة وامتثال، أمن الأنظمة الصناعية، ودفاع ذكي بمنصة Defend360 AI. ونطوّر مواقعك وتطبيقاتك آمنة من أول سطر.", 
      "نبني لك موقعاً يعكس هوية شركتك، متجاوباً مع كل الأجهزة، ومهيّأ لمحركات البحث، وتسلّمه خلال أيام.",
      "نبني لك تطبيق جوال (iOS + Android) مع لوحة تحكم كاملة وموقع تعريفي مرافق، أو متجر إلكتروني متكامل حسب احتياج مشروعك.",
    ],
    // أي شارة سعر «... ريال شامل الدومين والاستضافة» (بأي مبلغ) تُستبدل بشارة الشراكة
    badge: ["حلول رقمية للشركات والمتاجر", /ريال\s*شامل\s*الدومين/],
    primaryButton: ["اطلب الآن عبر واتساب"],
    secondaryButton: ["استعرض الباقات"],
  },
};

// نفس الفكرة للنسخة الإنجليزية (en.hero و en.seo)
const LEGACY_EN = {
  seo: {
    title: ["Hassan Developer | Cybersecurity & Penetration Testing in Saudi Arabia", "Hassan Developer | Mobile Apps, Websites, E-commerce & Cybersecurity"],
    description: ["End-to-end cyber defence for organizations in Saudi Arabia: penetration testing, NCA and SAMA compliance, OT security and Defend360 AI. Official partner of Australia's SPG, plus secure websites and apps.", 
      "Mobile apps (iOS + Android), professional business websites and full e-commerce stores with a complete admin panel, plus enterprise cybersecurity services in Saudi Arabia.",
    ],
  },
  hero: {
    title: ["Cyber defence that {protects your business} before the attack begins", "Mobile apps + {professional websites} for your business"],
    subtitle: ["We find your vulnerabilities before attackers do and build end-to-end protection aligned with NCA and SAMA controls: penetration testing, governance and compliance, OT security and AI-driven defence with Defend360 AI. And we build your websites and apps secure from the first line of code.", 
      "We build your mobile app (iOS + Android) with a complete admin panel and a companion website, or a full e-commerce store tailored to your project.",
    ],
    badge: ["Digital solutions for companies and stores"],
    primaryButton: ["Order now on WhatsApp"],
    secondaryButton: ["View packages"],
  },
  security: {
    seoTitle: ["Official SPG Partner in Saudi Arabia | Enterprise Cybersecurity"],
    seoDescription: ["Official partner of Australia's Security Professionals Group in Saudi Arabia: penetration testing, GRC and NCA/SAMA compliance, OT security and Defend360 AI."],
  },
};

function upgradeLegacyEn(en) {
  if (!en || typeof en !== "object") return en;
  const out = { ...en };
  for (const [sec, fields] of Object.entries(LEGACY_EN)) {
    if (!out[sec] || typeof out[sec] !== "object") continue;
    out[sec] = { ...out[sec] };
    for (const [f, olds] of Object.entries(fields)) {
      if (olds.includes(String(out[sec][f] ?? "").trim())) out[sec][f] = defaultContent.en[sec][f];
    }
  }
  return out;
}

const OLD_DOMAIN = /somecare\.shop/i;

function upgradeLegacy(key, value) {
  const legacy = LEGACY_DEFAULTS[key];
  if (!legacy && key !== "seo") return value;
  const out = { ...value };
  for (const [field, oldValues] of Object.entries(legacy || {})) {
    const v = String(out[field] ?? "").trim();
    const isOld = oldValues.some((o) => (o instanceof RegExp ? o.test(v) : o === v));
    // عنوان ووصف جوجل لا يُتركان فارغين، أما بقية الخانات فقد يفرّغها صاحب الموقع عمداً
    if (isOld || (!v && key === "seo")) out[field] = defaultContent[key][field];
  }
  // الرابط المعتمد القديم يجعل canonical وخريطة الموقع تشير إلى somecare.shop
  if (key === "seo" && OLD_DOMAIN.test(String(out.siteUrl || ""))) out.siteUrl = SITE_URL;
  return out;
}

// محتوى باقة الأمن السيبراني المحفوظ من النسخة الأولى (قبل اعتماد الملف التعريفي للشريك):
// إذا لم يعدّله صاحب الموقع يُستبدل بالمحتوى الجديد، وإن عدّله يبقى كما هو.
const SECURITY_NEW_KEYS = ["url", "seoTitle", "seoDescription", "ogImage"];
const sameAs = (a, b) => {
  const norm = (o) => JSON.stringify(o, (k, v) => (SECURITY_NEW_KEYS.includes(k) ? undefined : v));
  return norm(a) === norm(b);
};
function upgradeSecurity(key, s) {
  if (key === "security" && sameAs(s, SECURITY_V1.ar)) return defaultContent.security;
  if (key === "en") {
    const en = upgradeLegacyEn(s);
    if (!en?.security) return en;
    if (sameAs(en.security, SECURITY_V1.en)) return { ...en, security: defaultContent.en.security };
    // الخانات الجديدة (مثل الأسئلة الشائعة) تُؤخذ ترجمتها الافتراضية إن لم تكن محفوظة
    return { ...en, security: { ...defaultContent.en.security, ...en.security } };
  }
  return s;
}

const BIG_STORE_NAMES = new Set(["متجر كبير", "باقة المتجر الكبير", BIG_STORE_NAME]);

const RETIRED_PACKAGES = new Set([
  "متجر صغير",
  "متجر متوسط",
  "باقة تطبيق خدمات",
  "Small store",
  "Medium store",
  "Services app package",
]);

function isRetiredPackage(p) {
  return RETIRED_PACKAGES.has(String(p?.name || "").trim());
}

function asBigStore(p, template) {
  return {
    ...template,
    icon: p?.icon || template.icon,
    image: p?.image || "",
    label: template.label,
    name: template.name,
    pricePrefix: template.pricePrefix,
    price: template.price,
    unit: template.unit,
    desc: template.desc,
    features: [...template.features],
    featured: true,
  };
}

function upgradeFreeAddons(list) {
  if (!Array.isArray(list)) return list;
  return list.map((a) => {
    const title = String(a?.title || "");
    if (/دعم|support/i.test(title)) return a;
    if (!/دفع|شحن|payment|shipping/i.test(title)) return a;
    const en = /payment|shipping/i.test(title) && !/[\u0600-\u06FF]/.test(title);
    return {
      ...a,
      price: en ? "Free" : "مجاناً",
      desc: en ? "Included in the large store package with the app" : "داخل باقة المتجر الكبير شامل التطبيق",
    };
  });
}

// أسعار المتجر والتطبيق القديمة تُزال عند القراءة حتى لا يبقى رقم مخالف لـ 1,500 في المحتوى المحفوظ.
function alignStoreOffer(content) {
  const template = defaultContent.packages.find((p) => p.name === BIG_STORE_NAME);
  const enTemplate = defaultContent.en.packages.find((p) => p.name === BIG_STORE_NAME_EN);
  if (!template || !enTemplate) return content;
  const packages = Array.isArray(content.packages) ? content.packages : [];
  const kept = [];
  const keptIdx = [];
  let hasBig = false;
  packages.forEach((p, i) => {
    if (!p || typeof p !== "object" || isRetiredPackage(p)) return;
    const name = String(p.name || "").trim();
    if (BIG_STORE_NAMES.has(name)) {
      if (hasBig) return;
      hasBig = true;
      kept.push(asBigStore(p, template));
      keptIdx.push(i);
      return;
    }
    kept.push(p);
    keptIdx.push(i);
  });
  if (!hasBig) {
    kept.push(template);
    keptIdx.push(-1);
  }
  const en = content.en && typeof content.en === "object" ? { ...content.en } : null;
  if (en) {
    const src = Array.isArray(en.packages) ? en.packages : [];
    en.packages = keptIdx.map((i, pos) => {
      if (kept[pos]?.name === BIG_STORE_NAME) {
        return { label: enTemplate.label, name: enTemplate.name, desc: enTemplate.desc, features: [...enTemplate.features] };
      }
      const item = i >= 0 && src[i] && typeof src[i] === "object" && !isRetiredPackage(src[i]) ? src[i] : {};
      return item;
    });
    en.addons = upgradeFreeAddons(en.addons);
  }
  return { ...content, packages: kept, addons: upgradeFreeAddons(content.addons), ...(en ? { en } : {}) };
}

export function mergeContent(stored) {
  if (!stored || typeof stored !== "object") return defaultContent;
  const out = {};
  for (const key of Object.keys(defaultContent)) {
    const d = defaultContent[key];
    const s = upgradeSecurity(key, stored[key]);
    if (s === undefined || s === null) out[key] = d;
    else if (Array.isArray(d)) out[key] = Array.isArray(s) ? s : d;
    else if (typeof d === "object") out[key] = upgradeLegacy(key, { ...d, ...s });
    else out[key] = s;
  }
  return alignStoreOffer(out);
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
