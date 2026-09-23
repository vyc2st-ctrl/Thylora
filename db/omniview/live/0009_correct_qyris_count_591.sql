-- OMNIVIEW · 0009 · Correction found by the post-apply readback (sequence 591)
-- Work: THY-WORK-OMNIVIEW-LIVE-APPLY-591
--
-- The 0008 QYRIS evidence said the execution registry "held 159 checks". The
-- readback found 158, and two PASS rows for this work, not one: the Chairman's
-- session wrote one at 2026-09-23 14:58:41Z alongside carryforward 591, and this
-- session wrote its pre-execution check at 17:27:49Z. The first statement is not
-- edited; it is superseded and stays readable as history.

begin;

select thy_omniview_state_canon('QYRIS',
  'At 591 the execution registry thylora_qyris_work_item_checks held 158 checks. Two of them are PASS records for THY-WORK-OMNIVIEW-LIVE-APPLY-591: '
  || 'one written with carryforward 591 at 2026-09-23 14:58:41Z (id 8ee15f18-faa0-4cd3-8807-4fd7e3302ce6) and the pre-execution check written by the apply session at '
  || '17:27:49Z (id de1f1064-5e2c-4bc9-b2ce-b2482721b3cb). The recursive QYRIS tables from 584 (thylora_qyris_node, thylora_qyris_cluster) hold 0 rows.',
  'BACKEND_VERIFIED','Chairman',591,
  (select id from thy_omniview_statements where topic_key = 'QYRIS' and status = 'CURRENT'
      and body like 'At 591 the execution registry thylora_qyris_work_item_checks held 159 checks%'),
  'EVIDENCE','thylora_qyris_work_item_checks');

commit;
