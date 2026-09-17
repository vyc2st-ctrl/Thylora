# WR-VEHICLE-CIV-001 · Vehicle Civilization

**Lane:** vehicle industry · companies and competitors · supplier ecosystem · mobility classes · engineering studies · road and bridge · first three build manifests
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-vehicle-civilization-ifu0at`
**Opened:** 2026-09-17

---

## 1 · Authority position

Read before execution, and held throughout:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority
  for the Chairman dashboard. **Nothing in this delta touches
  `dashboard-current-head.html`, `app/`, `public-site/` or `rae-link/`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. No baseline
  capability was removed, renamed or disconnected.
- `db/rae-link/README.md` establishes the standing rule that **applying DDL to
  the live backend is a production mutation held for Chairman execution.** That
  rule is honoured here: the backend was **read** extensively, and **not
  written**.
- `AUTO-VISUAL-GATE-001` is LOCKED. Engineering brief and geometry precede
  imagery. **No imagery was produced.**
- `THY-NAME-PROVENANCE-001` is LOCKED. No canon name was replaced. Every new
  name is a proposal.
- `AUTO-NAME-001` is LOCKED. C&W is the canonical automotive shop form. No
  identifier was renamed.

---

## 2 · Backend connection

The backend was reached and read. Project `jvsdxhrfhtlgaknhjxlz`, `thylora-dash`,
PostgreSQL 17.6, `ACTIVE_HEALTHY`.

This is worth stating because `db/rae-link/README.md` records that an earlier
build session could **not** reach this host ("egress policy denied the backend
host"), and had to design around unverified schema. That constraint no longer
applies. Every reconciliation finding below comes from querying the live
registries.

Registries read: `er_all_vehicle_program_registry`, `er_vehicle_brand_language_registry`,
`er_automotive_vehicle_class_matrix`, `er_automotive_vehicle_deep_taxonomy`,
`er_automotive_facility_registry`, `er_automotive_gap_registry`,
`er_automotive_naming_corrections`, `er_automotive_impact_taxonomy`,
`er_automotive_parts_taxonomy`, `er_automotive_service_matrix`,
`er_automotive_dealership_matrix`, `er_automotive_build_sheets`,
`er_vehicle_project_pipeline`, `er_vehicle_survival_case_registry`,
`er_mobility_infrastructure_registry`, `transport_program_registry`,
`transport_vehicle_registry`, `transport_design_gate_registry`,
`transport_garage_registry`, `transport_safety_case_registry`,
`thylora_name_provenance_gate`, `businesses`, `sports_equipment_company_registry`.

---

## 3 · Canon preserved exactly

| Record | State | Action taken |
|---|---|---|
| `ER-BRAND-PEETE-CROWN-001` Peete Crown | LOCKED | Carried as `EXISTING_CANON`. No new scope conferred. |
| `ER-BRAND-DGM-001` DGM | LOCKED | Carried. Scope queried from backend: **genuinely unresolved there**. Nothing assigned. |
| `ER-BRAND-MAH-001` MAH' | LOCKED | Carried. Scope queried from backend: **genuinely unresolved there**. Nothing assigned. |
| `CW-AUTO-CUSTOMS-FACILITY-001` C&W | BUILT_CANON | Carried as factory, restoration garage, custom builder and managed fleet house. 52 in-world staff. |
| `ER-DESIGN-NEWNEW-001`, `-WHEEL-001`, `-CROWN-001` | LOCKED | Honoured in every render brief as prohibitions. |
| `ER-VEH-GROUND/AIR/MARINE/SPACE/MULTIMODE-001` | ACTIVE_BUILD | Mapped into the new class registry, unchanged. |
| `THY-GUARDIAN-FLIGHT-001` | ACTIVE_DESIGN | Carried with its blockers intact, plus a new binding aviation gate. |
| `CNW-CONCEPT-009` / `ER-AUTO-BS-009` | GATE_1_COMPLETE | **Extended**, not replaced. See §5. |

---

## 4 · Execution delta

### Added — backend schema and seed (reviewable, **not applied**)

`db/vehicle-civilization/` — 7 numbered migrations, 11 new `er_civ_*` tables.

| File | Contents |
|---|---|
| `0001_industry_core.sql` | 11 tables, RLS enabled, no client policies (matches existing `er_*` posture) |
| `0002_seed_companies.sql` | 28 companies, 18 suppliers, 14 market-structure genres |
| `0003_seed_classes.sql` | 22 mobility classes, ground through infrastructure |
| `0004_seed_engineering_studies.sql` | 11 decision studies with worked numbers |
| `0005_seed_road_findings.sql` | 5 road and bridge findings |
| `0006_seed_manifests.sql` | The first three build manifests |
| `0007_seed_names_briefs_risks.sql` | 34 name proposals, 3 render briefs, 10 reconciliation findings, 16 safety risks |

`validation/run.sh` + `validation/behaviour.sql` — applies all seven twice to a
throwaway local database, then asserts six "expect reject" cases and eight
content rules. **Exit 0 on PostgreSQL 16.13, 2026-09-17.**

### Added — documentation

- `docs/VEHICLE-CIVILIZATION-ENGINEERING.md` — every formula and finding in
  Chairman-simple language.
- `workrooms/WR-VEHICLE-CIV-001.md` — this file.

### Changed

Nothing. This delta is additive only.

---

## 5 · Manifest B extends existing canon rather than duplicating it

The brief for the low-wide flagship van matched an existing record almost
exactly: `CNW-CONCEPT-009`, class `royal_family_grand_utility`, carrying the
Chairman direction "main royal family vehicle / family-sized comfortable cabin /
near-flat nose, 1970s van influence without copying / premium presence /
design roads around human comfort".

That record stood at `GATE_1_ARCHITECTURE_COMPLETE_VALIDATION_OPEN` with these
blockers: *hard dimensions and mass target unresolved*, *powertrain and energy
architecture unresolved*.

**Manifest B closes exactly those blockers** — dimensional package, mass model,
centre of gravity, rollover threshold, wheel count decision, crosswind case and
energy architecture — and inherits the occupant cell, rollover ring, restraint
and post-crash provisions from `ER-AUTO-BS-009` unchanged. A second flagship van
was not created.

### The correction that matters

The 1970s van reference is packaging logic only, and its central flaw is
corrected explicitly. In those vehicles the driver sat **ahead of the front
axle**, which is what killed people in frontal impacts.

**In this vehicle the driver's feet sit behind the front axle centreline,
without exception.** The short nose is achieved by moving the axle forward and
using a deep cross-car beam with load-spreading sill entry — not by shortening
the 780 mm crush length.

---

## 6 · Findings the build produced

1. **Six wheels are not safer.** Grip is μN and N is the weight; rollover is
   t/(2h). Wheel count is in neither equation. Four wheels, with six retained
   only above a 2,400 kg rear axle load — which the armored derivative crosses
   and the passenger flagship does not.
2. **The energy architecture is a rollover decision.** Battery in the floor
   gives SSF 1.44; the hybrid on the same body gives 1.27. Not previously
   recorded anywhere in the canon. Permit the hybrid, disclose the difference.
3. **393 metres.** Hydroplaning stopping distance from 100 km/h. Wider tires do
   not help and neither does mass — both are commonly believed and both are
   false.
4. **Crosswind is a steering problem, not a tipping problem.** 12:1 rollover
   margin, but the pressure centre sits ahead of the CG on a blunt nose. Fix it
   directionally; making it narrower or heavier are both wrong answers.
5. **The cabin air filter is a safety item.** Demist airflow is visibility.
   Filed as comfort, it gets deferred.
6. **Prefer the solution whose broken state is boring.** Binding rule: no active
   aero device may have a failure state that increases yaw sensitivity.
7. **The wide vehicle depends on a road standard that does not exist yet.**
   Recorded as a cross-domain dependency with a named owner rather than left
   invisible inside the vehicle programme.

---

## 7 · Reconciliation findings raised against existing canon

Ten findings recorded in `er_civ_reconciliation_log`. The four that need a
decision:

- **`ERCIV-REC-001`** — `AUTO-NAME-001` is LOCKED on C&W, but every program and
  vehicle code in the backend still carries the `CNW-` prefix. The transcription
  error is frozen into the identifier scheme. **Nothing was renamed**, because
  renaming live identifiers is not an engineering decision.
- **`ERCIV-REC-002`** — `er_automotive_vehicle_class_matrix` holds two competing
  class taxonomies written eight hours apart on 2026-08-30, with different
  column shapes. Neither supersedes the other. The new class registry maps onto
  both rather than picking a winner.
- **`ERCIV-REC-004`** — `ER-AUTO-BS-009` and `CNW-CONCEPT-009` both claim
  conformance to safety standard `THY-VEH-SAFE-SERVICEABLE-001`. **No defining
  record for it exists in the gate registry.** A standard that cannot be read
  cannot be complied with.
- **`ERCIV-REC-006`** — `CNW-HERITAGE-FLEET-001` is `ACTIVE_SIMULATION_PRODUCTION`
  and requires a worker/part/build ledger and a managed fleet. `er_vehicle_build_ledger`,
  `er_vehicle_managed_fleet_registry`, `transport_provenance_registry` and
  `transport_maintenance_reports` all hold **zero rows**. Ten CW-LEAD projects
  sit at `SIMULATION_REBUILD_ACTIVE` with nothing behind them.

---

## 8 · Boundaries held

- **No imagery.** `AUTO-VISUAL-GATE-001` honoured. Three written render briefs
  exist, all at `AWAITING_CHAIRMAN_VISUAL_APPROVAL`, each listing what may be
  drawn, what may not, and what the image must state.
- **No public name locked.** `er_civ_name_proposal.approval_state` carries a
  check constraint permitting exactly one value. A name cannot be locked from
  that table even by accident.
- **No weapons.** `weapons_boundary` is `not null` on every mobility class.
  Military transport means personnel transport, field logistics, engineering,
  recovery, bridging and medical transport. Nothing else.
- **No Earth claim.** `earth_claim_boundary` is `not null` on the company
  registry, defaulted to the C&W disclaimer. A company row cannot exist without
  carrying it.
- **No copied trade dress.** Every Earth vehicle named in the brief or the
  existing registry is carried as a functional or proportional reference only.
- **Nothing validated.** No study in this build carries `confidence_state =
  VALIDATED`, because nothing has been tested.
