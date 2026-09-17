create or replace function public.thylora_record_chairman_visit_v1()
returns jsonb
language plpgsql
volatile security definer
set search_path to 'public','auth'
as $function$
declare
  v_prev timestamptz;
begin
  if not public.thylora_is_chairman() then
    return jsonb_build_object('allowed', false, 'reason', 'CHAIRMAN_ONLY');
  end if;
  select max(visited_at) into v_prev
    from public.thylora_chairman_visit_log
   where user_id = auth.uid() and surface = 'OPERATING_SURFACE';
  insert into public.thylora_chairman_visit_log (user_id, surface)
  values (auth.uid(), 'OPERATING_SURFACE');
  return jsonb_build_object('allowed', true, 'previous_visit', v_prev, 'recorded_at', now());
end;
$function$;

revoke all on function public.thylora_record_chairman_visit_v1() from public, anon;
grant execute on function public.thylora_record_chairman_visit_v1() to authenticated, service_role;
