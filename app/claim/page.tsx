import type { Metadata } from "next";
import { ClaimForm } from "@/components/claim-form";
import { getTopAmount } from "@/lib/data";

export const metadata: Metadata = { title: "Claim your spot", description: "Submit your site and bid for a place on The Ranking leaderboard." };
export const dynamic = "force-dynamic";

export default async function ClaimPage() {
  let topAmount = 0;
  try {
    topAmount = await getTopAmount();
  } catch (error) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) throw error;
  }
  return <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16"><p className="text-xs font-black uppercase tracking-[.2em] text-muted">Make your mark</p><h1 className="mt-2 font-display text-4xl uppercase tracking-tight sm:text-5xl">Claim your spot.</h1><p className="mb-7 mt-3 max-w-xl text-muted">A good link deserves to be seen. Submit your details and take a place on the board.</p><ClaimForm topAmount={topAmount} /></div>;
}
