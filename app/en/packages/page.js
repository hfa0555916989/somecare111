import SitelinkPage from "../../SitelinkPage";
import { sitelinkMeta } from "@/lib/sitelinks";

export const dynamic = "force-dynamic";
export const metadata = sitelinkMeta("packages", "en");

export default function Page() {
  return <SitelinkPage id="packages" lang="en" />;
}
