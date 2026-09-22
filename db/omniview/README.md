# OMNIVIEW migrations

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). These files are the
reviewable schema for the OMNIVIEW read model and the sequence change ledger.
**They are not applied by this repository.** Applying DDL to the live backend is
a production mutation and is held for Chairman execution — see `APPLY.md`.

## Apply order

| File | Contents |
|---|---|
| `0001_sequence_ledger.sql` | The sequence change ledger: twelve required fields, chain guard, append-only trigger |
| `0002_topic_manifest.sql` | Topics, aliases, canon statements, linked graph, gates, open questions, restart points |
| `0003_read_model.sql` | `thy_omniview_manifest`, `thy_omniview_topic`, `thy_omniview_sequence`, `thy_sequence_ledger_page`, `thy_omniview_qyris` |
| `0004_write_path.sql` | Writeback functions; every one returns the readback of what it wrote |
| `0005_rls_policies.sql` | Row level security: signed-in sessions read, only the service role writes |
| `0006_seed_manifest.sql` | The named topics, the ledger floor at 587, sequence 588, and canon only where a file proves it |
| `0007_prior_context.sql` | Guarded bridge to pre-ledger history in `thylora_query_carryforward` |
| `0008_topics_alistair_sports.sql` | Registers ALISTAIR and SPORTS for the 588 named-topic read test; both left UNSEEDED with the question that would settle them |

Run in numeric order, one transaction per file.

## What the read model is for

The Chairman asks about a topic — CASTLE, STORE, TIME RUN. One call,
`thy_omniview_topic('castle')`, returns the whole pre-response path in the order
it must be read:

```
NEWEST DELTAS -> TOPIC MANIFEST -> AUTHORITY LOCKS -> LINKED GRAPH ->
LINKED PEOPLE/PLACES/OBJECTS/PRODUCTS -> LINKED WORK -> LINKED GATES ->
CURRENT VS SUPERSEDED -> LAST CHAIRMAN CORRECTION -> LAST RESTART -> ANSWER
```

The order ships **as data** (`read_path`), so a client cannot render it in a
different order and a future client does not have to remember it.

## Design rules held throughout

1. **Additive only.** Every object is new and prefixed `thy_omniview_` or
   `thy_sequence_`. No existing table is dropped, renamed or rewritten.
2. **Source history is never rewritten.** `thy_sequence_ledger` refuses UPDATE
   and DELETE at the database level. A correction is a new sequence carrying
   `supersedes_sequence_no`. Canon statements are superseded, never edited, and a
   superseded statement is frozen.
3. **No second source of truth.** Products, departments, family archives and the
   money ledger stay where they already live. A link row holds a soft reference
   (`source_table` + `source_ref`) and is resolved when it is opened.
4. **Authority before content.** A topic carries an authority lock. A topic with
   no lock, or with no canon, is reported `UNSEEDED` and returns the question
   that would settle it, instead of an answer.
5. **No raw sweep.** The read model reads the OMNIVIEW tables only. It does not
   re-read the raw registries every turn.
6. **QYRIS.** Every read returns the trace that produced it: scope, timestamp,
   sequence head, the exact tables read with row counts, and an explicit
   `not_read` list. An answer may claim only what `tables_read` names.
7. **Access is not authority.** Signed-in sessions read. Writes go through the
   security-definer functions in `0004`, and each one returns the readback.

## What the seed is allowed to write

Canon only where a file in this repository proves it — and the source file is
recorded on the statement. Everything else is registered `UNSEEDED` with its
next-better question. At sequence 588 that is: five topics with repo-verified
canon (DASHBOARD, QYRIS, OMNIVIEW, TIME RUN, STORE, ECONOMY) and five held open
(CASTLE, INÉS, VERONICA, FOOTBALL, VEHICLES).

## Validation

`validation/run.sh` applies all seven files to a throwaway local database —
twice, to prove idempotency — then runs `validation/behaviour.sql`, which asks
the database to do eighteen things the rules forbid, and four proof tests.

```
sudo service postgresql start
db/omniview/validation/run.sh
```

Result on PostgreSQL 16.13, 2026-09-22: **exit 0**. Seven migrations applied
twice with no error. Eighteen of eighteen "expect reject" cases rejected, each
for the stated reason. Four of four proof tests passed:

- `proof_1_time_run.sql` — one read returns corrected canon plus byte-preserved
  history, the last sequence and a QYRIS trace over eight tables.
- `proof_2_castle.sql` — an unseeded topic refuses to be answered from and
  returns its question; once the Chairman supplies the source, the same single
  read returns canon, linked person and place, and a closed gate.
- `proof_3_store.sql` — one read returns canon, soft-referenced products, the
  economy link and preserved history; the manifest and the sequence expansion
  agree with it.
- `proof_4_prior_context.sql` — an absent, a mis-shaped and a readable
  carryforward table are each reported honestly, and nothing below 587 enters
  the ledger.

`validation/supabase_stub.sql` creates a minimal `auth.users`, `auth.uid()` and
the `anon` / `authenticated` / `service_role` roles so the migrations can run
outside Supabase. It is scaffolding only and is never applied to a real backend.

## Verification still owed

Validation ran on PostgreSQL 16 locally, not on the live backend: this build
session could not reach `jvsdxhrfhtlgaknhjxlz.supabase.co` (egress denied).
Before applying, confirm the live Postgres version, that `auth.users` is the
identity table in use, and that no existing object already uses the
`thy_omniview_` or `thy_sequence_` prefix.
