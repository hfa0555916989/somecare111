// نموذج أسعار منصة المتجر المستقلة. المصدر الوحيد للأرقام الظاهرة للزائر.
// بوابات الدفع والشحن وفاتورة زاتكا والتطبيقان وإشعارات الدفع جزء من المنصة.
// لا يُدّعى نظام محاسبي ولا توليد بنرات بالذكاء الاصطناعي ولا استيراد بالذكاء الاصطناعي.

export const SUBSCRIPTION_NAME = "اشتراك المتجر";
export const SUBSCRIPTION_NAME_EN = "Store subscription";
export const PURCHASE_NAME = "شراء المتجر";
export const PURCHASE_NAME_EN = "Store purchase";

export const WA_TEXT = "السلام عليكم، أبغى أستفسر عن اشتراك المتجر الإلكتروني";

export const OFFER_DESC_AR =
  "منصة متجر مستقلة لكل عميل. الاشتراك (الخيار الذي نوصي به): تجهيز من 2,000 إلى 3,000 ريال مرة واحدة، ثم 300 إلى 500 ريال شهرياً بدون تطبيقات أو 700 إلى 1,000 مع التطبيقات، وسنوياً بشهرين مجاناً. الشراء: 12,000 إلى 18,000 ريال للمتجر أو 20,000 إلى 30,000 مع التطبيقين، ثم دعم أعطال مجاني من شهر إلى شهرين وعقد صيانة من 500 إلى 800 ريال شهرياً.";

export const OFFER_DESC_EN =
  "An independent store for each client. Subscription (recommended): setup 2,000–3,000 SAR once, then 300–500 SAR per month without apps or 700–1,000 with apps, and two months free on the annual plan. Purchase: 12,000–18,000 SAR for the store or 20,000–30,000 with both apps, then 1–2 months of free bug-fix support and a maintenance contract at 500–800 SAR per month.";

const FAST_AR = "تسليم سريع، والموعد يتوقف على تسليمك للمحتوى في وقته";
const FAST_EN = "Fast delivery, and the date depends on you providing the content on time";
const BUG_AR = "إصلاح العطل يعني خللاً في ما تم تسليمه. الميزات الجديدة تتسعّر بشكل منفصل";
const BUG_EN = "A bug fix is a defect in what was delivered. A new feature request is quoted and paid separately";
const ACCOUNTS_AR = "نشر التطبيق على App Store وGoogle Play يعتمد على مراجعة المتجر، وغالباً من أسبوع إلى أسبوعين، ويحتاج حسابات المطوّر الخاصة بالعميل (رسوم Apple السنوية ورسوم Google لمرة واحدة)";
const ACCOUNTS_EN = "Publishing on the App Store and Google Play depends on store review, usually about one to two weeks, and needs the client's own developer accounts (Apple's annual fee and Google's one-time fee)";

export const SUBSCRIPTION_FEATURES_AR = [
  "نسخة مستقلة من المنصة لكل عميل",
  "التجهيز يشمل الهوية، وربط بوابات الدفع وشركات الشحن، واستيراد المنتجات",
  "تطبيق iOS وAndroid ضمن باقة التطبيقات، وإشعارات الدفع تصل معهما عند التسليم",
  "الاشتراك الشهري يشمل الاستضافة والدعم والنسخ الاحتياطي والتحديثات",
  "الاشتراك السنوي بشهرين مجاناً",
  FAST_AR,
  BUG_AR,
  ACCOUNTS_AR,
];

export const SUBSCRIPTION_FEATURES_EN = [
  "An independent platform instance for each client",
  "Setup covers branding, connecting payment gateways and shipping carriers, and product import",
  "The iOS and Android apps are part of the apps plan, and push notifications are included with them at delivery",
  "The monthly fee includes hosting, support, backups and updates",
  "Annual billing includes two months free",
  FAST_EN,
  BUG_EN,
  ACCOUNTS_EN,
];

export const PURCHASE_FEATURES_AR = [
  "تملك المتجر، أو المتجر مع تطبيقي iOS وAndroid",
  "إشعارات الدفع تصل مع التطبيقين عند التسليم",
  "بعد التسليم: دعم مجاني لإصلاح الأعطال من شهر إلى شهرين",
  "ثم عقد صيانة من 500 إلى 800 ريال شهرياً",
  FAST_AR,
  BUG_AR,
  ACCOUNTS_AR,
];

