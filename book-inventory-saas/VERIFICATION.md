# Verification notes

- TypeScript/TSX source files were parsed with the locally installed TypeScript compiler API: **29 files, 0 syntax errors**.
- No `TODO` or `FIXME` markers remain in the shipped source.
- The Supabase schema includes tenant-aware tables, RLS enablement/policies, membership helpers, audit tables, and an atomic `adjust_stock` RPC foundation.
- A full `npm install` / `next build` could not be completed in the build environment because package download timed out. Run `npm install && npm run build` on a networked machine before production deployment.
- The application works conceptually in demo mode without credentials once dependencies are installed; demo data persists in browser localStorage.
