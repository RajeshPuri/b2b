# B2B Wholesale Marketplace — Project Report

**Date:** 2026-11-16
**Project root:** `/home/meroworth/mycode/B2B`
**Environment:** Development (local container)
**Status:** Deployment-ready demo — 4 public pages, 2 role dashboards, credentials auth, seeded database, cloud database setup scripts, production build passing, Vercel configuration prepared.

---

## 1. Executive Summary

This is a multi-vendor B2B wholesale clothing marketplace built with Next.js 16 (App Router).
Wholesalers can manage a product catalog; retail clients can browse and (in later milestones) place
wholesale orders, request quotes, and track credit terms.

The current build covers:

- A JBL-inspired marketing site with homepage, catalogue sections, and CTAs.
- Credentials authentication with bcrypt password verification and role-aware sessions.
- Separate wholesaler and client dashboards, protected by session and role checks.
- A PostgreSQL database with 25 tables, 9 enum types, and seeded demo businesses,
  profiles, products, and variants.
- Seeded login accounts for Admin, Wholesaler, and Client with one-click demo access.

The project is a functional MVP demo, not production-ready. Registration UI, order flow,
payments, and several APIs still need implementation (see Known Limitations and Next Steps).

---

## 2. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16.4.6 (App Router) | Dev runs with `--webpack`; production build uses Turbopack |
| UI runtime | React 19 | Server Components by default |
| Language | TypeScript + JavaScript | Pages in TSX; API routes and lib in JS (CommonJS for `lib/auth.js`) |
| Styling | Hand-written CSS design system | Tailwind is not installed; see Section 8 |
| Database | PostgreSQL 15.20 | `127.0.0.1:5433`, database `b2b_platform` |
| DB access | `pg` (node-postgres) | Prisma packages removed; `pg` is the only runtime DB layer |
| Auth | NextAuth v4 (Credentials provider) | JWT session strategy; custom role claims |
| Passwords | bcryptjs | Hashes stored in `User.passwordHash` |
| Runtime env | Linux container | Node 26 types; dev server on port 3000 |

### Database credentials (development)

```
Host:     127.0.0.1
Port:     5433
User:     b2b_user
Password: devpass123
Database: b2b_platform
```

Note: local `.env.local` / `.env.development` and `.env.example` now use port **5433**.
Application pools read `DATABASE_URL` (with a localhost fallback) and enable SSL automatically
for non-local hosts, so the same code works locally and on Vercel/Neon/Supabase.

---

## 3. What Was Delivered

### 3.1 UI and pages

| Route | Type | Description |
|---|---|---|
| `/` | Static | Marketing homepage: hero, stats, categories, featured products, benefits, CTA, footer |
| `/auth/login` | Static | Split-screen login with working credentials form and quick-fill demo chips |
| `/auth/register` | Static | Split-screen buyer signup form (visual only; not wired to an API yet) |
| `/products/new` | Static | Supplier product form with sections, pricing fields, and helper sidebar (visual only) |
| `/dashboard/wholesaler` | Dynamic | Supplier dashboard with real catalog data, stats, readiness checklist, payouts, orders |
| `/dashboard/client` | Dynamic | Buyer dashboard with credit profile, recommended products, orders/quotes empty states |

### 3.2 Authentication and roles

- NextAuth Credentials provider with bcrypt verification.
- Session carries `id`, `name`, `email`, `status`, `role`, `businessId`, `businessName`, `businessType`.
- Login redirects by business type:
  - `CLIENT` → `/dashboard/client`
  - `WHOLESALER` or platform admin → `/dashboard/wholesaler`
- Dashboards redirect unauthenticated visitors to `/auth/login` and cross-role visitors
  to their own dashboard.
- Sign-out available from both dashboards via `SignOutButton`.

### 3.3 Database seeding

Seeded tables:

| Table | Rows | Details |
|---|---|---|
| `User` | 3 | Admin, wholesaler, client (bcrypt hashes) |
| `Business` | 2 | Atelier North Studio (WHOLESALER), Urban Threads Retail (CLIENT) |
| `BusinessMembership` | 2 | Both users are OWNER of their business |
| `WholesalerProfile` | 1 | Bank/CIN/PAN details, approved limit 250,000 |
| `ClientProfile` | 1 | Credit limit 25,000, NET_30 terms |
| `Tenant` | 2 | `tenant_1` (admin), `tenant_wholesaler` |
| `Category` | 4 | Men's, Women's, Kids', Accessories |
| `Product` | 4 | Atelier North catalog (tee, shirt, pant, jacket) |
| `ProductVariant` | 4 | Prices, MOQs, colors, sizes |
| `Order` / `OrderItem` | 0 | No order flow implemented yet |

