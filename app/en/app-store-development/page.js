import StorePage from "../../StorePage";

export const dynamic = "force-dynamic";

const TITLE = "Create an online store | Subscribe or buy | Hassan Developer";
const DESC = "An independent store. Subscription from 300 to 1,000 SAR per month after setup of 2,000–3,000, or purchase from 12,000 to 30,000 SAR. The subscription is what we recommend.";

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
