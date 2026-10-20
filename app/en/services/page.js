import SitelinkPage from "../../SitelinkPage";
import { sitelinkMeta } from "@/lib/sitelinks";

export const dynamic = "force-dynamic";
export const metadata = sitelinkMeta("services", "en");

export default function Page() {
  return <SitelinkPage id="services" lang="en" />;
}
