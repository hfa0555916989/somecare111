// نموذج أسعار منصة المتجر المستقلة. المصدر الوحيد للأرقام الظاهرة للزائر.
// لا توجد اشتراكات: المتجر شراء لمرة واحدة بـ 8,500 ريال، والموقع التعريفي 2,300 ريال.
// بوابات الدفع والشحن وفاتورة زاتكا جزء من المنصة.
// لا يُدّعى نظام محاسبي ولا توليد بنرات بالذكاء الاصطناعي ولا استيراد بالذكاء الاصطناعي.

export const STORE_PRICE = 8500;
export const WEBSITE_PRICE = 2300;

export const PURCHASE_NAME = "شراء المتجر";
export const PURCHASE_NAME_EN = "Store purchase";
// أسماء قديمة تُستخدم في أماكن أخرى، وتشير الآن إلى الشراء
export const SUBSCRIPTION_NAME = PURCHASE_NAME;
export const SUBSCRIPTION_NAME_EN = PURCHASE_NAME_EN;

export const WA_TEXT = "السلام عليكم، أبغى عرض المتجر بـ 8500 ريال";

export const OFFER_DESC_AR =
  "متجرك الإلكتروني الجاهز بـ 8,500 ريال شراءً لمرة واحدة بدون اشتراكات: نسخة مستقلة لك بكل مزايا المنصة الحالية، وربط بوابات الدفع وشركات الشحن، واستضافة مجانية لمدة سنة، ودعم فني مجاني لمدة سنة، ودومين مجاني. والمواقع التعريفية بـ 2,300 ريال.";

export const OFFER_DESC_EN =
  "Your ready online store for 8,500 SAR, a one-time purchase with no subscriptions: your own independent instance with every current platform feature, payment gateway and shipping carrier integration, free hosting for one year, free technical support for one year, and a free domain. Business websites are 2,300 SAR.";

const FAST_AR = "تسليم سريع، والموعد يتوقف على تسليمك للمحتوى في وقته";
const FAST_EN = "Fast delivery, and the date depends on you providing the content on time";
const BUG_AR = "الدعم الفني يشمل إصلاح الأعطال. الميزات الجديدة تتسعّر بشكل منفصل";
const BUG_EN = "Technical support covers bug fixes. A new feature request is quoted and paid separately";
const ACCOUNTS_AR = "نشر التطبيق على App Store وGoogle Play يعتمد على مراجعة المتجر، وغالباً من أسبوع إلى أسبوعين، ويحتاج حسابات المطوّر الخاصة بالعميل (رسوم Apple السنوية ورسوم Google لمرة واحدة)";
const ACCOUNTS_EN = "Publishing on the App Store and Google Play depends on store review, usually about one to two weeks, and needs the client's own developer accounts (Apple's annual fee and Google's one-time fee)";

export const PURCHASE_FEATURES_AR = [
  "شراء لمرة واحدة بدون أي اشتراك",
  "نسخة مستقلة من المنصة بكل المزايا الحالية",
  "ربط بوابات الدفع وشركات الشحن",
  "تطبيق iOS وAndroid للمتجر، ونشره يعتمد على مراجعة App Store وGoogle Play",
  "استضافة مجانية لمدة سنة",
  "دعم فني مجاني لمدة سنة",
  "دومين مجاني",
  "الهوية واستيراد المنتجات وتدريبك على لوحة التحكم",
  FAST_AR,
  BUG_AR,
];

export const PURCHASE_FEATURES_EN = [
  "One-time purchase with no subscription",
  "Your own independent instance with every current feature",
  "Payment gateway and shipping carrier integration",
  "iOS and Android app for the store, with publishing subject to App Store and Google Play review",
  "Free hosting for one year",
  "Free technical support for one year",
  "Free domain",
  "Branding, product import, and training on the dashboard",
  FAST_EN,
  BUG_EN,
];
export const SUBSCRIPTION_FEATURES_AR = PURCHASE_FEATURES_AR;
export const SUBSCRIPTION_FEATURES_EN = PURCHASE_FEATURES_EN;

