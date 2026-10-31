export const categories = [
  { slug: "technology", name: "Technology", emoji: "⚡" },
  { slug: "design", name: "Design", emoji: "✳️" },
  { slug: "business", name: "Business", emoji: "◈" },
  { slug: "education", name: "Education", emoji: "✎" },
  { slug: "entertainment", name: "Entertainment", emoji: "♫" },
  { slug: "food", name: "Food & Drink", emoji: "✿" },
  { slug: "health", name: "Health & Fitness", emoji: "♡" },
  { slug: "travel", name: "Travel", emoji: "✈" },
  { slug: "community", name: "Community", emoji: "◎" },
  { slug: "other", name: "Other", emoji: "✦" }
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export function categoryName(slug: string): string {
  return categories.find((category) => category.slug === slug)?.name ?? "Other";
}
