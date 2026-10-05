-- GOVERNANCE · 0001 · Chairman attention queue gate
-- Policy: THY-POLICY-AGENT-PRECHECK-670 (DECLARED + STORED in thylora_execution_policy).
-- This file is the ENFORCING mechanism for the part a database can check.
-- HELD FOR CHAIRMAN APPLY to thylora-dash. Validated locally, not applied.
--
-- What it enforces on every INSERT into thylora_chairman_attention_queue:
--   1. A source_ref is required (every question traces to the backend record that raised it).
--   2. No duplicate of an open question (same normalized title or same source_ref, still WAITING).
--   3. No re-asking an answered question (same source_ref already ANSWERED_YES/NO).
-- What it cannot enforce (stays DECLARED): whether the asking agent read the backend
-- first, and whether the fact was a DISCOVER target. Those remain review rules.

begin;

create or replace function thy_chairman_queue_gate() returns trigger
language plpgsql as $$
declare clash text;
begin
  if new.source_ref is null or length(btrim(new.source_ref)) = 0 then
    raise exception 'QUEUE GATE 670: a Chairman question needs source_ref (the backend record that raised it)';
  end if;
  select code into clash from thylora_chairman_attention_queue q
   where q.state = 'WAITING_ON_CHAIRMAN'
     and (lower(regexp_replace(q.title, '\W+', '', 'g')) = lower(regexp_replace(new.title, '\W+', '', 'g'))
          or q.source_ref = new.source_ref)
   limit 1;
  if clash is not null then
    raise exception 'QUEUE GATE 670: duplicate of open question %', clash;
  end if;
  select code into clash from thylora_chairman_attention_queue q
   where q.source_ref = new.source_ref and q.state in ('ANSWERED_YES','ANSWERED_NO') limit 1;
  if clash is not null then
    raise exception 'QUEUE GATE 670: already answered as question % — read the answer instead of asking again', clash;
  end if;
  return new;
end $$;

drop trigger if exists thy_chairman_queue_gate on thylora_chairman_attention_queue;
create trigger thy_chairman_queue_gate before insert on thylora_chairman_attention_queue
  for each row execute function thy_chairman_queue_gate();

commit;