export const STORE_PACKAGES_AR = [
  {
    label: "شراء بدون اشتراكات",
    icon: "store",
    name: "المتجر الإلكتروني الجاهز",
    pricePrefix: "",
    price: "8,500",
    unit: "ريال مرة واحدة",
    desc: "متجر إلكتروني جاهز باسمك، تشتريه مرة واحدة بدون اشتراكات، مع الربط بالدفع والشحن واستضافة ودعم فني لسنة ودومين مجاني.",
    features: PURCHASE_FEATURES_AR,
    tiers: [
      { label: "المتجر", price: "8,500", unit: "ريال مرة واحدة" },
      { label: "الاستضافة", price: "سنة", unit: "مجاناً" },
      { label: "الدعم الفني", price: "سنة", unit: "مجاناً" },
      { label: "الدومين", price: "مجاني", unit: "" },
    ],
    image: "",
    featured: true,
  },
];

const AFTER_AR = () => "بعد التسليم: دعم فني مجاني لإصلاح الأعطال، وأي تطوير لاحق بعرض سعر منفصل";
const AFTER_EN = () => "After delivery: free bug-fix support, and any later work is quoted separately";

export const PROJECT_PACKAGES_AR = [
  {
    label: "مواقع تعريفية",
    icon: "monitor",
    name: "موقع تعريفي",
    pricePrefix: "",
    price: "2300",
    unit: "ريال",
    desc: "موقع تعريفي احترافي لنشاطك أو شركتك، بسعر ثابت يُدفع مرة واحدة.",
    features: ["تصميم احترافي متجاوب لكل الأجهزة", "لوحة تحكم مع إحصائيات لمراقبة الزوار", "استضافة مجانية لمدة سنة", "دعم فني مجاني لمدة سنة", "دومين مجاني", "تهيئة SEO", "زر واتساب ونموذج تواصل", "سعر ثابت مرة واحدة بدون اشتراك", FAST_AR],
    oneTime: true,
    image: "",
    featured: false,
  },
  {
    label: "مواقع وتطبيقات خدمية",
    icon: "phone",
    name: "موقع خدمي + تطبيق iOS وAndroid",
    pricePrefix: "",
    price: "11,000",
    unit: "ريال مرة واحدة",
    desc: "موقع خدمي لاستقبال الطلبات أو الحجوزات مع تطبيق iOS وAndroid ولوحة تحكم واحدة، بسعر ثابت يُدفع مرة واحدة.",
    features: ["موقع خدمي لاستقبال الطلبات أو الحجوزات", "تطبيق جوال iOS وAndroid للعملاء", "لوحة تحكم لإدارة الطلبات والمحتوى", "حسابات للعملاء وإشعارات فورية", "سعر ثابت مرة واحدة بدون اشتراك", AFTER_AR(), FAST_AR, ACCOUNTS_AR],
    oneTime: true,
    image: "",
    featured: false,
  },
];

export const PROJECT_PACKAGES_EN = [
  {
    label: "Business websites",
    name: "Business website",
    desc: "A professional website for your business or company, at a fixed one-time price.",
    features: ["Professional responsive design for every device", "Control panel with visitor statistics", "Free hosting for one year", "Free technical support for one year", "Free domain", "SEO setup", "WhatsApp button and contact form", "Fixed one-time price, no subscription", FAST_EN],
  },
  {
    label: "Service websites and apps",
    name: "Service website + iOS and Android app",
    desc: "A service website for orders or bookings with an iOS and Android app and one dashboard, at a fixed one-time price.",
    features: ["Service website for orders or bookings", "iOS and Android customer app", "Dashboard to manage orders and content", "Customer accounts and push notifications", "Fixed one-time price, no subscription", AFTER_EN(), FAST_EN, ACCOUNTS_EN],
  },
];

