import type { Metadata } from "next";

export const metadata: Metadata = { title: "About", description: "Why The Ranking exists." };

export default function AboutPage() {
  return <article className="prose mx-auto max-w-3xl px-5 py-14"><p className="text-xs font-black uppercase tracking-[.2em] text-muted">The idea</p><h1 className="mt-2 font-display text-4xl uppercase">About the board</h1><p className="mt-6 leading-relaxed">The Ranking is a public, pay-to-rank directory for projects that want a moment in the spotlight. A higher confirmed bid earns a higher position. No accounts, no complicated profiles: just a link, a pitch, and a place on the board.</p><p className="mt-4 leading-relaxed">Listings are reviewed before they go live. Rankings are determined by the approved amount displayed on each listing, not by clicks or editorial preference.</p></article>;
}
