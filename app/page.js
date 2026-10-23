import HomePage, { homeAlternates } from "./HomePage";
import { HOME_DESC_AR, HOME_KEYWORDS_AR, HOME_TITLE_AR } from "@/lib/home-landing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: { absolute: HOME_TITLE_AR },
  description: HOME_DESC_AR,
  keywords: HOME_KEYWORDS_AR,
  alternates: homeAlternates("ar"),
  openGraph: { title: HOME_TITLE_AR, description: HOME_DESC_AR, locale: "ar_SA", images: ["/images/brand-og.png"] },
  twitter: { card: "summary_large_image", title: HOME_TITLE_AR, description: HOME_DESC_AR, images: ["/images/brand-og.png"] },
};

export default function Home() {
  return <HomePage lang="ar" />;
}
