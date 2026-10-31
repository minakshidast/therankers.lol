import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

const faqs = [
  ["How do I get on the board?", "Submit a website, description, category, email, and bid. Complete payment and submit its reference. Listings appear only after manual verification and approval."],
  ["How is the winner chosen?", "Approved entries are ordered by the amount confirmed by the administrator. To claim #1, bid at least $1 above the current top amount."],
  ["When will my listing go live?", "After the admin reviews the payment and approves the submission. Review time can vary; this is not an instant automated payment confirmation. Status emails are not automated."],
  ["Can I edit my listing?", "Contact the site administrator using the email you submitted. Changes may need review."],
  ["Do clicks guarantee sales?", "No. Clicks are a basic count of link redirects and do not guarantee visitors, leads, or purchases."],
  ["Can I get a refund?", "See our Refund Policy. Approved listings are not refundable."]
];

export default function FaqPage() {
  return <article className="mx-auto max-w-3xl px-5 py-14"><p className="text-xs font-black uppercase tracking-[.2em] text-muted">Good questions</p><h1 className="mt-2 font-display text-4xl uppercase">FAQ</h1><div className="mt-8 space-y-6">{faqs.map(([question, answer]) => <section key={question} className="border-b border-ink/15 pb-5"><h2 className="font-bold">{question}</h2><p className="mt-2 leading-relaxed text-muted">{answer}</p></section>)}</div></article>;
}
