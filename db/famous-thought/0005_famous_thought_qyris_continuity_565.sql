-- THY-WORK-COMPLETE-QUOTE-LIBRARY-561 : QYRIS check, work registry row and
-- continuity carryforward. Idempotent reproduction of applied migration
-- famous_thought_qyris_work_continuity_565.
-- Carryforward lands at sequence 565 because deltas 562, 563 and 564 were
-- written by the ChatGPT command thread while this work was running; all three
-- were read before this row was written.

insert into thylora_qyris_work_item_checks
 (layer_code, source_text, plain_meaning, why_it_matters, known, unknown, next_step,
  chairman_approval_required, inspection_state, safeguard_findings, source_query_id, work_code)
select 'THY-QYRIS-PLAIN-SPEECH-001',
 $q$THYLORA HEAD - SPINE FORWARD. WORK_CODE THY-WORK-COMPLETE-QUOTE-LIBRARY-561. Build the Famous Thought library into a source-verified reasoning system.$q$,
 $q$THYLORA now holds 23 famous thoughts that were each checked against the actual source document, plus 6 that were checked and refused. Every accepted one carries a question, the evidence that would matter, what it connects to, something to do next, and a THYLORA place it leads to. Every person carries what problem they faced, what they knew, what they could not know, and where their rule breaks.$q$,
 $q$A quote nobody can trace is a liability, not an asset. Two of the most widely repeated lines in this field - Sojourner Truth's and Ida B. Wells's best-known sentences - did not survive a full-text check against the original documents. Holding them is the work, not a failure of it.$q$,
 $q$23 records verified against primary texts, national archives, university archives, government archives and Nobel Foundation lectures; all 20 required themes covered; F-gate PASS recorded for all 23; People in Time complete for all 23; math bindings foreign-keyed so a thought cannot point at an equation that does not exist.$q$,
 $q$Whether anyone outside THYLORA wants to read these cards: attention and match are unmeasured, which is why every card fails the D gate. Whether the Ida B. Wells 'light of truth' line, the Gandhi line and the Garvey line have any printed source at all - three archives remain unsearched. Whether the existing Henry Ford record's second equation, P_solve=L x M x S, is a real Chairman equation: it is not in thylora_math_equation_registry and was not invented here.$q$,
 $q$Chairman decides whether the MATH surface on the dashboard branch should read thylora_famous_thought_dashboard_v1(). Nothing is published until he says so. Deltas 562, 563 and 564 were read and are unchanged by this pass; 563 explicitly keeps quote-library expansion running in parallel with the dashboard interaction closeout.$q$,
 true, 'PASS',
 jsonb_build_object(
  'unknown_rule','UNKNOWN kept as UNKNOWN in 6 held rows and 1 equation conflict.',
  'no_publication','No card published, no image generated, no social post queued, no store product created. The today-post lane held in delta 564 was not touched.',
  'no_political_ranking','No endorsement or ranking of any political tradition; opposing positions (Booker T. Washington and W. E. B. Du Bois) are held in the same library without adjudication.',
  'rights','Every excerpt is short and attributed; in-copyright sources (Nobel lectures 1993 and 2004, Caltech 1974, Ebony 1955) are quoted for study with the full text left at the source.',
  'no_score_manipulation','Every card fails the D gate at 1440 against 4096. No factor was raised to produce a pass.',
  'source_conflict','THOUGHT-FORD-001 carries math_binding P_solve=L x M x S. No such equation exists in thylora_math_equation_registry, so no binding row was created for it. Not deleted, not invented - raised for the Chairman.',
  'predicate_vocabulary','No graph predicate exists for routes-to or depends-on. None was invented; the Famous Thought lane and the People in Time lane are therefore not linked by an edge, and that gap is recorded rather than filled.',
  'authority','All rows from this work are written with authority THYLORA_ANALYSIS, not Chairman. Chairman authority is not assumed by an agent.'),
 'THY-Q-20260920-COMPLETE-QUOTE-LIBRARY-561','THY-WORK-COMPLETE-QUOTE-LIBRARY-561'
where not exists (select 1 from thylora_qyris_work_item_checks c where c.work_code='THY-WORK-COMPLETE-QUOTE-LIBRARY-561');

insert into thylora_execution_work_registry
 (work_code, product_code, phase, work_item, owner_role, who, where_system, why, dependency,
  acceptance_test, cost_state, cost_estimate, state, evidence)
values ('THY-WORK-COMPLETE-QUOTE-LIBRARY-561','FAMOUS-THOUGHT-LIBRARY','BUILD',
 $q$Expand the Famous Thought registry into a source-verified reasoning library with meaning chains, People in Time, themes and FK-checked math bindings.$q$,
 'RESEARCH_AND_BACKEND','Claude (Claude Code Remote)','thylora-dash (jvsdxhrfhtlgaknhjxlz) + vyc2st-ctrl/Thylora',
 $q$A quote with no traceable source is a liability. A quote that leads nowhere is decoration. The library has to survive both tests before anything is shown to a reader.$q$,
 $q$Dashboard MATH surface lives in vyc2st-ctrl/thylora-executive-dashboard, which is outside this session repository scope. Read model is prepared in the backend; binding it to the surface is a separate, Chairman-approved step, and delta 563 holds dashboard merge until interaction closeout passes.$q$,
 $q$select thylora_famous_thought_dashboard_v1() returns public_ready = 23, themes_covered = 20, people_in_time_complete = 23, held_or_rejected = 6, and every held row returns FAIL from the F gate.$q$,
 'NO_EXTERNAL_COST',
 jsonb_build_object('external_spend',0,'tools',jsonb_build_array('Supabase MCP','web retrieval for source checking')),
 'DELIVERED_BACKEND_NOT_PUBLISHED',
 jsonb_build_object('records_accepted',23,'records_new',19,'records_inherited',4,'held_or_rejected',6,'themes',20,
   'f_gate_pass',23,'f_gate_fail',6,'d_gate_pass',0,'d_gate_fail',23,
   'graph', jsonb_build_object('nodes_created',3,'nodes_updated',2,'edges_created',8,'versions_created',12),
   'publication','NONE','chairman_approval_required',true))
