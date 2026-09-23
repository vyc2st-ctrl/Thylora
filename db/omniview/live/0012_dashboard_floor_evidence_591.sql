-- OMNIVIEW · 0012 · Dashboard baseline-floor evidence (sequence 591)
-- Work: THY-WORK-OMNIVIEW-LIVE-APPLY-591
-- Read of vyc2st-ctrl/thylora-executive-dashboard at a634249 (2026-09-19T17:51Z):
-- index.html plus every script it loads was checked for the 17 capabilities of
-- THY-DASH-FLOOR-20260823-001. Vercel refused to list thylora-public-world
-- deployments (403), so which commit is serving is NOT established.

begin;

select thy_omniview_state_canon('DASHBOARD',
  'The deployment repository head (vyc2st-ctrl/thylora-executive-dashboard @ a634249, 2026-09-19) carries 14 of the 17 baseline capabilities. '
  || 'It is missing Product & Storefront, Commerce Proof and Digital Product Passports (no renamed equivalent found in index.html or the 21 scripts it loads). '
  || 'It does not yet carry CONTEXT or SEQUENCE. The vyc2st-ctrl/Thylora copy of the head is missing seven. Which commit thylora-public-world is serving is not established: Vercel returned 403 on listing its deployments.',
  'REPO_VERIFIED','Chairman',591,null,'EVIDENCE','vyc2st-ctrl/thylora-executive-dashboard@a634249');

select thy_omniview_set_gate('GATE-BASELINE-FLOOR','DASHBOARD',
  'The head carries every capability named in baseline THY-DASH-FLOOR-20260823-001.',
  'BLOCKED','Chairman',
  'Deployment head a634249 is missing 3 of 17: Product & Storefront, Commerce Proof, Digital Product Passports. The vyc2st-ctrl/Thylora copy is missing 7. '
  || 'Production promotion of CONTEXT and SEQUENCE is held until these are restored in the deployment repository.',
  'vyc2st-ctrl/thylora-executive-dashboard@a634249',591);

select thy_omniview_answer(id, 591) from thy_omniview_questions
 where topic_key = 'DASHBOARD' and state = 'OPEN' and question like 'Does the live head on thylora-public-world still carry the seven capabilities%';
select thy_omniview_ask('DASHBOARD',
  'Restore Product & Storefront, Commerce Proof and Digital Product Passports in vyc2st-ctrl/thylora-executive-dashboard from which earlier head, and who confirms which commit thylora-public-world is serving?',
  'The floor is below itself in the deployment repository, and the serving commit cannot be read without Vercel deployment access.', true, 591);

commit;
