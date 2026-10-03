<img src="public/kiwi-icon.png" width="72" alt="Kiwi icon" />

# Kiwi

Kiwi is a personal finance app to track **income, expenses, and investments** — built for one user (you), with an Apple-style dark UI and a live Supabase backend. All 2026 data from the original Google Sheet is already loaded.

Live: **https://kiwi-money.vercel.app** (the old https://expense-manager-og.vercel.app still works)

![stack](https://img.shields.io/badge/Next.js-14-black) ![stack](https://img.shields.io/badge/Supabase-Postgres-3ECF8E) ![stack](https://img.shields.io/badge/Tailwind-3-38BDF8)

## ✨ Features

- **Dashboard** — income / expense / net-investment / free-balance KPIs (animated count-ups), monthly flow bar chart, spending-mix donut, cumulative-balance area chart, recent activity. Filter by month or all-time.
- **Transactions** — searchable, filterable ledger (by type, month, text). Add / edit / delete from one sheet (bottom sheet on mobile).
- **Investments** — net invested, contributions vs withdrawals, portfolio mix by instrument, full investment ledger (withdrawals shown as negative).
- **Auth** — passwordless magic-link sign-in + optional password (set from Settings). Row-level security so data is private to your account.
- **Apple dark-mode design** in Kiwi green, fully responsive (translucent top bar on desktop, iOS tab bar on mobile), installable to the home screen.
- **CSV export** for the last 1/2/3 months or everything.
- **Fast:** app pages are prerendered, sessions are verified locally, writes are optimistic, and data is cached on-device.

## 🧱 Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + RLS) · Recharts · Sonner · deploy on Vercel.

## 🗂️ Data model

One table, `public.transactions`:

| column | notes |
|---|---|
| `type` | `income` \| `expense` \| `investment` |
| `txn_date` | the transaction date |
| `amount` | signed — investment **withdrawals are negative** |
| `description` | your free-text note (kept verbatim from the sheet) |
| `category` | auto-assigned bucket (Food & Snacks, Family, Salary — Infatix, Mutual Funds, …) |
| `source` | income source / investment instrument |

Full schema (with RLS policies, indexes, `updated_at` trigger) lives in [`supabase/schema.sql`](supabase/schema.sql).

## 🔑 Environment variables

Create `.env.local` (already present locally; **not** committed):

```
NEXT_PUBLIC_SUPABASE_URL=https://pxyuilhuahoabmtwksua.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Both are safe to expose to the browser — access is protected by row-level security, not by hiding these keys.

## 🖥️ Local development

```bash
npm install
npm run dev
# open http://localhost:3000
```

Sign in with the **Magic Link** tab using your email; open the link on the same device. Once in, set a password from **Settings** for faster future logins.

## 🚀 Deploy to Vercel

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com) → **Add New Project** → import the repo (framework auto-detected as Next.js).
3. Add the two env vars above under **Settings → Environment Variables**.
4. Deploy. You'll get a `https://<project>.vercel.app` URL.
5. In **Supabase → Authentication → URL Configuration**, set **Site URL** to your Vercel URL and ensure it's in the redirect allow-list (the wildcard `https://*.vercel.app/**` is already added).

> Tip: the CLI path is `npm i -g vercel && vercel` then `vercel --prod`.

## ✉️ Branded sign-in emails

Kiwi-branded templates for every auth email (sign-in link, confirm, reset, verification code, change notices) live in [`scripts/email_templates.py`](scripts/email_templates.py).

Supabase's free tier only allows custom templates with a **custom SMTP provider**:

1. Supabase Dashboard → **Authentication → Emails → SMTP Settings** → enable custom SMTP (e.g. Gmail with an App Password, Resend, Brevo). Set **Sender name** to `Kiwi`.
2. Apply the templates:

```bash
SUPABASE_ACCESS_TOKEN=sbp_... python3 scripts/email_templates.py --apply
```

Preview them locally with `python3 scripts/email_templates.py --preview /tmp/kiwi-emails`.

## 🔁 Re-seeding / importing more data

The 2026 sheet is already imported (197 records). To import again or add a new year, drop a CSV in the same layout and adapt `scripts/` — or just add transactions through the UI.

---

Built with Next.js + Supabase. Numbers reconcile exactly to the source sheet: Income ₹3,15,000 · Expenses ₹2,94,613 · Net investments ₹6,294 · Free balance ₹14,093.
