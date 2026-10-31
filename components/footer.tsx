import Link from "next/link";

const links = [
  ["About", "/about"], ["Rules", "/rules"], ["FAQ", "/faq"],
  ["Terms", "/terms"], ["Privacy", "/privacy"], ["Refunds", "/refund-policy"]
];

export function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-bold">A little internet fame, one bid at a time.</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-muted">
          {links.map(([label, href]) => <Link key={href} href={href} className="hover:text-ink">{label}</Link>)}
        </nav>
        {process.env.NEXT_PUBLIC_SUPPORT_EMAIL && <a className="text-muted hover:text-ink" href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>Support</a>}
      </div>
    </footer>
  );
}
