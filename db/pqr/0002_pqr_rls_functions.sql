-- ============================================================================
-- PUBLIC QUESTION RADAR (PQR) · 0002 · RLS, grants, gates and readers
-- PQR is internal intelligence. Chairman reads and writes; anon reads nothing.
-- ============================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'thylora_pqr_sources','thylora_pqr_signals','thylora_pqr_question_clusters',
    'thylora_pqr_cluster_signals','thylora_pqr_evidence_checks',
    'thylora_pqr_gap_findings','thylora_pqr_scores','thylora_pqr_opportunities',
    'thylora_pqr_originality_gate','thylora_pqr_boards','thylora_pqr_board_rows'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format(
      'drop policy if exists chairman_manage_%s on public.%I', t, t);
    execute format(
      'create policy chairman_manage_%s on public.%I for all to authenticated '
      || 'using (thylora_is_chairman()) with check (thylora_is_chairman())', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Originality verdict. Computed, never asserted by the writer.
-- ---------------------------------------------------------------------------
create or replace function public.thylora_pqr_originality_verdict()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare b jsonb := '[]'::jsonb;
begin
  if not new.question_is_public then
    b := b || jsonb_build_array(jsonb_build_object(
      'code','QUESTION_NOT_ESTABLISHED_PUBLIC',
      'detail','The question has not been shown to be publicly recurring.',
      'route','Add signals from at least two distinct sources and re-evaluate.'));
  end if;
  if not new.no_creator_work_reused then
    b := b || jsonb_build_array(jsonb_build_object(
      'code','CREATOR_WORK_REUSE_UNCLEARED',
      'detail','Reuse of a creator''s wording, structure or framing is not cleared.',
      'route','Rewrite from the evidence, or record attribution and a licence.'));
  end if;
  if not new.independent_evidence_path then
    b := b || jsonb_build_array(jsonb_build_object(
      'code','NO_INDEPENDENT_EVIDENCE_PATH',
      'detail','THYLORA cannot reach this answer without leaning on the observed source.',
      'route','Find a primary source, or record the evidence state as ABSENT.'));
  end if;
  if new.distinct_thylora_angle is null or length(btrim(new.distinct_thylora_angle)) < 20 then
    b := b || jsonb_build_array(jsonb_build_object(
      'code','NO_DISTINCT_ANGLE',
      'detail','No stated angle that is ours rather than a restatement.',
      'route','State what THYLORA adds that the observed sources do not.'));
  end if;
  new.blockers := b;
  new.verdict  := case when jsonb_array_length(b) = 0 then 'PASS' else 'BLOCKED' end;
  return new;
end $$;

drop trigger if exists thylora_pqr_originality_verdict_trg on public.thylora_pqr_originality_gate;
create trigger thylora_pqr_originality_verdict_trg
  before insert or update on public.thylora_pqr_originality_gate
  for each row execute function public.thylora_pqr_originality_verdict();

-- ---------------------------------------------------------------------------
-- Release gate. Reports every blocker at once, never one per round trip.
-- Always carries NO_PUBLISH_IN_V1: this workstream does not publish.
-- ---------------------------------------------------------------------------
create or replace function public.thylora_pqr_release_gate_v1(p_opportunity_code text)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  o public.thylora_pqr_opportunities%rowtype;
  b jsonb := '[]'::jsonb;
  v_gate public.thylora_pqr_originality_gate%rowtype;
  v_evidence_count int;
  v_absent_count int;
  v_score public.thylora_pqr_scores%rowtype;
begin
  select * into o from public.thylora_pqr_opportunities where opportunity_code = p_opportunity_code;
  if not found then
    return jsonb_build_object('opportunity_code', p_opportunity_code,
                              'found', false, 'blockers', '[]'::jsonb);
  end if;

  select * into v_gate from public.thylora_pqr_originality_gate
    where opportunity_code = p_opportunity_code
    order by evaluated_at desc limit 1;
  if not found then
    b := b || jsonb_build_array(jsonb_build_object('code','ORIGINALITY_GATE_NOT_RUN',
      'detail','No originality evaluation exists for this opportunity.',
      'route','Insert a row into thylora_pqr_originality_gate.'));
  elsif v_gate.verdict <> 'PASS' then
    b := b || jsonb_build_array(jsonb_build_object('code','ORIGINALITY_GATE_BLOCKED',
      'detail','The originality gate is blocked.', 'route','Clear the gate blockers.',
      'gate_blockers', v_gate.blockers));
  end if;

  select count(*), count(*) filter (where evidence_state = 'ABSENT')
    into v_evidence_count, v_absent_count
    from public.thylora_pqr_evidence_checks where cluster_code = o.cluster_code;
  if v_evidence_count = 0 then
    b := b || jsonb_build_array(jsonb_build_object('code','NO_EVIDENCE_CHECK',
      'detail','No evidence check exists for the underlying question.',
      'route','Run an evidence check before routing this anywhere.'));
  end if;
  if o.output_class in ('INVESTIGATION','NEWSPAPER','SHOW')
     and v_absent_count = v_evidence_count and v_evidence_count > 0 then
    b := b || jsonb_build_array(jsonb_build_object('code','EVIDENCE_ABSENT_FOR_FACTUAL_OUTPUT',
      'detail','Every evidence check on this question came back ABSENT.',
      'route','Find evidence, or route this as a story rather than a factual output.'));
  end if;

  select * into v_score from public.thylora_pqr_scores
    where cluster_code = o.cluster_code and not superseded
    order by scored_at desc limit 1;
  if not found then
    b := b || jsonb_build_array(jsonb_build_object('code','NOT_SCORED',
      'detail','The cluster has no current O = R x Q x E x U x P score.',
      'route','Score the cluster.'));
  elsif v_score.score_band = 'DEAD' then
    b := b || jsonb_build_array(jsonb_build_object('code','SCORE_DEAD',
      'detail','A scoring factor is zero, so the opportunity score is zero.',
      'route','Raise the zero factor with real work, or close the cluster.'));
  end if;

  -- Standing blocker for this version of the workstream.
  b := b || jsonb_build_array(jsonb_build_object('code','NO_PUBLISH_IN_V1',
    'detail','PUBLIC_QUESTION_RADAR v1 detects and routes. It does not publish.',
    'route','Chairman decision plus a later migration that opens a published state.'));

  return jsonb_build_object(
    'opportunity_code', p_opportunity_code,
    'found', true,
    'output_class', o.output_class,
    'state', o.state,
    'blocker_count', jsonb_array_length(b),
    'blockers', b);
end $$;

revoke all on function public.thylora_pqr_release_gate_v1(text) from public, anon;
grant execute on function public.thylora_pqr_release_gate_v1(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Board reader
-- ---------------------------------------------------------------------------
create or replace function public.thylora_pqr_board_v1(p_board_code text)
returns table (
  row_order int, cluster_code text, cluster_question text, domain text,
  what_people_are_asking text, why_it_matters text, what_evidence_exists text,
  what_is_unknown text, ersatzreality_story text, thylora_tool text,
  store_product text, show_possibility text, opportunity_score int, score_band text)
language sql
security invoker
stable
set search_path = public, pg_temp
as $$
  select r.row_order, r.cluster_code, c.cluster_question, c.domain,
         r.what_people_are_asking, r.why_it_matters, r.what_evidence_exists,
         r.what_is_unknown, r.ersatzreality_story, r.thylora_tool,
         r.store_product, r.show_possibility, r.opportunity_score, r.score_band
    from public.thylora_pqr_board_rows r
    join public.thylora_pqr_question_clusters c using (cluster_code)
   where r.board_code = p_board_code
   order by r.row_order;
$$;

revoke all on function public.thylora_pqr_board_v1(text) from public, anon;
grant execute on function public.thylora_pqr_board_v1(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Recurrence recount. Derived from linked signals, never hand-typed.
-- ---------------------------------------------------------------------------
create or replace function public.thylora_pqr_recount_cluster_v1(p_cluster_code text)
returns public.thylora_pqr_question_clusters
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare c public.thylora_pqr_question_clusters%rowtype;
begin
  update public.thylora_pqr_question_clusters q
     set signal_count = s.n,
         distinct_source_count = s.d,
         first_observed_at = s.f,
         last_observed_at = s.l,
         updated_at = now()
    from (
      select count(*) n, count(distinct sg.source_code) d,
             min(sg.observed_at) f, max(sg.observed_at) l
        from public.thylora_pqr_cluster_signals cs
        join public.thylora_pqr_signals sg using (signal_id)
       where cs.cluster_code = p_cluster_code) s
   where q.cluster_code = p_cluster_code
  returning q.* into c;
  return c;
end $$;

revoke all on function public.thylora_pqr_recount_cluster_v1(text) from public, anon;
grant execute on function public.thylora_pqr_recount_cluster_v1(text) to authenticated;