export const STORE_PACKAGES_EN = [
  {
    label: "One-time purchase, no subscriptions",
    name: "Ready online store",
    unit: "SAR one-time",
    desc: "A ready online store in your name, bought once with no subscriptions, with payment and shipping integration, a year of hosting and support, and a free domain.",
    features: PURCHASE_FEATURES_EN,
    tiers: [
      { label: "Store", price: "8,500", unit: "SAR one-time" },
      { label: "Hosting", price: "1 year", unit: "free" },
      { label: "Technical support", price: "1 year", unit: "free" },
      { label: "Domain", price: "Free", unit: "" },
    ],
  },
]

// باقات المتجر أولاً، ثم المواقع والتطبيقات الخدمية (الترتيب نفسه في العربي والإنجليزي)
export const PACKAGES_AR = [...STORE_PACKAGES_AR, ...PROJECT_PACKAGES_AR];
export const PACKAGES_EN = [...STORE_PACKAGES_EN, ...PROJECT_PACKAGES_EN];

export const ADDONS_AR = [
  {
    icon: "card",
    title: "بوابات الدفع",
    desc: "ميسر، تابي، تمارا، مصرف الراجحي، والدفع عند الاستلام.",
    price: "ضمن التجهيز",
  },
  {
    icon: "truck",
    title: "شركات الشحن",
    desc: "أرامكس، سمسا، أوتو، طرود، والبريد السعودي.",
    price: "ضمن التجهيز",
  },
  {
    icon: "award",
    title: "فاتورة زاتكا",
    desc: "فاتورة إلكترونية مع رمز QR.",
    price: "ضمن المنصة",
  },
  {
    icon: "phone",
    title: "استضافة ودعم فني",
    desc: "استضافة مجانية ودعم فني مجاني لمدة سنة كاملة مع المتجر.",
    price: "سنة مجاناً",
  },
  {
    icon: "bell",
    title: "الدومين",
    desc: "دومين باسم متجرك مع شهادة SSL.",
    price: "مجاني",
  },
  {
    icon: "headset",
    title: "بدون اشتراكات",
    desc: "تدفع 8,500 ريال مرة واحدة فقط. الميزات الجديدة بعد التسليم تتسعّر بشكل منفصل.",
    price: "مرة واحدة",
  },
];

export const ADDONS_EN = [
  {
    title: "Payment gateways",
    desc: "Moyasar, Tabby, Tamara, Al Rajhi and cash on delivery.",
    price: "Included in setup",
  },
  {
    title: "Shipping carriers",
    desc: "Aramex, SMSA, OTO, Torod and Saudi Post.",
    price: "Included in setup",
  },
  {
    title: "ZATCA e-invoice",
    desc: "An e-invoice with a QR code.",
    price: "Included",
  },
  {
    title: "Hosting and support",
    desc: "Free hosting and free technical support for a full year with the store.",
    price: "1 year free",
  },
  {
    title: "Domain",
    desc: "A domain in your store's name with an SSL certificate.",
    price: "Free",
  },
  {
    title: "No subscriptions",
    desc: "You pay 8,500 SAR once. New features after delivery are quoted separately.",
    price: "One-time",
  },
];

export const FEATURES_AR = [
  { icon: "clock", title: "تسليم سريع", desc: "نبدأ بعد تأكيد الطلب واستلام المحتوى. لا نعد بعدد أيام ثابت، لأن الموعد يتوقف على تسليمك للمحتوى في وقته." },
  { icon: "gear", title: "تحكم كامل بالمحتوى", desc: "تعدّل النصوص والصور والأسعار من لوحة التاجر بدون خبرة تقنية." },
  { icon: "shield", title: "دعم وإصلاح أعطال", desc: "دعم فني مجاني لمدة سنة يشمل إصلاح الأعطال. الميزات الجديدة تتسعّر بشكل منفصل." },
  { icon: "bolt", title: "سرعة فائقة", desc: "صفحات تفتح بسرعة وتحافظ على زوّارك." },
  { icon: "search", title: "تهيئة SEO", desc: "أساسات قوية لظهور المتجر في نتائج البحث." },
  { icon: "chart", title: "تحليلات الزوار", desc: "من لوحة التاجر ترى الزيارات والزوار الحاليين." },
];

