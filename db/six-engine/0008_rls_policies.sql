-- SIX UNDERSTANDING ENGINE · 0008 · Row level security
-- Workroom: WR-SIXENGINE-001
--
-- ACCESS != AUTHORITY. A learner reads their own questions, their own runs and
-- their own record. A guardian on that learner's protection list reads the same
-- and is the only party who can dispose of a gated question. The lexicon and the
-- concept graph are shared teaching material and are readable by any signed-in
-- member; writing them is a department action, not a learner action.
--
-- Writes that need custody — closing a run, recording a load measurement,
-- resolving a claim — go through the security-definer functions in 0007 rather
-- than direct table grants.

begin;

create or replace function sixu_is_learner(p_learner_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from sixu_learners l where l.id = p_learner_id and l.user_id = auth.uid());
$$;

create or replace function sixu_is_guardian(p_learner_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from sixu_learners l
     where l.id = p_learner_id and auth.uid() = any(l.guardian_user_ids));
$$;

-- A learner's own record, or the record of a learner this adult protects.
create or replace function sixu_may_read_learner(p_learner_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select sixu_is_learner(p_learner_id) or sixu_is_guardian(p_learner_id);
$$;

alter table sixu_learners               enable row level security;
alter table sixu_learner_known_lemmas   enable row level security;
alter table sixu_question_sessions      enable row level security;
alter table sixu_questions              enable row level security;
alter table sixu_question_routes        enable row level security;
alter table sixu_gate_routings          enable row level security;
alter table sixu_lexemes                enable row level security;
alter table sixu_word_senses            enable row level security;
alter table sixu_sense_cues             enable row level security;
alter table sixu_blocker_resolutions    enable row level security;
alter table sixu_learner_restatements   enable row level security;
alter table sixu_sense_ambiguities      enable row level security;
alter table sixu_lexicon_gaps           enable row level security;
alter table sixu_concepts               enable row level security;
alter table sixu_concept_prerequisites  enable row level security;
alter table sixu_learner_mastery        enable row level security;
alter table sixu_concept_gaps           enable row level security;
alter table sixu_prerequisite_walks     enable row level security;
alter table sixu_claims                 enable row level security;
alter table sixu_claim_positions        enable row level security;
alter table sixu_sources                enable row level security;
alter table sixu_evidence_items         enable row level security;
alter table sixu_claim_unknowns         enable row level security;
alter table sixu_discriminators         enable row level security;
alter table sixu_claim_resolutions      enable row level security;
alter table sixu_resolution_positions   enable row level security;
alter table sixu_evidence_tier_weights  enable row level security;
alter table sixu_problem_structures     enable row level security;
alter table sixu_solve_attempts         enable row level security;
alter table sixu_load_measurements      enable row level security;
alter table sixu_runs                   enable row level security;
alter table sixu_run_stages             enable row level security;
alter table sixu_run_failures           enable row level security;
alter table sixu_transfer_tasks         enable row level security;
alter table sixu_next_questions         enable row level security;
alter table sixu_run_connections        enable row level security;

-- Learner-owned rows -----------------------------------------------------------
drop policy if exists sixu_learners_read on sixu_learners;
create policy sixu_learners_read on sixu_learners for select
  using (sixu_may_read_learner(id));

drop policy if exists sixu_known_lemmas_read on sixu_learner_known_lemmas;
create policy sixu_known_lemmas_read on sixu_learner_known_lemmas for select
  using (sixu_may_read_learner(learner_id));

drop policy if exists sixu_sessions_read on sixu_question_sessions;
create policy sixu_sessions_read on sixu_question_sessions for select
  using (sixu_may_read_learner(learner_id));

drop policy if exists sixu_questions_read on sixu_questions;
create policy sixu_questions_read on sixu_questions for select
  using (sixu_may_read_learner(learner_id));

drop policy if exists sixu_questions_insert on sixu_questions;
create policy sixu_questions_insert on sixu_questions for insert
  with check (sixu_is_learner(learner_id) or sixu_is_guardian(learner_id));

drop policy if exists sixu_routes_read on sixu_question_routes;
create policy sixu_routes_read on sixu_question_routes for select
  using (exists (select 1 from sixu_questions q where q.id = question_id and sixu_may_read_learner(q.learner_id)));

-- A gated question is the guardian's to dispose of. The learner may see that it
-- was routed; only the guardian may say what happens next.
drop policy if exists sixu_gate_read on sixu_gate_routings;
create policy sixu_gate_read on sixu_gate_routings for select
  using (exists (select 1 from sixu_questions q where q.id = question_id and sixu_may_read_learner(q.learner_id)));

drop policy if exists sixu_gate_dispose on sixu_gate_routings;
create policy sixu_gate_dispose on sixu_gate_routings for update
  using (routed_to_user_id = auth.uid())
  with check (routed_to_user_id = auth.uid());

-- Language work ----------------------------------------------------------------
drop policy if exists sixu_blockers_read on sixu_blocker_resolutions;
create policy sixu_blockers_read on sixu_blocker_resolutions for select
  using (sixu_may_read_learner(learner_id));

drop policy if exists sixu_restatements_read on sixu_learner_restatements;
create policy sixu_restatements_read on sixu_learner_restatements for select
  using (exists (select 1 from sixu_blocker_resolutions b where b.id = resolution_id and sixu_may_read_learner(b.learner_id)));

drop policy if exists sixu_restatements_insert on sixu_learner_restatements;
create policy sixu_restatements_insert on sixu_learner_restatements for insert
  with check (exists (select 1 from sixu_blocker_resolutions b where b.id = resolution_id and sixu_may_read_learner(b.learner_id)));

drop policy if exists sixu_ambiguities_read on sixu_sense_ambiguities;
create policy sixu_ambiguities_read on sixu_sense_ambiguities for select
  using (exists (select 1 from sixu_questions q where q.id = question_id and sixu_may_read_learner(q.learner_id)));

-- Mastery and walks ------------------------------------------------------------
drop policy if exists sixu_mastery_read on sixu_learner_mastery;
create policy sixu_mastery_read on sixu_learner_mastery for select
  using (sixu_may_read_learner(learner_id));

drop policy if exists sixu_walks_read on sixu_prerequisite_walks;
create policy sixu_walks_read on sixu_prerequisite_walks for select
  using (sixu_may_read_learner(learner_id));

-- Load separation --------------------------------------------------------------
drop policy if exists sixu_attempts_read on sixu_solve_attempts;
create policy sixu_attempts_read on sixu_solve_attempts for select
  using (sixu_may_read_learner(learner_id));

drop policy if exists sixu_measurements_read on sixu_load_measurements;
create policy sixu_measurements_read on sixu_load_measurements for select
  using (sixu_may_read_learner(learner_id));

drop policy if exists sixu_structures_read on sixu_problem_structures;
create policy sixu_structures_read on sixu_problem_structures for select
  using (exists (select 1 from sixu_questions q where q.id = question_id and sixu_may_read_learner(q.learner_id)));

-- Runs and their trail ---------------------------------------------------------
drop policy if exists sixu_runs_read on sixu_runs;
create policy sixu_runs_read on sixu_runs for select
  using (sixu_may_read_learner(learner_id));

drop policy if exists sixu_run_stages_read on sixu_run_stages;
create policy sixu_run_stages_read on sixu_run_stages for select
  using (exists (select 1 from sixu_runs r where r.id = run_id and sixu_may_read_learner(r.learner_id)));

-- Failure hits are shown to the adult reviewing the run, and to the learner's
-- own record. They are not hidden from the person they were made about.
drop policy if exists sixu_run_failures_read on sixu_run_failures;
create policy sixu_run_failures_read on sixu_run_failures for select
  using (exists (select 1 from sixu_runs r where r.id = run_id and sixu_may_read_learner(r.learner_id)));

drop policy if exists sixu_transfer_read on sixu_transfer_tasks;
create policy sixu_transfer_read on sixu_transfer_tasks for select
  using (sixu_may_read_learner(learner_id));

drop policy if exists sixu_transfer_update on sixu_transfer_tasks;
create policy sixu_transfer_update on sixu_transfer_tasks for update
  using (sixu_may_read_learner(learner_id))
  with check (sixu_may_read_learner(learner_id));

drop policy if exists sixu_next_questions_read on sixu_next_questions;
create policy sixu_next_questions_read on sixu_next_questions for select
  using (exists (select 1 from sixu_runs r where r.id = run_id and sixu_may_read_learner(r.learner_id)));

drop policy if exists sixu_connections_read on sixu_run_connections;
create policy sixu_connections_read on sixu_run_connections for select
  using (exists (select 1 from sixu_runs r where r.id = run_id and sixu_may_read_learner(r.learner_id)));

-- Shared teaching material -----------------------------------------------------
-- The lexicon, the concept graph, the evidence tiers and the knowledge base are
-- readable by any signed-in member. What a word means here, and what evidence
-- counts, is not a private fact about one child.
do $$
declare t text;
begin
  foreach t in array array[
    'sixu_lexemes','sixu_word_senses','sixu_sense_cues','sixu_concepts',
    'sixu_concept_prerequisites','sixu_evidence_tier_weights','sixu_claims',
    'sixu_claim_positions','sixu_sources','sixu_evidence_items','sixu_claim_unknowns',
    'sixu_discriminators','sixu_claim_resolutions','sixu_resolution_positions',
    'sixu_lexicon_gaps','sixu_concept_gaps']
  loop
    execute format('drop policy if exists %I on %I', t || '_read_shared', t);
    execute format('create policy %I on %I for select to authenticated using (true)', t || '_read_shared', t);
  end loop;
end $$;

commit;
