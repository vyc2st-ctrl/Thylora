-- THY-WORK-COMPLETE-QUOTE-LIBRARY-561 : content value gate, graph writeback, QYRIS, work registry and continuity.
-- This file is the idempotent reproduction of the migrations applied to
-- thylora-dash (jvsdxhrfhtlgaknhjxlz) on 2026-09-20:
--   famous_thought_content_value_gate_561
--   famous_thought_graph_writeback_561
--   famous_thought_qyris_work_continuity_565
-- See README.md in this directory for the full applied-migration list.

-- ---------------------------------------------------------------------------
-- CONTENT VALUE GATE  D = A x H x W x T x M x P
-- PASS requires every factor >= 3 AND D >= 4096 (LAW-STORE-DRAW-VALUE-001).
-- Every card FAILS, and that is the correct result, not a defect:
--   A = 3  no measured external demand for THYLORA content
--          (FIND-STORE-DEMAND-BASELINE-556B: zero external paid customers)
--   M = 3  match to a real reader job is asserted, not measured
--   P = 2  the destination surface exists in the backend but the dashboard
--          branch is not merged or promoted, so the reader path is incomplete
-- Ceiling with H=4, W=4, T=5 is 3*4*4*5*3*2 = 1440 against a 4096 threshold.
-- No score was adjusted to make any card pass.
-- ---------------------------------------------------------------------------
insert into thylora_store_draw_gate_evaluations
 (subject_type, subject_id, layer, attention_score, help_score, worth_score, trust_score, match_score, path_score,
  equation_score, geometric_mean, minimum_factor, gate_state, evidence, authority, semver)
select 'CONTENT', r.thought_id, 'Earth',
  3,
  case when p.thought_id is not null then 4 else 2 end,
  case when pt.thought_id is not null then 4 else 3 end,
  case when r.source_class in ('PRIMARY_TEXT_PUBLIC_DOMAIN','NATIONAL_ARCHIVE_PRIMARY','LIBRARY_OF_CONGRESS_PRIMARY','GOVERNMENT_PRIMARY') then 5 else 4 end,
  3, 2,
  3 * (case when p.thought_id is not null then 4 else 2 end)
    * (case when pt.thought_id is not null then 4 else 3 end)
    * (case when r.source_class in ('PRIMARY_TEXT_PUBLIC_DOMAIN','NATIONAL_ARCHIVE_PRIMARY','LIBRARY_OF_CONGRESS_PRIMARY','GOVERNMENT_PRIMARY') then 5 else 4 end)
    * 3 * 2,
  round(power((3 * (case when p.thought_id is not null then 4 else 2 end)
    * (case when pt.thought_id is not null then 4 else 3 end)
    * (case when r.source_class in ('PRIMARY_TEXT_PUBLIC_DOMAIN','NATIONAL_ARCHIVE_PRIMARY','LIBRARY_OF_CONGRESS_PRIMARY','GOVERNMENT_PRIMARY') then 5 else 4 end)
    * 3 * 2)::numeric, 1.0/6.0), 3),
  2, 'FAIL',
  jsonb_build_object('work_code','THY-WORK-COMPLETE-QUOTE-LIBRARY-561','class','PUBLIC_DRAFT_CARD',
    'pass_rule','minimum factor >= 3 AND D >= 4096',
    'reason','Meaning chain complete and source verified, so help, worth and trust are real. Attention and match are unmeasured and the reader path is not promoted to production, so the gate fails. No scores were adjusted to fit.',
    'source_class', r.source_class),
  'THYLORA_ANALYSIS', '1.0.0'
from thylora_famous_thought_registry r
left join thylora_famous_thought_publication_map p on p.thought_id=r.thought_id and p.meaning_gate_state='PASS'
left join thylora_famous_thought_people_in_time pt on pt.thought_id=r.thought_id
where r.state='ACTIVE'
  and not exists (select 1 from thylora_store_draw_gate_evaluations e
                  where e.subject_id=r.thought_id and e.evidence->>'work_code'='THY-WORK-COMPLETE-QUOTE-LIBRARY-561');

-- ---------------------------------------------------------------------------
-- GRAPH WRITEBACK
-- Preflight was run before any write: stable id -> graph context -> layer ->
-- authority -> version -> evidence -> write. No node duplicated, no predicate
-- invented, nothing deleted.
-- ---------------------------------------------------------------------------
insert into thylora_graph_nodes (node_id,node_type,layer,canonical_name,status,authority,truth_class,source_ref,properties,semver)
values
('LAW-FAMOUS-THOUGHT-MEANING-CHAIN-001','Gate','Earth','THYLORA Famous Thought Meaning Chain Gate','CURRENT',
 'THYLORA_ANALYSIS','IMPLEMENTED','THY-WORK-COMPLETE-QUOTE-LIBRARY-561',
 jsonb_build_object(
   'chain', jsonb_build_array('THOUGHT','TENSION','QUESTION','EVIDENCE','CONNECTION','ACTION','DESTINATION'),
   'rule','No quotation may be marked public-ready unless all seven links resolve and the destination is an existing THYLORA capability.',
   'enforced_by','thylora_famous_thought_publication_map.meaning_gate_state',
   'quote_only_cards','PROHIBITED'),'1.0.0'),
