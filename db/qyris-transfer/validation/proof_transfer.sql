-- PROOF TEST · QYRIS TRANSFER RECURSION
-- Work: THY-WORK-TRANSFER-RECURSION-588
--
-- Question the proof answers: does a transfer actually CREATE the next context,
-- and does an item left open in one cycle survive into the next one without
-- anyone remembering to carry it?
--
-- Rolled back at the end.
begin;

do $$
declare
  c1 bigint; c2 bigint; c3 bigint;
  f_open bigint; f_closed bigint; f_second bigint;
  v jsonb; v2 jsonb; v_chain jsonb;
  ok boolean := true;
  refused boolean;
begin
  -- Cycle 1 ------------------------------------------------------------------
  c1 := thy_qyris_open('STORE', 'Is the store live and taking orders?', 588);

  perform thy_qyris_record(c1,'Y',
    'Three unknowns: whether products are published, whether a real order exists, and whether the payment path completed.',
    'db/rae-link/0006_access_entitlements.sql; public-site/store.html');
  perform thy_qyris_record(c1,'R',
    'Read the repository only. The backend of record was not reachable, so no live product, order or payment row was read.',
    'GATE-BACKEND-EGRESS is BLOCKED at sequence 588');
  perform thy_qyris_record(c1,'I',
    'Nothing in canon changes. What changes is the truth class: store liveness moves from assumed to explicitly UNMEASURED.',
    'db/omniview/0006_seed_manifest.sql');
  perform thy_qyris_record(c1,'S',
    'Settled: the question cannot be answered from a build session. Not settled: the answer itself.',
    'thy_gate_law GATE-BACKEND-EGRESS');

  -- Two items are left open, and one is settled inside the cycle.
  f_open   := thy_qyris_frontier_add(c1,'Whether any real order has ever completed','QUESTION','R');
  f_second := thy_qyris_frontier_add(c1,'Whether the payment path is connected end to end','UNKNOWN','R');
  f_closed := thy_qyris_frontier_add(c1,'Whether the store surface exists at all','QUESTION','Y');
  perform thy_qyris_frontier_close(f_closed, 'Answered inside this cycle: public-site/store.html exists and is routed in vercel.json.');

  -- A cycle cannot transfer to nowhere -----------------------------------------
  refused := false;
  begin
    perform thy_qyris_transfer(c1, null, 589);
  exception when others then refused := true; end;
  if not refused then
    raise notice 'PROOF FAIL: a cycle transferred without creating a next context'; ok := false;
  end if;

  -- TRANSFER CREATES THE NEXT CONTEXT ------------------------------------------
  v := thy_qyris_transfer(c1,
    'Can a build session reach thylora-dash at all, and if not, who runs the read?',
    589,
    'Store liveness is handed forward as an open question with its two unknowns attached.');

  c2 := (v->>'next_cycle_id')::bigint;
  if c2 is null then
    raise notice 'PROOF FAIL: transfer returned no successor cycle'; ok := false;
  end if;
  if (v->>'frontier_carried')::int <> 2 then
    raise notice 'PROOF FAIL: % frontier items carried, expected 2', v->>'frontier_carried'; ok := false;
  end if;

  -- PRESERVE OPEN FRONTIER ------------------------------------------------------
  -- The successor holds both open items, and each names where it came from.
  v2 := thy_qyris_loop(c2);
  if (v2->'frontier_counts'->>'open')::int <> 2 then
    raise notice 'PROOF FAIL: successor holds % open frontier items, expected 2',
      v2->'frontier_counts'->>'open'; ok := false;
  end if;
  if not exists (
    select 1 from jsonb_array_elements(v2->'frontier') f
     where f->>'item' = 'Whether any real order has ever completed'
       and (f->>'carried_from_id')::bigint = f_open) then
    raise notice 'PROOF FAIL: the carried item does not name the frontier row it came from'; ok := false;
  end if;

  -- The settled item did NOT travel. Closing is not carrying.
  if exists (select 1 from jsonb_array_elements(v2->'frontier') f
              where f->>'item' = 'Whether the store surface exists at all') then
    raise notice 'PROOF FAIL: an explicitly closed item was carried forward anyway'; ok := false;
  end if;

  -- The origin cycle keeps its record: carried, not emptied.
  v := thy_qyris_loop(c1);
  if (v->'frontier_counts'->>'carried')::int <> 2 or (v->'frontier_counts'->>'closed')::int <> 1 then
    raise notice 'PROOF FAIL: origin cycle frontier is %, expected 2 carried and 1 closed',
      v->'frontier_counts'; ok := false;
  end if;
  if (v->'frontier_counts'->>'open')::int <> 0 then
    raise notice 'PROOF FAIL: origin cycle still holds open frontier items after transfer'; ok := false;
  end if;
  if v->>'state' <> 'TRANSFERRED' then
    raise notice 'PROOF FAIL: origin cycle state is %, expected TRANSFERRED', v->>'state'; ok := false;
  end if;
  if (v->'next_context'->>'cycle_id')::bigint <> c2 then
    raise notice 'PROOF FAIL: origin cycle does not point at its successor'; ok := false;
  end if;

  -- Q' IS THE NEXT Q -------------------------------------------------------------
  if v2->>'question' <> 'Can a build session reach thylora-dash at all, and if not, who runs the read?' then
    raise notice 'PROOF FAIL: the successor question is not the Q-prime that was transferred'; ok := false;
  end if;
  if not exists (select 1 from jsonb_array_elements(v2->'stages') s
                  where s->>'stage' = 'Q' and (s->>'recorded')::boolean
                    and s->>'body' = v2->>'question') then
    raise notice 'PROOF FAIL: the successor Q stage does not carry the transferred question'; ok := false;
  end if;

  -- RECURSION: the second cycle transfers again, carrying what is still open ------
  perform thy_qyris_record(c2,'Y','Egress, credentials and who is at a keyboard.','WR-OMNIVIEW-587 §2');
  perform thy_qyris_record(c2,'R','Repository only, again. Two sessions now record the same denial.','WR-RAELINK-001; WR-OMNIVIEW-587');
  perform thy_qyris_record(c2,'I','The denial becomes a standing gate rather than a per-session note.','db/gate-law/0004_seed_gate_law.sql');
  perform thy_qyris_record(c2,'S','Settled: the read must be run by the Chairman. Not settled: when.','GATE-BACKEND-EGRESS');
  v := thy_qyris_transfer(c2, 'When will the Chairman run the OMNIVIEW apply and readback?', 590);
  c3 := (v->>'next_cycle_id')::bigint;

  -- Both original unknowns are still on the frontier two cycles later.
  v2 := thy_qyris_loop(c3);
  if (v2->'frontier_counts'->>'open')::int <> 2 then
    raise notice 'PROOF FAIL: after two transfers the frontier holds % items, expected 2',
      v2->'frontier_counts'->>'open'; ok := false;
  end if;
  if not exists (select 1 from jsonb_array_elements(v2->'frontier') f
                  where f->>'item' = 'Whether any real order has ever completed') then
    raise notice 'PROOF FAIL: an open item was lost across the second transfer'; ok := false;
  end if;

  -- A chain does not end on an open frontier ---------------------------------
  refused := false;
  begin
    perform thy_qyris_terminate(c3, 'calling it done');
  exception when others then refused := true; end;
  if not refused then
    raise notice 'PROOF FAIL: a chain terminated while its frontier was still open'; ok := false;
  end if;

  -- The chain read shows the whole recursion ---------------------------------
  v_chain := thy_qyris_chain('STORE');
  if (v_chain->>'cycle_count')::int <> 3 then
    raise notice 'PROOF FAIL: chain reports % cycles, expected 3', v_chain->>'cycle_count'; ok := false;
  end if;
  if jsonb_array_length(v_chain->'open_frontier') <> 2 then
    raise notice 'PROOF FAIL: chain open frontier has % items, expected 2',
      jsonb_array_length(v_chain->'open_frontier'); ok := false;
  end if;
  -- Nothing is stranded on a closed cycle.
  if jsonb_array_length(v_chain->'stranded_frontier') <> 0 then
    raise notice 'PROOF FAIL: % frontier items are stranded on transferred cycles',
      jsonb_array_length(v_chain->'stranded_frontier'); ok := false;
  end if;
  if v_chain->>'answer' not like 'The live question on STORE is:%' then
    raise notice 'PROOF FAIL: the chain does not name the live question'; ok := false;
  end if;

  if ok then
    raise notice 'PROOF PASS: QYRIS TRANSFER — Q->Y->R->I->S->T ran twice, each transfer created the next context and carried its open frontier (2 items survived 2 transfers), a closed item did not travel, a transfer to nowhere was refused, and a chain refused to end on an open frontier';
  end if;
end $$;

rollback;
