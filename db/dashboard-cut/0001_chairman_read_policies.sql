-- THYLORA Minimum Usable Chairman Cut · 0001 · Chairman read policies
--
-- STATE: WRITTEN, NOT APPLIED. Production access-control change → APPROVAL_REQUIRED.
--
-- WHY (measured 2026-09-28, SQL impersonation of the Chairman identity in a read-only transaction):
--   These five tables have row-level security ENABLED and ZERO policies, so every
--   non-service caller — including the Chairman — reads 0 rows. The rows exist.
--
--   table                                   rows present   Chairman reads   cut item
--   thylora_response_point_coverage          ~728           0                7  Every-Word ledger
--   thylora_workroom_registry                 30            0                8  open lanes
--   thylora_workroom_task_registry           ~49            0                8  lane tasks
--   thylora_store_product_readiness           14            0                11 store status
--   thylora_dashboard_regression_evidence     42            0                13/15 evidence, no-regression
--
-- WHAT: add one SELECT-only policy per table, TO authenticated, USING thylora_is_chairman().
--   This is the same predicate every other Chairman table already uses
--   (e.g. restart_records.authenticated_read_restart_records).
--
-- WHAT IT DOES NOT DO:
--   - no INSERT/UPDATE/DELETE grant (writes stay with service role / edge functions)
--   - no anon access
--   - no change to any existing policy, column or row
--
-- REVERSIBLE: see the DOWN block at the end.

begin;

do $$
declare
  t text;
  pol text;
begin
  foreach t in array array[
    'thylora_response_point_coverage',
    'thylora_workroom_registry',
    'thylora_workroom_task_registry',
    'thylora_store_product_readiness',
    'thylora_dashboard_regression_evidence'
  ] loop
    if to_regclass('public.' || t) is null then
      raise notice 'SKIP % — table absent', t;
      continue;
    end if;
    pol := 'chairman_read_' || t;
    if exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = pol) then
      raise notice 'KEEP % — policy already present', pol;
      continue;
    end if;
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select public.thylora_is_chairman()))',
      pol, t);
    raise notice 'ADD %', pol;
  end loop;
end $$;

commit;

-- READ-BACK (run after apply; expect 5 rows, cmd = SELECT, roles = {authenticated}):
--   select tablename, policyname, cmd, roles, qual from pg_policies
--   where schemaname = 'public' and policyname like 'chairman_read_thylora_%'
--     and tablename in ('thylora_response_point_coverage','thylora_workroom_registry',
--       'thylora_workroom_task_registry','thylora_store_product_readiness',
--       'thylora_dashboard_regression_evidence');
--
-- WITNESS (run after apply; expect Chairman counts > 0 and non-Chairman counts = 0):
--   begin read only;
--   select set_config('thy.cid',(select user_id::text from public.thylora_user_roles where role='chairman' order by created_at limit 1),true);
--   set local role authenticated;
--   select set_config('request.jwt.claims', json_build_object('sub',current_setting('thy.cid'),'role','authenticated')::text, true);
--   select (select count(*) from thylora_response_point_coverage) cov, (select count(*) from thylora_workroom_registry) wr,
--          (select count(*) from thylora_workroom_task_registry) wrt, (select count(*) from thylora_store_product_readiness) store,
--          (select count(*) from thylora_dashboard_regression_evidence) regr;
--   select set_config('request.jwt.claims', json_build_object('sub','00000000-0000-4000-8000-000000000001','role','authenticated')::text, true);
--   select (select count(*) from thylora_response_point_coverage) cov, (select count(*) from thylora_workroom_registry) wr;
--   rollback;
--
-- DOWN (reverses exactly this migration):
--   drop policy if exists chairman_read_thylora_response_point_coverage on public.thylora_response_point_coverage;
--   drop policy if exists chairman_read_thylora_workroom_registry on public.thylora_workroom_registry;
--   drop policy if exists chairman_read_thylora_workroom_task_registry on public.thylora_workroom_task_registry;
--   drop policy if exists chairman_read_thylora_store_product_readiness on public.thylora_store_product_readiness;
--   drop policy if exists chairman_read_thylora_dashboard_regression_evidence on public.thylora_dashboard_regression_evidence;
