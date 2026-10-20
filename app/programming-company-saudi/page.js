import SeoArticle from "../SeoArticle";
import { getSeoPage, pageMeta } from "@/lib/seo-pages";

export const dynamic = "force-dynamic";
export const metadata = pageMeta(getSeoPage("programming-company-saudi"));

export default function Page() {
  return <SeoArticle id="programming-company-saudi" />;
}
