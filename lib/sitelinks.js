// صفحات القائمة الرئيسية. نصوص الروابط هي ما يظهر في الهيدر والفوتر، وعناوين الصفحات أوضح لمحركات البحث.
export const SITE_NAV = [
  {
    id: "app-store-development",
    path: "/app-store-development",
    ar: "المتاجر والتطبيقات",
    en: "Stores and apps",
    titleAr: "إنشاء متجر إلكتروني بـ 1,500 ريال بدون اشتراكات | المطور حسن",
    titleEn: "Create an online store for 1,500 SAR, no subscriptions | Hassan Developer",
    descAr: "متجر إلكتروني جاهز بـ 1,500 ريال شراءً لمرة واحدة بدون اشتراكات، مع ربط الدفع والشحن، واستضافة ودعم فني مجاناً لسنة، ودومين مجاني.",
    descEn: "A ready online store for 1,500 SAR, a one-time purchase with no subscriptions, with payment and shipping integration, a free year of hosting and support, and a free domain.",
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
    descAr: "خدمات المطور حسن: مواقع تعريفية بـ 350 ريال، ومتجر إلكتروني بـ 1,500 ريال شراء بدون اشتراكات مع استضافة ودعم فني لسنة ودومين مجاني، وموقع خدمي مع تطبيق جوال بـ 2,000 ريال، وخدمات الأمن السيبراني للشركات.",
    descEn: "Developer Hassan services: business websites for 350 SAR, an online store for 1,500 SAR with no subscriptions plus a free year of hosting and support and a free domain, a service website with a mobile app for 2,000 SAR, and enterprise cybersecurity.",
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
    titleAr: "الأسعار | متجر إلكتروني بـ 1,500 ريال وموقع تعريفي بـ 350 ريال",
    titleEn: "Pricing | Online store 1,500 SAR, business website 350 SAR",
    descAr: "الأسعار بدون اشتراكات: المتجر الإلكتروني بـ 1,500 ريال مرة واحدة مع ربط الدفع والشحن، واستضافة ودعم فني مجاناً لسنة، ودومين مجاني. والموقع التعريفي بـ 350 ريال.",
    descEn: "Pricing with no subscriptions: the online store is 1,500 SAR once with payment and shipping integration, a free year of hosting and support, and a free domain. A business website is 350 SAR, and a service website with an app is 2,000 SAR.",
  },
  {
    id: "blog",
    path: "/blog",
    ar: "المدونة",
    en: "Blog",
    titleAr: "المدونة | متجر إلكتروني بـ 1,500 ريال بدون اشتراكات",
    titleEn: "Blog | Online store for 1,500 SAR, no subscriptions",
    descAr: "مدونة المطور حسن عن انشاء المتاجر والمواقع وأسعارها. المتجر الإلكتروني بـ 1,500 ريال شراء بدون اشتراكات، والموقع التعريفي بـ 350 ريال.",
    descEn: "Articles by Developer Hassan on building stores and websites. The online store is 1,500 SAR with no subscriptions, and a business website is 350 SAR.",
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