export const PURCHASE_FEATURES_EN = [
  "Own the store, or the store with the iOS and Android apps",
  "Push notifications are included with both apps at delivery",
  "After delivery: 1–2 months of free bug-fix support",
  "Then a maintenance contract at 500–800 SAR per month",
  FAST_EN,
  BUG_EN,
  ACCOUNTS_EN,
];

export const PACKAGES_AR = [
  {
    label: "الخيار الذي نوصي به",
    icon: "store",
    name: SUBSCRIPTION_NAME,
    pricePrefix: "يبدأ من",
    price: "2,000",
    unit: "ريال للتجهيز",
    desc: "نسخة مستقلة مع استضافة ودعم ونسخ احتياطي وتحديثات ضمن الاشتراك. التجهيز مرة واحدة، ثم رسم شهري. هذا هو الخيار الذي نوصي به.",
    features: SUBSCRIPTION_FEATURES_AR,
    tiers: [
      { label: "تجهيز وتخصيص", price: "2,000 – 3,000", unit: "ريال مرة واحدة" },
      { label: "متجر بدون تطبيقات", price: "300 – 500", unit: "ريال / شهر" },
      { label: "متجر مع التطبيقات", price: "700 – 1,000", unit: "ريال / شهر" },
      { label: "الاشتراك السنوي", price: "شهران مجاناً", unit: "" },
    ],
    image: "",
    featured: true,
  },
  {
    label: "تملّك النسخة",
    icon: "box",
    name: PURCHASE_NAME,
    pricePrefix: "يبدأ من",
    price: "12,000",
    unit: "ريال",
    desc: "دفعة للمتجر مرة واحدة. بعد التسليم دعم مجاني لإصلاح الأعطال من شهر إلى شهرين، ثم عقد صيانة إن رغبت.",
    features: PURCHASE_FEATURES_AR,
    tiers: [
      { label: "المتجر", price: "12,000 – 18,000", unit: "ريال" },
      { label: "المتجر مع تطبيقي iOS وAndroid", price: "20,000 – 30,000", unit: "ريال" },
      { label: "دعم إصلاح الأعطال بعد التسليم", price: "شهر – شهرين", unit: "مجاناً" },
      { label: "عقد الصيانة بعدها", price: "500 – 800", unit: "ريال / شهر" },
    ],
    image: "",
    featured: false,
  },
];

export const PACKAGES_EN = [
  {
    label: "Recommended",
    name: SUBSCRIPTION_NAME_EN,
    desc: "An independent instance. Hosting, support, backups and updates are part of the subscription. One-time setup, then a monthly fee. This is the option we recommend.",
    features: SUBSCRIPTION_FEATURES_EN,
    tiers: [
      { label: "Setup and customization", price: "2,000 – 3,000", unit: "SAR one-time" },
      { label: "Store without apps", price: "300 – 500", unit: "SAR / month" },
      { label: "Store with apps", price: "700 – 1,000", unit: "SAR / month" },
      { label: "Annual subscription", price: "Two months free", unit: "" },
    ],
  },
  {
    label: "Own the instance",
    name: PURCHASE_NAME_EN,
    desc: "A one-time payment for the store. After delivery, bug fixes are free for one to two months, then a maintenance contract if you want one.",
    features: PURCHASE_FEATURES_EN,
    tiers: [
      { label: "Store", price: "12,000 – 18,000", unit: "SAR" },
      { label: "Store with iOS and Android apps", price: "20,000 – 30,000", unit: "SAR" },
      { label: "Bug-fix support after delivery", price: "1–2 months", unit: "free" },
      { label: "Maintenance contract after that", price: "500 – 800", unit: "SAR / month" },
    ],
  },
];

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
    title: "تطبيق iOS وAndroid",
    desc: "التطبيقان ضمن باقة التطبيقات. النشر يعتمد على مراجعة المتجر، وغالباً من أسبوع إلى أسبوعين.",
    price: "ضمن باقة التطبيقات",
  },
  {
    icon: "bell",
    title: "إشعارات الدفع",
    desc: "تصل مع تطبيقي iOS وAndroid عند التسليم.",
    price: "مع التطبيقات",
  },
  {
    icon: "headset",
    title: "عقد الصيانة بعد الشراء",
    desc: "يبدأ بعد شهر إلى شهرين من إصلاح الأعطال مجاناً. طلب ميزة جديدة ليس صيانة.",
    price: "500 – 800 ريال / شهر",
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
    title: "iOS and Android apps",
    desc: "Both apps are part of the apps plan. Publishing depends on store review, usually about one to two weeks.",
    price: "Included with apps",
  },
  {
    title: "Push notifications",
    desc: "Included with the iOS and Android apps at delivery.",
    price: "With the apps",
  },
  {
    title: "Maintenance after purchase",
    desc: "Starts after one to two months of free bug fixes. A new feature request is not maintenance.",
    price: "500 – 800 SAR / month",
  },
];

