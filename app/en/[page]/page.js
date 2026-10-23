import CustomPage, { pageMetadata } from "../../CustomPage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { page } = await params;
  return pageMetadata(page, "en");
}

// النسخة الإنجليزية من الصفحات المضافة من لوحة التحكم (مثل /en/privacy)
export default async function DynamicPageEn({ params }) {
  const { page } = await params;
  return <CustomPage slug={page} lang="en" />;
}
