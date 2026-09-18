-- HISTORY → SHOW FACTORY · 0005 · row level security
-- Workroom: WR-SHOWFACTORY-001 · REVIEWABLE, NOT APPLIED.
--
-- Research is readable by signed-in researchers. Writing history is not a public
-- act: every write goes through the service role. Published corrections are the
-- one exception — they are world-readable, always, which is the point of them.

begin;

do $$
declare t text;
begin
  foreach t in array array[
    'hsf_moments','hsf_sources','hsf_claims','hsf_claim_sources','hsf_quotes','hsf_quote_sources',
    'hsf_seeds','hsf_seed_factors','hsf_acts','hsf_format_drafts','hsf_format_claims','hsf_question_cards',
    'hsf_evidence_items','hsf_evidence_people_flags','hsf_corrections','hsf_gate_events'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists %I on %I', t || '_read', t);
    execute format('drop policy if exists %I on %I', t || '_write', t);
    execute format('create policy %I on %I for select to authenticated using (true)', t || '_read', t);
    execute format('create policy %I on %I for all to service_role using (true) with check (true)', t || '_write', t);
  end loop;
end $$;

-- Anyone at all may read a published correction, signed in or not.
drop policy if exists hsf_corrections_read_published on hsf_corrections;
create policy hsf_corrections_read_published on hsf_corrections
  for select to anon, authenticated using (published = true);

-- The gate runner writes to an append-only trail and moves seed state. Not a
-- browser's job.
revoke execute on function hsf_run_gate(uuid, text) from public;
do $$ begin
  execute 'revoke execute on function hsf_run_gate(uuid, text) from anon, authenticated';
exception when undefined_object then null; end $$;

commit;
