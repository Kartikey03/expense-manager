# 💸 Expense Manager

A personal finance dashboard to track **income, expenses, and investments** — built for one user (you), with a glassmorphism UI, smooth animations, and a live Supabase backend. All 2026 data from the original Google Sheet is already loaded.

![stack](https://img.shields.io/badge/Next.js-14-black) ![stack](https://img.shields.io/badge/Supabase-Postgres-3ECF8E) ![stack](https://img.shields.io/badge/Tailwind-3-38BDF8)

## ✨ Features

- **Dashboard** — income / expense / net-investment / free-balance KPIs (animated count-ups), monthly flow bar chart, spending-mix donut, cumulative-balance area chart, recent activity. Filter by month or all-time.
- **Transactions** — searchable, filterable ledger (by type, month, text). Add / edit / delete from a single glass modal.
- **Investments** — net invested, contributions vs withdrawals, portfolio mix by instrument, full investment ledger (withdrawals shown as negative).
- **Auth** — passwordless magic-link sign-in + optional password (set from Settings). Row-level security so data is private to your account.
- **Glassmorphism** everywhere, animated aurora background, Framer Motion transitions, fully responsive (desktop sidebar + mobile bottom nav).

## 🧱 Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + RLS) · Framer Motion · Recharts · Sonner · deploy on Vercel.

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

## 🔁 Re-seeding / importing more data

The 2026 sheet is already imported (197 records). To import again or add a new year, drop a CSV in the same layout and adapt `scripts/` — or just add transactions through the UI.

---

Built with Next.js + Supabase. Numbers reconcile exactly to the source sheet: Income ₹3,15,000 · Expenses ₹2,94,613 · Net investments ₹6,294 · Free balance ₹14,093.
