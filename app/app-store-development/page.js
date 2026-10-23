import StorePage from "../StorePage";

export const dynamic = "force-dynamic";

const TITLE = "إنشاء متجر إلكتروني | اشتراك أو شراء | المطور حسن";
const DESC = "نسخة مستقلة من المتجر. الاشتراك من 300 إلى 1,000 ريال شهرياً بعد تجهيز 2,000–3,000، أو الشراء من 12,000 إلى 30,000 ريال. الاشتراك هو الخيار الذي نوصي به.";

export const metadata = {
  title: { absolute: TITLE },
  description: DESC,
  keywords: "انشاء متجر الكتروني, انشاء متجر الكتروني في السعودية, متجر الكتروني مع تطبيق, اشتراك متجر, المطور حسن",
  alternates: {
    canonical: "/app-store-development",
    languages: { "ar-SA": "/app-store-development", en: "/en/app-store-development", "x-default": "/app-store-development" },
  },
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "ar_SA", url: "/app-store-development", title: TITLE, description: DESC, images: ["/images/brand-og.png"] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/images/brand-og.png"] },
};

export default function AppStoreDevelopment() {
  return <StorePage lang="ar" />;
}
