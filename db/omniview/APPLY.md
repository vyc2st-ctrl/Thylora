# Applying OMNIVIEW to the backend of record

Held for Chairman execution. This repository does not apply DDL to
`thylora-dash` (`jvsdxhrfhtlgaknhjxlz`).

## Before applying

```sql
-- 1. Nothing already owns the prefixes.
select to_regclass('public.thy_sequence_ledger'),
       to_regclass('public.thy_omniview_topics');
-- Expect: null, null. If either is not null, stop and report it.

-- 2. The identity table is the one the policies assume.
select to_regclass('auth.users');

-- 3. The pre-ledger bridge has something to read (optional; the bridge reports
--    honestly either way).
select count(*), min(sequence_no), max(sequence_no) from thylora_query_carryforward;
```

## Apply

In the Supabase SQL editor, or with `psql`, run in numeric order, one file at a
time, checking each returns without error:

```
db/omniview/0001_sequence_ledger.sql
db/omniview/0002_topic_manifest.sql
db/omniview/0003_read_model.sql
db/omniview/0004_write_path.sql
db/omniview/0005_rls_policies.sql
db/omniview/0006_seed_manifest.sql
db/omniview/0007_prior_context.sql
```

## Verify readback

```sql
-- The whole board in one read.
select jsonb_pretty(thy_omniview_manifest(5));

-- One topic, whole path.
select jsonb_pretty(thy_omniview_topic('castle'));
select jsonb_pretty(thy_omniview_topic('time-run'));
select jsonb_pretty(thy_omniview_topic('the store'));

-- The ledger, and one sequence expanded.
select jsonb_pretty(thy_sequence_ledger_page(10));
select jsonb_pretty(thy_omniview_sequence(588));

-- Pre-ledger history, labelled as context.
select jsonb_pretty(thy_sequence_prior_context(5));
```

Expect `sequence_head = 588`, eleven topics, and a `qyris` block on every read.

## Then the dashboard

CONTEXT and SEQUENCE are already in the current head and in the member app. They
read through `/rest/v1/rpc/…`, so they light up the moment the pack is applied —
no second deploy. Until then they show a plain NOT YET APPLIED notice naming this
file, and nothing else on the dashboard is affected.

Per `DASHBOARD_AUTHORITY.md`, the head change is not live until it is merged into
`vyc2st-ctrl/thylora-executive-dashboard` and witnessed on `thylora-public-world`.

## Recording the apply as a sequence

The apply is itself a change, so it gets a sequence. Run it through the write
path so the ledger records it and hands back the readback:

```sql
select jsonb_pretty(thy_sequence_append(
  589,
  timestamp '2026-09-22 00:00', 'UTC',      -- replace with the real local time and zone
  'The OMNIVIEW pack was applied to the backend of record.',
  'thy_omniview_* and thy_sequence_* are live on thylora-dash; CONTEXT and SEQUENCE read from the live backend.',
  'The surfaces were shipped ahead of the pack and were showing NOT YET APPLIED.',
  'No existing table changed. Every prior registry is untouched.',
  'Chairman', 'WITNESSED',
  'Which UNSEEDED topic should be seeded first: CASTLE, INÉS, VERONICA, FOOTBALL or VEHICLES?',
  'OMNIVIEW live. Next: seed the first UNSEEDED topic.',
  '[{"topic_key":"OMNIVIEW","effect":"TOUCHED"},{"topic_key":"DASHBOARD","effect":"WORK_CHANGED"}]'::jsonb));

select thy_omniview_set_gate('GATE-OMNIVIEW-APPLIED','OMNIVIEW',
  'The OMNIVIEW pack is applied to thylora-dash and thy_omniview_manifest() returns from the live backend.',
  'PASSED','Chairman', null, 'witnessed on apply', 589);
```

## Rollback

The pack is additive, so rollback is a drop of its own objects only:

```sql
drop function if exists thy_sequence_prior_context(int,bigint);
drop function if exists thy_omniview_restart(text,text,text,bigint,text,text);
drop function if exists thy_omniview_answer(bigint,bigint);
drop function if exists thy_omniview_ask(text,text,text,boolean,bigint);
drop function if exists thy_omniview_set_gate(text,text,text,text,text,text,text,bigint);
drop function if exists thy_omniview_link(text,text,text,text,text,text,text,text,bigint);
drop function if exists thy_omniview_state_canon(text,text,text,text,bigint,bigint,text,text);
drop function if exists thy_omniview_register_topic(text,text,text,text,text,text,text);
drop function if exists thy_sequence_append(bigint,timestamp,text,text,text,text,text,text,text,text,text,jsonb,bigint,text,timestamptz);
drop function if exists thy_sequence_ledger_page(int,bigint);
drop function if exists thy_omniview_sequence(bigint);
drop function if exists thy_omniview_topic(text,int);
drop function if exists thy_omniview_manifest(int);
drop function if exists thy_omniview_deltas(int,text);
drop function if exists thy_omniview_qyris(text,text,jsonb);
drop function if exists thy_omniview_resolve_topic(text);
drop function if exists thy_omniview_normalize_key(text);
drop function if exists thy_sequence_head();
drop table if exists thy_omniview_restarts, thy_omniview_questions, thy_omniview_gates,
                     thy_omniview_links, thy_omniview_statements,
                     thy_sequence_ledger_topics, thy_omniview_topics, thy_sequence_ledger;
```

Dropping the ledger destroys the sequence history it holds. Export it first:

```sql
select * from thy_sequence_ledger order by sequence_no;
```
