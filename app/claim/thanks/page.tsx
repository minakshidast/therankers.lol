import Link from "next/link";

export default function ClaimThanksPage() {
  return <div className="mx-auto max-w-xl px-5 py-20 text-center"><div className="text-5xl">✳</div><h1 className="mt-5 font-display text-4xl uppercase">You're in the queue.</h1><p className="mt-4 leading-relaxed text-muted">Your payment reference is with our admin team. Your listing will appear after the payment is verified and approved.</p><Link href="/" className="mt-7 inline-flex rounded-full bg-ink px-6 py-3 font-bold text-white">Back to the board</Link></div>;
}