### 3.4 Build and runtime verification

- `npx next build` completes successfully.
- Route table from the last build:

```
○ /                        ○ /auth/login            ○ /auth/register
○ /products/new            ○ /_not-found
ƒ /api/auth/[...nextauth]  ƒ /business/register
ƒ /dashboard/client        ƒ /dashboard/wholesaler
ƒ /products
```

- All public pages return HTTP 200 and load `/_next/static/css/app/layout.css` (~33 KB).
- NextAuth credentials sign-in was verified end to end with cookies for all three accounts.
- Role guards verified:
  - Client visiting `/dashboard/wholesaler` → 307 to `/dashboard/client`
  - Wholesaler visiting `/dashboard/client` → 307 to `/dashboard/wholesaler`
  - Anonymous visiting either dashboard → 307 to `/auth/login`

---

## 4. Demo Accounts

Development-only credentials. Do not use in production.

| Role | Email | Password | Destination |
|---|---|---|---|
| Wholesaler | `wholesaler@b2b.com` | `wholesale123` | `/dashboard/wholesaler` |
| Client (buyer) | `client@b2b.com` | `client123` | `/dashboard/client` |
| Admin | `admin@b2b.com` | `admin123` | `/dashboard/wholesaler` (can open both dashboards) |

Seed script: `npm run seed:demo` (runs `seed-demo-accounts.js`). The script is idempotent:
it upserts users and businesses, refreshes memberships/profiles, and upserts demo products.

Access flow:

1. Open `http://localhost:3000/auth/login`.
2. Use a quick-fill chip (Wholesaler / Client / Admin) or type credentials.
3. Submit; you are redirected to the correct dashboard automatically.

---

## 5. Project Structure

```
B2B/
├── app/
│   ├── api/auth/[...nextauth]/route.js     NextAuth App Router handler (GET/POST)
│   ├── auth/login/page.tsx                 Login page (server component + LoginForm)
│   ├── auth/register/page.tsx              Buyer registration page (visual)
│   ├── business/register/route.js          Business registration API (session required)
│   ├── components/
│   │   ├── site-header.tsx                 Marketing header/nav/search
│   │   ├── site-footer.tsx                 Marketing footer
│   │   ├── dashboard-shell.tsx             Shared sidebar/topbar dashboard chrome
│   │   ├── login-form.tsx                  Client login form, quick-fill, role redirect
│   │   └── sign-out-button.tsx             Client sign-out control
│   ├── dashboard/client/page.tsx           Client dashboard (guarded)
│   ├── dashboard/wholesaler/page.tsx       Wholesaler dashboard (guarded)
│   ├── products/new/page.tsx               Supplier product form (visual)
│   ├── products/route.js                   Product API (public GET, guarded writes)
│   ├── globals.css                         Complete design system (~2,650 lines)
│   ├── layout.tsx                          Root layout, global CSS import
│   └── page.tsx                            Marketing homepage
├── lib/
│   ├── auth.js                             pg pool, verifyUser (bcrypt), tenant helpers
│   ├── auth-options.js                     NextAuth options, JWT/session callbacks
│   └── db.js                               Shared pg pool + query helper
├── middleware/
│   ├── tenant.js                           Tenant resolution helpers (not mounted)
│   └── api-protect.js                      JWT API protection helpers (not mounted)
├── prisma/schema.prisma                    Reference data model (not used at runtime)
├── db/schema.sql                           Cloud database schema (25 tables, 9 enums)
├── setup-cloud-db.js                       Applies db/schema.sql to DATABASE_URL
├── docs/planning/                          18 planning documents
├── docs/report/PROJECT-REPORT.md           This report
├── seed-data.js                            Original category/business seed attempt
├── seed-demo-accounts.js                   Demo users/businesses/products seeder
├── next.config.js                          reactStrictMode only
└── package.json                            Scripts: dev, build, start, seed, seed:demo, db:cloud
```

