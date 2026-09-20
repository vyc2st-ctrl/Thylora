-- THY-WORK-MATH-FAMOUS-THOUGHT-559 · behavioural assertions
--
-- Every "expect reject" block below must produce an ERROR. An ERROR here is the
-- passing result; silence means the rule did not hold.

\set ON_ERROR_STOP off

\echo == F gate: all fours is exactly the floor and passes
select 'f_all_fours = ' || (thy_famous_thought_f_gate_v1('T',4,4,4,4,true,true,true,true,true) ->> 'verdict')
    || ' value ' || (thy_famous_thought_f_gate_v1('T',4,4,4,4,true,true,true,true,true) ->> 'f_value');

\echo == F gate: one variable below 4 fails even when the product is large
select 'f_one_low = ' || (thy_famous_thought_f_gate_v1('T',3,5,5,5,true,true,true,true,true) ->> 'verdict')
    || ' value ' || (thy_famous_thought_f_gate_v1('T',3,5,5,5,true,true,true,true,true) ->> 'f_value');

\echo == F gate: perfect scores still fail when the source is uncertain
select 'f_unsourced = ' || (thy_famous_thought_f_gate_v1('T',5,5,5,5,false,true,true,true,true) ->> 'verdict');

\echo == F gate: perfect scores still fail when the quote ties to no question
select 'f_no_question = ' || (thy_famous_thought_f_gate_v1('T',5,5,5,5,true,true,true,true,false) ->> 'verdict');

\echo == F gate: an unscored variable produces no product at all
select 'f_unscored_value_is_null = ' ||
       ((thy_famous_thought_f_gate_v1('T',null,5,5,5,true,true,true,true,true) -> 'f_value') = 'null'::jsonb)::text;

\echo == D gate: cannot pass while the variable meanings are UNKNOWN_DEFINITION
select 'd_unknown = ' || (thy_store_value_d_gate_v1('X',5,5,5,5,5,5,true,true) ->> 'verdict');

\echo == D gate: attention with no help and no destination fails
select 'd_no_help = ' || (thy_store_value_d_gate_v1('X',5,5,5,5,5,5,false,false) ->> 'verdict');

\echo == the four drafts are blocked, not ready
select 'drafts_blocked = ' || count(*)::text from thy_thought_draft
 where status = 'BLOCKED_PENDING_READBACK';
select 'drafts_ready = ' || count(*)::text from thy_thought_draft where status = 'READY';

\echo == expect reject: a draft may not be READY while a gate fails
update thy_thought_draft set status = 'READY' where draft_code = 'DRAFT-FORD-001';

\echo == expect reject: a draft may not be READY with the template parts empty
update thy_thought_draft
   set f_gate_verdict = 'PASS', d_gate_verdict = 'PASS', status = 'READY'
 where draft_code = 'DRAFT-FORD-001';

\echo == expect reject: a quotation may not be stored without its source record
update thy_thought_draft set verified_quote = 'any wording at all'
 where draft_code = 'DRAFT-CARVER-001';

\echo == expect reject: a session evaluation may not supersede the registry
insert into thy_thought_gate_session_eval (thought_code, gate, verdict, f_value, supersedes_registry)
values ('THOUGHT-DOUGLASS-001', 'F', 'PASS', 625, true);

\echo == expect reject: a PASS may not be recorded alongside a blocking reason
insert into thy_thought_gate_session_eval (thought_code, gate, verdict, f_value, fail_closed)
values ('THOUGHT-DOUGLASS-001', 'F', 'PASS', 625, array['SOURCE_UNCERTAIN']);

\echo == expect reject: a PASS on F may not carry a value under 256
insert into thy_thought_gate_session_eval (thought_code, gate, verdict, f_value)
values ('THOUGHT-DOUGLASS-001', 'F', 'PASS', 81);

\echo == a FAIL with no computable value is accepted, because that is the honest record
insert into thy_thought_gate_session_eval (thought_code, gate, verdict, fail_closed)
values ('THOUGHT-DOUGLASS-001', 'F', 'FAIL', array['SOURCE_UNCERTAIN']);
select 'honest_fail_rows = ' || count(*)::text from thy_thought_gate_session_eval;

\echo == expect reject: an unrecovered equation may not be marked anything but UNKNOWN_DEFINITION
update thy_math_unrecovered_equation set status = 'ACTIVE' where equation_code = 'EQ-PSOLVE-001';

\echo == expect reject: a variable with no definition may not carry an authority
insert into thy_math_equation_variable (equation_code, variable_key, ordinal, authority)
values ('EQ-Q-001', 'Z', 9, 'WORK_ORDER_559');

\echo == expect reject: the prohibited reading levels may not re-enter the display text
update thy_math_equation_display set plain = 'Explain this one at a scholar level.'
 where equation_code = 'EQ-F-001';

\echo == expect reject: a rule may not be extracted without stating where it fails
update thy_people_in_time set reasoning_rule = 'Check the source before repeating it.'
 where thought_code = 'THOUGHT-FORD-001';

\echo == expect reject: COMPLETE may not be claimed while answers are unknown
update thy_people_in_time set completeness = 'COMPLETE' where thought_code = 'THOUGHT-CARVER-001';

\echo == supersede, never delete
insert into thy_math_equation_display (equation_code, whole_equation, left_side, right_side)
values ('EQ-F-002', 'F=S×A×C×T', 'F', 'S×A×C×T') on conflict do nothing;
select thy_math_supersede_equation('EQ-F-001', 'EQ-F-002');
select 'superseded_rows_still_present = ' || count(*)::text
  from thy_math_equation_display where equation_code = 'EQ-F-001' and status = 'SUPERSEDED';

\echo == graph preflight refuses to write while the overlay is absent
select 'preflight_outcome = ' || (thy_math_graph_preflight_v1('SYSTEM-MATH-ENGINE-001', '{"e":1}'::jsonb)).outcome;
select 'writeback_edges_created = ' || (thy_math_graph_writeback_v1() ->> 'edges_created')
    || ' nodes_created ' || (thy_math_graph_writeback_v1() ->> 'nodes_created');
