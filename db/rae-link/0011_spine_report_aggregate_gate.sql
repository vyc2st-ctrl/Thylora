-- Least-privilege read gate for the scheduled SPINE report worker.
-- Exposes one aggregate value, never department rows.
create or replace function public.thylora_spine_department_count_v1()
returns integer
language sql
stable
security definer
set search_path = pg_catalog, public
as $function$
  select count(*)::integer
  from public.thylora_departments;
$function$;

revoke all on function public.thylora_spine_department_count_v1() from public;
revoke all on function public.thylora_spine_department_count_v1() from anon, authenticated, service_role;
grant execute on function public.thylora_spine_department_count_v1() to anon;

comment on function public.thylora_spine_department_count_v1() is
  'Least-privilege aggregate for the GitHub SPINE report worker; returns only the total department count.';
