import Link from "next/link";

export function Header() {
  return (
    <header className="border-b-2 border-ink bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="font-display text-lg tracking-tight sm:text-xl">
          THE RANKING<span className="text-gold">.</span>
        </Link>
        <nav className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider sm:gap-7 sm:text-sm">
          <Link href="/#leaderboard" className="hover:text-gold">Leaderboard</Link>
          <Link href="/rules" className="hidden hover:text-gold sm:inline">Rules</Link>
          <Link href="/claim" className="rounded-full bg-ink px-4 py-2.5 text-white hover:bg-gold hover:text-ink">Claim a spot ↗</Link>
        </nav>
      </div>
    </header>
  );
}
