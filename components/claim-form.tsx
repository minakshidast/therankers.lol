"use client";

import { useState } from "react";
import { categories } from "@/lib/categories";

type ClaimDetails = {
  title: string; url: string; description: string; category: string; email: string; amount: string;
};
type Props = { topAmount: number };
type PaymentMethod = "upi" | "paypal";

export function ClaimForm({ topAmount }: Props) {
  const [details, setDetails] = useState<ClaimDetails>({ title: "", url: "", description: "", category: "technology", email: "", amount: String(topAmount + 1) });
  const [stage, setStage] = useState<"form" | "payment">("form");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [qrUnavailable, setQrUnavailable] = useState(false);
  const [qrReady, setQrReady] = useState(false);
  const paypalName = (process.env.NEXT_PUBLIC_PAYPAL_ME_NAME || "minakshid606")
    .replace(/^https?:\/\/(?:www\.)?paypal\.me\//i, "")
    .replace(/^\/+|\/+$/g, "");
  const fxRate = Number(process.env.NEXT_PUBLIC_USD_INR_RATE || "100");
  const fxRateValid = Number.isSafeInteger(fxRate) && fxRate >= 1 && fxRate <= 1_000;
  const minimum = topAmount + 1;
  const amountNumber = Number(details.amount);
  const paymentAmount = paymentMethod === "upi" ? amountNumber * fxRate : amountNumber;

  function update(field: keyof ClaimDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
  }

  async function submitPaymentProof(formData: FormData) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          amount: Number(details.amount),
          payment_method: paymentMethod,
          payment_ref: formData.get("payment_ref"),
          payer_name: formData.get("payer_name")
        })
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not submit your entry.");
      window.location.assign("/claim/thanks");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not submit your entry.");
    } finally {
      setBusy(false);
    }
  }

  if (stage === "payment") {
    return (
      <div className="rounded-2xl border-2 border-ink bg-white p-5 shadow-card sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.2em] text-muted">Step 2 of 2</p>
        <h2 className="mt-2 font-display text-2xl uppercase">Make your payment</h2>
        <p className="mt-2 text-sm text-muted">Your bid is <strong className="text-ink">${amountNumber.toLocaleString()} USD</strong>. Choose the payment option for your location. Your spot appears after payment review.</p>
        <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-bold">Where are you paying from?</legend>
          <label className={`cursor-pointer rounded-xl border-2 p-4 ${paymentMethod === "upi" ? "border-ink bg-[#fff8e4]" : "border-ink/15"}`}>
            <input type="radio" name="payment_method" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} className="mr-2 accent-ink" />
            <span className="font-bold">India · UPI / bank</span><span className="mt-1 block pl-6 text-xs text-muted">Pay ₹{paymentMethod === "upi" ? paymentAmount.toLocaleString("en-IN") : (amountNumber * fxRate).toLocaleString("en-IN")} INR · fixed rate ₹{fxRate}/USD</span>
          </label>
          <label className={`cursor-pointer rounded-xl border-2 p-4 ${paymentMethod === "paypal" ? "border-ink bg-[#fff8e4]" : "border-ink/15"}`}>
            <input type="radio" name="payment_method" value="paypal" checked={paymentMethod === "paypal"} onChange={() => setPaymentMethod("paypal")} className="mr-2 accent-ink" />
            <span className="font-bold">Outside India · PayPal</span><span className="mt-1 block pl-6 text-xs text-muted">Pay ${amountNumber.toLocaleString()} USD</span>
          </label>
        </fieldset>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {paymentMethod === "upi" && <div className="rounded-xl border border-ink/15 bg-paper p-4">
            <p className="text-xs font-black uppercase tracking-wide">UPI / Bank transfer</p>
            <div className="mt-3 flex min-h-44 items-center justify-center rounded-lg border border-dashed border-ink/25 bg-white p-4 text-center">
              <div>{qrUnavailable ? <p className="text-sm font-bold text-red-700">Indian payments are not configured yet. {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ? <a className="underline" href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>Contact support.</a> : "Please try again later."}</p> : <><img src="/qr.png" alt="UPI or bank payment QR code" className="mx-auto max-h-36 max-w-full object-contain" onLoad={() => setQrReady(true)} onError={() => { setQrReady(false); setQrUnavailable(true); }} />{!qrReady && <p className="text-xs text-muted">Loading verified payment QR…</p>}</>}<p className="mt-2 text-sm font-bold">Pay ₹{(amountNumber * fxRate).toLocaleString("en-IN")} INR</p><p className="mt-1 text-xs text-muted">Fixed conversion: ₹{fxRate} for each $1 USD bid. Enter the exact amount in your UPI app.</p></div>
            </div>
            <p className="mt-2 text-xs text-muted">Please verify the recipient and amount before paying.</p>
          </div>}
          {paymentMethod === "paypal" && <div className="rounded-xl border border-ink/15 bg-paper p-4">
            <p className="text-xs font-black uppercase tracking-wide">PayPal</p>
            <p className="mt-4 text-sm text-muted">Send the exact USD amount to PayPal.Me.</p>
            {paypalName ? <a href={`https://paypal.me/${encodeURIComponent(paypalName)}/${amountNumber}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-full bg-[#ffc439] px-5 py-3 font-bold">Pay ${amountNumber.toLocaleString()} with PayPal ↗</a> : <p className="mt-3 font-bold text-red-700">PayPal is not configured. Contact support.</p>}
            <p className="mt-3 text-xs text-muted">PayPal.me does not verify the payment for us. Approval is manual.</p>
          </div>}
        </div>
        <form action={submitPaymentProof} className="mt-6 grid gap-4">
          <label className="grid gap-1 text-sm font-bold">Transaction ID / payment reference
            <input name="payment_ref" required maxLength={120} className="rounded-lg border border-ink/25 px-3 py-3 font-normal outline-none focus:border-ink" placeholder={paymentMethod === "upi" ? "UPI / bank transaction ID" : "PayPal transaction ID"} />
          </label>
          <label className="grid gap-1 text-sm font-bold">Payer name
            <input name="payer_name" required maxLength={100} className="rounded-lg border border-ink/25 px-3 py-3 font-normal outline-none focus:border-ink" placeholder="Name on the payment" />
          </label>
          {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStage("form")} className="rounded-full border border-ink px-5 py-3 text-sm font-bold">Back</button>
            <button disabled={busy || (paymentMethod === "upi" ? !qrReady || !fxRateValid : !paypalName)} className="flex-1 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Submitting…" : "Submit for review →"}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); setError(""); setStage("payment"); }} className="grid gap-4 rounded-2xl border-2 border-ink bg-white p-5 shadow-card sm:p-8">
      <p className="text-xs font-black uppercase tracking-[.2em] text-muted">Step 1 of 2</p>
      <h2 className="font-display text-2xl uppercase">Your listing</h2>
      <label className="grid gap-1 text-sm font-bold">Website or project name
        <input required maxLength={80} value={details.title} onChange={(e) => update("title", e.target.value)} className="rounded-lg border border-ink/25 px-3 py-3 font-normal outline-none focus:border-ink" placeholder="The name people will see" />
      </label>
      <label className="grid gap-1 text-sm font-bold">Website URL
        <input required type="url" pattern="https://.*" value={details.url} onChange={(e) => update("url", e.target.value)} className="rounded-lg border border-ink/25 px-3 py-3 font-normal outline-none focus:border-ink" placeholder="https://yourwebsite.com" />
      </label>
      <label className="grid gap-1 text-sm font-bold">Short description <span className="font-normal text-muted">{details.description.length}/160</span>
        <textarea required maxLength={160} value={details.description} onChange={(e) => update("description", e.target.value)} rows={3} className="resize-y rounded-lg border border-ink/25 px-3 py-3 font-normal outline-none focus:border-ink" placeholder="What makes it worth a click?" />
      </label>
      <label className="grid gap-1 text-sm font-bold">Category
        <select value={details.category} onChange={(e) => update("category", e.target.value)} className="rounded-lg border border-ink/25 bg-white px-3 py-3 font-normal">
          {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-bold">Email <span className="font-normal text-muted">Private — used for status updates only.</span>
        <input required type="email" maxLength={254} value={details.email} onChange={(e) => update("email", e.target.value)} className="rounded-lg border border-ink/25 px-3 py-3 font-normal outline-none focus:border-ink" placeholder="you@example.com" />
      </label>
      <label className="grid gap-1 text-sm font-bold">Your bid (USD)
        <span className="text-xs font-normal text-muted">Current #1: ${topAmount.toLocaleString()} · Minimum to claim #1: ${minimum.toLocaleString()}</span>
        <div className="flex items-center rounded-lg border border-ink/25 px-3 focus-within:border-ink"><span className="font-bold">$</span><input required type="number" min={minimum} max={1000000} step={1} value={details.amount} onChange={(e) => update("amount", e.target.value)} className="w-full border-0 px-2 py-3 outline-none" /></div>
      </label>
      <p aria-live="polite" className="rounded-lg bg-[#fff8e4] p-3 text-sm font-bold">{Number.isSafeInteger(amountNumber) && amountNumber >= minimum ? `Claim #1 for $${amountNumber.toLocaleString()}` : `Enter at least $${minimum.toLocaleString()} to claim #1`}</p>
      {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
      <button disabled={!Number.isSafeInteger(amountNumber) || amountNumber < minimum} className="rounded-full bg-ink px-5 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Continue to payment →</button>
      <p className="text-center text-xs text-muted">No account needed. Your listing goes live after payment review.</p>
    </form>
  );
}
