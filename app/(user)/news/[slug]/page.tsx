import { stripHtml } from "@/lib/utils/stripHtml";
import NewsPageDetail from "./NewsDetail";
import type { Metadata } from "next";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/articles?slug=${params.slug}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return { title: "Article not found" };
  }

  const json = await res.json();
  const data = json.data;

  if (!data) {
    return { title: "Article not found" };
  }

  const description = stripHtml(data.content ?? "").slice(0, 160);
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/news/${data.slug}`;

  return {
    title: data.title,
    description,
    openGraph: {
      title: data.title,
      description,
      url,
      siteName: "Execorner",
      type: "article",
      publishedTime: data.publishedAt,
      images: [
        {
          url: data.coverImage,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description,
      images: [data.coverImage],
    },
  };
}

export default function Page({ params }: Props) {
  return <NewsPageDetail params={params} />;
}
