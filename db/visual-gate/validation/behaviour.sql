-- Behavioural checks. Each "expect reject" block must ERROR; that is the pass.
\set ON_ERROR_STOP off

\echo == 1 · a product with nothing recorded FAILS (fail-closed)
select 'fail_closed = ' || (thylora_visual_gate_evaluate_v1('THY-TEST-EMPTY')->>'gate_state');

\echo == 2 · expect reject: a dominantly white page with no justified exception
insert into thylora_product_page_plan (product_code, page_index, white_page_dominant)
values ('THY-TEST-WHITE', 1, true);

\echo == 3 · a justified artistic exception is accepted
insert into thylora_product_page_plan
  (product_code, page_index, white_page_dominant, artistic_exception, artistic_exception_justification)
values ('THY-TEST-WHITE', 2, true, 'Silent breath page', 'One empty beat between acts.');
select 'justified_white_page_rows = ' || count(*)::text from thylora_product_page_plan where product_code='THY-TEST-WHITE';

\echo == 4 · expect reject: a RESOLVED role with a generic system byline
insert into thylora_product_authorship (product_code, role_code, byline, role_state)
values ('THY-TEST-BYLINE','AUTHOR','THYLORA','RESOLVED');

\echo == 5 · expect reject: a RESOLVED role with no name at all
insert into thylora_product_authorship (product_code, role_code, byline, role_state)
values ('THY-TEST-BYLINE','EDITOR',null,'RESOLVED');

\echo == 6 · an explicitly OPEN role is accepted and stays nameless
insert into thylora_product_authorship (product_code, role_code, byline, role_state)
values ('THY-TEST-BYLINE','ILLUSTRATOR',null,'OPEN');
select 'open_role_byline_is_null = ' || (byline is null)::text
  from thylora_product_authorship where product_code='THY-TEST-BYLINE' and role_code='ILLUSTRATOR';

\echo == 7 · a real authored byline is accepted
insert into thylora_product_authorship (product_code, role_code, byline, role_state)
values ('THY-TEST-BYLINE','DESIGNER','R. Halvard','RESOLVED');
select 'resolved_rows = ' || count(*)::text from thylora_product_authorship
  where product_code='THY-TEST-BYLINE' and role_state='RESOLVED';

\echo == 8 · OPEN author and illustrator block preview as Chairman decisions
insert into thylora_product_visual_record (product_code, story_summary) values ('THY-TEST-OPEN','A story.');
insert into thylora_product_authorship (product_code, role_code, role_state) values
  ('THY-TEST-OPEN','AUTHOR','OPEN'), ('THY-TEST-OPEN','EDITOR','OPEN'),
  ('THY-TEST-OPEN','ILLUSTRATOR','OPEN'), ('THY-TEST-OPEN','DESIGNER','OPEN'),
  ('THY-TEST-OPEN','PUBLISHER_IMPRINT','OPEN'), ('THY-TEST-OPEN','PRODUCTION_HOUSE','OPEN');
select 'chairman_blockers = ' || (
  select string_agg(b->>'code', ',' order by b->>'code')
  from jsonb_array_elements(thylora_visual_gate_evaluate_v1('THY-TEST-OPEN')->'chairman_blockers') b);

\echo == 9 · a FAIL never advances to CHAIRMAN_PREVIEW
select 'fail_to_state = ' || (thylora_preview_admission_v1('THY-TEST-OPEN')->>'to_state')
    || ' shown = ' || (thylora_preview_admission_v1('THY-TEST-OPEN')->>'shown_to_chairman');

\echo == 10 · the gate run was recorded as append-only evidence
select 'gate_check_rows = ' || count(*)::text from thylora_visual_gate_checks where product_code='THY-TEST-OPEN';

\echo == 11 · a complete product PASSES and is admitted to preview
insert into thylora_product_visual_record
  (product_code, story_summary, visual_matches_story, price_minor_units, price_value_basis)
values ('THY-TEST-GOOD','A boy follows a cart to the shorewall.', true, 1900,
        '32 bound pages, original art, archival stock.');
