-- OMNIVIEW · 0010 · Graph writeback (sequence 591)
-- Work: THY-WORK-OMNIVIEW-LIVE-APPLY-591
-- Additive only: three nodes, four edges, seven version rows. Nothing existing is
-- updated. Truth classes use the graph's own vocabulary: the backend objects are
-- MEASURED_ON_BACKEND_CERTAIN; the dashboard relation is
-- IMPLEMENTED_NOT_RUNTIME_WITNESSED, because the UI has not been witnessed.

begin;

insert into thylora_graph_nodes (node_id, node_type, layer, canonical_name, status, authority, truth_class, source_ref, properties, semver)
values
 ('THY-OMNIVIEW-READ-MODEL-001','System','Earth','OMNIVIEW read model (CURRENT_STATE_MANIFEST_PLUS_TOPIC_EXPANSION)','CURRENT','Chairman',
  'MEASURED_ON_BACKEND_CERTAIN','THY-WORK-OMNIVIEW-LIVE-APPLY-591',
  '{"live_applied": true, "live_ui_witnessed": false, "reads": "Chairman only (thylora_is_chairman)", "writes": "service role only",
    "entry_points": ["thy_omniview_manifest", "thy_omniview_topic", "thy_omniview_sequence", "thy_sequence_ledger_page", "thy_sequence_prior_context"],
    "tables": 8, "ledger_sequence": 591, "repository": "vyc2st-ctrl/Thylora db/omniview"}'::jsonb,'1.0.0'),
 ('THY-SEQUENCE-LEDGER-001','System','Earth','THYLORA sequence change ledger (thy_sequence_ledger)','CURRENT','Chairman',
  'MEASURED_ON_BACKEND_CERTAIN','THY-WORK-SEQUENCE-CHANGE-LEDGER-587',
  '{"append_only": true, "floor": 587, "rows_at_591": [587, 591], "carryforward_outside_ledger": "readable via thy_sequence_prior_context, labelled PRE_LEDGER / NOT_IN_LEDGER",
    "local_timezone": "America/New_York (thylora_timestamp_punch_gate)"}'::jsonb,'1.0.0'),
 ('EVID-OMNIVIEW-LIVE-APPLY-591','Evidence','Earth','OMNIVIEW live apply evidence, sequence 591','CURRENT','Chairman',
  'MEASURED_ON_BACKEND_CERTAIN','db/omniview/live/EVIDENCE-591.md',
  '{"migrations": ["omniview_0001_sequence_ledger_591", "omniview_0002_topic_manifest_591", "omniview_0003_read_model_591", "omniview_0004_write_path_591",
                   "omniview_0005_rls_policies_591", "omniview_0006_seed_manifest_591", "omniview_0007_prior_context_591", "omniview_0008_live_apply_591",
                   "omniview_0009_correct_qyris_count_591", "omniview_0010_graph_writeback_591"],
    "expect_reject_live": "27/27 PASS", "topic_proofs_live": "6/6 PASS", "qyris_check_id": "de1f1064-5e2c-4bc9-b2ce-b2482721b3cb"}'::jsonb,'1.0.0')
on conflict (node_id) do nothing;

insert into thylora_graph_edges (edge_id, subject_id, predicate, object_id, object_literal, layer, properties, authority, truth_class, evidence_id, semver, state)
values
 ('E-591-OMNIVIEW-EVIDENCED','THY-OMNIVIEW-READ-MODEL-001','EVIDENCED_BY','EVID-OMNIVIEW-LIVE-APPLY-591',null,'Earth',
  '{"method": "live readback, expect-reject suite and topic proofs on thylora-dash"}'::jsonb,'Chairman','MEASURED_ON_BACKEND_CERTAIN','THY-WORK-OMNIVIEW-LIVE-APPLY-591','1.0.0','CURRENT'),
 ('E-591-LEDGER-EVIDENCED','THY-SEQUENCE-LEDGER-001','EVIDENCED_BY','EVID-OMNIVIEW-LIVE-APPLY-591',null,'Earth',
  '{"method": "chain guard and append-only rejections exercised live"}'::jsonb,'Chairman','MEASURED_ON_BACKEND_CERTAIN','THY-WORK-OMNIVIEW-LIVE-APPLY-591','1.0.0','CURRENT'),
 ('E-591-LEDGER-PART-OF-OMNIVIEW','THY-SEQUENCE-LEDGER-001','PART_OF','THY-OMNIVIEW-READ-MODEL-001',null,'Earth',
  '{"since_sequence": 591}'::jsonb,'Chairman','MEASURED_ON_BACKEND_CERTAIN','THY-WORK-OMNIVIEW-LIVE-APPLY-591','1.0.0','CURRENT'),
 ('E-591-OMNIVIEW-PART-OF-CONTROL-SURFACE','THY-OMNIVIEW-READ-MODEL-001','PART_OF','THY-DASHBOARD-CONTROL-SURFACE-001',null,'Earth',
  '{"surfaces": ["CONTEXT", "SEQUENCE"], "since_sequence": 591, "live_ui_witnessed": false,
    "witness_requires": "merge into vyc2st-ctrl/thylora-executive-dashboard, deploy on thylora-public-world, Chairman phone sign-in"}'::jsonb,
  'Chairman','IMPLEMENTED_NOT_RUNTIME_WITNESSED','THY-WORK-OMNIVIEW-LIVE-APPLY-591','1.0.0','CURRENT')
on conflict (edge_id) do nothing;

insert into thylora_graph_versions (entity_kind, entity_id, version, change_type, previous_version, reason, evidence_id, authority, source_ref)
select v.kind, v.id, '1.0.0', 'MAJOR', null,
       'Registered at sequence 591. OMNIVIEW applied live to thylora-dash. Additive; nothing renamed or deleted.',
       'THY-WORK-OMNIVIEW-LIVE-APPLY-591', 'Chairman', 'THY-WORK-OMNIVIEW-LIVE-APPLY-591'
  from (values ('NODE','THY-OMNIVIEW-READ-MODEL-001'),('NODE','THY-SEQUENCE-LEDGER-001'),('NODE','EVID-OMNIVIEW-LIVE-APPLY-591'),
               ('EDGE','E-591-OMNIVIEW-EVIDENCED'),('EDGE','E-591-LEDGER-EVIDENCED'),
               ('EDGE','E-591-LEDGER-PART-OF-OMNIVIEW'),('EDGE','E-591-OMNIVIEW-PART-OF-CONTROL-SURFACE')) v(kind, id)
 where not exists (select 1 from thylora_graph_versions g where g.entity_kind = v.kind and g.entity_id = v.id and g.version = '1.0.0');

commit;