---

## 6. Database

### 6.1 Inventory

- 25 tables in schema `public`.
- 9 enum type names (7 logical enums, 2 legacy duplicates created manually):
  - `AccountType`: ASSET, LIABILITY, REVENUE, EXPENSE, EQUITY, TAX
  - `BusinessType` / `businesstype`: WHOLESALER, CLIENT
  - `InvoiceStatus`: UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED, CREATED
  - `OrderStatus`: PENDING, ACCEPTED, PROCESSING, READY_FOR_DISPATCH, DISPATCHED, DELIVERED, COMPLETED, CANCELLED, RETURNED
  - `PaymentArrangement`: ONLINE, MANUAL, CREDIT
  - `ProductStatus`: ACTIVE, ARCHIVED
  - `VerificationStatus` / `verificationstatus`: UNVERIFIED, PENDING_VERIFICATION, VERIFIED, REJECTED, SUSPENDED

Core tables: `User`, `Session`, `VerificationToken`, `Business`, `BusinessMembership`,
`WholesalerProfile`, `ClientProfile`, `Tenant`, `Category`, `Product`, `ProductVariant`,
`ProductImage`, `Inventory`, `Order`, `OrderItem`, `OrderStatusHistory`, `Invoice`,
`InvoiceItem`, `Payment`, `PaymentAllocation`, `LedgerAccount`, `JournalEntry`,
`JournalLine`, `AuditLog`, `Notification`.

### 6.2 Demo business data

| Business | Type | Verification | Owner | Notes |
|---|---|---|---|---|
| Atelier North Studio | WHOLESALER | VERIFIED | Maya Sharma (`wholesaler@b2b.com`) | Tenant `tenant_wholesaler`, plan `pro` |
| Urban Threads Retail | CLIENT | VERIFIED | Jordan Lee (`client@b2b.com`) | Credit limit 25,000; NET_30 |

Products (Atelier North Studio):

| Product | SKU | Category | B2B price | MOQ |
|---|---|---|---|---|
| Heavyweight Boxy Tee | ATN-TEE-001 | Men's Clothing | $14.50 | 24 |
| Relaxed Linen Shirt | ATN-SHT-002 | Men's Clothing | $26.00 | 12 |
| Utility Cargo Pant | ATN-PNT-003 | Men's Clothing | $22.75 | 36 |
| Cropped Puffer Jacket | ATN-JKT-004 | Women's Clothing | $38.00 | 12 |

### 6.3 Data model notes for future work

- Column naming is mixed: quoted camelCase (`"passwordHash"`, `"businessId"`, `"createdAt"`) alongside
  lowercase (`createdat`, `fabricmaterial`, `productstatus`, `ownerid`). SQL must match case exactly.
- `Business.id`, `User.id`, `Product.id` are UUID; textual mock IDs such as `'biz-demo'` are rejected.
- `Tenant` is a manually created table using `ownerid` (not `userId`).
- `User` has no role column; roles come from `BusinessMembership.role` and business type from `Business.type`.
- Prisma is reference-only: the schema has drifted (e.g., enum casing `ACTIVE` vs stored `active`),
  and all Prisma packages were removed from dependencies. Raw `pg` queries are the source of truth.
- Avoid passing JavaScript `Date` values as parameters to `pg` in this environment; a timezone
  config error (`gmt+0545` not recognized) occurs. Use SQL `NOW()` instead.

---

## 7. Authentication and Authorization

### 7.1 Files

- `app/api/auth/[...nextauth]/route.js`
  ```js
  const handler = NextAuth(authOptions);
  export { handler as GET, handler as POST };
  ```
  This export form is required in the App Router; a default export alone produces HTTP 405
  on `/api/auth/*`.

- `lib/auth-options.js`
  - Credentials provider calls `verifyUser(email, password, callback)`.
  - JWT callback stores `id`, `role`, `businessId`, `businessName`, `businessType`, `status`.
  - Session callback exposes the same fields to server components and clients.

- `lib/auth.js`
  - Shared `pg` pool (127.0.0.1:5433).
  - `verifyUser` joins `User → BusinessMembership → Business`, rejects suspended/deleted users,
    verifies bcrypt hashes (`$2...`), and falls back to plaintext comparison for legacy rows.
  - Users without an active membership are treated as platform `ADMIN`.
  - Also provides `getUserById`, `getUserTenant` (fixed to use `ownerid`), `generateTenantId`, `hashPassword`.

