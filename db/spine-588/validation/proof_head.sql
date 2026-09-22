-- PROOF TEST · THE HEAD READ
-- Work: THY-WORK-DASHBOARD-INTERACTION-CLOSEOUT-562
--
-- Question the proof answers: does ONE read return the four surfaces the
-- dashboard must carry, and does NEXT QUESTION put the thing that is actually
-- blocking at the top rather than the most recently written question?
--
-- Rolled back at the end.
begin;

do $$
declare
  v jsonb; n jsonb;
  ok boolean := true;
begin
  v := thy_spine_head();

  -- The four surfaces -------------------------------------------------------
  if v->'surfaces' <> '["TOPIC CONTEXT","SEQUENCE LEDGER","CURRENT GATES","NEXT QUESTION"]'::jsonb then
    raise notice 'PROOF FAIL: the head does not name the four surfaces: %', v->'surfaces'; ok := false;
  end if;
  if v->'topic_context'->'topic_manifest' is null
     or jsonb_array_length(v->'topic_context'->'topic_manifest') = 0 then
    raise notice 'PROOF FAIL: TOPIC CONTEXT returned no topics'; ok := false;
  end if;
  if v->'sequence_ledger'->'rows' is null then
    raise notice 'PROOF FAIL: SEQUENCE LEDGER returned no rows section'; ok := false;
  end if;
  if v->'current_gates'->'gates' is null then
    raise notice 'PROOF FAIL: CURRENT GATES returned no gates section'; ok := false;
  end if;
  if v->'next_question'->'next_question' is null then
    raise notice 'PROOF FAIL: NEXT QUESTION returned nothing'; ok := false;
  end if;

  -- Nothing is missing, so nothing should be reported missing.
  if jsonb_array_length(v->'not_applied') <> 0 then
    raise notice 'PROOF FAIL: the head reports % pack(s) missing in a database where all are applied: %',
      jsonb_array_length(v->'not_applied'), v->'not_applied'; ok := false;
  end if;

  -- CURRENT GATES shows the rule in force, not a superseded one --------------
  if (v->'current_gates'->'counts'->>'blocked')::int < 1 then
    raise notice 'PROOF FAIL: no gate is blocking at 588, which contradicts the seeded law'; ok := false;
  end if;
  if exists (
    select 1 from jsonb_array_elements(v->'current_gates'->'gates') g
     where (g->>'VERSION')::int
           <> (select max(version) from thy_gate_law where gate_key = g->>'GATE')) then
    raise notice 'PROOF FAIL: CURRENT GATES carried a superseded version'; ok := false;
  end if;
  -- The first gate shown is one that stops work.
  if v->'current_gates'->'gates'->0->>'STATE' not in ('BLOCKED','OPEN','HELD') then
    raise notice 'PROOF FAIL: a settled gate sorted above a blocking one'; ok := false;
  end if;

  -- NEXT QUESTION is ordered by what blocks ---------------------------------
  n := thy_spine_next_question(20);
  if n->'next_question'->>'source' <> 'GATE' then
    raise notice 'PROOF FAIL: the next question came from % while a gate is blocking',
      n->'next_question'->>'source'; ok := false;
  end if;
  -- Every GATE-sourced item must appear before every TOPIC-sourced one.
  if exists (
    select 1
      from jsonb_array_elements(n->'queue') with ordinality a(item, pos)
      join jsonb_array_elements(n->'queue') with ordinality b(item, pos) on true
     where a.item->>'source' = 'TOPIC' and b.item->>'source' = 'GATE' and a.pos < b.pos) then
    raise notice 'PROOF FAIL: a topic question sorted above a blocking gate'; ok := false;
  end if;
  if jsonb_array_length(n->'not_read') <> 0 then
    raise notice 'PROOF FAIL: the next question reports unread sources in a complete database'; ok := false;
  end if;

  -- The open QYRIS frontier reaches the surface ------------------------------
  if not exists (select 1 from jsonb_array_elements(n->'queue') q where q->>'source' = 'FRONTIER') then
    raise notice 'PROOF FAIL: the open frontier from cycle 588 does not reach NEXT QUESTION'; ok := false;
  end if;

  -- The milestone is carried, and still refuses ------------------------------
  if (v->'milestone'->>'comparable')::boolean then
    raise notice 'PROOF FAIL: the head reports milestone 874 as comparable'; ok := false;
  end if;

  if ok then
    raise notice 'PROOF PASS: HEAD READ — one read returned TOPIC CONTEXT, SEQUENCE LEDGER, CURRENT GATES and NEXT QUESTION; gates showed only current versions with a blocking one first; the next question came from a blocking gate ahead of every topic question; and milestone 874 still refused';
  end if;
end $$;

rollback;
