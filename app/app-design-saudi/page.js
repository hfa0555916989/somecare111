import SeoArticle from "../SeoArticle";
import { getSeoPage, pageMeta } from "@/lib/seo-pages";

export const dynamic = "force-dynamic";
export const metadata = pageMeta(getSeoPage("app-design-saudi"));

export default function Page() {
  return <SeoArticle id="app-design-saudi" />;
}
