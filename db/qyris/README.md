# db/qyris — QYRIS backend

Nine numbered migrations. **Reviewable, validated, and not applied to the live
backend.** Applying DDL to production is a Chairman act; this build does not
perform one.

| File | Contents |
|---|---|
| `0001_qyris_grammar.sql` | The five-part question object, the five deltas, passes, and the recursive stopping rule as SQL functions. |
| `0002_premarriage_pack.sql` | **GENERATED.** 16 clusters, 112 questions, 244 delta links. |
| `0003_industry_template.sql` | **GENERATED.** 16 axes × 6 domains = 96 projected questions, with per-field provenance. |
| `0004_trusted_six_support.sql` | Scope vocabulary, 8 role families, households, seats, ACCESS, STEWARDSHIP. |
| `0005_support_integrity.sql` | AUDIT, TRUST BREACH, SELF-DISQUALIFICATION, RESTORATION/APPEAL, CONFLICT-OF-INTEREST. |
| `0006_sr_candidate.sql` | The SR candidate under test, its factors, floors, observations and recorded results. Not canon. |
| `0007_rls_policies.sql` | Row-level security on all 32 tables. |
| `0008_readback.sql` | Readback functions — the shape, the fields, the pass, the register, the summary. |
| `0009_registry_link.sql` | `to_regclass`-guarded links into existing THYLORA registries. |

## Generated files

`0002` and `0003` are generated from the JavaScript source of truth:

```bash
node db/qyris/generate-seed.mjs          # write
node db/qyris/generate-seed.mjs --check  # fail on drift (run by npm test)
```

Editing them by hand breaks `npm test` rather than quietly forking the pack from
the surface. **One source of truth.**

## Validating

```bash
sudo service postgresql start
db/qyris/validation/run.sh
```

Three questions, in order:

1. **Do the migrations apply cleanly, and again idempotently?**
   Both passes, all nine files.
2. **Do the rules reject what they claim to reject?**
   `behaviour.sql` — 32 EXPECT REJECT blocks. The `ERROR` lines are the passing
   result.
3. **Does what was written read back in the shape it was written?**
   `readback.sql` — R1 through R10, raising on any mismatch.

`run.sh` exits non-zero if any of the three fails. It never touches the THYLORA
backend; it creates and drops a throwaway local database.

Last run, PostgreSQL 16.13, 2026-09-22:

```
tables=32  policies=32  functions=28  check_constraints=51  rls_disabled_tables=0
expected rejections: 32, actual: 32
R1–R10 all OK · READBACK VERIFIED · exit 0
```

## Structural refusals

Things this schema cannot express, by construction rather than by convention:

| Refusal | Where |
|---|---|
| A question with no SAFEGUARD | `qyr_nodes_safeguard_present` |
| A question that moves none of the five deltas | deferred constraint trigger on `qyr_node_deltas` |
| A pass claiming to be CLOSED / COMPLETE / FINISHED | `qyr_passes_state_open` **and** `qyr_passes_never_finished` |
| Answering a child before its parent | `qyr_answer()` raises `PARENT_UNANSWERED` |
| A seventh concurrent support seat | `qyr_assert_seat_limit()` |
| A support seat with decision rights | `qyr_seats_no_authority` |
| Granting `MONEY_MOVEMENT`, `HOUSEHOLD_SURVEILLANCE` or any never-grantable scope | `qyr_assert_grant_legal()` + `qyr_scopes.grantable` |
| A scope outside the role family | `qyr_assert_grant_legal()` |
| Self-granted access, self-approved draws, self-cleared conflicts, self-reviewed appeals | four separate triggers |
| A closed resource draw with no receipt | `qyr_draw_closed_has_receipt` |
| Editing or deleting an audit entry | `qyr_audit_no_update` / `qyr_audit_no_delete` |
| A penalty or demotion attached to standing down | `qyr_dq_no_penalty` / `qyr_dq_no_demotion` |
| Canonizing SR by update | `qyr_sr_not_canon` |
| An UNKNOWN factor carrying a number, or a measured one claiming to be unknown | `qyr_sr_obs_unknown_has_no_value` |
| Producing the SR scalar | `qyr_sr_score()` raises, and is revoked from `anon`/`authenticated` |

## Held

Applying `0001…0009` mutates the production backend. Per the execution rules
this is held for Chairman execution. The backend host was not reachable from the
build session — the egress proxy returned 403 on CONNECT — so the live schema
could not be inspected. Every link into an existing registry in `0009` is a soft
reference guarded by `to_regclass`: a wrong assumption degrades rather than
corrupts.