on conflict (work_code) do update set state=excluded.state, evidence=excluded.evidence,
  acceptance_test=excluded.acceptance_test, dependency=excluded.dependency, updated_at=now();

insert into thylora_query_carryforward
 (query_id, source_app, session_label, user_message, assistant_message, message_hash, authority, truth_class,
  capture_state, continuity_refs, restart_point, sequence_no, previous_query_id, verbatim_locked, capture_method, created_by)
values ('THY-Q-20260920-COMPLETE-QUOTE-LIBRARY-DELIVERED-565','CLAUDE_CODE_REMOTE',
 $q$Famous Thought library built into a source-verified reasoning system: 23 accepted records, 20 themes, 6 quotations held or rejected on evidence, nothing published$q$,
 $q$THYLORA HEAD - SPINE FORWARD. Read backend through sequence 561 and all newer deltas. WORK_CODE THY-WORK-COMPLETE-QUOTE-LIBRARY-561. QYRIS required. Build the THYLORA Famous Thought library into a source-verified reasoning system. Every accepted thought must lead somewhere. Graph preflight required. No publishing, no image generation, no new dashboard, no Lovable migration.$q$,
 $q$DELIVERED under THY-WORK-COMPLETE-QUOTE-LIBRARY-561, consuming newer deltas 562, 563 and 564. 19 new source-verified records written to thylora_famous_thought_registry, each with an F-gate PASS evaluation, a seven-link meaning chain in thylora_famous_thought_publication_map, a People in Time record, theme tags and FK-checked math bindings. The four records inherited from sequence 559 were completed to the same standard rather than duplicated. 6 quotations were checked and refused. Graph: 3 nodes created, 2 updated, 8 edges created, 12 version rows. Nothing was published.$q$,
 md5('THY-WORK-COMPLETE-QUOTE-LIBRARY-561:565'),'THYLORA_ANALYSIS','BACKEND_WRITTEN_AND_READ_BACK','CAPTURED',
 jsonb_build_array('THY-Q-20260920-COMPLETE-QUOTE-LIBRARY-561','THY-Q-20260920-CHAIRMAN-LOCKIN-562','THY-Q-20260920-CHAIRMAN-ATTENTION-CLOSEOUT-563','THY-Q-20260920-GRAPH-HARDENING-TODAY-POST-564','THY-Q-20260920-MATH-FAMOUS-THOUGHT-559'),
 $q$RESTART 565 - FAMOUS THOUGHT LIBRARY IS SOURCE-VERIFIED AND UNPUBLISHED. The library holds 23 accepted records (4 inherited from 559 plus 19 new) covering all 20 required themes, each with a complete THOUGHT>TENSION>QUESTION>EVIDENCE>CONNECTION>ACTION>DESTINATION chain, a People in Time record and math bindings foreign-keyed to thylora_math_equation_registry so no thought can point at an equation that does not exist. Read model for the existing MATH surface is thylora_famous_thought_dashboard_v1(), with card, library, today, random and theme/person filters beside it; no new app and no new dashboard section was created. Six quotations were checked and refused; two matter: Sojourner Truth's 'Ain't I a woman' is absent from the 1851 Anti-Slavery Bugle report and comes from Frances Gage's 1863 reconstruction, and Ida B. Wells's 'turn the light of truth upon them' does not occur in the full text of Southern Horrors. Both are held in thylora_famous_thought_holds with the evidence, and verified alternatives from the same two women are in the library instead. Every card fails the D gate at 1440 against 4096 because attention and match are unmeasured and the reader path is not promoted - that is the correct result and no score was adjusted. THREE CHAIRMAN DECISIONS ARE OPEN AND NOTHING MOVES WITHOUT THEM: (1) whether the MATH surface on branch claude/thylora-dashboard-completion-37annk should read thylora_famous_thought_dashboard_v1() - note delta 563 holds that merge until interaction closeout passes; (2) whether any card may be published, since none has been; (3) what P_solve=L x M x S is - THOUGHT-FORD-001 carries it as a math binding and no such equation exists in the registry, so it was left unbound rather than invented. NEXT EXECUTABLE ACTION WITH NO FURTHER AUTHORITY NEEDED: search the three unsearched archives for the three held lines - the Ida B. Wells Papers at the University of Chicago, the Collected Works of Mahatma Gandhi on the Gandhi Heritage Portal, and the Marcus Garvey and UNIA Papers Project at UCLA. Lanes not touched by this pass and unchanged: dashboard interaction closeout (563), Green Milk source recovery, approval-queue triage, graph hardening and the held today-post (564).$q$,
 565,'THY-Q-20260920-GRAPH-HARDENING-TODAY-POST-564',true,'CLAUDE_CODE_REMOTE','claude_code_remote')
on conflict (query_id) do update set restart_point=excluded.restart_point, assistant_message=excluded.assistant_message;
