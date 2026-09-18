-- HISTORY → SHOW FACTORY · 0004 · the production gate, in SQL
-- Workroom: WR-SHOWFACTORY-001 · REVIEWABLE, NOT APPLIED.
--
-- This mirrors productionGate() in show-factory/lib/seed.js. The rules are written
-- twice on purpose: once in JS so the researcher sees the answer immediately, once
-- here so a different client cannot bypass it. The two are kept deliberately
-- identical and the parity is asserted by the validation harness.

create or replace function hsf_production_gate(p_seed_id uuid)
returns table (code text, detail text, route text)
language plpgsql stable as $$
declare
  v_moment uuid;
begin
  select moment_id into v_moment from hsf_seeds where id = p_seed_id;
  if v_moment is null then
    return query select 'SEED_MISSING'::text, 'No seed record.'::text, 'hsf_seeds'::text;
    return;
  end if;

  -- 1 · the formula: five factors, all present. A missing factor is a zero.
  return query
    select 'FACTOR_MISSING_' || f::text,
           'SHOW_SEED has no ' || replace(lower(f::text), '_', ' ') || '.',
           'hsf_seed_factors'
    from unnest(enum_range(null::hsf_factor)) f
    where not exists (select 1 from hsf_seed_factors sf where sf.seed_id = p_seed_id and sf.factor = f);

  -- 2 · three acts
  return query
    select 'ACT_MISSING_' || n::text, 'Act ' || n || ' has not been written.', 'hsf_acts'
    from generate_series(1, 3) n
    where not exists (select 1 from hsf_acts a where a.seed_id = p_seed_id and a.act_no = n);

  -- 3 · a documented spine
  return query
    select 'NO_DOCUMENTED_SPINE',
           'Nothing on this moment is DOCUMENTED. There is no spine to build on.',
           'hsf_claims'
    where not exists (select 1 from hsf_claims c where c.moment_id = v_moment and c.tier = 'DOCUMENTED');

  -- 4 · DOCUMENTED needs a primary, archival or scholarly source
  return query
    select 'TIER_TOO_STRONG',
           c.ref || ': DOCUMENTED needs a primary, archival or scholarly source. Popular repetition is not documentation.',
           'hsf_claim_sources'
    from hsf_claims c
    where c.moment_id = v_moment and c.tier = 'DOCUMENTED'
      and not exists (
        select 1 from hsf_claim_sources cs join hsf_sources s on s.id = cs.source_id
        where cs.claim_id = c.id and s.source_class in ('PRIMARY', 'ARCHIVAL', 'SCHOLARLY'));

  -- 5 · every claim below UNKNOWN needs at least one source
  return query
    select 'SOURCE_MISSING', c.ref || ': a ' || c.tier::text || ' claim must name at least one source.', 'hsf_claim_sources'
    from hsf_claims c
    where c.moment_id = v_moment and c.tier <> 'UNKNOWN'
      and not exists (select 1 from hsf_claim_sources cs where cs.claim_id = c.id);

  -- 6 · a quotation cannot be documented wording without the document
  return query
    select 'QUOTE_NOT_DOCUMENTED',
           q.ref || ': documented wording needs the document. Downgrade the state.',
           'hsf_quote_sources'
    from hsf_quotes q
    where q.moment_id = v_moment and q.state = 'DOCUMENTED_WORDING'
      and not exists (
        select 1 from hsf_quote_sources qs join hsf_sources s on s.id = qs.source_id
        where qs.quote_id = q.id and s.source_class in ('PRIMARY', 'ARCHIVAL'));

  -- 7 · if the seed says the retelling is wrong, a claim must carry the correction
  return query
    select 'RETELLING_CORRECTION_UNSOURCED',
           'The moment says the popular retelling is wrong but no claim carries the correction.',
           'hsf_claims.corrects_retelling'
    from hsf_moments m
    where m.id = v_moment
      and m.popular_retelling_error is not null and length(btrim(m.popular_retelling_error)) > 0
      and not exists (select 1 from hsf_claims c where c.moment_id = v_moment and c.corrects_retelling);

  -- 8 · rights: unresolved copyright blocks production use
  return query
    select 'COPYRIGHT_UNRESOLVED', e.ref || ': resolve copyright before this item is cut into anything.', 'hsf_evidence_items'
    from hsf_evidence_items e
    where e.seed_id = p_seed_id and e.copyright_state = 'UNRESOLVED';

  -- 9 · rights: human remains and violated consent need a named clearance
  return query
    select 'AUTHORITY_CLEARANCE_REQUIRED',
           e.ref || ': ' || f.flag::text || ' requires a named clearance before production use.',
           'hsf_evidence_items.authority_clearance'
    from hsf_evidence_items e
    join hsf_evidence_people_flags f on f.evidence_item_id = e.id
    where e.seed_id = p_seed_id
      and f.flag in ('HUMAN_REMAINS', 'CONSENT_HISTORY_VIOLATED')
      and (e.authority_clearance is null or length(btrim(e.authority_clearance)) = 0);

  -- 10 · rights: identified living descendants must have a recorded contact state
  return query
    select 'DESCENDANT_CONTACT_UNRESOLVED',
           e.ref || ': named living descendants exist. Record contacted, declined, or unreachable.',
           'hsf_evidence_items.descendant_contact_state'
    from hsf_evidence_items e
    join hsf_evidence_people_flags f on f.evidence_item_id = e.id
    where e.seed_id = p_seed_id and f.flag = 'LIVING_DESCENDANTS_IDENTIFIED'
      and (e.descendant_contact_state is null or length(btrim(e.descendant_contact_state)) = 0);

  -- 11 · the ladder: every rung written
  return query
    select 'FORMAT_MISSING_' || fmt::text, 'The ' || replace(lower(fmt::text), '_', ' ') || ' has not been written.', 'hsf_format_drafts'
    from unnest(enum_range(null::hsf_format)) fmt
    where not exists (select 1 from hsf_format_drafts d where d.seed_id = p_seed_id and d.format = fmt);

  -- 12 · the short may not carry a contested or inferred claim
  return query
    select 'SHORT_60_TIER_NOT_ALLOWED', c.ref || ' is ' || c.tier::text || ' and cannot carry a 60-second short.', 'hsf_format_claims'
    from hsf_format_drafts d
    join hsf_format_claims fc on fc.format_draft_id = d.id
    join hsf_claims c on c.id = fc.claim_id
    where d.seed_id = p_seed_id and d.format = 'SHORT_60' and c.tier in ('CONTESTED', 'INFERENCE', 'UNKNOWN');

  -- 13 · the children's rung rests on DOCUMENTED claims only. The strictest rule here.
  return query
    select 'CHILDREN_NON_DOCUMENTED',
           'The children''s version rests on a non-documented claim: ' || c.ref || '.',
           'hsf_format_claims'
    from hsf_format_drafts d
    join hsf_format_claims fc on fc.format_draft_id = d.id
    join hsf_claims c on c.id = fc.claim_id
    where d.seed_id = p_seed_id and d.format = 'CHILDREN' and c.tier <> 'DOCUMENTED';

  -- 14 · question cards: at least five
  return query
    select 'QUESTION_CARDS_TOO_FEW', 'A question-card set needs at least five cards.', 'hsf_question_cards'
    where (select count(*) from hsf_question_cards q where q.seed_id = p_seed_id) < 5;
end $$;

-- Convenience: run the gate and record the run in the append-only trail.
create or replace function hsf_run_gate(p_seed_id uuid, p_run_by text default null)
returns text
language plpgsql as $$
declare
  v_blockers jsonb;
  v_state text;
begin
  select coalesce(jsonb_agg(to_jsonb(g)), '[]'::jsonb) into v_blockers
  from hsf_production_gate(p_seed_id) g;

  v_state := case when jsonb_array_length(v_blockers) = 0 then 'PASSED' else 'BLOCKED' end;
  insert into hsf_gate_events (seed_id, gate_state, blockers, run_by)
  values (p_seed_id, v_state, v_blockers, p_run_by);

  update hsf_seeds set state = case when v_state = 'PASSED' then 'PRODUCTION_READY'::hsf_seed_state else 'GATED'::hsf_seed_state end
  where id = p_seed_id and state in ('SEEDED', 'GATED', 'PRODUCTION_READY');

  return v_state;
end $$;

-- Money and publication decisions are never a browser's to make.
do $$ begin
  execute 'revoke execute on function hsf_run_gate(uuid, text) from public';
exception when others then null; end $$;
