import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const pages = ["", "/claim", "/about", "/rules", "/faq", "/terms", "/privacy", "/refund-policy"];
  return [
    ...pages.map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: path ? 0.6 : 1 })),
    ...categories.map(({ slug }) => ({ url: `${base}/category/${slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.5 }))
  ];
}
