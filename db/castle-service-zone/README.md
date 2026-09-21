# Castle service-zone migrations · THY-WORK-KITCHEN-SUITE-RESIDENCE-576

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). These files are the
reviewable schema and content for the royal kitchen service zone. **They are not
applied by this repository.** Applying DDL or seeding the live backend is a
production mutation and is held for Chairman execution.

## The evidence gap, stated once and held everywhere

The build session **could not reach the backend**. The egress policy denied
`CONNECT` to `jvsdxhrfhtlgaknhjxlz.supabase.co` with `403`, on every attempt.

So **backend sequence 576 was not read.** It was not reachable. Every consequence
of that is carried in the schema rather than in a footnote:

- no dimension in this delta claims `DOCUMENTED`, and a check constraint refuses
  any row that tries to claim it while citing this work as its source;
- nothing hard-links to a canon table whose shape is unverified;
- every canon touch is `to_regclass`-guarded and no-ops rather than inventing;
- `thy_csz_canon_probe()` exists precisely to answer, from a session that *does*
  have egress, the question this one could not.

## This is not a second geometry system

`thy_csz_*` is an **intake ledger**. Geometry truth stays in
`thylora_castle_space_geometry` and `thylora_castle_space_connections`.

`thy_csz_project_spaces()` walks intake into canon **only** when the canon table is
present and shape-compatible. When it is absent the function returns
`CANON_ABSENT` and stops — it does not create the table, does not rename anything,
and does not keep a rival copy that behaves like one. When canon *is* present it
still refuses every `PROPOSED`, `DERIVED_FROM_ERC` and `UNKNOWN` row, because
intake does not become geometry truth without a Chairman state change.

Validated: with a stub canon table present, projection wrote **0** rows and
refused **10**.

## Apply order

| File | Contents |
|---|---|
| `0001_core_spaces.sql` | State vocabulary, serial registry, space intake, adjacency intake |
| `0002_flows.sql` | Flow paths and steps with physical-fit verdicts; herb residence states |
| `0003_objects_wardrobe.sql` | Role slots, object home map, wardrobe and laundry path |
| `0004_residence_relief.sql` | Three residence models, canonization guard, day-off relief matrix |
| `0005_public_branding_qyris.sql` | Public-safe projection view, brand relationships, QYRIS ledger |
| `0006_rls_policies.sql` | Row level security across every `thy_csz_*` table |
| `0007_projection_readback.sql` | Canon probe, name resolution, projection, readback, teleport report |
| `0008_seed_576.sql` | The slice itself: 10 spaces, 19 links, 4 flows, 9 herb states, 13 objects, 6 wardrobe rows, 3 residence models |

Run in numeric order, one transaction per file.

## Rules held throughout

1. **Additive only.** Every object is new and prefixed `thy_csz_`. Nothing existing
   is dropped, renamed or rewritten.
2. **PROPOSED is never presented as fact.** All 10 spaces are `PROPOSED`. The
   readback reports the state histogram so nobody has to take that on trust.
3. **No invented canon.** Ten native-name slots are held open as `UNKNOWN` rather
   than filled. The herb is `NATIVE_HERB_UNRESOLVED`; rosemary is carried only as a
   labelled ERC functional mirror.
4. **No random people, no random makers.** Two occupants exist, both given facts:
   Inés as Head Cook, and the Deputy Cook relief. Every other custodian is an
   unoccupied role slot. No craftsman or supplier is named anywhere.
5. **No teleporting.** `thy_csz_teleport_report()` returns every declared object
   move no recorded link can carry. Current result: **0**.
6. **Nothing canonized.** No residence model is selected; a partial unique index
   plus a trigger make selection possible only through a `CHAIRMAN_AUTHORED` row.
7. **No decorative marks.** A brand appearance without a declared real relationship
   is rejected by a deferred constraint trigger.
8. **Security topology is withheld structurally, not by care.** The public view
   exposes no dimension column and no adjacency row at all, and a check constraint
   makes a `RESTRICTED_SERVICE` or `SECURE` row publishable-flagged impossible.

## Validation

`validation/run.sh` applies all eight files to a throwaway local database — twice,
to prove idempotency — then runs `validation/behaviour.sql`.

```
sudo service postgresql start
db/castle-service-zone/validation/run.sh
```

Result on PostgreSQL 16, 2026-09-21: **exit 0**. Both passes clean. Seven of seven
"expect reject" cases rejected by the database. Measured on the validated build:

| Check | Result |
|---|---|
| Spaces / links / flows / flow steps | 10 / 19 / 4 / 29 |
| Herb residence states / objects / wardrobe rows | 9 / 13 / 6 |
| Dimensions claiming `DOCUMENTED` | **0** (all 10 `PROPOSED`) |
| Native-name slots still open | 10 |
| Flow steps failing physical fit | **0** |
| Flow steps honestly `UNVERIFIED` | 2 (both the unresolved dining stair) |
| Teleporting object moves | **0** |
| Restricted/secure rows reaching the public sheet | **0** |
| Residence models canonized | **0** of 3 |
| People named anywhere | **1** (Inés) |
| Open conflicts / unknowns / pending Chairman decisions | 3 / 8 / 6 |

`validation/supabase_stub.sql` creates a minimal `auth` schema and the
`anon` / `authenticated` roles so the migrations can run outside Supabase.
