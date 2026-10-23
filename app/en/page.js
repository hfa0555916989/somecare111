import HomePage, { homeAlternates } from "../HomePage";
import { HOME_DESC_EN, HOME_KEYWORDS_EN, HOME_TITLE_EN } from "@/lib/home-landing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: { absolute: HOME_TITLE_EN },
  description: HOME_DESC_EN,
  keywords: HOME_KEYWORDS_EN,
  alternates: homeAlternates("en"),
  openGraph: { title: HOME_TITLE_EN, description: HOME_DESC_EN, locale: "en_US", images: ["/images/brand-og.png"] },
  twitter: { card: "summary_large_image", title: HOME_TITLE_EN, description: HOME_DESC_EN, images: ["/images/brand-og.png"] },
};

// النسخة الإنجليزية من الصفحة الرئيسية
export default function HomeEn() {
  return <HomePage lang="en" />;
}
