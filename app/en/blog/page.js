import SitelinkPage from "../../SitelinkPage";
import { sitelinkMeta } from "@/lib/sitelinks";

export const dynamic = "force-dynamic";
export const metadata = sitelinkMeta("blog", "en");

export default function Page() {
  return <SitelinkPage id="blog" lang="en" />;
}
