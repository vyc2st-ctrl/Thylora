# C&W engineering package — modules, interfaces, corridors, mass

**Run:** 2026-09-17 · **Authority:** `AUTO-NAME-001` (LOCKED) — C&W is the public canonical form
**Sources read live:** `er_automotive_gap_registry` (8), `er_automotive_build_sheets` (10),
`er_vehicle_project_pipeline` (10), `er_automotive_vehicle_class_matrix` (12),
`er_automotive_vehicle_deep_taxonomy` (7), `program_registry`

**No imagery was produced.** Every one of the eight registered gaps is `engineering_state = OPEN`, and
`ER-AUTO-GAP-006` records that final wheel geometry has not been designed. The standing law holds:
no image before the visual, mass and geometry gates pass.

---

## A. Module certification process

A module is any replaceable assembly with a defined boundary. Certification is what lets it be fitted
to a vehicle. Five gates, in order — a module cannot skip forward.

| Gate | Name | Passes when |
| --- | --- | --- |
| M1 | **Boundary declared** | The module's physical envelope, mounting points, and every interface crossing its boundary are written down. No interface may cross undeclared. |
| M2 | **Failure declared** | Each way the module can fail is listed with what the vehicle observes when it does. A failure mode with no observable is a blind failure and fails this gate outright. |
| M3 | **Service access proven** | The module can be reached, removed and refitted without disturbing any unrelated module. Measured in modules-disturbed, and the answer must be zero. |
| M4 | **Evidence attached** | Mass, centre of gravity, materials, supplier, and the test evidence behind any performance claim. A claim without evidence is recorded as a claim, never as a property. |
| M5 | **Provenance sealed** | Part provenance and a content hash, so a fitted module can be identified later and a counterfeit can be told from an original. |

**The rule that makes this worth having:** M3 is checked against the *current* vehicle package, not
against the module in isolation. A module that is serviceable on a bench and buried in the vehicle
has not passed M3. This is the direct answer to `ER-AUTO-GAP-005`, the one gap with an empty blocker
list — it is not waiting on a trial, it is waiting on being designed.

**Certification states:** `DECLARED` → `BOUNDED` (M1) → `CHARACTERISED` (M2) → `SERVICEABLE` (M3) →
`EVIDENCED` (M4) → `CERTIFIED` (M5). Only `CERTIFIED` may be fitted to a released vehicle.
Downgrade is always permitted and never silent: a changed package can knock a module back to M3.

## B. Read-only module interface specification

The problem this solves: a diagnostic that can also command is a diagnostic that can cause the fault
it is reporting. So observation and control are separated at the interface, not by convention.

Every certified module exposes exactly one **read-only observation interface**:

- **It cannot write.** No command, no set-point, no reset, no calibration. A read-only interface that
  can clear a fault is not read-only.
- **It reports state, freshness, and confidence.** Three fields, always. A value with no timestamp is
  not an observation, and a value with no confidence invites a system to trust a guess.
- **It answers when the module is failed.** The interface is powered and reachable independently of
  the module's own function. A module that goes silent when it breaks defeats the purpose.
- **It never carries personal data.** Occupant identity, location history and biometric data do not
  cross a module observation boundary. `ER-AUTO-GAP-008` puts privacy and due-process gates on the
  post-crash chain; this is where that starts.
- **It is stable across versions.** A module revision may add fields. Removing or re-meaning a field
  is a new interface with a new identifier, because a silent re-meaning is a lie to every consumer.

**Degradation contract:** when a module fails, the vehicle loses that module's *function*, never its
*observability*. That sentence is the whole specification. `THY-VEH-SAFE-SERVICEABLE-001` states it
as "failure isolation without total vehicle blindness"; this is the interface-level expression.

## C. Corridor-width engineering standard — DRAFT

**Scope note, stated up front:** this is a draft standard for *service corridors inside the vehicle* —
the access routes a hand, an arm or a tool must travel to reach a module. It is not a road-width or
traffic-corridor standard. Both readings of "corridor" appear in the vehicle material and they are
different engineering problems; this one is the one M3 depends on.

A corridor is defined by what has to pass through it, not by what happens to be left over.

| Corridor class | Passes | Governing dimension |
| --- | --- | --- |
| C1 — sight | A line of sight to an inspection point | Unobstructed cone to the point |
| C2 — hand | A gloved hand, no tool | Hand breadth plus glove plus clearance |
| C3 — hand + tool | A gloved hand holding the tool the job requires | C2 plus tool swing envelope |
| C4 — module | The module itself, on its removal path | Module envelope plus tolerance, along the full path |

**Rules.**

1. A corridor is measured along its **whole path**, not at its narrowest published point. A corridor
   that is generous at the opening and pinches at the far end is a C-class failure, not a tight fit.
2. The corridor class is set by the **most demanding routine operation**, not the easiest one.
3. C4 is measured on the **removal path**, which is not always the reverse of the fitting path. A
   module fitted before its neighbours and removable only by removing them fails M3.
4. Corridors are declared at M1 and **re-measured whenever the package changes.** A corridor is a
   property of the vehicle, not of the module.
5. **The numbers are deliberately absent.** Populating C2, C3 and C4 with millimetres requires the
   anthropometric target population, which `ER-AUTO-GAP-001` records as not locked. Writing numbers
   now would be inventing them. The structure is ready; the figures wait on that decision.

