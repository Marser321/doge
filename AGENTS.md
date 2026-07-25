# DOGE engineering instructions

- The source of truth for schema, RLS, Storage buckets and RPCs is `supabase/migrations/`.
- Never expose `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `RATE_LIMIT_PEPPER` or `CRON_SECRET` to browser code.
- Browser Supabase access is authentication-only. Business data goes through Next.js Route Handlers and is re-authorized on the server.
- Every new public table must enable RLS, revoke default grants and receive explicit policies before application code uses it.
- Monetary values are stored as integer cents. Timestamps are UTC; operations render in `America/New_York`.
- Do not hard-delete audited business records. Archive them or create compensating ledger movements.
- Apply and test migrations locally before staging. Never apply `supabase/seed.sql` to production.
- After editing application code, run `npx tsc --noEmit`, `npm test`, `npm run lint` and `npm run build`.
