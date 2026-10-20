import SitelinkPage from "../SitelinkPage";
import { sitelinkMeta } from "@/lib/sitelinks";

export const dynamic = "force-dynamic";
export const metadata = sitelinkMeta("works", "ar");

export default function Page() {
  return <SitelinkPage id="works" lang="ar" />;
}
