import SitelinkPage from "../../SitelinkPage";
import { sitelinkMeta } from "@/lib/sitelinks";

export const dynamic = "force-dynamic";
export const metadata = sitelinkMeta("about", "en");

export default function Page() {
  return <SitelinkPage id="about" lang="en" />;
}
