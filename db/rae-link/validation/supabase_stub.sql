-- Validation scaffolding ONLY. Never applied to a real backend, where auth.users,
-- auth.uid() and the anon/authenticated roles already exist.
create extension if not exists pgcrypto;
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
do $$ begin create role anon; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated; exception when duplicate_object then null; end $$;

-- Supabase grants the client roles usage on the auth schema so policies can call
-- auth.uid(). Reproduced here so local validation matches the real environment.
grant usage on schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on table auth.users to authenticated;
