import HomePage, { homeAlternates } from "../HomePage";

export const dynamic = "force-dynamic";

export const metadata = { alternates: homeAlternates("en") };

// النسخة الإنجليزية من الصفحة الرئيسية
export default function HomeEn() {
  return <HomePage lang="en" />;
}
