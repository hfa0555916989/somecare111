import SeoArticle from "../SeoArticle";
import { getSeoPage, pageMeta } from "@/lib/seo-pages";

export const dynamic = "force-dynamic";
export const metadata = pageMeta(getSeoPage("create-online-store"));

export default function Page() {
  return <SeoArticle id="create-online-store" />;
}