export const FEATURES_EN = [
  { title: "Fast delivery", desc: "We start after the order is confirmed and the content arrives. We do not promise a fixed number of days, because the date depends on you providing the content on time." },
  { title: "Full control of your content", desc: "Edit text, images and prices from the merchant dashboard, with no technical skills needed." },
  { title: "Support and bug fixes", desc: "Free technical support for one year, including bug fixes. A new feature is quoted on its own." },
  { title: "Blazing-fast speed", desc: "Pages load quickly and keep your visitors." },
  { title: "SEO setup", desc: "Strong foundations for showing up in search results." },
  { title: "Visitor analytics", desc: "From the merchant dashboard you can see visits and who is on the store right now." },
];

// وصف الباقات السابق (المتجر فقط)، يُستبدل بالجديد في المحتوى المحفوظ
const STORE_ONLY_SUB_AR = "الاشتراك هو الخيار الذي نوصي به. الأسعار نطاقات بالريال السعودي، وتُثبَّت في عرض السعر حسب حجم المتجر.";
const STORE_ONLY_SUB_EN = "The subscription is the option we recommend. Prices are ranges in Saudi riyals and are fixed in the quote according to the size of the store.";

export const TITLES_AR = {
  packages: "الباقات {والأسعار}",
  packagesSub: "بدون اشتراكات: المتجر الإلكتروني بـ 8,500 ريال مرة واحدة مع استضافة ودعم فني لسنة ودومين مجاني، والموقع التعريفي بـ 2,300 ريال. والموقع الخدمي مع التطبيق بـ 11,000 ريال مرة واحدة.",
  addons: "الدفع والشحن {والاستضافة}",
  addonsSub: "بوابات الدفع وشركات الشحن وفاتورة زاتكا جزء من المنصة، والاستضافة والدعم الفني لسنة والدومين مجاناً مع المتجر.",
};

export const TITLES_EN = {
  packages: "Packages {and pricing}",
  packagesSub: "No subscriptions: the online store is 8,500 SAR once with a year of hosting and support and a free domain, and a business website is 2,300 SAR. A service website with an iOS and Android app is 11,000 SAR once.",
  addons: "Payment, shipping {and hosting}",
  addonsSub: "Payment gateways, carriers and the ZATCA QR invoice are part of the platform, and a year of hosting and support plus the domain are free with the store.",
};

export const NOTE_AR =
  "كل عميل يأخذ نسخة مستقلة يشتريها مرة واحدة بدون اشتراكات. الاستضافة والدعم الفني مجاناً لمدة سنة، والدومين مجاني. الميزات الجديدة تتسعّر بشكل منفصل.";

export const NOTE_EN =
  "Each client gets an independent instance bought once, with no subscriptions. Hosting and technical support are free for one year, and the domain is free. A new feature is a separate quote.";

export const ORIGINAL_TERMS_AR = `المتجر الإلكتروني بـ 8,500 ريال شراءً لمرة واحدة بدون اشتراكات.
يشمل كل مزايا المنصة الحالية، وربط بوابات الدفع وشركات الشحن، واستضافة مجانية لمدة سنة، ودعماً فنياً مجانياً لمدة سنة، ودوميناً مجانياً.
الموقع التعريفي بـ 2,300 ريال تُدفع مرة واحدة.
مدة التسليم تقريبية وتبدأ بعد تأكيد المتطلبات ودفع المبلغ المتفق عليه.`;

export const ORIGINAL_TERMS_EN = `The online store is 8,500 SAR, a one-time purchase with no subscriptions.
It includes every current platform feature, payment gateway and shipping carrier integration, free hosting for one year, free technical support for one year, and a free domain.
A business website is 2,300 SAR, paid once.
Delivery time is approximate and starts after the requirements are confirmed and the agreed amount is paid.`;