export const FEATURES_AR = [
  { icon: "clock", title: "تسليم سريع", desc: "نبدأ بعد تأكيد الطلب واستلام المحتوى. لا نعد بعدد أيام ثابت، لأن الموعد يتوقف على تسليمك للمحتوى في وقته." },
  { icon: "gear", title: "تحكم كامل بالمحتوى", desc: "تعدّل النصوص والصور والأسعار من لوحة التاجر بدون خبرة تقنية." },
  { icon: "shield", title: "دعم وإصلاح أعطال", desc: "الاشتراك يشمل الدعم. بعد الشراء دعم مجاني لإصلاح الأعطال من شهر إلى شهرين ثم عقد صيانة. الميزات الجديدة تتسعّر بشكل منفصل." },
  { icon: "bolt", title: "سرعة فائقة", desc: "صفحات تفتح بسرعة وتحافظ على زوّارك." },
  { icon: "search", title: "تهيئة SEO", desc: "أساسات قوية لظهور المتجر في نتائج البحث." },
  { icon: "chart", title: "تحليلات الزوار", desc: "من لوحة التاجر ترى الزيارات والزوار الحاليين." },
];

export const FEATURES_EN = [
  { title: "Fast delivery", desc: "We start after the order is confirmed and the content arrives. We do not promise a fixed number of days, because the date depends on you providing the content on time." },
  { title: "Full control of your content", desc: "Edit text, images and prices from the merchant dashboard, with no technical skills needed." },
  { title: "Support and bug fixes", desc: "The subscription includes support. After a purchase, bug fixes are free for one to two months, then a maintenance contract. A new feature is quoted on its own." },
  { title: "Blazing-fast speed", desc: "Pages load quickly and keep your visitors." },
  { title: "SEO setup", desc: "Strong foundations for showing up in search results." },
  { title: "Visitor analytics", desc: "From the merchant dashboard you can see visits and who is on the store right now." },
];

export const TITLES_AR = {
  packages: "الباقات {والأسعار}",
  packagesSub: "الاشتراك هو الخيار الذي نوصي به. الأسعار نطاقات بالريال السعودي، وتُثبَّت في عرض السعر حسب حجم المتجر.",
  addons: "الدفع والشحن {والتطبيقات}",
  addonsSub: "بوابات الدفع وشركات الشحن وفاتورة زاتكا جزء من المنصة. تطبيق iOS وAndroid ضمن باقة التطبيقات، وإشعارات الدفع تصل معهما. نشر المتاجر يعتمد على مراجعة App Store وGoogle Play، وغالباً من أسبوع إلى أسبوعين.",
};

export const TITLES_EN = {
  packages: "Packages {and pricing}",
  packagesSub: "The subscription is the option we recommend. Prices are ranges in Saudi riyals and are fixed in the quote according to the size of the store.",
  addons: "Payment, shipping {and apps}",
  addonsSub: "Payment gateways, carriers and the ZATCA QR invoice are part of the platform. The iOS and Android apps are part of the apps plan, and push notifications are included at delivery. Store publishing depends on App Store and Google Play review, usually about one to two weeks.",
};

export const NOTE_AR =
  "كل عميل يأخذ نسخة مستقلة. الاشتراك هو الخيار الذي نوصي به. إصلاح العطل داخل الدعم، والميزات الجديدة تتسعّر بشكل منفصل. نشر التطبيقات على حسابات المطوّر الخاصة بالعميل، ويعتمد على مراجعة المتجر وغالباً من أسبوع إلى أسبوعين.";

