import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rules" };

export default function RulesPage() {
  return <article className="mx-auto max-w-3xl px-5 py-14"><p className="text-xs font-black uppercase tracking-[.2em] text-muted">Read before bidding</p><h1 className="mt-2 font-display text-4xl uppercase">The rules</h1><ol className="mt-7 list-decimal space-y-4 pl-5 leading-relaxed"><li>Only public websites using HTTPS are accepted.</li><li>To take the number-one position, your bid must be at least $1 more than the current approved number-one amount.</li><li>We review every payment and listing manually. The submitted bid is not confirmed until the administrator verifies payment and approves it.</li><li>Listings must be lawful and must not promote scams, phishing, malware, adult content, weapons, or other harmful activity.</li><li>We may reject or remove a listing that violates these rules or applicable law.</li><li>Clicks are counted when a visitor follows a listing's redirect link. Automated traffic may be filtered at our discretion.</li></ol></article>;
}
