import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "The Ranking";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} — Pay to be remembered`, template: `%s | ${siteName}` },
  description: "A live leaderboard of the internet's most ambitious websites. Bid for your place in the hall of fame.",
  openGraph: {
    title: `${siteName} — Pay to be remembered`,
    description: "A live leaderboard of the internet's most ambitious websites.",
    url: siteUrl,
    siteName,
    type: "website"
  },
  twitter: { card: "summary_large_image", title: siteName, description: "Bid for your place in the internet hall of fame." }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header /><main>{children}</main><Footer /></body></html>;
}
