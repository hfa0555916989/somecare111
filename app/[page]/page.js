import CustomPage, { pageMetadata } from "../CustomPage";

export const dynamic = "force-dynamic";

export const generateMetadata = ({ params }) => pageMetadata(params.page, "ar");

export default function DynamicPage({ params }) {
  return <CustomPage slug={params.page} lang="ar" />;
}
