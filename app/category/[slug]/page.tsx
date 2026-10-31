import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedEntries } from "@/lib/data";
import { categories, categoryName } from "@/lib/categories";
import { Leaderboard } from "@/components/leaderboard";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return categories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!categories.some((category) => category.slug === slug)) return {};
  return { title: `${categoryName(slug)} websites`, description: `Explore top-ranked ${categoryName(slug).toLowerCase()} websites on The Ranking.` };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!categories.some((category) => category.slug === slug)) notFound();
  const allEntries = await getApprovedEntries();
  const entries = allEntries.filter((entry) => entry.category === slug);
  return <div className="mx-auto max-w-7xl px-5 py-12"><Link href="/" className="text-sm font-bold text-muted hover:text-ink">← All categories</Link><h1 className="mb-8 mt-3 font-display text-4xl uppercase">{categoryName(slug)}</h1><Leaderboard entries={entries} /></div>;
}
