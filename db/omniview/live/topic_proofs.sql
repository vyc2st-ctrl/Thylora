-- OMNIVIEW · live topic proofs (THY-WORK-OMNIVIEW-LIVE-APPLY-591)
-- One read per topic through the same function the CONTEXT surface calls.
-- Each proof names the tables the read touched (from its own QYRIS trace) and
-- the authority it returned. Read-only.
select t.asked as topic,
       r->>'topic_key'                                   as resolved_to,
       (r->>'found')::boolean                            as found,
       r#>>'{topic_manifest,canon_state}'                as canon_state,
       r#>>'{authority_locks,authority_lock}'            as authority_lock,
       r#>>'{authority_locks,authority_holder}'          as authority_holder,
       (r#>>'{current_vs_superseded,current_count}')::int    as current_statements,
       (r#>>'{current_vs_superseded,superseded_count}')::int as superseded_statements,
       jsonb_array_length(r->'linked_graph')             as links,
       (select count(*) from jsonb_array_elements(r->'linked_gates') g where g->>'gate_state' in ('OPEN','BLOCKED')) as open_gates,
       r#>>'{next_better_question,question}'             as next_better_question,
       r#>>'{last_sequence,sequence_no}'                 as last_sequence,
       (select string_agg((x->>'table')||'='||(x->>'rows'), ', ') from jsonb_array_elements(r#>'{qyris,tables_read}') x) as tables_read,
       r->>'answer_rule'                                 as answer_rule,
       case when (r->>'found')::boolean
             and r#>>'{qyris,qyris_version}' is not null
             and jsonb_array_length(r#>'{qyris,tables_read}') = 8
             and r#>>'{read_path,0}' = 'NEWEST DELTAS'
             and r#>>'{read_path,9}' = 'ANSWER'
            then 'PROOF PASS' else 'PROOF FAIL' end        as verdict
  from (values ('TIME RUN'),('ROYAL CASTLE'),('ALISTAIR CROWE'),('STORE'),('SPORTS'),('QYRIS')) t(asked)
  cross join lateral (select thy_omniview_topic(t.asked, 25) as r) x;