('SYSTEM-PEOPLE-IN-TIME-001','System','Earth','THYLORA People in Time Lane','CURRENT',
 'THYLORA_ANALYSIS','IMPLEMENTED','thylora_people_in_time_state + thylora_famous_thought_people_in_time',
 jsonb_build_object(
   'recovers', jsonb_build_array('problem faced','what they knew','what they could not know','historical context','reasoning rule','where the rule fails','transfer today'),
   'rule','Historical people are not flattened into motivational slogans.','records',23),'1.0.0'),
('FIND-QUOTE-ATTRIBUTION-DRIFT-561','Finding','Earth','Widely circulated quotations fail primary-source checks at a high rate','CURRENT',
 'THYLORA_ANALYSIS','MEASURED_ON_FULL_TEXT_SEARCH','THY-WORK-COMPLETE-QUOTE-LIBRARY-561',
 jsonb_build_object(
   'checked_this_pass',25,'accepted',23,'held_or_rejected',6,
   'worked_examples', jsonb_build_object(
     'Sojourner Truth','The 1851 Anti-Slavery Bugle report of the Akron speech contains no "Ain''t I a woman"; that wording is Frances Gage''s 1863 reconstruction, twelve years later, in a dialect Truth did not speak.',
     'Ida B. Wells','"The way to right wrongs is to turn the light of truth upon them" does not occur anywhere in the full text of Southern Horrors (1892), nor in the first 200,000 characters of The Red Record.',
     'Harriet Tubman','The "thousand slaves" line contradicts the documented record of roughly seventy people over about thirteen missions.'),
   'implication','A quotation''s popularity is negatively correlated with the ease of finding its primary source. The F-gate attribution factor must be scored against the earliest surviving witness, not against circulation.'),'1.0.0')
on conflict (node_id) do nothing;

insert into thylora_graph_versions (entity_kind,entity_id,version,change_type,previous_version,reason,evidence_id,authority,source_ref)
select 'NODE', x.nid, '1.0.0', 'MINOR', null,
  'Created under THY-WORK-COMPLETE-QUOTE-LIBRARY-561 while building the Famous Thought quote library.',
  'THY-WORK-COMPLETE-QUOTE-LIBRARY-561','THYLORA_ANALYSIS','THY-WORK-COMPLETE-QUOTE-LIBRARY-561'
from (values ('LAW-FAMOUS-THOUGHT-MEANING-CHAIN-001'),('SYSTEM-PEOPLE-IN-TIME-001'),('FIND-QUOTE-ATTRIBUTION-DRIFT-561')) as x(nid)
on conflict (entity_kind,entity_id,version) do nothing;