export const NOTE_EN =
  "Each client gets an independent instance. The subscription is the option we recommend. Bug fixes are covered by support, and a new feature is a separate quote. Apps are published on the client's own developer accounts, and store review usually takes about one to two weeks.";

export const ORIGINAL_TERMS_AR = `الخدمة المعروضة هي تصميم موقع تعريفي بالسعر الموضح في الصفحة.
السعر 1,100 ريال يشمل تصميم الموقع والدومين والاستضافة لسنة واحدة، ما لم يُذكر غير ذلك في الباقة المختارة.
الدعم الفني مجاني أول سنة مع الدومين والاستضافة. السنة الثانية: الدعم بـ 200 ريال للسنة.
مدة التسليم تقريبية وتبدأ بعد تأكيد المتطلبات ودفع المبلغ المتفق عليه.
باقة المتجر الكبير شامل التطبيق بـ 1,500 ريال، وداخلها بوابة الدفع والشحن والدومين، وزر واتساب يفتح محادثة مع صاحب المتجر.`;

export const ORIGINAL_TERMS_EN = `The service offered is the design of a business website at the price shown on the page.
The price of 1,100 SAR includes website design, domain and hosting for one year, unless the chosen package states otherwise.
Technical support is free for the first year, together with the domain and hosting. From the second year, support is 200 SAR for the full year.
Delivery time is approximate and starts after the requirements are confirmed and the agreed amount is paid.
The large store package with the app is 1,500 SAR, and payment, shipping and the domain are included, plus a WhatsApp button that opens a chat with the store owner.`;

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

export const TERMS_AR = `المنصة متجر إلكتروني مستقل لكل عميل.

الاشتراك هو الخيار الذي نوصي به:
تجهيز وتخصيص لمرة واحدة من 2,000 إلى 3,000 ريال (الهوية، وربط بوابات الدفع وشركات الشحن، واستيراد المنتجات).
متجر بدون تطبيقات من 300 إلى 500 ريال شهرياً، ويشمل الاستضافة والدعم والنسخ الاحتياطي والتحديثات.
متجر مع التطبيقات من 700 إلى 1,000 ريال شهرياً.
الاشتراك السنوي بشهرين مجاناً.

الشراء:
المتجر من 12,000 إلى 18,000 ريال.
المتجر مع تطبيقي iOS وAndroid من 20,000 إلى 30,000 ريال.
بعد التسليم دعم مجاني لإصلاح الأعطال من شهر إلى شهرين، ثم عقد صيانة من 500 إلى 800 ريال شهرياً.

إصلاح الأعطال يعني خللاً في ما تم تسليمه. الميزات الجديدة تتسعّر بشكل منفصل.
التسليم سريع ويتوقف على تسليم المحتوى في وقته، ولا نعد بعدد أيام ثابت.
نشر التطبيق على App Store وGoogle Play يعتمد على مراجعة المتجر، وغالباً من أسبوع إلى أسبوعين، ويحتاج حسابات المطوّر الخاصة بالعميل (رسوم Apple السنوية ورسوم Google لمرة واحدة).
بوابات الدفع (ميسر، تابي، تمارا، مصرف الراجحي، والدفع عند الاستلام) وشركات الشحن (أرامكس، سمسا، أوتو، طرود، والبريد السعودي) وفاتورة زاتكا مع رمز QR جزء من المنصة. تطبيق iOS وAndroid ضمن باقة التطبيقات، وإشعارات الدفع تصل معهما عند التسليم.`;

export const TERMS_EN = `The platform is an independent online store for each client.

The subscription is the option we recommend:
One-time setup and customization from 2,000 to 3,000 SAR (branding, connecting payment gateways and shipping carriers, and product import).
A store without apps is 300 to 500 SAR per month and includes hosting, support, backups and updates.
A store with apps is 700 to 1,000 SAR per month.
The annual subscription includes two months free.

Purchase:
The store is 12,000 to 18,000 SAR.
The store with iOS and Android apps is 20,000 to 30,000 SAR.
After delivery, bug fixes are free for one to two months, then a maintenance contract is 500 to 800 SAR per month.

A bug fix means a defect in what was delivered. Any new feature request is quoted and paid separately.
Delivery is fast and depends on the content arriving on time. We do not promise a fixed number of days.
Publishing on the App Store and Google Play depends on store review, usually about one to two weeks, and needs the client's own developer accounts (Apple's annual fee and Google's one-time fee).
Payment gateways (Moyasar, Tabby, Tamara, Al Rajhi and cash on delivery), shipping carriers (Aramex, SMSA, OTO, Torod and Saudi Post) and a ZATCA e-invoice with a QR code are part of the platform. The iOS and Android apps are part of the apps plan, and push notifications are included with them at delivery.`;

