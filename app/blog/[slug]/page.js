import { notFound } from "next/navigation";
import SeoArticle from "../../SeoArticle";
import { getPostBySlug, pageMeta } from "@/lib/seo-pages";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }) {
  const page = getPostBySlug(params.slug);
  return page ? pageMeta(page) : { robots: { index: false, follow: false } };
}

export default function Post({ params }) {
  const page = getPostBySlug(params.slug);
  if (!page) notFound();
  return <SeoArticle id={page.id} />;
}
