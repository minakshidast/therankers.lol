# The Ranking

A mobile-first pay-to-rank directory built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase. It has no visitor accounts. Submissions and ranking changes are handled server-side; administrator approval verifies the amount against the current top bid atomically.

## Local setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local` and fill in the Supabase project URL, anon key, service-role key, a randomly generated `ADMIN_PASSWORD` (at least 32 characters), the public site URL/name, PayPal.Me name, fixed INR-per-USD rate, and support email.
3. In the Supabase SQL editor, run [`supabase/schema.sql`](./supabase/schema.sql).
4. Put your verified Indian UPI/bank QR image at `public/qr.png` (create `public/` if needed). Test it and verify the beneficiary name and exact rupee amount before publishing.
5. Run `npm install`, then `npm run dev`. For a production build, run `npm run build`.

The service-role key is used only in server-only modules and must never be exposed in a `NEXT_PUBLIC_` variable. The public anon key is subject to the supplied row-level security policy.

## Payments and operations

The claim page lets a buyer select India (UPI / bank QR, charged in INR at the configured fixed rate) or outside India (PayPal.Me in USD). Ranking bids always remain USD. UPI payment amounts and the exchange-rate snapshot are recorded with each pending entry. The payment screen intentionally disables submission when the selected payment method is not configured or the Indian QR cannot be loaded.

Payment providers do not send a verified webhook in this starter; an administrator must independently confirm receipt and enter the actual amount in `/admin` before approval. Do not approve based only on the submitter's reference. The administrator signs in at `/admin` with `ADMIN_PASSWORD` (minimum 32 characters). The signed, HTTP-only cookie expires after 12 hours. Configure HTTPS in production. The submit API uses a database-backed limit of five attempts per IP hash per hour; admin logins are limited to ten attempts per IP hash per 15 minutes.

There are no automated status emails. The support email is public. Before accepting payments, verify that your payment accounts may be used for this service and that your India-based business/tax and cross-border payment obligations are satisfied.

## Deploy to Vercel

Import the project, set all `.env.example` values in Vercel's environment settings, execute the SQL schema in Supabase, and deploy. Use the actual HTTPS deployment URL for `NEXT_PUBLIC_SITE_URL`. Add the payment QR as `public/qr.png` before deployment. Review the policies and privacy/terms copy for the jurisdictions where you operate.
