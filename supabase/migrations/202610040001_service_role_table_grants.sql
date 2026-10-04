-- The server-side client (SUPABASE_SECRET_KEY) runs as `service_role`.
--
-- Projects created before Supabase stopped auto-granting the Data API roles
-- (staging) gave service_role every table through default privileges. A fresh
-- database, like the one CI builds with `supabase db reset`, does not, so every
-- server-side read failed with "permission denied" (profiles,
-- subscription_plans, …). RLS is unaffected: service_role bypasses it by
-- design and is never exposed to the browser (see AGENTS.md).

begin;

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Tables added by later migrations inherit the same grant.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

commit;
