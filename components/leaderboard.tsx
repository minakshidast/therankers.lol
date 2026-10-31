"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Entry } from "@/lib/types";
import { categoryName } from "@/lib/categories";

type Props = { entries: Entry[] };
type Period = "all" | "today";

const medals = ["🥇", "🥈", "🥉"];
const placeStyles = ["bg-[#f6dc91]", "bg-[#d9d8d2]", "bg-[#d9a178]"];

export function Leaderboard({ entries }: Props) {
  const [period, setPeriod] = useState<Period>("all");
  const shown = useMemo(() => {
    const filtered = period === "today"
      ? entries.filter((entry) => entry.approved_at && new Date(entry.approved_at).toDateString() === new Date().toDateString())
      : entries;
    return [...filtered].sort((a, b) => b.amount - a.amount);
  }, [entries, period]);

  return (
    <section id="leaderboard" className="scroll-mt-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-muted">The board</p>
          <h2 className="font-display text-2xl uppercase sm:text-3xl">Current standings</h2>
        </div>
        <div className="flex rounded-full border border-ink p-1 text-xs font-bold">
          {(["all", "today"] as const).map((value) => (
            <button key={value} onClick={() => setPeriod(value)} className={`rounded-full px-3 py-2 ${period === value ? "bg-ink text-white" : "hover:bg-white"}`}>
              {value === "all" ? "All-time" : "Today"}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-card">
        <div className="hidden grid-cols-[52px_minmax(0,1fr)_112px_100px] gap-3 border-b border-ink/15 bg-[#eeece5] px-5 py-3 text-[10px] font-black uppercase tracking-[.16em] text-muted sm:grid">
          <span>Rank</span><span>Website</span><span className="text-right">Clicks</span><span className="text-right">Bid</span>
        </div>
        {shown.map((entry, index) => (
          <article key={entry.id} className={`grid grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 border-b border-ink/10 px-4 py-4 last:border-b-0 sm:grid-cols-[52px_minmax(0,1fr)_112px_100px] sm:gap-3 sm:px-5 ${index === 0 ? "bg-[#fff8e4]" : ""}`}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${index < 3 ? placeStyles[index] : "bg-paper"} sm:h-10 sm:w-10`}>
              {index < 3 ? medals[index] : `#${index + 1}`}
            </div>
            <div className="min-w-0">
              <a href={`/go/${entry.id}`} className="group flex min-w-0 items-center gap-2 font-bold hover:underline">
                <img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(entry.url).hostname)}&sz=32`} alt="" width="20" height="20" className="h-5 w-5 shrink-0 rounded-sm" />
                <span className="truncate">{entry.title}</span><span className="hidden text-muted group-hover:text-ink sm:inline">↗</span>
              </a>
              <p className="mt-1 truncate text-xs text-muted">{entry.description}</p>
              <Link href={`/category/${entry.category}`} className="mt-1 inline-block rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted hover:bg-[#f0dfb1]">{categoryName(entry.category)}</Link>
            </div>
            <span className="hidden text-right text-sm tabular-nums text-muted sm:block">{entry.clicks.toLocaleString()}</span>
            <div className="text-right">
              <strong className="whitespace-nowrap text-sm tabular-nums sm:text-base">${entry.amount.toLocaleString()}</strong>
              <span className="block text-[10px] uppercase tracking-wide text-muted sm:hidden">{entry.clicks.toLocaleString()} clicks</span>
            </div>
          </article>
        ))}
        {shown.length === 0 && <div className="px-5 py-12 text-center"><p className="font-bold">No spots on the board yet.</p><p className="mt-1 text-sm text-muted">Make history. Claim the first spot.</p><Link href="/claim" className="mt-4 inline-block rounded-full bg-ink px-5 py-3 text-sm font-bold text-white">Claim #1 ↗</Link></div>}
      </div>
    </section>
  );
}
