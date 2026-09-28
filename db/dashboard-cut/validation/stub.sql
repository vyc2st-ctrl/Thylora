-- Minimal stand-in for the Supabase objects the migration touches.
create schema if not exists auth;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claims', true)::json->>'sub','')::uuid $$;
create table public.thylora_user_roles(user_id uuid, role text);
insert into public.thylora_user_roles values ('11111111-1111-4111-8111-111111111111','chairman');
create or replace function public.thylora_is_chairman() returns boolean language sql stable set search_path to 'public','auth' as
  $$ select exists (select 1 from public.thylora_user_roles where user_id = auth.uid() and role = 'chairman') $$;
create table public.thylora_response_point_coverage(id int);
create table public.thylora_workroom_registry(id int);
create table public.thylora_workroom_task_registry(id int);
create table public.thylora_store_product_readiness(id int);
create table public.thylora_dashboard_regression_evidence(id int);
insert into public.thylora_response_point_coverage values (1),(2),(3);
insert into public.thylora_workroom_registry values (1),(2);
insert into public.thylora_workroom_task_registry values (1),(2);
insert into public.thylora_store_product_readiness values (1),(2);
insert into public.thylora_dashboard_regression_evidence values (1),(2);
do $$ declare t text; begin
  foreach t in array array['thylora_response_point_coverage','thylora_workroom_registry','thylora_workroom_task_registry','thylora_store_product_readiness','thylora_dashboard_regression_evidence','thylora_user_roles'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select on public.%I to authenticated, anon', t);
  end loop; end $$;
create policy own_role on public.thylora_user_roles for select to authenticated using (user_id = auth.uid());
grant usage on schema auth to authenticated, anon;