### 7.2 Session shape (verified)

```json
{
  "user": {
    "id": "11111111-1111-4111-8111-111111111111",
    "name": "Maya Sharma",
    "email": "wholesaler@b2b.com",
    "status": "active",
    "role": "OWNER",
    "businessId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "businessName": "Atelier North Studio",
    "businessType": "WHOLESALER"
  },
  "expires": "2026-12-15T18:19:00.545Z"
}
```

Client session returns `businessType: "CLIENT"` with business `Urban Threads Retail`.
Admin returns `role: "ADMIN"` with null business fields.

### 7.3 Guards

| Visitor | `/dashboard/wholesaler` | `/dashboard/client` |
|---|---|---|
| Anonymous | 307 → `/auth/login` | 307 → `/auth/login` |
| Wholesaler | 200 | 307 → `/dashboard/wholesaler` |
| Client | 307 → `/dashboard/client` | 200 |
| Admin | 200 | 200 |

Admin pages fall back to the demo wholesaler/client business IDs because the admin user has no
`BusinessMembership`. This is a demo convenience and should be replaced with real admin views.

---

## 8. UI and Design System

Tailwind is not installed; all prior utility-class markup was non-functional. The UI was rebuilt
with a hand-written CSS system in `app/globals.css`, inspired by the JBL Store reference
(`/home/meroworth/mycode/jbl`).

Design tokens:

```
--brand:       #ff6a00   (JBL orange)
--brand-dark:  #e85f00
--brand-soft:  #fff2e8
--ink:         #141416
--soft:        #f6f6f4
--line:        #e8e8e4
--paper:       #ffffff
```

Key UI features:

- Announcement bar, sticky blurred header, orange mark, pill search, category nav.
- Hero with layered floating order/MOQ cards and CSS-composed product visuals (no external images).
- Stats strip, category grid, product cards with badges, swatches, and price/MOQ.
- Benefits, dark CTA band, four-column footer.
- Split-screen auth cards with brand panel and demo-credential hint.
- Dashboard shell: sidebar workspace nav, user card, sign-out, sticky topbar, stat cards,
  data tables, checklist, empty states, recommendation list.
- Responsive breakpoints at 1080px, 900px, 640px; reduced-motion support; focus-visible styles.

Component files: `site-header.tsx`, `site-footer.tsx`, `dashboard-shell.tsx`,
`login-form.tsx`, `sign-out-button.tsx`. Pages contain no JSX comments (a Turbopack parse
workaround; see Section 10).

---

## 9. API Surface

| Endpoint | Methods | Status | Notes |
|---|---|---|---|
| `/api/auth/*` | NextAuth | Working | Credentials sign-in, session, CSRF; proper GET/POST exports |
| `/products` | GET, POST, PUT, DELETE | Working | Public active-product GET; writes require a session and are scoped to the session business |
| `/business/register` | POST | Working | Session required; creates business, profile, membership, and tenant in one transaction |

Helper middleware (`middleware/tenant.js`, `middleware/api-protect.js`) exists but is not wired to
a root `middleware.ts` or used by routes. `api-protect.js` requires `jsonwebtoken` (installed).

---

## 10. Issues Encountered and Resolutions

