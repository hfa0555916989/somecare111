// نصوص أقسام الصفحة الرئيسية التي لا تُعدَّل من لوحة التحكم: سطور الإثبات تحت العنوان،
// نافذة الأوامر، شريط الأسعار، قسم التجربة، وطريقة العمل مع بطاقة الكود.
// لا أرقام ولا شهادات مخترعة: الأسعار تُقرأ من الباقات، وعدد المواقع من قائمة الأعمال السابقة.

const sitesAr = (n) => (n >= 3 && n <= 10 ? `${n} مواقع منشورة وتعمل الآن` : `${n} موقعاً منشوراً يعمل الآن`);

export const HOME_SECTIONS = {
  ar: {
    proof: (n) => [sitesAr(n), "عرض سعر وعقد رسمي لكل مشروع", "دعم فني بعد التسليم"],
    terminal: ["تم بناء المشروع", "اجتاز الاختبارات", "منشور على نطاقك"],
    noSubs: { label: "اشتراكات شهرية", note: "تدفع مرة واحدة فقط" },
    demo: {
      title: "جرّب المتجر ولوحة التحكم {قبل أن تقرّر}",
      text: "افتح المتجر التجريبي وتصفّح المنتجات والسلة، ثم ادخل لوحة التحكم وشاهد الطلبات والتحليلات كما ستراها في متجرك.",
      open: "افتح المتجر التجريبي",
      admin: "لوحة التحكم",
      blog: "من المدونة",
    },
    work: "مواقع منشورة تعمل الآن، {افتحها وجرّبها}",
    process: {
      title: "من الفكرة إلى الإطلاق {في أربع خطوات}",
      steps: [
        { fn: "understand()", title: "نفهم نشاطك أولاً", text: "نسأل عن عملك وعملائك وما تريد أن يفعله الزائر، قبل أي تصميم أو سطر كود." },
        { fn: "quote()", title: "عرض سعر وعقد رسمي", text: "البنود والأسعار والدفعات مكتوبة بالتفصيل، وتوافق عليها إلكترونياً من جوالك." },
        { fn: "build()", title: "برمجة على رابط تجريبي", text: "تتابع العمل على رابط تجريبي، وتطلب تعديلاتك قبل الإطلاق." },
        { fn: "launch()", title: "إطلاق ودعم", text: "ننشر المشروع على نطاقك، ومعه دعم فني لإصلاح الأعطال بعد التسليم." },
      ],
    },
    code: {
      comment: "نفهم المشروع قبل أن نكتب",
      client: "نشاطك التجاري",
      build: ["متجر", "موقع", "تطبيق"],
      payments: ["ميسر", "تابي", "تمارا"],
      price: "ثابت، يُدفع مرة واحدة",
    },
  },
  en: {
    proof: (n) => [`${n} live websites running now`, "An official quote and contract for every project", "Technical support after delivery"],
    terminal: ["Project built", "Tests passed", "Live on your domain"],
    noSubs: { label: "Monthly subscriptions", note: "You pay once" },
    demo: {
      title: "Try the store and the dashboard {before you decide}",
      text: "Open the demo store and browse the products and the cart, then sign in to the dashboard and see the orders and analytics as you will see them in your own store.",
      open: "Open the demo store",
      admin: "Admin panel",
      blog: "From the blog",
    },
    work: "Live websites running now, {open them and try}",
    process: {
      title: "From idea to launch {in four steps}",
      steps: [
        { fn: "understand()", title: "We understand your business first", text: "We ask about your work, your customers and what you want a visitor to do, before any design or line of code." },
        { fn: "quote()", title: "An official quote and contract", text: "Items, prices and payments are written in detail, and you approve them online from your phone." },
        { fn: "build()", title: "Built on a test link", text: "You follow the work on a test link and ask for your changes before launch." },
        { fn: "launch()", title: "Launch and support", text: "We publish the project on your domain, with technical support for bug fixes after delivery." },
      ],
    },
    code: {
      comment: "understand the project before we write",
      client: "your business",
      build: ["store", "website", "app"],
      payments: ["Moyasar", "Tabby", "Tamara"],
      price: "fixed, paid once",
    },
  },
};

export const homeSections = (lang) => (lang === "en" ? HOME_SECTIONS.en : HOME_SECTIONS.ar);