// يُبقي نص الصفحة الذي يرتب في البحث، ويضيف النطاق الحالي تحته إن لم يكن موجوداً.
export function withRankedTerms(body, original, extra) {
  let text = String(body || "").trim();
  const origin = String(original || "").trim();
  const lead = origin.split("\n")[0];
  if (lead && !text.includes(lead)) text = text ? `${origin}\n\n${text}` : origin;
  const extraLead = String(extra || "").trim().split("\n")[0];
  if (extraLead && !text.includes(extraLead)) text = text ? `${text}\n\n${extra}` : extra;
  return text;
}

export const TERMS_AR = `المنصة متجر إلكتروني مستقل لكل عميل، بدون اشتراكات.

المتجر: 8,500 ريال شراءً لمرة واحدة، ويشمل كل المزايا الحالية، وربط بوابات الدفع (ميسر، تابي، تمارا، مصرف الراجحي، والدفع عند الاستلام) وشركات الشحن (أرامكس، سمسا، أوتو، طرود، والبريد السعودي)، وفاتورة زاتكا مع رمز QR.
مع المتجر مجاناً: استضافة لمدة سنة، ودعم فني لمدة سنة، ودومين.
الموقع التعريفي: 2,300 ريال مرة واحدة.

الدعم الفني يشمل إصلاح الأعطال في ما تم تسليمه. الميزات الجديدة تتسعّر بشكل منفصل.
التسليم سريع ويتوقف على تسليم المحتوى في وقته، ولا نعد بعدد أيام ثابت.`;

export const TERMS_EN = `The platform is an independent online store for each client, with no subscriptions.

Store: 8,500 SAR as a one-time purchase, including every current feature, payment gateways (Moyasar, Tabby, Tamara, Al Rajhi and cash on delivery), shipping carriers (Aramex, SMSA, OTO, Torod and Saudi Post), and a ZATCA e-invoice with a QR code.
Free with the store: one year of hosting, one year of technical support, and a domain.
Business website: 2,300 SAR, paid once.

Technical support covers defects in what was delivered. Any new feature request is quoted and paid separately.
Delivery is fast and depends on the content arriving on time. We do not promise a fixed number of days.`;

// سطر الدفع يحيل إلى جدول الدفعات في الوثيقة (lib/quote-defaults.js يبني الجدول)
export const PAYMENT_TERM_AR = "الدفعات حسب جدول الدفعات في هذه الوثيقة، بالتحويل البنكي على الحساب الموضح فيها فقط.";

export const QUOTE_TERMS_AR = [
  PAYMENT_TERM_AR,
  "مدة التنفيذ تتوقف على تسليم المحتوى في وقته، ولا يُوعد بعدد أيام ثابت.",
  "المتجر شراء لمرة واحدة بدون اشتراكات، ويشمل استضافة ودعماً فنياً مجاناً لسنة ودوميناً مجانياً. عمولات بوابات الدفع على العميل.",
  "إصلاح الأعطال في ما تم تسليمه داخل الدعم. الميزات الجديدة تتسعّر بشكل منفصل.",
  "المحتوى والبيانات وملكية النطاق تعود للعميل بالكامل.",
];

const QUOTE_TERM_REPLACEMENTS = [
  [
    "لا يشمل العرض رسوم النطاق والاستضافة ولا عمولات بوابات الدفع ما لم يُذكر خلاف ذلك.",
    "المتجر شراء لمرة واحدة بدون اشتراكات، ويشمل استضافة ودعماً فنياً مجاناً لسنة ودوميناً مجانياً. عمولات بوابات الدفع على العميل.",
  ],
  ["الاشتراك الشهري يشمل الاستضافة والدعم والنسخ الاحتياطي والتحديثات. النطاق وعمولات بوابات الدفع على العميل ما لم يُذكر في العرض.", "المتجر شراء لمرة واحدة بدون اشتراكات، ويشمل استضافة ودعماً فنياً مجاناً لسنة ودوميناً مجانياً. عمولات بوابات الدفع على العميل."],
  ["الدفع: 50% عند التعاقد، و50% عند التسليم والإطلاق.", PAYMENT_TERM_AR],
  ["الدفع في الاشتراك: رسوم التجهيز عند التعاقد، ثم الاشتراك الشهري. في الشراء: 50% عند التعاقد و50% عند التسليم.", PAYMENT_TERM_AR],
  // تعليمات لصاحب الموقع كانت تظهر للعميل
  ["الأرقام في البنود بداية النطاق المنشور، وتُعدَّل داخل النطاق قبل إرسال العرض.", ""],
];

