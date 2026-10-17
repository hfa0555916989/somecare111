import CustomPage, { pageMetadata } from "../../CustomPage";

export const dynamic = "force-dynamic";

export const generateMetadata = ({ params }) => pageMetadata(params.page, "en");

// النسخة الإنجليزية من الصفحات المضافة من لوحة التحكم (مثل /en/privacy)
export default function DynamicPageEn({ params }) {
  return <CustomPage slug={params.page} lang="en" />;
}
