# B2B Wholesale Clothing Marketplace

A multi-vendor B2B marketplace where verified apparel suppliers list wholesale catalogs and
retail buyers source stock with transparent per-unit pricing and low minimum order quantities.

Built with Next.js 16 (App Router), React 19, PostgreSQL, and NextAuth.

## Features

- **JBL-inspired storefront** — bold orange accent, ink neutrals, responsive hero, category grid,
  featured products, benefits, and CTA sections.
- **Credentials authentication** — bcrypt password verification, JWT sessions, role-aware
  redirects, and protected dashboards.
- **Wholesaler dashboard** — catalog table with live product data, active-product and order stats,
  storefront-readiness checklist, payouts card, and order empty state.
- **Client dashboard** — credit limit and payment terms from the database, recommended styles,
  buying profile, and orders/quotes empty states.
- **Demo data** — two verified businesses, four products with variants, prices, and MOQs.
- **Custom CSS design system** — no Tailwind dependency; tokens, components, and responsive rules
  live in `app/globals.css`.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.4.6 (App Router) |
| UI | React 19, hand-written CSS |
| Database | PostgreSQL 15 (`b2b_platform`) |
| DB access | `pg` (node-postgres) |
| Auth | NextAuth v4 (Credentials) |
| Passwords | bcryptjs |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL running locally on port `5433` with:
  - database `b2b_platform`
  - user `b2b_user`
  - password `devpass123`

### Install and run

```bash
npm install
cp .env.example .env.local
npx next dev --webpack
```

Open [http://localhost:3000](http://localhost:3000).

> Use `--webpack` for the dev server in this environment; Turbopack dev mode has known
> parse/compatibility issues with this project.

### Seed demo data

```bash
npm run seed:demo
```

This creates the demo accounts, businesses, profiles, products, and variants. It is safe to
re-run — existing demo rows are updated.

### Production build

```bash
npx next build
```

## Deploy to Vercel

Vercel cannot reach a local PostgreSQL database. You need a hosted Postgres instance
(Neon, Supabase, or Vercel Postgres), then point the app at it.

### 1. Create the cloud database

Create a database with your provider and copy its connection string. Use the pooled
connection string with SSL, for example:

```text
postgres://user:password@host/dbname?sslmode=require
```

### 2. Create the schema and seed data

Run these once from your machine, with the cloud connection string:

```bash
DATABASE_URL="postgres://user:password@host/dbname?sslmode=require" npm run db:cloud
DATABASE_URL="postgres://user:password@host/dbname?sslmode=require" npm run seed:demo
```

`npm run db:cloud` creates the 25 tables and 9 enum types from `db/schema.sql`.
`npm run seed:demo` loads the demo accounts, businesses, and products.

### 3. Import the project into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import `RajeshPuri/b2b`.
2. Framework preset: **Next.js** (build and output settings are auto-detected).
3. Add these environment variables for **Production** (and Preview if needed):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your hosted Postgres connection string |
| `NEXTAUTH_SECRET` | Output of `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-production-domain` |

4. Click **Deploy**.

If you do not know the final domain before the first deploy, deploy once, copy the
production URL, add `NEXTAUTH_URL`, and redeploy. Sign-in callbacks require the correct
`NEXTAUTH_URL`; preview deployment URLs are not covered by it.

### CLI alternative

```bash
npx vercel link
npx vercel env add DATABASE_URL production
npx vercel env add NEXTAUTH_SECRET production
npx vercel env add NEXTAUTH_URL production
npx vercel --prod
```

### After deploying

- Test sign-in with the demo accounts, then change or remove them — they are public in this repo.
- Local `.env.local` files are git-ignored and are never uploaded to Vercel.

## Demo Accounts

Development-only credentials.

| Role | Email | Password | Dashboard |
|---|---|---|---|
| Wholesaler | `wholesaler@b2b.com` | `wholesale123` | `/dashboard/wholesaler` |
| Client | `client@b2b.com` | `client123` | `/dashboard/client` |
| Admin | `admin@b2b.com` | `admin123` | `/dashboard/wholesaler` (both dashboards) |

Sign in at `/auth/login`. The quick-fill chips fill credentials for each role, and the login
form redirects to the correct dashboard automatically.

## Routes

| Route | Description |
|---|---|
| `/` | Marketing homepage and catalog preview |
| `/auth/login` | Credentials sign-in with role-based redirect |
| `/auth/register` | Buyer registration form (UI only) |
| `/products/new` | Supplier product form (UI only) |
| `/dashboard/wholesaler` | Protected supplier dashboard |
| `/dashboard/client` | Protected buyer dashboard |
| `/api/auth/*` | NextAuth endpoints |
| `/products` | Product API (public GET; writes require a session) |
| `/business/register` | Business registration API (session required) |

Role guards: anonymous visitors are sent to `/auth/login`; clients and wholesalers are redirected
away from each other's dashboards.

## Project Structure

```
app/
  api/auth/[...nextauth]/route.js    NextAuth handler
  auth/                              Login and register pages
  components/                        Header, footer, dashboard shell, login form
  dashboard/                         Wholesaler and client dashboards
  products/                          Product form and API
  globals.css                        Design system
  layout.tsx, page.tsx               Root layout and homepage
lib/
  auth.js                            bcrypt verification and user/tenant helpers
  auth-options.js                    NextAuth configuration and callbacks
  db.js                              Shared pg pool
middleware/                          Tenant and JWT helpers (not mounted yet)
prisma/schema.prisma                 Reference data model
docs/
  planning/                          Architecture and planning documents
  report/PROJECT-REPORT.md           Full project status report
seed-demo-accounts.js                Demo data seeder
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server with webpack |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run seed` | Run the original seed script |
| `npm run seed:demo` | Seed demo users, businesses, products, and variants |
| `npm run db:cloud` | Create the schema on a database in `DATABASE_URL` |

## Notes and Known Limitations

- Registration forms are visual only; they are not wired to APIs yet.
- Orders, quotes, invoices, and payments are not implemented; dashboards show empty states.
- Prisma client generation is not functional in this environment; the app uses raw `pg`.
- `.env.local` and `.env.development` are git-ignored. Never commit real secrets.
- Turbopack constraints: avoid JSX comments and do not place `page.tsx` and `route.js`
  in the same route segment.

See [`docs/report/PROJECT-REPORT.md`](docs/report/PROJECT-REPORT.md) for the complete status
report, verification log, and roadmap.
