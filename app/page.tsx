import Link from "next/link";
import { Leaderboard } from "@/components/leaderboard";
import { getApprovedEntries, getLatestEntries } from "@/lib/data";
import { categoryName } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [entries, latest] = await Promise.all([getApprovedEntries(), getLatestEntries()]);
  return (
    <>
      <section className="topo relative overflow-hidden border-b-2 border-ink bg-[#f0dfb1]">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 py-14 sm:grid-cols-[1.3fr_.7fr] sm:py-24">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-ink px-3 py-1 text-[10px] font-black uppercase tracking-[.2em]">The internet's loudest little leaderboard</p>
            <h1 className="max-w-3xl font-display text-5xl uppercase leading-[.94] tracking-[-.06em] sm:text-7xl lg:text-8xl">Pay to<br />be <span className="text-white" style={{ WebkitTextStroke: "1.5px #171717" }}>remembered.</span></h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed sm:text-lg">One board. Every website. The highest bidder gets the crown. Your link, your moment in the spotlight.</p>
            <Link href="/claim" className="mt-7 inline-flex rounded-full bg-ink px-6 py-4 text-sm font-bold text-white shadow-[4px_4px_0_#fff] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none">Claim the top spot ↗</Link>
          </div>
          <div className="mx-auto w-full max-w-sm rotate-2 rounded-2xl border-2 border-ink bg-[#fffaf0] p-5 shadow-[8px_8px_0_#171717]">
            <div className="flex items-center justify-between border-b border-ink/20 pb-3 text-xs font-black uppercase tracking-wider"><span>Hall of fame</span><span className="text-[#b68c1e]">● LIVE</span></div>
            <div className="mt-5 space-y-3">
              {[["01", "The one to beat", "$???", "bg-[#f6dc91]"], ["02", "Your next big idea", "$??", "bg-[#d9d8d2]"], ["03", "Make a little noise", "$?", "bg-[#d9a178]"]].map((row) =>
                <div key={row[0]} className="flex items-center gap-3 rounded-xl border border-ink/10 p-3"><span className={`grid h-9 w-9 place-items-center rounded-full text-xs font-black ${row[3]}`}>{row[0]}</span><span className="flex-1 text-sm font-bold">{row[1]}</span><strong className="font-display text-sm">{row[2]}</strong></div>
              )}
            </div>
            <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted">Your site could be right here.</p>
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_290px] lg:py-16">
        <Leaderboard entries={entries} />
        <aside>
          <div className="rounded-2xl border-2 border-ink bg-ink p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#e7c35d]">Simple rules</p>
            <ol className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3"><b className="text-[#e7c35d]">01</b><span>Pick your best link and write a one-line pitch.</span></li>
              <li className="flex gap-3"><b className="text-[#e7c35d]">02</b><span>Bid at least $1 more than the current top spot.</span></li>
              <li className="flex gap-3"><b className="text-[#e7c35d]">03</b><span>Pay, send your reference, and wait for review.</span></li>
            </ol>
            <Link href="/claim" className="mt-5 block rounded-full bg-[#e7c35d] px-4 py-3 text-center text-sm font-black text-ink">Put me on the board ↗</Link>
          </div>
          <div className="mt-6 rounded-2xl border-2 border-ink bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[.2em] text-muted">Latest activity</p>
            <div className="mt-4 space-y-4">
              {latest.length === 0 && <p className="text-sm text-muted">The first entry is waiting to make history.</p>}
              {latest.map((entry) => <div key={entry.id} className="border-b border-ink/10 pb-3 last:border-0 last:pb-0"><p className="truncate text-sm font-bold">{entry.title}</p><p className="mt-1 text-xs text-muted">Joined at ${entry.amount.toLocaleString()} · {categoryName(entry.category)}</p></div>)}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
