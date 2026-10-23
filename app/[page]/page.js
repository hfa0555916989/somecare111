import CustomPage, { pageMetadata } from "../CustomPage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { page } = await params;
  return pageMetadata(page, "ar");
}

export default async function DynamicPage({ params }) {
  const { page } = await params;
  return <CustomPage slug={page} lang="ar" />;
}