export const ADVANCED_AR = {
  title: "مزايا {متقدمة}",
  lead: "هذه المزايا كلها ضمن المتجر بـ 8,500 ريال.",
  groups: [
    {
      icon: "monitor",
      title: "واجهة المتجر",
      items: [
        "عربي وإنجليزي",
        "خيارات المنتج بسعر ومخزون لكل خيار، مع عينات لون حقيقية",
        "بحث وتصفية",
        "منتجات مقترحة",
        "دخول بكلمة المرور أو رمز OTP أو حساب Google",
        "زر واتساب يتواصل به عملاؤك معك",
        "تتبع الطلب: أين وصل ومن معه",
        "جاهز لمحركات البحث",
      ],
    },
    {
      icon: "gear",
      title: "لوحة التاجر",
      items: [
        "المخزون مع تعديل جماعي ومستودعات متعددة",
        "الطلبات والمرتجعات",
        "تتبع حي لحالة الطلب وموقعه",
        "تذكير بالسلة المتروكة",
        "التسويق: كوبونات، خصومات تلقائية، عروض موسمية، بطاقات هدايا، تسويق بالعمولة، شرائح العملاء، وطلبات متكررة",
        "المحتوى: بنرات سطح المكتب والجوال مع أداة قص، وصفحات، ومدونة، وتقييمات",
        "صلاحيات للموظفين مع سجل النشاط",
        "تحليلات، وزوار الآن، وتنبيهات داخل اللوحة، وقوالب بريد",
        "بوابات الدفع: ميسر، تابي، تمارا، مصرف الراجحي، والدفع عند الاستلام",
        "الشحن: أرامكس، سمسا، أوتو، طرود، والبريد السعودي",
        "فاتورة زاتكا مع رمز QR",
        "الشعار والألوان والثيم، ونسخ احتياطي",
      ],
    },
    {
      icon: "box",
      title: "الاستيراد",
      items: [
        "من سلة أو زد أو شوبيفاي أو ملف Excel",
        "استخراج المقاس واللون من اسم المنتج",
        "فصل النص العربي عن الإنجليزي",
        "تصنيف تلقائي للمنتجات",
      ],
    },
    {
      icon: "phone",
      title: "التطبيقات",
      items: [
        "تطبيق iOS وAndroid بهوية المتجر: تصفح، سلة، إتمام الطلب، والطلبات",
        "تتبع الطلب من التطبيق: أين وصل ومن معه",
        "إشعارات الدفع تصل مع التطبيقين عند التسليم",
        "تنبيه التاجر بالطلب داخل لوحة الطلبات",
        "النشر يعتمد على مراجعة App Store وGoogle Play، وغالباً من أسبوع إلى أسبوعين، وبحسابات المطوّر الخاصة بالعميل (رسوم Apple السنوية ورسوم Google لمرة واحدة)",
      ],
    },
  ],
};

