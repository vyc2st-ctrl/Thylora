-- Behavioural checks for the castle service-zone slice.
-- ERROR lines are the PASSING result: each block asserts that the database
-- refuses something it claims to refuse.

\echo == 1 a PROPOSED dimension may not claim DOCUMENTED while citing this work
do $$ begin
  insert into thy_csz_space_intake (
    stable_id, serial, erc_mirror, working_label, function_text,
    width_m, depth_m, height_m, wall_thickness_m, dimension_state, dimension_basis,
    floor_text, floor_state, ceiling_text, ceiling_state, openings_text, openings_state,
    hearth_oven_water, services_state, access_class, public_safe, source_text)
  values ('CSZ-BAD-99', thy_csz_issue('SPACE','CSZ-BAD-99',900),'x','x','x',
          1,1,1,1,'DOCUMENTED','x','x','PROPOSED','x','PROPOSED','x','PROPOSED','x','PROPOSED',
          'SERVICE',true,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576');
  raise exception 'CHECK 1 FAILED: a self-sourced DOCUMENTED dimension was accepted';
exception when check_violation then raise exception 'ERROR expected: self-sourced DOCUMENTED rejected';
end $$;

\echo == 2 an UNKNOWN dimension may carry no numbers
do $$ begin
  insert into thy_csz_space_intake (
    stable_id, serial, erc_mirror, working_label, function_text,
    width_m, dimension_state, dimension_basis,
    floor_text, floor_state, ceiling_text, ceiling_state, openings_text, openings_state,
    hearth_oven_water, services_state, access_class, public_safe, source_text)
  values ('CSZ-BAD-98', thy_csz_issue('SPACE','CSZ-BAD-98',901),'x','x','x',
          7.5,'UNKNOWN','x','x','UNKNOWN','x','UNKNOWN','x','UNKNOWN','x','UNKNOWN','SERVICE',false,'x');
  raise exception 'CHECK 2 FAILED: UNKNOWN row carried a number';
exception when check_violation then raise exception 'ERROR expected: UNKNOWN-with-a-number rejected';
end $$;

\echo == 3 a SECURE space may not be flagged public-safe
do $$ begin
  insert into thy_csz_space_intake (
    stable_id, serial, erc_mirror, working_label, function_text,
    dimension_state, dimension_basis, floor_text, floor_state, ceiling_text, ceiling_state,
    openings_text, openings_state, hearth_oven_water, services_state,
    access_class, public_safe, source_text)
  values ('CSZ-BAD-97', thy_csz_issue('SPACE','CSZ-BAD-97',902),'x','x','x',
          'UNKNOWN','x','x','UNKNOWN','x','UNKNOWN','x','UNKNOWN','x','UNKNOWN','SECURE',true,'x');
  raise exception 'CHECK 3 FAILED: a SECURE space was published';
exception when check_violation then raise exception 'ERROR expected: SECURE-and-public rejected';
end $$;

\echo == 4 a residence model may not be selected without a CHAIRMAN_AUTHORED state
do $$ begin
  update thy_csz_residence_option set chairman_selected = true where model = 'B_ESTATE_COTTAGE';
  raise exception 'CHECK 4 FAILED: a PROPOSED residence model was canonized';
exception when others then raise exception 'ERROR expected: canonization without Chairman authority rejected';
end $$;

\echo == 5 an object may not carry a brand mark with no declared relationship
do $$ begin
  update thy_csz_object_home set mark_present = true where object_id = 'CSZ-OBJ-002';
  raise exception 'CHECK 5 FAILED: a decorative mark was accepted';
exception when others then raise exception 'ERROR expected: decorative mark rejected';
end $$;

\echo == 6 a flow step must start and end somewhere
do $$ begin
  insert into thy_csz_flow_step (flow_id, step_no, action, load_text, fit_verdict, fit_reason, custodian_role)
  values ('CSZ-FLOW-WASTE', 99, 'nowhere', 'x', 'FITS', 'x', 'CSZ-ROLE-PORTER');
  raise exception 'CHECK 6 FAILED: a step with no origin was accepted';
exception when check_violation then raise exception 'ERROR expected: unlocated flow step rejected';
end $$;

\echo == 7 an internal move must name the link it uses
do $$ begin
  insert into thy_csz_flow_step (flow_id, step_no, action, from_space, to_space, load_text, fit_verdict, fit_reason, custodian_role)
  values ('CSZ-FLOW-WASTE', 98, 'teleport', 'CSZ-KITCHEN-01', 'CSZ-DRYSTORE-01', 'x', 'FITS', 'x', 'CSZ-ROLE-PORTER');
  raise exception 'CHECK 7 FAILED: a linkless internal move was accepted';
exception when check_violation then raise exception 'ERROR expected: linkless internal move rejected';
end $$;

\echo == 8 projection refuses when the canon geometry table is absent
select (thy_csz_project_spaces(true) ->> 'reason') as projection_refusal;

\echo == 9 with a canon geometry table present, projection still refuses every PROPOSED row
create table if not exists thylora_castle_space_geometry (stable_id text primary key);
select (thy_csz_project_spaces(true) ->> 'applied')                    as rows_written_into_canon,
       jsonb_array_length(thy_csz_project_spaces(true) -> 'refused')   as rows_refused_as_not_fact,
       (select count(*) from thylora_castle_space_geometry)            as canon_rows_after;
drop table thylora_castle_space_geometry;

\echo == 10 no teleporting: every declared object move is carried by a recorded link
select count(*) as teleporting_objects from thy_csz_teleport_report();

\echo == 11 the public sheet exposes no restricted or secure space
select count(*) as restricted_rows_published
  from thy_csz_public_world_sheet p
  join thy_csz_space_intake s on s.stable_id = p.entry_id
 where s.access_class in ('RESTRICTED_SERVICE','SECURE');

\echo == 12 no dimension anywhere claims to be fact
select count(*) as spaces_claiming_documented
  from thy_csz_space_intake where dimension_state = 'DOCUMENTED';

\echo == 13 no residence model is canonized
select count(*) as models_selected from thy_csz_residence_option where chairman_selected;

\echo == 14 every custodian role except the two given facts is unoccupied
select count(*) as named_people from thy_csz_role_slot where occupant_name is not null;

\echo == 15 readback
select jsonb_pretty(thy_csz_readback()) as readback;
