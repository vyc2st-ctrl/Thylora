-- THYLORA WORLD · behavioural checks
-- Every "expect reject" block below must raise. The ERROR lines in the output
-- are the passing result; a block that prints nothing has FAILED.
\set ON_ERROR_STOP off

\echo '== seed'
insert into thyw_evidence_sources (source_id, source_kind, locator, accessed_at, confidence, readable, unreadable_note, note) values
  ('S1','REPOSITORY_FILE','vyc2st-ctrl/thylora-executive-dashboard@ea21b42 app/thylora-forward.js','2026-09-18','HIGH',true,null,'Approved reference described as castle, cart and workers.'),
  ('S3','CHAIRMAN_DIRECTIVE','Chairman directive opening WR-WORLD-CASTLE-001','2026-09-18','HIGH',true,null,'States an upper-left room is visible.'),
  ('S4','REPOSITORY_FILE','vyc2st-ctrl/thylora-executive-dashboard@ea21b42 app/assets/thylora-handluh-castle.jpg','2026-09-18','NONE',false,'Truncated JPEG: 8144 bytes, SOI + APP0 + 2x DQT, marker desync at byte 158, no SOF/SOS/EOI.','The Chairman castle reference. Unreadable.')
on conflict (source_id) do nothing;

insert into thyw_datums (datum_id, description, evidence_state) values
  ('THYW-DATUM-CASTLE-001','Finished ground level of the principal courtyard inside the main gate.','UNKNOWN')
on conflict (datum_id) do nothing;

insert into thyw_world_frames (frame_id, frame_kind, parent_frame_id, evidence_state, source_id, north_basis) values
  ('THYW-FRAME-PLANET-EDEREARIAH','PLANET',null,'VERIFIED','S1','PLANETARY_ROTATIONAL_NORTH'),
  ('THYW-FRAME-REGION-UNKNOWN','REGION','THYW-FRAME-PLANET-EDEREARIAH','UNKNOWN',null,null),
  ('THYW-FRAME-SITE-001','SITE','THYW-FRAME-REGION-UNKNOWN','UNKNOWN',null,null),
  ('THYW-FRAME-CASTLE-001','COMPLEX','THYW-FRAME-SITE-001','UNKNOWN',null,'GRID_NORTH_PLUS_Y')
on conflict (frame_id) do nothing;

insert into thyw_elements (element_id, element_class, frame_id, evidence_state, source_id) values
  ('THYW-EL-CASTLE-001','TOWER','THYW-FRAME-CASTLE-001','VERIFIED','S1'),
  ('THYW-EL-WALL-UL-001','WALL','THYW-FRAME-CASTLE-001','INFERRED',null)
on conflict (element_id) do nothing;

insert into thyw_rooms (room_id, frame_id, evidence_state, source_id) values
  ('THYW-ROOM-UL-001','THYW-FRAME-CASTLE-001','VERIFIED','S3')
on conflict (room_id) do nothing;

insert into thyw_openings (opening_id, opening_kind, host_element_id, frame_id, inner_room_id, evidence_state, source_id) values
  ('THYW-OPEN-UL-001','WINDOW','THYW-EL-WALL-UL-001','THYW-FRAME-CASTLE-001','THYW-ROOM-UL-001','VERIFIED','S3')
on conflict (opening_id) do nothing;

insert into thyw_period_profiles (profile_id, scene_frame_id, period_resolved, basis) values
  ('PERIOD_TECH_PROFILE_CASTLE_001','THYW-FRAME-CASTLE-001',false,'No readable source establishes the period.')
on conflict (profile_id) do nothing;

insert into thyw_period_prohibited (profile_id, category, item, basis) values
  ('PERIOD_TECH_PROFILE_CASTLE_001','LIGHTING','ELECTRIC_LIGHTING','Post-dates every candidate tradition.')
on conflict (profile_id, category, item) do nothing;

\echo '== 1 expect reject: a window with no space behind it'
insert into thyw_openings (opening_id, opening_kind, frame_id) values ('BAD-W','WINDOW','THYW-FRAME-CASTLE-001');

\echo '== 2 expect reject: a door connecting only one space'
insert into thyw_openings (opening_id, opening_kind, frame_id, inner_room_id)
  values ('BAD-D','DOOR','THYW-FRAME-CASTLE-001','THYW-ROOM-UL-001');

\echo '== 3 expect reject: an element VERIFIED from the unreadable castle reference'
insert into thyw_elements (element_id, element_class, frame_id, evidence_state, source_id)
  values ('BAD-EL','WALL','THYW-FRAME-CASTLE-001','VERIFIED','S4');

\echo '== 4 expect reject: a non-planet frame with no parent'
insert into thyw_world_frames (frame_id, frame_kind, parent_frame_id) values ('BAD-F','SITE',null);

\echo '== 5 expect reject: a planet frame hanging off another frame'
insert into thyw_world_frames (frame_id, frame_kind, parent_frame_id) values ('BAD-P','PLANET','THYW-FRAME-SITE-001');

\echo '== 6 expect reject: an origin declared resolved with no resolved point'
insert into thyw_origin_rules (origin_id, frame_id, horizontal_rule, vertical_rule, axis_x_rule, axis_y_rule, axis_z_rule, resolves_when, resolved)
  values ('BAD-O','THYW-FRAME-CASTLE-001','x','y','x','y','z','never',true);

\echo '== 7 expect reject: a wheeled traveller declared step capable'
insert into thyw_traveller_profiles (class_code, wheeled, step_capable) values ('CART',true,true);

\echo '== 8 expect reject: a stair segment with no steps'
insert into thyw_circulation_nodes (node_id) values ('N1'),('N2') on conflict do nothing;
insert into thyw_circulation_segments (segment_id, from_node_id, to_node_id, segment_kind, step_count)
  values ('BAD-S','N1','N2','STAIR',0);

