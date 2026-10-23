import { notFound } from "next/navigation";
import SeoArticle from "../../SeoArticle";
import { getPostBySlug, pageMeta } from "@/lib/seo-pages";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = getPostBySlug(slug);
  return page ? pageMeta(page) : { robots: { index: false, follow: false } };
}

export default async function Post({ params }) {
  const { slug } = await params;
  const page = getPostBySlug(slug);
  if (!page) notFound();
  return <SeoArticle id={page.id} />;
}
