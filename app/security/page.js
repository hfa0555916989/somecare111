import SecurityPage, { securityMetadata } from "../SecurityPage";

export const dynamic = "force-dynamic";

export const generateMetadata = () => securityMetadata("ar");

export default function Security() {
  return <SecurityPage lang="ar" />;
}
