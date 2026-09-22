-- PROOF TEST · PRE-LEDGER CONTEXT
--
-- Question the proof answers: when the ledger starts at 587, can sequences
-- 1-586 still be reached without the ledger pretending it wrote them — and
-- does the bridge report an absent or differently shaped table instead of
-- failing the read?
--
-- Rolled back at the end.
begin;

do $$
declare v jsonb; ok boolean := true;
begin
  -- 1. The table does not exist in this throwaway database.
  v := thy_sequence_prior_context(5);
  if (v->>'available')::boolean or v->>'reason' <> 'REGISTRY_ABSENT' then
    raise notice 'PROOF FAIL: an absent carryforward table was not reported as absent'; ok := false;
  end if;
  if jsonb_array_length(v->'rows') <> 0 then
    raise notice 'PROOF FAIL: rows were invented for an absent table'; ok := false;
  end if;

  -- 2. A table of the wrong shape is reported, not guessed at.
  create table thylora_query_carryforward (id int);
  v := thy_sequence_prior_context(5);
  if (v->>'available')::boolean or v->>'reason' <> 'SHAPE_MISMATCH' then
    raise notice 'PROOF FAIL: a differently shaped carryforward table was not reported'; ok := false;
  end if;
  drop table thylora_query_carryforward;

  -- 3. The real shape is read, and every row comes back labelled PRE_LEDGER.
  create table thylora_query_carryforward (
    sequence_no bigint, session_label text, user_message text,
    assistant_message text, created_at timestamptz default now());
  insert into thylora_query_carryforward (sequence_no, session_label, user_message, assistant_message)
  values (586,'prior session','earlier prompt','earlier reply'),
         (585,'prior session','older prompt','older reply');

  v := thy_sequence_prior_context(5);
  if not (v->>'available')::boolean then
    raise notice 'PROOF FAIL: a readable carryforward table was not read'; ok := false;
  end if;
  if jsonb_array_length(v->'rows') <> 2 then
    raise notice 'PROOF FAIL: pre-ledger rows did not come back'; ok := false;
  end if;
  if (v#>>'{rows,0,origin}') <> 'PRE_LEDGER' or (v#>>'{rows,0,truth_class}') <> 'UNVERIFIED' then
    raise notice 'PROOF FAIL: pre-ledger rows are not labelled as context'; ok := false;
  end if;
  if (v->>'ledger_floor')::bigint <> 587 then
    raise notice 'PROOF FAIL: the ledger floor is not reported as 587'; ok := false;
  end if;

  -- 4. Nothing from before the floor leaked into the ledger itself.
  if exists (select 1 from thy_sequence_ledger where sequence_no < 587) then
    raise notice 'PROOF FAIL: pre-ledger history was written into the ledger'; ok := false;
  end if;

  drop table thylora_query_carryforward;

  if ok then
    raise notice 'PROOF PASS: PRE-LEDGER — absent, mis-shaped and readable carryforward tables are each reported honestly, rows come back labelled PRE_LEDGER/UNVERIFIED, and nothing below 587 entered the ledger';
  end if;
end $$;

rollback;