export const ADVANCED_EN = {
  title: "Advanced {features}",
  lead: "All of these features are included in the 8,500 SAR store.",
  groups: [
    {
      icon: "monitor",
      title: "Storefront",
      items: [
        "Arabic and English",
        "Product variants with a price and stock for each variant, and real color swatches",
        "Search and filters",
        "Recommendations",
        "Sign-in with a password, an OTP or Google",
        "WhatsApp button your customers use to reach you",
        "Order tracking: where the order is and who has it",
        "SEO-ready",
      ],
    },
    {
      icon: "gear",
      title: "Merchant dashboard",
      items: [
        "Inventory with bulk edit and multiple warehouses",
        "Orders and returns",
        "Live order status and location tracking",
        "Abandoned-cart reminders",
        "Marketing: coupons, automatic discounts, seasonal offers, gift cards, affiliates, customer segments and recurring orders",
        "Content: desktop and mobile banners with a crop tool, pages, a blog and reviews",
        "Staff roles with an activity log",
        "Analytics, live visitors, in-dashboard alerts and email templates",
        "Payment gateways: Moyasar, Tabby, Tamara, Al Rajhi and cash on delivery",
        "Shipping: Aramex, SMSA, OTO, Torod and Saudi Post",
        "ZATCA e-invoice with a QR code",
        "Logo, colors and theme, plus backups",
      ],
    },
    {
      icon: "box",
      title: "Import",
      items: [
        "From Salla, Zid, Shopify or an Excel file",
        "Size and color extracted from the product name",
        "Arabic and English text split apart",
        "Automatic product categories",
      ],
    },
    {
      icon: "phone",
      title: "Apps",
      items: [
        "Branded iOS and Android apps: browsing, cart, checkout and orders",
        "In-app order tracking: where the order is and who has it",
        "Push notifications included with both apps at delivery",
        "Merchant order alerts inside the orders dashboard",
        "Publishing depends on App Store and Google Play review, usually about one to two weeks, on the client's developer accounts (Apple's annual fee and Google's one-time fee)",
      ],
    },
  ],
};

export function offerJsonLd(url) {
  return {
    "@type": "Product",
    name: "المتجر الإلكتروني الجاهز",
    description: OFFER_DESC_AR,
    brand: { "@type": "Brand", name: "المطور حسن" },
    offers: [
      { "@type": "Offer", name: "متجر إلكتروني (شراء لمرة واحدة)", price: "8500", priceCurrency: "SAR", availability: "https://schema.org/InStock", url },
      { "@type": "Offer", name: "موقع تعريفي", price: "2300", priceCurrency: "SAR", availability: "https://schema.org/InStock", url },
      { "@type": "Offer", name: "موقع خدمي + تطبيق iOS وAndroid", price: "11000", priceCurrency: "SAR", availability: "https://schema.org/InStock", url },
    ],
  };
}

const TITLE_FIELDS_AR = {
  packagesSub: [STORE_ONLY_SUB_AR],
  addons: ["ما زال {قريباً}"],
  addonsSub: ["هذه البنود ليست مفعّلة على حسابات حقيقية، ولا تُعرض كخدمة تعمل اليوم."],
};

const TITLE_FIELDS_EN = {
  packagesSub: [STORE_ONLY_SUB_EN],
  addons: ["Still {coming soon}"],
  addonsSub: ["These items are not live on real accounts, and they are not presented as a service you can use today."],
};

const LEGACY_TERMS_AR = /الخدمة المعروضة هي تصميم موقع تعريفي/;
const LEGACY_PRICE = /1[,٬\s]?100|1[,٬\s]?500|200 ريال للسنة|200 SAR|7[,٬\s]?200|باقة المتجر الكبير|large store package|مجاناً داخل|included free/i;

// لا تُستبدل جمل الصفحات التي ترتب في البحث. النطاق الحالي يُضاف تحتها.
const PHRASES = [];

