create or replace function public.thylora_enqueue_internal_verification_v1()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_evidence_needed jsonb;
begin
  if new.state <> 'WAITING_EXTERNAL'
     or new.autonomy_class <> 'SAFE_INTERNAL'
     or coalesce(new.blocker,'') not like 'INDEPENDENT_VERIFICATION_REQUIRED:%'
     or jsonb_typeof(new.result) <> 'object'
     or jsonb_typeof(new.result->'blockers') <> 'array'
     or jsonb_array_length(new.result->'blockers') <> 0
     or jsonb_typeof(new.result->'evidence_needed') <> 'array'
     or jsonb_array_length(new.result->'evidence_needed') <> 0
     or lower(coalesce(new.directive,'')) !~ '(design|define|organize|plan|model|architecture|structure|assemble|prepare|draft)'
     or lower(coalesce(new.directive,'')) ~ '(research|verify|audit|legal|rights|historical|medical|tax|publish|deploy|purchase|contact|outreach|implement|execute|test)'
  then
    return new;
  end if;

  v_evidence_needed := coalesce(new.result->'evidence_needed','[]'::jsonb);

  insert into public.thylora_independent_verification_queue(
    task_id,canonical_id,department_code,verifier_class,verification_status,
    evidence_needed,evidence_resolved,unresolved_evidence,can_complete,next_action
  )
  values(
    new.id,new.canonical_id,new.department_code,'INTERNAL_EVIDENCE','PENDING',
    v_evidence_needed,'[]'::jsonb,'[]'::jsonb,false,
    'Automatically queued after the worker saved a scope-eligible result; await independent run/output/hash readback.'
  )
  on conflict(task_id) do nothing;

  return new;
end;
$function$;

create trigger thylora_autonomy_verification_queue_enqueue_v1
after update of state,result,blocker on public.thylora_autonomy_tasks
for each row
when (new.state = 'WAITING_EXTERNAL')
execute function public.thylora_enqueue_internal_verification_v1();