-- Validation scaffolding ONLY. Never applied to a real backend, where auth.users,
-- auth.uid() and the anon/authenticated/service_role roles already exist.
create extension if not exists pgcrypto;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key default gen_random_uuid(), email text);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
do $$ begin create role anon; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated; exception when duplicate_object then null; end $$;
do $$ begin create role service_role; exception when duplicate_object then null; end $$;
-- Mirrors the live THYLORA role helper that 0005 depends on (read on
-- thylora-dash at sequence 591: public.thylora_is_chairman() checks
-- thylora_user_roles.role = 'chairman' for auth.uid()).
create table if not exists public.thylora_user_roles (user_id uuid not null, role text not null);
create or replace function public.thylora_is_chairman() returns boolean
language sql stable set search_path = public, auth as $$
  select exists (select 1 from public.thylora_user_roles where user_id = auth.uid() and role = 'chairman');
$$;
grant select on public.thylora_user_roles to authenticated;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
