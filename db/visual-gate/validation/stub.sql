-- Validation scaffolding ONLY. Never applied to a real backend, where auth.uid(),
-- the anon/authenticated roles and the two THYLORA identity predicates already exist.
create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
do $$ begin create role anon; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated; exception when duplicate_object then null; end $$;
-- Stubs for the existing house predicates. The real ones live in the backend.
create or replace function thylora_is_chairman() returns boolean language sql stable as $$
  select coalesce(current_setting('thy.is_chairman', true)::boolean, true);
$$;
create or replace function thylora_is_trusted_server() returns boolean language sql stable as $$
  select false;
$$;
