# Supabase setup

## Local

1. Install and start Docker Desktop.
2. Run `npm install`, `npm run db:start` and `npm run db:reset`.
3. Copy `.env.example` to `.env.local`.
4. Run `supabase status -o env` and map:
   - `API_URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `PUBLISHABLE_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SECRET_KEY` → `SUPABASE_SECRET_KEY`
5. Generate random values for `RATE_LIMIT_PEPPER` and `CRON_SECRET`.
6. Run `npm run dev -- --port 3100`.

Local Auth email is captured by Inbucket at `http://127.0.0.1:54324`.

## Staging and production

- Create independent Supabase projects and link them one at a time with `supabase link --project-ref …`.
- Review migrations using `supabase db push --dry-run`; apply with `supabase db push`.
- Keep new-object auto-exposure disabled. The migration explicitly grants only the required operations.
- Configure Auth site URL and redirects for the matching Vercel environment.
- Disable public signup. Staff users are created through the owner-only invitation endpoint.
- Enable TOTP MFA. Owner and manager sessions are redirected until they reach AAL2.
- Copy the invite and recovery HTML from `supabase/templates/` into the hosted Auth templates. Their `token_hash` links establish the SSR session cookie before password setup.

## Storage

The migration provisions:

- `booking-attachments`: private public-request intake.
- `job-evidence`: private before/after and incident evidence.
- `product-media`: public normalized catalogue images.

The application stores opaque object keys for private files. Do not turn the private buckets public.

## Resend

1. Verify the sending domain and publish SPF and DKIM.
2. Set `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` and `EMAIL_FROM`.
3. Configure Supabase Auth custom SMTP with the same verified sending domain.
4. Create a Resend webhook pointing to `/api/webhooks/resend`.
5. Confirm `email.delivered`, `email.bounced`, `email.complained` and `email.suppressed` appear in `email_deliveries`.

## Production bootstrap

Run:

```bash
node scripts/bootstrap-owner.mjs owner@example.com "Owner DOGE"
```

The script sends an invitation; it never creates or stores a production password. After accepting, enroll TOTP before entering the CRM.