## D. Mass and centre-of-gravity envelope package

An envelope is the region a vehicle's mass and centre of gravity must stay inside. Declaring it early
is what stops a late addition from quietly changing how the vehicle behaves.

**The package declares, per vehicle programme:**

- **Kerb mass envelope** — minimum and maximum, not a single target. A single target is met on paper
  and missed in production.
- **Occupant and load envelope** — the mass added by people and cargo, at their real positions rather
  than at a convenient centroid.
- **CG envelope** — longitudinal, lateral and vertical bounds, each stated at kerb, at full load, and
  at the worst realistic distribution (one heavy occupant, one corner loaded).
- **Per-module mass budget** — every certified module carries its M4 mass. The sum is checked against
  the envelope on every package change, so an overrun is found when a module is added rather than
  when the vehicle is weighed.
- **Unsprung mass sub-budget** — called out separately because `ER-AUTO-GAP-006` is specifically about
  large wheels adding unsprung mass. It cannot be allowed to hide inside a total.

**The binding rule:** the envelope is declared **before** surfacing freeze and is not relaxed to
accommodate a styling decision. `ER-AUTO-BS-009` is at `DIMENSIONAL_PACKAGE_REQUIRED` with exterior
explicitly `SURFACING_AFTER_PACKAGE_AND_SAFETY_GATES` — that ordering is this rule already written
into the build sheet.

**State: structure complete, unpopulated.** No masses, no CG coordinates, no envelope bounds are
recorded here, because `ER-AUTO-BS-009` has no dimensional package yet and `er_vehicle_build_ledger`
holds zero rows. There is nothing to weigh. Inventing plausible numbers would be the worst possible
outcome for a document whose purpose is to catch invented numbers.

---

## G. `THY-VEH-SAFE-SERVICEABLE-001` — traced, connected, not fabricated

**It exists.** `program_registry`, status `SPEC_IN_PROGRESS`, authority Chairman Vyc, titled
*THYLORA Safe + Serviceable Vehicle Architecture*. It is **not** `FORWARD_REFERENCE_UNDEFINED`.

Its four recorded principles are the spine of sections A–D above:

> systems may operate independently but remain mutually observable and supportable ·
> failure isolation without total vehicle blindness ·
> repair access designed before styling freeze ·
> common service items reachable with minimal unrelated disassembly

Connected this run to `ER-AUTO-BS-009`, to `ER-AUTO-GAP-005`, and to the C&W Design Notebook product.
Its status is unchanged — connecting a program is not promoting it.

## H. Class taxonomy — reconciled, nothing deleted

The duplication is **inside one table**, not across two. `er_automotive_vehicle_class_matrix` holds
two generations that never got merged: six `AUTO-CLASS-*` rows whose `price_position` is an object,
and six `VEH-*-00N` rows whose `price_position` is an array. Same column, two shapes.

`er_automotive_vehicle_deep_taxonomy` is **not** a third duplicate — it is the subtype layer keyed to
the `VEH-*` generation, which is the evidence that `VEH-*` is the live one.

Recorded in `er_automotive_taxonomy_reconciliation`. Four clean supersessions. **Two are not clean and
were deliberately not merged:**

- **`AUTO-CLASS-MOTORSPORT` → coverage gap.** It covers circuit, drag, rally, drift, endurance and
  monster. The only `VEH-*` candidate, `VEH-MONSTER-004`, covers monster/exhibition alone. Superseding
  would silently delete five motorsport disciplines from the taxonomy. It stays live until a
  `VEH-MOTORSPORT` class exists.
- **`AUTO-CLASS-ULTRA` → split.** Ultra-luxury is a price tier on `VEH-PASS-001` and royal/family is a
  use case on `VEH-SPECIAL-005`; neither holds ceremonial or chauffeured. This is on
  `ER-AUTO-BS-009`'s critical path, because that build sheet's class is `royal_family_grand_utility`
  and **no `VEH-*` code currently names it.**

All 12 original rows are untouched.

## F. CNW → C&W identifier map

`er_automotive_identifier_map`, 8 rows, **zero renames performed.**

`AUTO-NAME-001` is LOCKED: voice transcription substituted N for the ampersand, and C&W is the only
correct public form. But seven technical identifiers still contain the string `CNW`, and they are
referenced as values inside `er_automotive_gap_registry.applicable_programs`. Renaming them in place
would silently break those references — which is exactly the kind of quiet damage the naming
correction was created to prevent.

So they are marked `rename_safe = false` and carry a canonical display form instead. Public surfaces
resolve through `canonical_display`; the legacy strings stay as inert keys.

| Legacy key | Public display |
| --- | --- |
| `CNW` | **C&W** |
| `CNW-CONCEPT-001/002/003/004/007` | C&W Concept 001 / 002 / 003 / 004 / 007 |
| `CNW-SUBMERGE-001` | C&W Submergence Program 001 |
| `CNW-ROADSAFE-001` | C&W Road Safety Program 001 |

## J / K — held deliberately

**DGM and MAH′** were not assigned meanings. They appear in the material without definitions, and a
plausible-sounding expansion would become canon the moment it was written down.

**No name was invented to clear a validation check.** `ER-AUTO-BS-009` remains
`DIMENSIONAL_PACKAGE_REQUIRED` with `royal_family_grand_utility` unnamed in the `VEH-*` generation.
That gap is reported, not papered over.