\echo '== 9 expect reject: a masonry spec with a fingerprint but unknown dimensions'
insert into thyw_masonry_specs (spec_id, seed, wall_fingerprint) values ('BAD-M', 42, 'deadbeefdeadbeef');

\echo '== 10 expect reject: admitting a technology while the period is unresolved'
insert into thyw_period_allowed (profile_id, category, item, basis)
  values ('PERIOD_TECH_PROFILE_CASTLE_001','LIGHTING','OIL_LAMP','assumed');

\echo '== 11 expect reject: allowing something already prohibited'
update thyw_period_profiles set period_resolved = true, era_label = 'X', region_tradition = 'Y'
  where profile_id = 'PERIOD_TECH_PROFILE_CASTLE_001';
insert into thyw_period_allowed (profile_id, category, item, basis)
  values ('PERIOD_TECH_PROFILE_CASTLE_001','LIGHTING','ELECTRIC_LIGHTING','should be refused');
update thyw_period_profiles set period_resolved = false, era_label = null, region_tradition = null
  where profile_id = 'PERIOD_TECH_PROFILE_CASTLE_001';

\echo '== 12 expect reject: a period declared resolved without naming an era'
update thyw_period_profiles set period_resolved = true where profile_id = 'PERIOD_TECH_PROFILE_CASTLE_001';

\echo '== 13 expect reject: a supersession issued by anyone but the Chairman'
insert into thyw_supersessions (object_id, facet, authority, directive_ref, reason)
  values ('THYW-EL-CASTLE-001','DIMENSIONS','CLAUDE','X','because');

\echo '== 14 expect reject: a room use promoted to selected without the Chairman'
insert into thyw_room_use_proposals (proposal_id, room_id, proposed_use, label, rationale, implications, selected)
  values ('BAD-PROP','THYW-ROOM-UL-001','TUTORIAL_CHAMBER','x','y','z',true);

\echo '== 15 expect reject: canonizing a castle name without the Chairman'
insert into thyw_name_candidates (candidate_id, subject_id, candidate_name, derivation, canonized)
  values ('BAD-N','THYW-EL-CASTLE-001','Handluh','attested token',true);

\echo '== 16 expect reject: rewriting the append-only world version ledger'
insert into thyw_world_versions (world_version_id, sequence_no, recorded_by) values ('V1',1,'TEST');
update thyw_world_versions set note = 'rewritten' where world_version_id = 'V1';

\echo '== 17 expect reject: closing an unknown with no evidence source'
insert into thyw_unknown_register (unknown_id, object_kind, object_id, unknown_field, why_unknown, closes_when, closed_at)
  values ('BAD-U','ROOM','THYW-ROOM-UL-001','purpose','no source','a source appears', now());

\echo '== 18 expect reject: a world version claiming more VERIFIED than total'
insert into thyw_world_versions (world_version_id, sequence_no, recorded_by, element_count, verified_element_count)
  values ('BAD-V',99,'TEST',2,5);

\echo '== 20 expect reject: a tolerance band on an element with no measurement'
insert into thyw_elements (element_id, element_class, frame_id, tolerance_linear_mm)
  values ('BAD-TOL','WALL','THYW-FRAME-CASTLE-001',5);

\echo '== 21 expect reject: Wq missing a factor'
select thyw_evaluate_wq('{"G":{"value":1,"basis":"x"}}'::jsonb);

\echo '== 22 expect reject: a Wq factor with no basis'
select thyw_evaluate_wq((select jsonb_object_agg(l, jsonb_build_object('value',1))
  from unnest(array['G','A','O','P','T','C','H','I','B','R','V']) as l));

\echo '== positive checks (these must NOT error)'
\set ON_ERROR_STOP on
select 'wq_holds_on_one_zero = ' || (thyw_evaluate_wq(
    (select jsonb_object_agg(l, jsonb_build_object('value', case when l='G' then 0 else 1 end, 'basis','test'))
       from unnest(array['G','A','O','P','T','C','H','I','B','R','V']) as l))->>'decision');
select 'opening_audit_findings = ' || count(*)::text from thyw_audit_openings();
select 'unknown_census_rows = ' || count(*)::text from thyw_unknown_census();
select 'frames = ' || count(*)::text from thyw_world_frames;
select 'verified_elements = ' || count(*)::text from thyw_elements where evidence_state = 'VERIFIED';
select 'rls_enabled_tables = ' || count(*)::text from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname like 'thyw_%' and c.relrowsecurity;
select 'tables = ' || count(*)::text from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname like 'thyw_%' and c.relkind='r';
select 'check_constraints = ' || count(*)::text from pg_constraint c join pg_class t on t.oid=c.conrelid
  where t.relname like 'thyw_%' and c.contype='c';

-- Geometry columns are bigint, so a fraction CANNOT be stored. A fractional
-- input is narrowed to whole millimetres at the boundary rather than rejected;
-- that is the intended narrowing, and it is asserted here rather than assumed.
insert into thyw_elements (element_id, element_class, frame_id, local_x_mm)
  values ('NARROW-1','WALL','THYW-FRAME-CASTLE-001',1200.5)
  on conflict (element_id) do nothing;
select 'fraction_narrowed_to_whole_mm = ' ||
  (select case when local_x_mm = trunc(local_x_mm) then 'yes' else 'NO' end
     from thyw_elements where element_id = 'NARROW-1');
select 'geometry_columns_are_integral = ' || count(*)::text
  from information_schema.columns
 where table_name like 'thyw_%'
   and (column_name like '%\_mm' or column_name like '%\_mdeg')
   and data_type not in ('bigint','integer');
