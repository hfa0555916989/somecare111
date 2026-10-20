import SitelinkPage from "../SitelinkPage";
import { sitelinkMeta } from "@/lib/sitelinks";

export const dynamic = "force-dynamic";
export const metadata = sitelinkMeta("about", "ar");

export default function Page() {
  return <SitelinkPage id="about" lang="ar" />;
}
