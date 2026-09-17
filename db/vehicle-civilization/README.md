# Vehicle civilization migrations

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). These files are the
reviewable schema and seed for the THYLORA / ErsatzReality vehicle industry.
**They are not applied by this repository.** Applying DDL to the live backend is
a production mutation and is held for Chairman execution, exactly as for
`db/rae-link`.

The live backend **was** read during this build. Every reconciliation finding in
`er_civ_reconciliation_log` comes from querying the real registries, not from
guessing at them.

## Apply order

| File | Contents |
|---|---|
| `0001_industry_core.sql` | 11 new `er_civ_*` tables, RLS enabled, no client policies |
| `0002_seed_companies.sql` | 28 companies, 18 suppliers, 14 market-structure genres |
| `0003_seed_classes.sql` | 22 mobility classes across ground, air, marine, multimode and infrastructure |
| `0004_seed_engineering_studies.sql` | 11 engineering decision studies with worked numbers |
| `0005_seed_road_findings.sql` | 5 road and bridge findings |
| `0006_seed_manifests.sql` | The first three build manifests |
| `0007_seed_names_briefs_risks.sql` | 34 name proposals, 3 render briefs, 10 reconciliation findings, 16 safety risks |

Run in numeric order, one transaction per file. Each file carries its own
`begin` / `commit`.

## Design rules held throughout

1. **Additive only.** Every object is new and prefixed `er_civ_`. No existing
   table is dropped, renamed, altered or rewritten. The existing
   `transport_*`, `er_automotive_*` and `er_vehicle_*` registries are untouched.
2. **Extend, never replace.** Manifest B extends `CNW-CONCEPT-009` /
   `ER-AUTO-BS-009` and closes its open dimensional package. It does not create
   a second flagship van. `er_civ_mobility_class_registry` maps onto the two
   existing class taxonomies rather than picking a winner between them.
3. **Locked canon is carried, not re-created.** Peete Crown, DGM, MAH' and C&W
   appear as `EXISTING_CANON` rows that confer no new scope. DGM and MAH' scope
   was queried from the backend and is genuinely unresolved there, so nothing
   was assigned to either.
4. **Nothing public gets named.** `er_civ_name_proposal.approval_state` has a
   check constraint permitting exactly one value,
   `PROPOSED_PENDING_CHAIRMAN`. A name cannot be locked from this table even by
   mistake.
5. **No Earth claim.** `earth_claim_boundary` is `not null` on the company
   registry with the C&W disclaimer as its default. A company row cannot exist
   without carrying it.
6. **Weapons boundary is structural.** `weapons_boundary` is `not null` on every
   mobility class. Military transport is mobility, logistics, engineering,
   recovery and medical transport. No weapon, munition, targeting or
   destructive hardware is carried anywhere in this canon.
7. **Engineering state is visible.** Every study carries a `confidence_state`,
   and the only values available are `ENGINEERING_REASONING_EVIDENCE_OPEN`,
   `PARTIALLY_BENCHMARKED`, `RESEARCH_ONLY` and `VALIDATED`. Nothing in this
   build is `VALIDATED`, because nothing has been tested.
8. **Written brief before imagery.** `AUTO-VISUAL-GATE-001` is LOCKED upstream
   and is honoured. Every render brief lists what may be drawn, what may not,
   and what the image must state, and all three sit at
   `AWAITING_CHAIRMAN_VISUAL_APPROVAL`.
9. **THYLORA does not own the economy.** 12 of the 28 companies and 12 of the 18
   suppliers are independent. Every genre carries a concentration ceiling, and
   the validation suite fails if any genre demands rivals it does not have.

## Validation

`validation/run.sh` applies all seven files to a throwaway local database —
twice, to prove idempotency — then runs `validation/behaviour.sql`, which
asserts that each rule rejects what it claims to reject.

```
sudo service postgresql start
db/vehicle-civilization/validation/run.sh
```

Result on PostgreSQL 16.13, 2026-09-17: **exit 0**. 11 tables created, six of
six "expect reject" cases rejected by the database, and eight content
assertions passed. Seeded: 28 companies, 18 suppliers, 14 market genres,
22 mobility classes, 11 studies, 3 manifests, 34 name proposals, 3 render
briefs, 10 reconciliation findings, 5 road findings, 16 safety risks.

The validation caught one real defect during the build: the `LIGHT_MOBILITY`
genre declared a minimum of one independent competitor while listing none. It
was corrected by stating the obligation as a pre-release gate rather than by
inventing a competitor to satisfy the check.

## Verification still owed

Validation ran on PostgreSQL 16.13 locally, not on the live backend, which runs
PostgreSQL 17.6. Before applying: confirm that no existing object already uses
the `er_civ_` prefix (none did at read time), and confirm that RLS-with-no-policies
is still the intended posture for `er_*` registries — it is what every existing
`er_*` table does today.