| Issue | Cause | Resolution |
|---|---|---|
| `/api/auth/*` returned 405 with curl | Route used `export default NextAuth(...)` | Export `handler` as `GET` and `POST` |
| Login accepted any password | `verifyUser` MVP stub | Seed bcrypt hashes; compare with bcrypt; plaintext fallback retained |
| Login page form did nothing | Static server component, no handler | Added client `LoginForm` using `signIn`/`getSession` and router redirect |
| Turbopack "Unterminated block comment" / parse errors | Turbopack mis-parsing `{/* */}` JSX comments and invalid JS | Removed JSX comments; avoided `as string` casts in `.js`; used `import { v4 }` |
| `export const config` in route.js caused parse error | Not valid App Router config syntax | Removed all `export const config` blocks |
| Page and API route at same segment conflicted | App Router cannot have `page.tsx` and `route.js` together | Removed conflicting pages |
| CSS import "Module not found" | CSS import/file state issues | Moved design system to `app/globals.css`; import from root layout |
| `metadata` export error | Exporting metadata from a client component | Kept pages as server components; client logic extracted into components |
| Prisma CLI broken | Environment/generated client issues | Removed unused Prisma packages; all app DB access uses `pg` |
| `next build` failed type check | Dead `tailwind.config.ts` and `prisma.config.ts` referenced missing packages | Deleted both dead config files |
| CSS utility classes had no effect | Tailwind not installed | Replaced utility markup with the custom CSS design system |
| Seeding failed on UUID/timezone/columns | `'biz-demo'` is not a UUID; mixed-case columns; JS Date timezone error | Used real UUIDs, exact quoted column names, SQL `NOW()` |
| opencode "Can't add file system" in home/root workspace | File picker refuses home and filesystem roots | Launch opencode from the project directory (`opencode /home/meroworth/mycode/B2B`) |
| `getUserTenant` never matched | Queried `"userId"` on `Tenant` | Corrected to `ownerid` |

Turbopack constraints to remember:

- No JSX comments (`{/* ... */}`) while this project is on the current Turbopack build.
- Do not mix a `page.tsx` and `route.js` in the same segment.
- Avoid Pages Router handler signatures (`(req, res)`) in `app/**/route.js`.
- Keep route exports limited to valid HTTP methods and supported segment config.

---

## 11. How to Run

### Start development

```bash
cd /home/meroworth/mycode/B2B
npx next dev --webpack
```

The `--webpack` flag avoids Turbopack dev-mode issues in this environment. Open
`http://localhost:3000`.

### Build

```bash
cd /home/meroworth/mycode/B2B
npx next build
```

### Seed demo data

```bash
cd /home/meroworth/mycode/B2B
npm run seed:demo
```

Re-running is safe; it updates existing demo rows and prints the credential table.

### Inspect the database

`psql` is not installed in this shell. Use Node:

```bash
node -e "const {Pool}=require('pg'); const p=new Pool({host:'127.0.0.1',port:5433,user:'b2b_user',password:'devpass123',database:'b2b_platform'}); p.query('select email, name from \"User\"').then(r=>console.log(r.rows)).finally(()=>p.end())"
```

---

## 12. Verification Log

Build (latest):

```
✓ Compiled successfully
Route (app)
○ /                        ○ /auth/login            ○ /auth/register
○ /products/new            ○ /_not-found
ƒ /api/auth/[...nextauth]  ƒ /business/register
ƒ /dashboard/client        ƒ /dashboard/wholesaler
ƒ /products
```

HTTP checks:

```
/                -> 200 (stylesheet /_next/static/css/app/layout.css)
/auth/login      -> 200
/auth/register   -> 200
/products/new    -> 200
```

Auth checks (real NextAuth credential grants with cookie jars):

```
wholesaler@b2b.com  -> session: OWNER, Atelier North Studio, WHOLESALER
client@b2b.com      -> session: OWNER, Urban Threads Retail, CLIENT
admin@b2b.com       -> session: ADMIN, no business (null fields)
client@b2b.com + wrong password -> rejected
```

Guard checks:

```
client -> /dashboard/wholesaler    : 307 -> /dashboard/client
wholesaler -> /dashboard/client    : 307 -> /dashboard/wholesaler
anonymous -> either dashboard      : 307 -> /auth/login
```

Dashboard content checks:

- Wholesaler: business name, 4 active products, catalog rows, storefront readiness, payouts, orders empty state.
- Client: business name, credit limit $25,000, NET 30 terms, 4 recommended products, orders/quotes empty states.

---

## 13. Known Limitations and Risks

1. **Registration forms are visual only.** `/auth/register` and `/products/new` have no submit handlers yet.
2. **No order, quote, invoice, or payment flows.** Dashboards intentionally show empty states.
3. **Homepage featured content is static marketing data**, not driven by the database.
4. **Admin experience is a fallback.** Admin has no business membership and is rendered into demo
   business dashboards via hardcoded IDs.
5. **Demo credentials are deliberately weak and public in the seed script.** Rotate or remove them
   before a real launch.
6. **No automated tests or CI.** Verification is manual build and curl smoke tests.
7. **No file/image handling.** There is no upload pipeline; product visuals are CSS/SVG compositions.
8. **Turbopack restrictions remain** for dev mode; `npm run dev` therefore uses `--webpack`.
9. **Currency/localization inconsistency.** Schema defaults to NPR/NP; seeded data and dashboard
   display use USD/US.
