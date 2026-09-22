-- PROOF TEST · STORE
--
-- Question the proof answers: does one read return the authoritative current
-- state of STORE plus the history and the linked graph around it, without
-- sweeping the raw registries and without creating a second product truth?
--
-- Rolled back at the end.
begin;

do $$
declare v jsonb; m jsonb; ok boolean := true; v_old_id bigint; v_old_body text;
begin
  v := thy_omniview_topic('the store');

  if v->'topic_manifest'->>'topic_key' <> 'STORE' then
    raise notice 'PROOF FAIL: alias "the store" did not resolve'; ok := false;
  end if;

  -- AUTHORITY LOCK: the store answers to the backend of record, not to this repo.
  if v->'authority_locks'->>'authority_lock' <> 'BACKEND_OF_RECORD' then
    raise notice 'PROOF FAIL: STORE authority lock is wrong'; ok := false;
  end if;

  -- LINKED PRODUCTS come back as soft references into the registry that owns them.
  if jsonb_array_length(v#>'{linked_entities,products}') < 1 then
    raise notice 'PROOF FAIL: no linked products'; ok := false;
  end if;
  if not exists (select 1 from jsonb_array_elements(v#>'{linked_entities,products}') p
                  where p->>'source_table' = 'products') then
    raise notice 'PROOF FAIL: the product link does not point back at the owning registry'; ok := false;
  end if;

  -- NO SECOND SOURCE OF TRUTH: OMNIVIEW holds no product rows of its own.
  if to_regclass('public.thy_omniview_products') is not null then
    raise notice 'PROOF FAIL: OMNIVIEW created a competing product table'; ok := false;
  end if;

  -- The linked graph reaches ECONOMY, so money questions are one hop away.
  if not exists (select 1 from jsonb_array_elements(v#>'{linked_entities,topics}') t
                  where t->>'link_key' = 'ECONOMY') then
    raise notice 'PROOF FAIL: STORE is not linked to ECONOMY'; ok := false;
  end if;

  -- The open question is the live-state question, not a restatement of the file.
  if v#>>'{next_better_question,question}' not like '%RELEASED%' then
    raise notice 'PROOF FAIL: the STORE next-better question is not the live-state question'; ok := false;
  end if;

  -- NO RAW SWEEP: every table named in the trace belongs to the OMNIVIEW read model.
  if exists (select 1 from jsonb_array_elements(v#>'{qyris,tables_read}') t
              where t->>'table' not like 'thy\_%') then
    raise notice 'PROOF FAIL: the read swept a raw registry'; ok := false;
  end if;

  -- ---------- history survives a correction ----------
  select id, body into v_old_id, v_old_body
    from thy_omniview_statements where topic_key = 'STORE' and status = 'CURRENT' order by id limit 1;

  perform thy_sequence_append(
    589, timestamp '2026-09-22 11:05', 'UTC',
    'Store canon was restated after a backend read.',
    'STORE canon restated with the live product position.',
    'The previous statement proved the surface exists; it did not state what is on sale.',
    'The storefront page, the product registry and the entitlement registry are unchanged.',
    'Chairman','BACKEND_VERIFIED',
    'Which entitlement does each released product grant?',
    'STORE canon restated at 589.',
    '[{"topic_key":"STORE","effect":"CANON_CHANGED"}]'::jsonb);

  perform thy_omniview_state_canon('STORE',
    'PROOF FIXTURE: restated store canon.','BACKEND_VERIFIED','Chairman', 589, v_old_id);

  v := thy_omniview_topic('STORE');

  if (v#>>'{current_vs_superseded,superseded,0,body}') is distinct from v_old_body then
    raise notice 'PROOF FAIL: the earlier store statement was not preserved'; ok := false;
  end if;
  if (v#>'{current_vs_superseded,current_count}')::int < 1 then
    raise notice 'PROOF FAIL: no current canon after the restatement'; ok := false;
  end if;

  -- ---------- the manifest agrees with the topic read ----------
  m := thy_omniview_manifest(5);
  if (m#>>'{sequence_head}')::bigint <> 589 then
    raise notice 'PROOF FAIL: manifest head is not 589'; ok := false;
  end if;
  if not exists (select 1 from jsonb_array_elements(m->'topic_manifest') t
                  where t->>'topic_key' = 'STORE'
                    and (t->>'last_sequence_no')::bigint = 589
                    and (t->>'superseded_statements')::int >= 1) then
    raise notice 'PROOF FAIL: the manifest does not reflect the store restatement'; ok := false;
  end if;
  if not exists (select 1 from jsonb_array_elements(m->'authority_locks') l
                  where l->>'authority_lock' = 'BACKEND_OF_RECORD') then
    raise notice 'PROOF FAIL: authority locks missing from the manifest'; ok := false;
  end if;
  if m#>>'{last_restart,restart_point}' is null then
    raise notice 'PROOF FAIL: the manifest returned no last restart'; ok := false;
  end if;

  -- ---------- sequence expansion answers the four click questions ----------
  v := thy_omniview_sequence(589);
  if v#>>'{delta,what_changed}' is null or v#>>'{reason,why_it_changed}' is null
     or v#>>'{authority,authority}' is null or v->>'next_question' is null then
    raise notice 'PROOF FAIL: sequence expansion is missing delta, reason, authority or next question'; ok := false;
  end if;
  if v->>'local_datetime' is null or v->>'utc_datetime' is null
     or (v->>'previous_sequence_no')::bigint <> 588 then
    raise notice 'PROOF FAIL: sequence expansion is missing a clock or the previous sequence'; ok := false;
  end if;

  if ok then
    raise notice 'PROOF PASS: STORE — one read returned canon, soft-referenced products, the economy link, preserved history and the live-state question; manifest and sequence expansion agree with it';
  end if;
end $$;

rollback;
