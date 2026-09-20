-- THY-WORK-MATH-FAMOUS-THOUGHT-559 · 0004 · People in time
--
-- Section 6 of the work order: this is not motivational quote content. Each
-- person is held as a reasoning case with seven required answers, and the two
-- that matter most for honesty are WHAT COULD THEY NOT KNOW and WHERE CAN THAT
-- RULE FAIL. A row that answers the first five and leaves those two blank is a
-- poster with extra steps, so the table refuses to be marked COMPLETE without them.
--
-- thylora_famous_thought_registry is the registry of record for the thought
-- itself. This table soft-references it by thought code and never restates the
-- quotation.

begin;

create table if not exists thy_people_in_time (
  thought_code            text primary key,
  registry_ref            text,
  graph_stable_id         text not null default 'SYSTEM-FAMOUS-THOUGHT-001',
  problem_faced           text not null default 'UNKNOWN_DEFINITION',
  what_they_knew          text not null default 'UNKNOWN_DEFINITION',
  what_they_could_not_know text not null default 'UNKNOWN_DEFINITION',
  what_they_said_ref      text not null default 'UNKNOWN_DEFINITION',
  reasoning_rule          text not null default 'UNKNOWN_DEFINITION',
  where_the_rule_fails    text not null default 'UNKNOWN_DEFINITION',
  transfer_today          text not null default 'UNKNOWN_DEFINITION',
  completeness            text not null default 'PENDING_READBACK',
  version                 integer not null default 1,
  superseded_by           text references thy_people_in_time (thought_code),
  updated_at              timestamptz not null default now(),
  constraint thy_pit_completeness_known
    check (completeness in ('PENDING_READBACK', 'PARTIAL', 'COMPLETE', 'SUPERSEDED')),
  -- COMPLETE is earned, not asserted.
  constraint thy_pit_complete_is_complete
    check (completeness <> 'COMPLETE' or (
      problem_faced            <> 'UNKNOWN_DEFINITION' and
      what_they_knew           <> 'UNKNOWN_DEFINITION' and
      what_they_could_not_know <> 'UNKNOWN_DEFINITION' and
      what_they_said_ref       <> 'UNKNOWN_DEFINITION' and
      reasoning_rule           <> 'UNKNOWN_DEFINITION' and
      where_the_rule_fails     <> 'UNKNOWN_DEFINITION' and
      transfer_today           <> 'UNKNOWN_DEFINITION'
    )),
  -- The two questions that separate reasoning from motivation may never be
  -- filled with an empty gesture while the rest is filled in.
  constraint thy_pit_limits_required_with_rule
    check (reasoning_rule = 'UNKNOWN_DEFINITION' or where_the_rule_fails <> 'UNKNOWN_DEFINITION')
);

comment on table thy_people_in_time is
  'Seven-question reasoning frame per famous thought. what_they_said_ref points at
   the stored source record; the quotation itself is never duplicated here.';

comment on constraint thy_pit_limits_required_with_rule on thy_people_in_time is
  'A rule may not be extracted without stating where it fails. Section 6 requires
   both, and a rule with no stated failure mode is advertising, not reasoning.';

-- The four records named by the work order, registered as pending readback.
-- The quotations, speakers, sources and contexts are NOT written here: this
-- session could not reach thylora_famous_thought_registry, and section 4
-- forbids rewriting them from memory.
insert into thy_people_in_time (thought_code, registry_ref)
values
  ('THOUGHT-DOUGLASS-001',   'THOUGHT-DOUGLASS-001'),
  ('THOUGHT-CARVER-001',     'THOUGHT-CARVER-001'),
  ('THOUGHT-WASHINGTON-001', 'THOUGHT-WASHINGTON-001'),
  ('THOUGHT-FORD-001',       'THOUGHT-FORD-001')
on conflict (thought_code) do nothing;

create or replace function thy_people_in_time_supersede(p_old text, p_new text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_old is null or p_new is null or p_old = p_new then
    raise exception 'supersede requires two distinct thought codes';
  end if;
  if not exists (select 1 from thy_people_in_time where thought_code = p_new) then
    raise exception 'superseding record % does not exist', p_new;
  end if;
  update thy_people_in_time
     set completeness = 'SUPERSEDED', superseded_by = p_new, updated_at = now()
   where thought_code = p_old;
end $$;

commit;