10. **Preview deployments and NextAuth.** `NEXTAUTH_URL` covers one production URL; preview URLs
    need separate handling.

---

## 14. Recommended Next Steps

1. **Wire registration end to end** (buyer account): validation, bcrypt hashing, user + business +
   membership + client profile creation, then auto sign-in.
2. **Connect `/products/new`** to the product API, including a variant editor and category picker.
3. **Orders and quotes**: cart/quote request, order creation, status transitions from the
   OrderStatus enum, invoices, and payment records.
4. **Admin console**: platform-level supplier verification and buyer management instead of the
   demo fallback IDs.
5. **Test suite**: unit tests for `verifyUser`, API route tests, and Playwright end-to-end tests for
   login → dashboard → product creation.
6. **Harden auth**: remove the plaintext-password fallback, add rate limiting, and rotate secrets.
7. **Polish**: pagination/search/filtering in dashboards, loading and error states, real product
   imagery, and consistent currency formatting.
8. **Operational readiness**: managed Postgres backups, logging/monitoring, and a preview-environment
   auth strategy.

---

## 15. File Inventory (application code)

| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout, imports global CSS |
| `app/page.tsx` | Marketing homepage |
| `app/auth/login/page.tsx` | Login screen shell |
| `app/auth/register/page.tsx` | Buyer registration screen |
| `app/products/new/page.tsx` | Supplier product form |
| `app/dashboard/wholesaler/page.tsx` | Role-guarded supplier dashboard |
| `app/dashboard/client/page.tsx` | Role-guarded buyer dashboard |
| `app/components/site-header.tsx` | Marketing navigation and search |
| `app/components/site-footer.tsx` | Marketing footer |
| `app/components/dashboard-shell.tsx` | Dashboard sidebar/topbar layout |
| `app/components/login-form.tsx` | Credentials form, quick-fill, role redirect |
| `app/components/sign-out-button.tsx` | NextAuth sign-out |
| `app/api/auth/[...nextauth]/route.js` | NextAuth App Router handler |
| `app/products/route.js` | Product API (public GET, guarded writes) |
| `app/business/register/route.js` | Business registration API (session required) |
| `lib/auth-options.js` | NextAuth options and callbacks |
| `lib/auth.js` | Password verification and user/tenant helpers |
| `lib/db.js` | Shared pg pool and query helper |
| `middleware/tenant.js` | Tenant resolution helpers (unmounted) |
| `middleware/api-protect.js` | JWT API guards (unmounted) |
| `app/globals.css` | Full design system and dashboard styles |
| `seed-demo-accounts.js` | Demo users, businesses, products, variants |
| `seed-data.js` | Earlier seed attempt (categories, sample data) |
| `db/schema.sql` | Schema dump used for cloud/Vercel database setup |
| `setup-cloud-db.js` | Applies `db/schema.sql` to the configured `DATABASE_URL` |
| `README.md` | Setup, demo accounts, routes, and Vercel deployment guide |

---

## 16. Vercel Deployment

The repository is ready to import into Vercel. Required steps:

1. Create a hosted Postgres database (Neon, Supabase, or Vercel Postgres) and copy a pooled
   connection string with `sslmode=require`.
2. Create the schema and seed data from the local machine:

```bash
DATABASE_URL="postgres://..." npm run db:cloud
DATABASE_URL="postgres://..." npm run seed:demo
```

3. Import `RajeshPuri/b2b` at `vercel.com/new` (Next.js preset is auto-detected).
4. Set environment variables for Production: `DATABASE_URL`, `NEXTAUTH_SECRET` (`openssl rand -base64 32`),
   and `NEXTAUTH_URL` (the final `https://` production URL).
5. Deploy. If the production URL was unknown during the first deploy, add `NEXTAUTH_URL` and redeploy.
6. Sign in with a demo account, then rotate or remove the public demo credentials.

Local `.env` files are git-ignored; database connections automatically use SSL for non-local hosts.
The complete guide is in `README.md`.

---

*Report generated from the working tree and live database on 2026-11-16. Updated with deployment
preparation. All credentials and secrets referenced here are development-only.*
