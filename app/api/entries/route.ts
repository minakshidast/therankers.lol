import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/supabase-admin";
import { cleanAmount, cleanCategory, cleanEmail, cleanText, cleanUrl } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL
    || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: "Submissions are not configured yet. Add the Supabase URL, anon key, and service-role key to .env.local, then restart the app." },
      { status: 503 }
    );
  }

  try {
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 10_000) return NextResponse.json({ error: "Submission is too large." }, { status: 413 });
    const ip = request.headers.get("x-real-ip")?.trim()
      || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || "unknown";
    const ipHash = createHash("sha256").update(`${process.env.SUPABASE_SERVICE_ROLE_KEY}:${ip}`).digest("hex");
    const db = getAdminDb();
    const { data: rateAllowed, error: rateError } = await db.rpc("consume_submission_limit", { p_ip_hash: ipHash });
    if (rateError) {
      if (rateError.code === "PGRST202" || rateError.code === "42883") {
        return NextResponse.json(
          { error: "Supabase is connected, but its schema is not set up. Run supabase/schema.sql in the Supabase SQL Editor." },
          { status: 503 }
        );
      }
      throw new Error(`Rate limit check failed: ${rateError.message}`);
    }
    if (rateAllowed !== true) return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON submission." }, { status: 400 });
    }
    if (!body || typeof body !== "object") throw new Error("Invalid submission.");
    const values = body as Record<string, unknown>;
    const title = cleanText(values.title, 80);
    const url = cleanUrl(values.url);
    const description = cleanText(values.description, 160);
    const category = cleanCategory(values.category);
    const email = cleanEmail(values.email);
    const amount = cleanAmount(values.amount);
    const paymentRef = cleanText(values.payment_ref, 120);
    const payerName = cleanText(values.payer_name, 100);
    if (values.payment_method !== "upi" && values.payment_method !== "paypal") {
      throw new Error("Choose a valid payment method.");
    }
    const paymentMethod = values.payment_method;
    const paymentFxRate = Number(process.env.NEXT_PUBLIC_USD_INR_RATE || "100");
    if (!Number.isSafeInteger(paymentFxRate) || paymentFxRate < 1 || paymentFxRate > 1_000) {
      throw new Error("Payment exchange-rate configuration is invalid.");
    }
    const paymentCurrency = paymentMethod === "upi" ? "INR" : "USD";
    const paymentAmount = paymentMethod === "upi" ? amount * paymentFxRate : amount;
    const { data: top, error: topError } = await db.from("entries").select("amount").eq("status", "approved").order("amount", { ascending: false }).limit(1).maybeSingle();
    if (topError) throw new Error(`Could not verify current top bid: ${topError.message}`);
    const minimum = (top?.amount ?? 0) + 1;
    if (amount < minimum) return NextResponse.json({ error: `The current minimum bid is $${minimum}. Refresh the claim page and try again.` }, { status: 409 });

    const { error } = await db.from("entries").insert({
      title, url, description, category, email, amount,
      payment_method: paymentMethod,
      payment_currency: paymentCurrency,
      payment_amount: paymentAmount,
      payment_fx_rate: paymentFxRate,
      payment_ref: `${paymentRef} (payer: ${payerName})`,
      status: "pending"
    });
    if (error) throw new Error(`Could not save your entry: ${error.message}`);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submission failed.";
    const clientError = /Please|Enter|Choose|Only|Text must|Amount must|not allowed|Invalid submission/.test(message);
    if (clientError) return NextResponse.json({ error: message }, { status: 400 });
    console.error("Entry submission failed", error);
    return NextResponse.json({ error: "We could not submit your entry right now. Please try again later." }, { status: 500 });
  }
}
