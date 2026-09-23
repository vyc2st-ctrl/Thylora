-- OMNIVIEW · 0005 · Row level security
-- Work: THY-WORK-OMNIVIEW-ROUNDTRIP-587, THY-WORK-OMNIVIEW-LIVE-APPLY-591
--
-- ACCESS != AUTHORITY. The Chairman READS the whole OMNIVIEW surface: the
-- manifest, the ledger, the canon and its superseded history. Nobody WRITES
-- directly. Every write goes through the security-definer functions in 0004, so
-- the chain guard, the append-only rule and the readback cannot be stepped
-- around by a client that gets replaced.
--
-- 591 CORRECTION (made before first live apply): the reviewed pack granted read
-- to ANY signed-in session (auth.uid() is not null). On thylora-dash that would
-- have opened the ledger to every member and store account, and it is weaker
-- than the backend's own rule for the same material: thylora_query_carryforward
-- is readable only when thylora_is_chairman(). The read policy now uses that
-- same helper, so OMNIVIEW grants no more than the registry it summarises.

begin;

-- Validation databases do not carry the THYLORA role helper. The live backend
-- does, and this block leaves it untouched there.
do $$
begin
  if to_regprocedure('public.thylora_is_chairman()') is null then
    raise exception 'OMNIVIEW_RLS_PREREQUISITE: public.thylora_is_chairman() is missing. '
      'OMNIVIEW reads are Chairman-only and will not fall back to a weaker rule.';
  end if;
end $$;

alter table thy_sequence_ledger         enable row level security;
alter table thy_sequence_ledger_topics  enable row level security;
alter table thy_omniview_topics         enable row level security;
alter table thy_omniview_statements     enable row level security;
alter table thy_omniview_links          enable row level security;
alter table thy_omniview_gates          enable row level security;
alter table thy_omniview_questions      enable row level security;
alter table thy_omniview_restarts       enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'thy_sequence_ledger','thy_sequence_ledger_topics','thy_omniview_topics',
    'thy_omniview_statements','thy_omniview_links','thy_omniview_gates',
    'thy_omniview_questions','thy_omniview_restarts']
  loop
    execute format('drop policy if exists %I on %I', t || '_read', t);
    execute format(
      'create policy %I on %I for select to authenticated using (public.thylora_is_chairman())',
      t || '_read', t);

    -- No insert/update/delete policy is created on purpose. With RLS enabled and
    -- no write policy, direct client writes are refused; the 0004 functions are
    -- the only way in. anon gets nothing at all.
    execute format('revoke all on %I from anon', t);
    execute format('revoke insert, update, delete, truncate, references, trigger on %I from authenticated', t);
    execute format('grant select on %I to authenticated', t);
  end loop;
end $$;

-- Read model: SECURITY INVOKER, so the Chairman-only policies above decide what
-- comes back. Signed-out callers cannot run them at all.
do $$
declare f text;
begin
  foreach f in array array[
    'thy_omniview_manifest(int)','thy_omniview_topic(text,int)','thy_omniview_sequence(bigint)',
    'thy_sequence_ledger_page(int,bigint)','thy_omniview_deltas(int,text)',
    'thy_omniview_qyris(text,text,jsonb)','thy_sequence_head()',
    'thy_omniview_normalize_key(text)','thy_omniview_resolve_topic(text)']
  loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

-- Trigger functions are never called directly.
revoke execute on function thy_sequence_ledger_chain_guard()     from public, anon, authenticated;
revoke execute on function thy_sequence_ledger_append_only()     from public, anon, authenticated;
revoke execute on function thy_omniview_statement_no_rewrite()   from public, anon, authenticated;

-- Write path: service role only. Custody does not travel to the browser.
revoke execute on function thy_sequence_append(bigint,timestamp,text,text,text,text,text,text,text,text,text,jsonb,bigint,text,timestamptz) from public, anon, authenticated;
revoke execute on function thy_omniview_register_topic(text,text,text,text,text,text,text) from public, anon, authenticated;
revoke execute on function thy_omniview_state_canon(text,text,text,text,bigint,bigint,text,text) from public, anon, authenticated;
revoke execute on function thy_omniview_link(text,text,text,text,text,text,text,text,bigint) from public, anon, authenticated;
revoke execute on function thy_omniview_set_gate(text,text,text,text,text,text,text,bigint) from public, anon, authenticated;
revoke execute on function thy_omniview_ask(text,text,text,boolean,bigint) from public, anon, authenticated;
revoke execute on function thy_omniview_answer(bigint,bigint) from public, anon, authenticated;
revoke execute on function thy_omniview_restart(text,text,text,bigint,text,text) from public, anon, authenticated;

grant execute on function thy_sequence_append(bigint,timestamp,text,text,text,text,text,text,text,text,text,jsonb,bigint,text,timestamptz) to service_role;
grant execute on function thy_omniview_register_topic(text,text,text,text,text,text,text) to service_role;
grant execute on function thy_omniview_state_canon(text,text,text,text,bigint,bigint,text,text) to service_role;
grant execute on function thy_omniview_link(text,text,text,text,text,text,text,text,bigint) to service_role;
grant execute on function thy_omniview_set_gate(text,text,text,text,text,text,text,bigint) to service_role;
grant execute on function thy_omniview_ask(text,text,text,boolean,bigint) to service_role;
grant execute on function thy_omniview_answer(bigint,bigint) to service_role;
grant execute on function thy_omniview_restart(text,text,text,bigint,text,text) to service_role;

commit;
