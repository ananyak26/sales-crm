# Sales CRM (Leads → Deals → Quotes → Invoices)

A lightweight, self-hosted alternative to Zoho CRM for your sales team:
manage leads and deals, build quotations from a shared price book, send a
shareable quote link to clients, and convert accepted quotes into invoices.

## 1. Create a Supabase project (free tier is enough to start)

1. Go to https://supabase.com → New Project.
2. Once created, open **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and run it. This creates all tables, the
   auto-profile trigger, and row-level security policies.
3. Then run `supabase/migration_002_gst_quotes.sql` in a new query. This
   adds GST-specific fields (GSTIN, HSN/SAC, place of supply, IGST vs
   CGST+SGST) so quotes come out matching the Indian GST quote format
   (like Zoho's).
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (optional, only if you later need admin scripts) →
     `SUPABASE_SERVICE_ROLE_KEY`
5. In **Authentication → Providers**, Email is enabled by default. If you'd
   rather invite reps manually instead of letting anyone sign up, go to
   **Authentication → Settings** and turn off "Allow new users to sign up",
   then invite each rep from the Authentication tab.
6. Once the app is running (see below) and you've logged in, go to
   **Settings** inside the app and fill in your company's letterhead —
   name, address, GSTIN, bank details, and default terms. This appears on
   every quote automatically, just like Zoho's organization profile.

## 2. Set up email sending (optional but recommended)

Quotes are "sent" as a link the client can open (no PDF attachment
juggling). To actually deliver the email:

1. Create a free account at https://resend.com
2. Get an API key → set it as `RESEND_API_KEY`.
3. (Optional) Verify your own domain in Resend and set `SEND_FROM_EMAIL` to
   an address on that domain. Until then it will send from Resend's shared
   test address, which works but looks less professional.

If you skip this step entirely, everything else still works — reps can
still download the PDF and send it manually via their own email/WhatsApp.

## 3. Local development

```bash
npm install
cp .env.example .env.local   # then fill in your real values
npm run dev
```

Visit http://localhost:3000 — you'll land on `/login`. Sign up with an
email + password to create the first sales rep account.

## 4. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **New Project → Import** your repo.
3. Add the environment variables from `.env.example` (with real values) in
   Vercel's Project Settings → Environment Variables.
4. Set `NEXT_PUBLIC_SITE_URL` to your production URL (e.g.
   `https://your-app.vercel.app`) once you know it.
5. Deploy. That's it — Vercel builds and hosts the Next.js app for free on
   the Hobby plan.

## What's included

- **Leads** — capture and qualify prospects
- **Accounts** — client companies
- **Deals** — sales pipeline with stages and amounts
- **Products** — your price book (name, HSN/SAC, price, tax rate, unit)
- **Quotes** — build a quote from the price book or custom items, in an
  Indian GST-style layout (Bill To/Ship To, HSN/SAC, IGST or CGST+SGST
  split, amount in words, bank details, terms) matching what Zoho
  generates. Auto-calculates totals, generates a PDF, and produces a
  shareable client-facing link (`/quote/[token]`) that requires no login
- **Invoices** — one click "Convert to Invoice" from any quote, with status
  tracking (Draft/Sent/Paid/Overdue)

## Notes / things to customize

- Currency is hardcoded to ₹ (INR) — search for `₹` and `en-IN` to change.
- All logged-in reps currently see all data (a shared team CRM, like a
  small Zoho team account). If you want each rep to only see their own
  records, that's a change to the RLS policies in `supabase/schema.sql`
  (filter by `created_by = auth.uid()` instead of `auth.role() =
  'authenticated'`) — happy to help wire that up.
- Quote/Invoice numbering (`QT-0001`, `INV-0001`) is based on row count;
  fine for a small team, but for heavier concurrent use switch to a
  Postgres sequence.
- IGST vs CGST+SGST is auto-detected by comparing your company's state
  (Settings) with the client account's state (Accounts) — same state
  splits into CGST+SGST, different state uses IGST. This is the standard
  GST rule, but always double check with your accountant for edge cases.
