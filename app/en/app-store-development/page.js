import StorePage from "../../StorePage";

export const dynamic = "force-dynamic";

const TITLE = "Create an online store for 1,500 SAR, no subscriptions | Hassan Developer";
const DESC = "A ready online store for 1,500 SAR, a one-time purchase with no subscriptions: every current feature, payment and shipping integration, a free year of hosting and support, and a free domain. Business websites are 350 SAR.";

export const metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: {
    canonical: "/en/app-store-development",
    languages: { "ar-SA": "/app-store-development", en: "/en/app-store-development", "x-default": "/app-store-development" },
  },
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "en_US", url: "/en/app-store-development", title: TITLE, description: DESC, images: ["/images/brand-og.png"] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/images/brand-og.png"] },
};

export default function AppStoreDevelopmentEn() {
  return <StorePage lang="en" />;
}
