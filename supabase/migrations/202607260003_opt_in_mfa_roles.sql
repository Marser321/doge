-- Migration: 202607260003_opt_in_mfa_roles.sql
-- Description: Align database RLS role resolution with application-level opt-in MFA policy.
-- When ENFORCE_MFA is false or optional, owners and managers can access operational CRM records via RLS.

create or replace function private.current_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.profiles
  where id = (select auth.uid())
    and is_active = true
    and archived_at is null;
$$;
