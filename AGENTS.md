# DOGE engineering instructions

- The source of truth for schema, RLS, Storage buckets and RPCs is `supabase/migrations/`.
- Never expose `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `RATE_LIMIT_PEPPER` or `CRON_SECRET` to browser code.
- Browser Supabase access is authentication-only. Business data goes through Next.js Route Handlers and is re-authorized on the server.
- Every new public table must enable RLS, revoke default grants and receive explicit policies before application code uses it.
- Monetary values are stored as integer cents. Timestamps are UTC; operations render in `America/New_York`.
- Do not hard-delete audited business records. Archive them or create compensating ledger movements.
- Apply and test migrations locally before staging. Never apply `supabase/seed.sql` to production.
- After editing application code, run `npx tsc --noEmit`, `npm test`, `npm run lint` and `npm run build`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