insert into thylora_product_authorship (product_code, role_code, byline, role_state) values
  ('THY-TEST-GOOD','AUTHOR','W. T. Peete','RESOLVED'),
  ('THY-TEST-GOOD','ILLUSTRATOR','R. Halvard','RESOLVED'),
  ('THY-TEST-GOOD','EDITOR',null,'OPEN'), ('THY-TEST-GOOD','DESIGNER',null,'OPEN'),
  ('THY-TEST-GOOD','PUBLISHER_IMPRINT',null,'OPEN'), ('THY-TEST-GOOD','PRODUCTION_HOUSE',null,'OPEN');
insert into thylora_product_page_plan (
  product_code, page_index, page_label, who_is_here, where_are_they, when_is_it,
  what_are_they_doing, objects_present, object_makers, background_action, light_weather,
  world_signature, text_region, differs_from_previous, illustration_ref, reference_binding,
  illustration_area_ratio, illustration_carries_information, world_continues_beyond_subject,
  composition_signature)
values
 ('THY-TEST-GOOD',1,'p1','The boy','The EdereAriah shorewall cart road','Late autumn afternoon',
  'Pushing a loaded hand cart uphill','A hand cart, a lantern',
  'Cart by the shorewall wheelwright; lantern from the foundry row',
  'Two workers load the second cart behind him','Low raking sun, wind off the water',
  'The EdereAriah shorewall cart road','Lower left, over the stone','Opening page',
  'REF-1','THY-VIS-EXEMPLAR-001',0.82,true,true,'wide-exterior-dusk'),
 ('THY-TEST-GOOD',2,'p2','The boy and the wheelwright','The wheelwright''s shed','Same evening, after dark',
  'Mending the cart''s split felloe','The cart wheel, a spokeshave, a lamp',
  'Spokeshave stamped by the foundry row','The apprentice banks the forge behind them',
  'Lamplight, still air','The EdereAriah foundry row sheds','Upper right, in the rafters',
  'Interior after exterior; night after day','REF-2','THY-VIS-EXEMPLAR-001',
  0.78,true,true,'close-interior-night');
select 'good_gate_state = ' || (thylora_visual_gate_evaluate_v1('THY-TEST-GOOD')->>'gate_state');
select 'good_to_state = ' || (thylora_preview_admission_v1('THY-TEST-GOOD')->>'to_state');

\echo == 12 · removing the maker detail alone flips the same product to FAIL
update thylora_product_page_plan set object_makers = null where product_code='THY-TEST-GOOD';
select 'after_removing_makers = ' || (thylora_visual_gate_evaluate_v1('THY-TEST-GOOD')->>'gate_state');
select 'maker_problem_present = ' || (
  select count(*)::text from jsonb_array_elements(thylora_visual_gate_evaluate_v1('THY-TEST-GOOD')->'problems') p
  where p->>'code' = 'NO_MAKER_SOURCE_DETAIL');

\echo == 13 · every recovered rule cites a record, and none is a new invention
select 'rules = ' || count(*)::text || ' gap_rules = ' ||
       count(*) filter (where recovered_from = 'GAP')::text from thylora_visual_rule_registry;

\echo == 14 · the superseded Build 6 exemplar is retained, not deleted
select 'superseded_retained = ' || count(*)::text from thylora_visual_exemplar_registry
  where exemplar_state = 'SUPERSEDED';

\echo == 15 · the name conflict is recorded OPEN, not silently resolved
select 'nameguard_state = ' || state from thylora_visual_open_questions
  where question_code = 'THY-NAMEGUARD-EDEREAIRAH-001';

\echo == 16 · Bramble is bound to this gate rather than a standard of its own
select 'bramble_bound_to = ' || gate_code from thylora_visual_gate_bindings
  where work_code = 'THY-WORK-BRAMBLE-PROOF-PRODUCT-544';

\echo == 17 · a non-Chairman caller is refused with a reason, not a stack trace
select set_config('thy.is_chairman','false',false);
select 'non_chairman_ok = ' || (thylora_visual_gate_evaluate_v1('THY-TEST-GOOD')->>'ok');
select set_config('thy.is_chairman','true',false);

\echo == 18 · restoring the maker detail restores the PASS (the gate is not sticky)
update thylora_product_page_plan
   set object_makers = case page_index
     when 1 then 'Cart by the shorewall wheelwright; lantern from the foundry row'
     else 'Spokeshave stamped by the foundry row' end
 where product_code='THY-TEST-GOOD';
select 'restored_gate_state = ' || (thylora_visual_gate_evaluate_v1('THY-TEST-GOOD')->>'gate_state');
