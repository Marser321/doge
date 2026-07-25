# DOGE release checklist

1. Install Docker Desktop, run `npm run db:start`, `npm run db:reset`, `npm run db:lint` and `npm run db:test`.
2. Create separate Supabase staging and production projects. Link staging, review `supabase db push --dry-run`, then apply migrations with `supabase db push`. Never run `supabase/seed.sql` against production.
3. Generate exact database types with `npm run db:types` and commit the result.
4. Configure the variables documented in `.env.example` in Vercel Preview first. Secret values must remain server-only.
5. Copy `supabase/templates/invite.html` and `recovery.html` into the hosted Supabase Auth templates, verify their `token_hash` links, and disable provider click tracking.
6. Run `node scripts/bootstrap-owner.mjs owner@example.com "Owner DOGE"` against staging. Accept the invitation, create the password and enroll TOTP MFA.
7. Verify RLS as anonymous, owner, manager, dispatcher and crew. A crew user must only see appointments assigned through an active team membership.
8. Verify private Storage access, image normalization, cleanup on failure, signed quote links and Resend webhook signatures.
9. Verify cron calls for email outbox every five minutes and subscription generation daily.
10. Run `npm test`, `npm run lint`, `npm run build` and `npm run test:e2e`; review Vercel and Supabase logs plus `audit_events`.
11. Repeat with the empty production project, bootstrap the production owner and run the smoke test before promoting the Vercel deployment.

See `docs/supabase-setup.md` for provisioning and SMTP/DNS details.
