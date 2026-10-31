import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return <article className="mx-auto max-w-3xl px-5 py-14 leading-relaxed"><p className="text-xs font-black uppercase tracking-[.2em] text-muted">Payments, clearly explained</p><h1 className="mt-2 font-display text-4xl uppercase">Refund policy</h1><div className="mt-7 space-y-5"><p>Payments are reviewed manually. Do not treat a payment as accepted until your listing has been approved.</p><h2 className="text-xl font-bold">After approval</h2><p><strong>No refunds are available after a listing is approved.</strong> The confirmed payment secures the displayed ranking placement while that amount remains competitive. A later higher approved bid may move your listing down.</p><h2 className="text-xl font-bold">Before approval</h2><p>If a payment cannot be verified or a listing is rejected, contact the site operator using the email address provided with your submission. Any refund for an unapproved or rejected entry is handled by the operator and payment provider, subject to applicable law and payment-provider rules. Duplicate or mistaken payments should be reported promptly.</p><p>Nothing in this policy limits mandatory consumer rights under applicable law.</p></div></article>;
}