export function rewriteLegacyCopy(value) {
  if (typeof value !== "string" || !value) return value;
  let text = value;
  for (const [re, to] of PHRASES) text = text.replace(re, to);
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function clonePackages(list) {
  return list.map((p) => ({
    ...p,
    features: [...(p.features || [])],
    tiers: (p.tiers || []).map((t) => ({ ...t })),
  }));
}

function alignFeatures(list, en) {
  const extra = en ? FEATURES_EN : FEATURES_AR;
  const source = Array.isArray(list) && list.length ? list.filter((f) => f && typeof f === "object").map((f) => ({ ...f })) : [];
  if (!source.length) return extra.map((f) => ({ ...f }));
  // الوصف المحفوظ القديم لبطاقة بنفس العنوان يأخذ النص الحالي (لا اشتراكات)
  for (const f of source) {
    const fresh = extra.find((x) => x.title === String(f.title || "").trim());
    if (fresh && /اشتراك|ubscri|شهر|month|صيانة|maintenance/i.test(String(f.desc || ""))) f.desc = fresh.desc;
  }
  const seen = new Set(source.map((f) => String(f.title || "").trim()));
  for (const feature of extra) if (!seen.has(feature.title)) source.push({ ...feature });
  return source;
}

function alignTitles(titles, en) {
  const base = { ...(en ? TITLES_EN : TITLES_AR), ...(titles && typeof titles === "object" ? titles : {}) };
  const known = en ? TITLE_FIELDS_EN : TITLE_FIELDS_AR;
  const fresh = en ? TITLES_EN : TITLES_AR;
  for (const [key, olds] of Object.entries(known)) {
    if (olds.includes(String(base[key] || "").trim()) || LEGACY_PRICE.test(String(base[key] || ""))) base[key] = fresh[key];
  }
  if (!base.packages) base.packages = fresh.packages;
  return base;
}

function alignGallery(list) {
  return list;
}

function alignLegal(legal) {
  if (!legal || typeof legal !== "object") return legal;
  const terms = legal.terms && typeof legal.terms === "object" ? { ...legal.terms } : null;
  if (!terms) return legal;
  terms.body = `${ORIGINAL_TERMS_AR}\n\n${TERMS_AR}`;
  return { ...legal, terms };
}

function alignQuoteTerms(list) {
  const src = (Array.isArray(list) ? list : []).map((line) => {
    const text = rewriteLegacyCopy(String(line || ""));
    // NFC: نفس الحروف قد تُخزَّن بترتيب تشكيل مختلف (الشدة والضمة)
    const same = (a, b) => a.normalize("NFC") === b.normalize("NFC");
    const hit = QUOTE_TERM_REPLACEMENTS.find(([old]) => same(old, String(line || "").trim()) || same(old, text));
    return hit ? hit[1] : text;
  }).filter(Boolean);
  for (const line of QUOTE_TERMS_AR) if (!src.includes(line)) src.push(line);
  return src;
}

// يستبدل أسعار المتجر القديمة عند القراءة حتى لا يبقى 1,100 أو 1,500 أو «مجاناً» في المحتوى المحفوظ.
export function alignCommercialContent(content) {
  if (!content || typeof content !== "object") return content;
  const en = content.en && typeof content.en === "object" ? { ...content.en } : null;
  const next = {
    ...content,
    packages: clonePackages(PACKAGES_AR),
    addons: ADDONS_AR.map((a) => ({ ...a })),
    features: alignFeatures(content.features, false),
    titles: alignTitles(content.titles, false),
    gallery: alignGallery(content.gallery, false),
    legal: alignLegal(content.legal),
  };
  if (next.contracts && typeof next.contracts === "object") {
    next.contracts = { ...next.contracts, quoteTerms: alignQuoteTerms(next.contracts.quoteTerms) };
  }
  if (en) {
    const enLegal = en.legal && typeof en.legal === "object" ? { ...en.legal } : null;
    if (enLegal?.terms) {
      enLegal.terms = { ...enLegal.terms, body: `${ORIGINAL_TERMS_EN}\n\n${TERMS_EN}` };
    }
    next.en = {
      ...en,
      packages: clonePackages(PACKAGES_EN),
      addons: ADDONS_EN.map((a) => ({ ...a })),
      features: alignFeatures(en.features, true),
      titles: alignTitles(en.titles, true),
      gallery: alignGallery(en.gallery, true),
      ...(enLegal ? { legal: enLegal } : {}),
    };
  }
  return next;
}

export function rewriteStoredPage(page) {
  if (!page || typeof page !== "object") return page;
  const isTerms = page.slug === "terms" || LEGACY_TERMS_AR.test(page.body || "") || String(page.body || "").includes("المنصة متجر إلكتروني مستقل");
  if (!isTerms) return page;
  const body = `${ORIGINAL_TERMS_AR}\n\n${TERMS_AR}`;
  const en = page.en && typeof page.en === "object"
    ? { ...page.en, body: `${ORIGINAL_TERMS_EN}\n\n${TERMS_EN}` }
    : page.en;
  return { ...page, body, ...(en ? { en } : {}) };
}
