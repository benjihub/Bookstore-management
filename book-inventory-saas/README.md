# BookStock Manager

A multi-tenant bookstore inventory, POS, purchasing and reporting SaaS starter built with Next.js, TypeScript and Supabase.

## Included

- Multi-branch dashboard and branch filter
- Book catalogue with ISBN/SKU, author, publisher, category, pricing and reorder levels
- Branch inventory with stock movement history and manual adjustments
- POS cart that validates stock, completes sales and reduces inventory
- Reversible sales that restore stock and leave an audit trail
- Suppliers and supplier balances
- Purchases / stock receiving that increase inventory
- Inter-branch transfers with dispatch/receive workflow
- Customers and purchase history
- Expenses
- Sales, profit and inventory valuation reports with CSV/PDF-friendly export
- Staff roles
- Activity log
- Store settings
- Platform admin preview
- Installable PWA manifest/service worker
- Persistent browser demo mode
- Production-oriented Supabase PostgreSQL schema and tenant RLS

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The app launches in demo mode without Supabase credentials.

## Demo mode

Demo changes are persisted in browser `localStorage`. Use **Settings → Reset demo data** to restore the sample bookstore.

Demo mode is intentionally separate from the production schema so the UI can be evaluated before provisioning infrastructure.

## Supabase production setup

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local` and add your project URL and anon key.
4. Set `NEXT_PUBLIC_DEMO_MODE=false` after replacing the demo adapter with Supabase repository calls for your deployment.
5. Configure Authentication email settings and allowed redirect URLs.
6. Create a private Storage bucket for book covers if covers will be uploaded.

The supplied schema includes tenant membership helpers and RLS policies. Every operational table carries `store_id`; branch-level tables also carry `branch_id`.

## Production mutation rule

Do not update inventory quantities from arbitrary client code. Use an atomic database transaction/RPC. The schema includes `adjust_stock(...)` as the base pattern. Production sale, purchase and transfer workflows should be implemented as transaction-safe RPCs that write both the business transaction and stock movements atomically.

## Roles

- Owner
- Manager
- Stock Manager
- Cashier
- Accountant
- Viewer

RLS examples in `supabase/schema.sql` enforce store membership and role permissions in the database.

## Key routes

- `/dashboard`
- `/books`
- `/inventory`
- `/sales`
- `/purchases`
- `/transfers`
- `/suppliers`
- `/customers`
- `/expenses`
- `/reports`
- `/staff`
- `/activity`
- `/settings`
- `/admin`
- `/login`

## Deployment

### Vercel

1. Push the folder to GitHub.
2. Import the repository in Vercel.
3. Add the environment variables.
4. Deploy.

### Security checklist before real customers

- Disable demo mode.
- Use Supabase Auth for login/signup/onboarding.
- Keep the service-role key server-only.
- Use transaction-safe RPCs for sale completion, reversals, purchases and transfers.
- Verify all RLS policies against Owner/Manager/Stock Manager/Cashier/Accountant/Viewer test users.
- Add rate limiting for public/auth endpoints.
- Add error monitoring and database backups.
- Configure a custom domain and HTTPS.

## Notes

This build is a complete functional product demo plus a production database/security foundation. Browser demo operations are real and persistent locally; a live Supabase account is intentionally not embedded in the ZIP because project credentials belong to the deployer.