export const QUOTE_TERMS_AR = [
  "الدفع في الاشتراك: رسوم التجهيز عند التعاقد، ثم الاشتراك الشهري. في الشراء: 50% عند التعاقد و50% عند التسليم.",
  "مدة التنفيذ تتوقف على تسليم المحتوى في وقته، ولا يُوعد بعدد أيام ثابت.",
  "الاشتراك الشهري يشمل الاستضافة والدعم والنسخ الاحتياطي والتحديثات. النطاق وعمولات بوابات الدفع على العميل ما لم يُذكر في العرض.",
  "إصلاح الأعطال في ما تم تسليمه داخل الدعم. الميزات الجديدة تتسعّر بشكل منفصل.",
  "المحتوى والبيانات وملكية النطاق تعود للعميل بالكامل.",
  "الأرقام في البنود بداية النطاق المنشور، وتُعدَّل داخل النطاق قبل إرسال العرض.",
];

const QUOTE_TERM_REPLACEMENTS = [
  [
    "لا يشمل العرض رسوم النطاق والاستضافة ولا عمولات بوابات الدفع ما لم يُذكر خلاف ذلك.",
    "الاشتراك الشهري يشمل الاستضافة والدعم والنسخ الاحتياطي والتحديثات. النطاق وعمولات بوابات الدفع على العميل ما لم يُذكر في العرض.",
  ],
  [
    "الدفع: 50% عند التعاقد، و50% عند التسليم والإطلاق.",
    "الدفع في الاشتراك: رسوم التجهيز عند التعاقد، ثم الاشتراك الشهري. في الشراء: 50% عند التعاقد و50% عند التسليم.",
  ],
];

export const ADVANCED_AR = {
  title: "مزايا {متقدمة}",
  lead: "هذه المزايا جزء من المنصة في الاشتراك وفي الشراء.",
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
        "زر واتساب يفتح محادثة مع صاحب المتجر",
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
        "التسويق: كوبونات، خصومات تلقائية، عروض موسمية، بطاقات هدايا، تسويق بالعمولة، شرائح العملاء، واشتراكات متكررة",
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
  lead: "These features are part of the platform on both the subscription and the purchase.",
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
        "WhatsApp button that opens a chat with the store owner",
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
        "Marketing: coupons, automatic discounts, seasonal offers, gift cards, affiliates, customer segments and recurring subscriptions",
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
    name: "منصة المتجر المستقلة",
    description: OFFER_DESC_AR,
    brand: { "@type": "Brand", name: "المطور حسن" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "SAR",
      lowPrice: "2000",
      highPrice: "30000",
      offerCount: 2,
      url,
      description: OFFER_DESC_AR,
    },
  };
}

const TITLE_FIELDS_AR = {
  addons: ["ما زال {قريباً}"],
  addonsSub: ["هذه البنود ليست مفعّلة على حسابات حقيقية، ولا تُعرض كخدمة تعمل اليوم."],
};

const TITLE_FIELDS_EN = {
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
  terms.body = withRankedTerms(terms.body, ORIGINAL_TERMS_AR, TERMS_AR);
  return { ...legal, terms };
}

function alignQuoteTerms(list) {
  const src = (Array.isArray(list) ? list : []).map((line) => {
    const text = rewriteLegacyCopy(String(line || ""));
    const hit = QUOTE_TERM_REPLACEMENTS.find(([old]) => old === String(line || "").trim() || old === text);
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
      enLegal.terms = { ...enLegal.terms, body: withRankedTerms(enLegal.terms.body, ORIGINAL_TERMS_EN, TERMS_EN) };
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
  const body = withRankedTerms(page.body, ORIGINAL_TERMS_AR, TERMS_AR);
  const en = page.en && typeof page.en === "object"
    ? { ...page.en, body: withRankedTerms(page.en.body, ORIGINAL_TERMS_EN, TERMS_EN) }
    : page.en;
  return { ...page, body, ...(en ? { en } : {}) };
}
