-- OMNIVIEW · 0005 · Row level security
-- Work: THY-WORK-OMNIVIEW-ROUNDTRIP-587
--
-- ACCESS != AUTHORITY. A signed-in Chairman session READS the whole OMNIVIEW
-- surface: the manifest, the ledger, the canon and its superseded history. It
-- WRITES nothing directly. Every write goes through the security-definer
-- functions in 0004, so the chain guard, the append-only rule and the readback
-- cannot be stepped around by a client that gets replaced.

begin;

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
      'create policy %I on %I for select to authenticated using (auth.uid() is not null)',
      t || '_read', t);

    -- No insert/update/delete policy is created on purpose. With RLS enabled and
    -- no write policy, direct client writes are refused; the 0004 functions are
    -- the only way in.
    execute format('revoke insert, update, delete on %I from authenticated, anon', t);
    execute format('grant select on %I to authenticated', t);
  end loop;
end $$;

-- Read model: any signed-in session may run it.
grant execute on function thy_omniview_manifest(int)            to authenticated;
grant execute on function thy_omniview_topic(text,int)          to authenticated;
grant execute on function thy_omniview_sequence(bigint)         to authenticated;
grant execute on function thy_sequence_ledger_page(int,bigint)  to authenticated;
grant execute on function thy_omniview_deltas(int,text)         to authenticated;
grant execute on function thy_omniview_qyris(text,text,jsonb)   to authenticated;
grant execute on function thy_sequence_head()                   to authenticated;

-- Write path: service role only. Custody does not travel to the browser.
revoke execute on function thy_sequence_append(bigint,timestamp,text,text,text,text,text,text,text,text,text,jsonb,bigint,text,timestamptz) from public, anon, authenticated;
revoke execute on function thy_omniview_register_topic(text,text,text,text,text,text,text) from public, anon, authenticated;
revoke execute on function thy_omniview_state_canon(text,text,text,text,bigint,bigint,text,text) from public, anon, authenticated;
revoke execute on function thy_omniview_link(text,text,text,text,text,text,text,text,bigint) from public, anon, authenticated;
revoke execute on function thy_omniview_set_gate(text,text,text,text,text,text,text,bigint) from public, anon, authenticated;
revoke execute on function thy_omniview_ask(text,text,text,boolean,bigint) from public, anon, authenticated;
revoke execute on function thy_omniview_answer(bigint,bigint) from public, anon, authenticated;
revoke execute on function thy_omniview_restart(text,text,text,bigint,text,text) from public, anon, authenticated;

commit;
