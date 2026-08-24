import type { Metadata } from "next";
import Insights from "./Insights";
import { getArticles } from "./data/articles";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Articles on mental health written and reviewed by professionals across Indonesia.",
};

export default async function InsightsPage() {
  const articles = await getArticles();

  return <Insights articles={articles} />;
}