insert into thylora_graph_edges (edge_id,subject_id,predicate,object_id,object_literal,layer,properties,authority,truth_class,evidence_id,semver,state)
values
('EDGE-FT-MEANING-CHAIN-LAYER-001','LAW-FAMOUS-THOUGHT-MEANING-CHAIN-001','LAYER',null,'Earth','Earth','{}'::jsonb,'THYLORA_ANALYSIS','IMPLEMENTED','THY-WORK-COMPLETE-QUOTE-LIBRARY-561','1.0.0','CURRENT'),
('EDGE-FT-MEANING-CHAIN-EVIDENCE-001','LAW-FAMOUS-THOUGHT-MEANING-CHAIN-001','EVIDENCED_BY',null,'THY-WORK-COMPLETE-QUOTE-LIBRARY-561','Earth','{}'::jsonb,'THYLORA_ANALYSIS','IMPLEMENTED','THY-WORK-COMPLETE-QUOTE-LIBRARY-561','1.0.0','CURRENT'),
('EDGE-FT-MEANING-CHAIN-PART-OF-001','LAW-FAMOUS-THOUGHT-MEANING-CHAIN-001','PART_OF','SYSTEM-FAMOUS-THOUGHT-001',null,'Earth','{}'::jsonb,'THYLORA_ANALYSIS','IMPLEMENTED','THY-WORK-COMPLETE-QUOTE-LIBRARY-561','1.0.0','CURRENT'),
('EDGE-PEOPLE-IN-TIME-LAYER-001','SYSTEM-PEOPLE-IN-TIME-001','LAYER',null,'Earth','Earth','{}'::jsonb,'THYLORA_ANALYSIS','IMPLEMENTED','THY-WORK-COMPLETE-QUOTE-LIBRARY-561','1.0.0','CURRENT'),
('EDGE-PEOPLE-IN-TIME-EVIDENCE-001','SYSTEM-PEOPLE-IN-TIME-001','EVIDENCED_BY',null,'thylora_famous_thought_people_in_time','Earth','{}'::jsonb,'THYLORA_ANALYSIS','IMPLEMENTED','THY-WORK-COMPLETE-QUOTE-LIBRARY-561','1.0.0','CURRENT'),
('EDGE-QUOTE-DRIFT-561-LAYER-001','FIND-QUOTE-ATTRIBUTION-DRIFT-561','LAYER',null,'Earth','Earth','{}'::jsonb,'THYLORA_ANALYSIS','MEASURED_ON_FULL_TEXT_SEARCH','THY-WORK-COMPLETE-QUOTE-LIBRARY-561','1.0.0','CURRENT'),
('EDGE-QUOTE-DRIFT-561-EVIDENCE-001','FIND-QUOTE-ATTRIBUTION-DRIFT-561','EVIDENCED_BY',null,'thylora_famous_thought_holds','Earth','{}'::jsonb,'THYLORA_ANALYSIS','MEASURED_ON_FULL_TEXT_SEARCH','THY-WORK-COMPLETE-QUOTE-LIBRARY-561','1.0.0','CURRENT'),
('EDGE-QUOTE-DRIFT-561-PART-OF-001','FIND-QUOTE-ATTRIBUTION-DRIFT-561','PART_OF','SYSTEM-FAMOUS-THOUGHT-001',null,'Earth','{}'::jsonb,'THYLORA_ANALYSIS','MEASURED_ON_FULL_TEXT_SEARCH','THY-WORK-COMPLETE-QUOTE-LIBRARY-561','1.0.0','CURRENT')
on conflict (edge_id) do nothing;

insert into thylora_graph_versions (entity_kind,entity_id,version,change_type,previous_version,reason,evidence_id,authority,source_ref)
select 'EDGE', x.eid, '1.0.0', 'MINOR', null, 'Created under THY-WORK-COMPLETE-QUOTE-LIBRARY-561.',
  'THY-WORK-COMPLETE-QUOTE-LIBRARY-561','THYLORA_ANALYSIS','THY-WORK-COMPLETE-QUOTE-LIBRARY-561'
from (values ('EDGE-FT-MEANING-CHAIN-LAYER-001'),('EDGE-FT-MEANING-CHAIN-EVIDENCE-001'),('EDGE-FT-MEANING-CHAIN-PART-OF-001'),
             ('EDGE-PEOPLE-IN-TIME-LAYER-001'),('EDGE-PEOPLE-IN-TIME-EVIDENCE-001'),
             ('EDGE-QUOTE-DRIFT-561-LAYER-001'),('EDGE-QUOTE-DRIFT-561-EVIDENCE-001'),('EDGE-QUOTE-DRIFT-561-PART-OF-001')) as x(eid)
on conflict (entity_kind,entity_id,version) do nothing;

-- SYSTEM-FAMOUS-THOUGHT-001 is updated in place, not superseded: the same lane,
-- with a larger verified library and a meaning-chain requirement.
update thylora_graph_nodes
set properties = properties || jsonb_build_object(
      'registered_thoughts',23,'held_or_rejected',6,'themes_covered',20,
      'meaning_chain_required',true,'people_in_time_records',23,'publication_state','DRAFT_ONLY'),
    semver='1.1.0', updated_at=now()
where node_id='SYSTEM-FAMOUS-THOUGHT-001';

insert into thylora_graph_versions (entity_kind,entity_id,version,change_type,previous_version,reason,evidence_id,authority,source_ref)
values ('NODE','SYSTEM-FAMOUS-THOUGHT-001','1.1.0','MINOR','1.0.0',
  'Library expanded from 4 to 23 source-verified records across 20 themes; meaning chain and People in Time made mandatory; 6 quotations held or rejected on evidence.',
  'THY-WORK-COMPLETE-QUOTE-LIBRARY-561','THYLORA_ANALYSIS','THY-WORK-COMPLETE-QUOTE-LIBRARY-561')
on conflict (entity_kind,entity_id,version) do nothing;

update thylora_graph_nodes
set properties = properties || jsonb_build_object(
      'famous_thought_bindings','thylora_famous_thought_math_bindings (foreign-keyed to thylora_math_equation_registry)'),
    updated_at=now()
where node_id='SYSTEM-MATH-ENGINE-001';
