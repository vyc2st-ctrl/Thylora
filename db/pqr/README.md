# PUBLIC QUESTION RADAR — migrations

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`).

Unlike `db/rae-link/`, **these files have been applied to the live backend**, in
this session, under these migration names:

| File | Applied as |
|---|---|
| `0001_pqr_core.sql` | `pqr_public_question_radar_core_v1` |
| `0002_pqr_rls_functions.sql` | `pqr_public_question_radar_rls_functions_v1` |
| `0003_first_candidate_board.sql` | `pqr_first_candidate_board_20260918_v1` |

11 tables, 4 functions, 1 trigger, 11 RLS policies. Additive only: every object
is new and prefixed `thylora_pqr_`. No existing table was dropped, renamed,
altered or rewritten, and no existing capability was removed.

Architecture: `docs/PQR-ARCHITECTURE.md`. Workroom: `workrooms/WR-PQR-001.md`.

## Design rules held throughout

1. **Additive only.** All objects new, prefixed `thylora_pqr_`.
2. **No second source of truth.** Concepts, claims, story seeds, shelves and
   gaps stay where they already live. PQR holds soft text references.
3. **Virality is not truth.** Reach is quarantined in one documented column;
   `check (virality_excluded)` refuses any row claiming otherwise; `E` is a
   multiplicative factor so unverifiable questions score zero.
4. **We do not copy creators.** Signals are paraphrase; a verbatim quote without
   attribution is refused by constraint; `originality_basis` is `not null`; the
   originality gate computes its own verdict.
5. **No publishing.** The opportunity state domain contains no published value,
   and the release gate always returns `NO_PUBLISH_IN_V1`.
6. **Gates report everything at once.** Never one blocker per round trip.
7. **Derived numbers are generated, not typed.** `opportunity_score` and
   `score_band` are generated columns; recurrence counts come from
   `thylora_pqr_recount_cluster_v1`.

## Validation

`validation/behaviour.sql` asserts that each rule rejects what it claims to
reject. Run it against the live backend or a local copy; it cleans up after
itself and leaves no rows behind.

Result on the live backend, 2026-09-18:

```
PASS virality-rejected
PASS zero-evidence-is-DEAD
PASS high-confidence-needs-primary
PASS uncredited-lift-rejected
PASS no-publish-state
PASS originality-gate-reports-all-four
PASS release-gate-holds-on-no-publish
```
