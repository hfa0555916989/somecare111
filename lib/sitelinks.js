// صفحات القائمة الرئيسية. نصوص الروابط هي ما يظهر في الهيدر والفوتر، وعناوين الصفحات أوضح لمحركات البحث.
export const SITE_NAV = [
  {
    id: "app-store-development",
    path: "/app-store-development",
    ar: "المتاجر والتطبيقات",
    en: "Stores and apps",
    titleAr: "إنشاء متجر إلكتروني | اشتراك أو شراء | المطور حسن",
    titleEn: "Create an online store | Subscribe or buy | Hassan Developer",
    descAr: "نسخة مستقلة من المتجر. الاشتراك من 300 إلى 1,000 ريال شهرياً بعد تجهيز 2,000–3,000، أو الشراء من 12,000 إلى 30,000 ريال.",
    descEn: "An independent store. Subscription from 300 to 1,000 SAR per month after setup of 2,000–3,000, or purchase from 12,000 to 30,000 SAR.",
  },
  {
    id: "security",
    path: "/security",
    ar: "الأمن السيبراني",
    en: "Cybersecurity",
    titleAr: "أمن سيبراني للشركات: اختبار اختراق وامتثال NCA وساما",
    titleEn: "Cybersecurity for Enterprises: Penetration Testing & NCA Compliance",
    descAr: "خدمات الأمن السيبراني للشركات في السعودية مع الشريك الرسمي لـ Security Professionals Group: اختبار الاختراق، الحوكمة والامتثال، أمن OT.",
    descEn: "Cybersecurity for organizations in Saudi Arabia with the official SPG partner: penetration testing, governance and compliance, OT security.",
  },
  {
    id: "about",
    path: "/about",
    ar: "من نحن",
    en: "About",
    titleAr: "من نحن | المطور حسن",
    titleEn: "About us | Developer Hassan",
    descAr: "من نحن: المطور حسن يبني من الرياض مواقع تعريفية وتطبيقات جوال ومتاجر إلكترونية، بتعامل مباشر وعرض سعر وعقد رسمي.",
    descEn: "About Developer Hassan in Riyadh: business websites, mobile apps and online stores, with a direct quote and an official contract.",
  },
  {
    id: "services",
    path: "/services",
    ar: "خدماتنا",
    en: "Services",
    titleAr: "خدماتنا | مواقع وتطبيقات ومتاجر وأمن سيبراني",
    titleEn: "Our services | Websites, apps, stores and cybersecurity",
    descAr: "خدمات المطور حسن: مواقع تعريفية، تطبيقات جوال، متجر إلكتروني مع تطبيق من 2,000 ريال للتجهيز والاشتراك من 300 ريال شهرياً أو الشراء من 12,000 ريال، وخدمات الأمن السيبراني للشركات.",
    descEn: "Developer Hassan services: business websites, mobile apps, an online store with an app from 2,000 SAR setup, subscription from 300 SAR/month, or purchase from 12,000 SAR, and enterprise cybersecurity.",
  },
  {
    id: "works",
    path: "/works",
    ar: "أعمالنا",
    en: "Our work",
    titleAr: "أعمالنا | نماذج المتجر والمواقع",
    titleEn: "Our work | Store and website examples",
    descAr: "أعمالنا: صور المتجر التجريبي ولوحة التحكم ونماذج المواقع، لترى الشكل قبل أن تطلب التنفيذ من المطور حسن.",
    descEn: "Our work: screenshots of the demo store, the admin dashboard and website examples from Developer Hassan.",
  },
  {
    id: "packages",
    path: "/packages",
    ar: "الباقات",
    en: "Packages",
    titleAr: "الباقات والأسعار | متجر وتطبيق من 2,000 ريال",
    titleEn: "Packages and pricing | Store and app from 2,000 SAR",
    descAr: "الباقات والأسعار: متجر كبير مع تطبيق جوال من 2,000 ريال للتجهيز، والاشتراك من 300 ريال شهرياً، أو الشراء من 12,000 ريال، والدفع والشحن والدومين مجاناً، إلى جانب باقات المواقع والتطبيقات.",
    descEn: "Packages and pricing, including the large store with a mobile app from 2,000 SAR setup, subscription from 300 SAR/month, or purchase from 12,000 SAR, and free payment, shipping and domain setup.",
  },
  {
    id: "blog",
    path: "/blog",
    ar: "المدونة",
    en: "Blog",
    titleAr: "المدونة | متجر وتطبيق من 2,000 ريال",
    titleEn: "Blog | Store and app from 2,000 SAR",
    descAr: "مدونة المطور حسن عن انشاء المتاجر والتطبيقات وأسعارها، مع شرح باقة من 2,000 ريال للتجهيز والاشتراك من 300 ريال شهرياً أو الشراء من 12,000 ريال والإضافات المجانية.",
    descEn: "Articles by Developer Hassan on building stores and apps, including setup from 2,000 SAR, subscription from 300 SAR/month, or purchase from 12,000 SAR, and free add-ons.",
  },
  {
    id: "contact",
    path: "/contact",
    ar: "تواصل معنا",
    en: "Contact",
    titleAr: "تواصل معنا | المطور حسن",
    titleEn: "Contact us | Developer Hassan",
    descAr: "تواصل مع المطور حسن عبر واتساب أو نموذج الموقع. نرد على مدار الساعة ونرسل عرض السعر الرسمي على جوالك.",
    descEn: "Contact Developer Hassan on WhatsApp or the site form. We reply around the clock and send an official quote to your phone.",
  },
];

export const navItem = (id) => SITE_NAV.find((item) => item.id === id);

export function navHref(item, lang) {
  return `${lang === "en" ? "/en" : ""}${item.path}`;
}

export const RESERVED_SLUGS = new Set([
  ...SITE_NAV.map((item) => item.id),
  "packages",
  "services",
  "security",
  "blog",
  "app-store-development",
  "programming-company-saudi",
  "app-design-saudi",
  "create-online-store",
]);

export function breadcrumbJsonLd(site, lang, page) {
  const en = lang === "en";
  const home = en ? `${site}/en` : `${site}/`;
  const url = `${site}${navHref(page, lang)}`;
  const title = en ? page.titleEn : page.titleAr;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: en ? "Home" : "الرئيسية", item: home },
          { "@type": "ListItem", position: 2, name: en ? page.en : page.ar, item: url },
        ],
      },
      {
        "@type": "WebPage",
        "@id": url,
        name: title,
        description: en ? page.descEn : page.descAr,
        url,
        inLanguage: en ? "en" : "ar",
        isPartOf: { "@id": `${site}/#website` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
    ],
  };
}

export function sitelinkMeta(id, lang) {
  const page = navItem(id);
  const en = lang === "en";
  const title = en ? page.titleEn : page.titleAr;
  const description = en ? page.descEn : page.descAr;
  const path = navHref(page, lang);
  const image = "/images/demo/home-1200.webp";
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: { "ar-SA": page.path, en: `/en${page.path}`, "x-default": page.path },
    },
    robots: { index: true, follow: true },
    openGraph: { type: "website", locale: en ? "en_US" : "ar_SA", url: path, title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
