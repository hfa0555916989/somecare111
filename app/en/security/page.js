import SecurityPage, { securityMetadata } from "../../SecurityPage";

export const dynamic = "force-dynamic";

export const generateMetadata = () => securityMetadata("en");

export default function SecurityEn() {
  return <SecurityPage lang="en" />;
}
