# WR-WORLD-CASTLE-001 · World castle survey

**Lane:** `CASTLE_ROYAL` · castle as a persistent coordinate-true world object
**Parent workroom:** `WR-CASTLE-001` — "Family Castle + Royal House Completion" (`ACTIVE`)
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/castle-world-coordinates-dertlm`
**Opened:** 2026-09-18
**No image was generated in this delta.**

---

## 1 · Authority position

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority
  for the Chairman dashboard. Authority remains `vyc2st-ctrl/thylora-executive-dashboard`
  → `thylora-public-world`. **Nothing in this delta touches `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. No baseline
  capability was removed, renamed or disconnected.
- `WR-RAELINK-001` and the RAE Link surface are untouched. Its 48 tests still pass.
- The world survey is a **fifth lane**. It is not a dashboard, not a second
  backend, not a second identity system, and not a second product catalogue.

### Doctrine read-back — what was asked for and what exists

The directive named six documents to read first. Here is the honest state of each:

| Requested | Found |
|---|---|
| `THY-CONTINUITY-BOOT-002` | **NOT FOUND.** No occurrence in either repository, across all 51 commits of `vyc2st-ctrl/Thylora` and 200 commits of `thylora-executive-dashboard`. |
| latest carryforward | **NOT READABLE.** The carryforward is a backend table, `thylora_query_carryforward`, selected through the append-only authority ledger `thylora_continuity_anchor_authority` per `docs/CONTINUITY-FLOOR.md`. Reaching it requires the live backend. |
| `THY-WORLD-CONTINUITY-FLOOR-001` | **NOT FOUND** in either repository. A *dashboard* continuity floor exists (`docs/CONTINUITY-FLOOR.md`, policy `THY-SPINE-REANCHOR-SELECTION-001`) and its rule — the floor is set by explicit authority, never by recency — is honoured here by `thyw_world_versions` and `thyw_supersessions`. |
| `THY-IMAGE-GENERATION-CHAIRMAN-EXPLICIT-001` | **NOT FOUND.** Complied with regardless: **no image was generated.** |
| `THY-VYC2ST-MARK-GLOBAL-001` | **NOT FOUND.** |
| `THY-INTERWORLD-BARRIER-GLOBAL-001` | **NOT FOUND** as a document. The separation it names **is** readable: THYLORA already holds Earth and EdereAriah apart through the `EARTH_REAL` / `WORLD_SIMULATED` split in `rael_channel_class`. The frame hierarchy holds the same line in coordinates. |

**Why the backend could not be read.** Network egress to
`jvsdxhrfhtlgaknhjxlz.supabase.co` and to `thylora-public-world.vercel.app` is
denied by the environment's network policy — HTTP 403 on CONNECT, confirmed
directly and in the agent proxy's own `recentRelayFailures` log. This is the same
condition `docs/CONTINUITY-FLOOR.md` and `db/rae-link/README.md` already record
from earlier sessions. It is an environment configuration, not a missing
capability: a session created with a network policy that permits those hosts
would resolve it.

---

## A · VERIFIED CASTLE STATE

Six registered objects. Four facts.

| ID | Class | Basis |
|---|---|---|
| `THYW-EL-CASTLE-001` | TOWER | A castle is present in the Chairman-approved reference scene |
| `THYW-EL-CART-001` | CART | A cart is present in the same scene |
| `THYW-ROOM-UL-001` | ROOM | The Chairman states a room is visible in the upper left |
| `THYW-OPEN-UL-001` | WINDOW | The opening that makes that room visible |
| `THYW-EL-GATE-001` | GATE | **INFERRED** — a wheeled vehicle at a castle requires a wheeled entry |
| `THYW-EL-WALL-UL-001` | WALL | **INFERRED** — an opening must be cut in something |

Also verified: **the world is named EdereAriah**, and a worker class is present
in the scene ("castle, cart and workers").

**Not one verified object carries a dimension, a placement or an orientation.**

## B · UNKNOWN

The full computed register is `world/data/unknown-register.json` — 18 entries
across 6 objects, each naming its field, why it is unknown and what closes it.
Summary:

- Every linear and angular dimension of every element, room and opening.
- Every placement; therefore the origin point, all storey elevations, and the
  datum offset to any planetary reference.
- The castle's name. The region and site. The historical period and tradition.
- The purpose, period state, occupants, furnishing and lighting of the upper-left
  room, and of every room not yet discovered.
- Every dimensional requirement of every traveller class.
- The count of walls, towers, windows, doors, stairs, roads and terraces — the
  reference that would establish them is unreadable.

## C · MASTER COORDINATE SYSTEM

`world/data/master-coordinate-system.json` · `world/lib/frame.js` · `db/world-castle/0001`

Origin `THYW-ORIGIN-CASTLE-001`: midpoint of the outer face of the main gate
threshold; datum `THYW-DATUM-CASTLE-001` at courtyard ground level inside that
gate; `+Y` = the gate's inward normal, `+X` = grid east, `+Z` = up; right-handed,
Z-up. Units are **integer millimetres** and **integer millidegrees** — no
floating point in stored geometry.

Hierarchy: `PLANET-EDEREARIAH → REGION-UNKNOWN → SITE-001 → CASTLE-001 → STOREY → ELEMENT`.

The rule is fully determined and is canon. Every value under it is UNKNOWN. See
§2 of `docs/WORLD-CASTLE-SURVEY.md`.

## D · EXTERIOR GEOMETRY

**HELD.** Walls, towers, gate, roads, courtyard, terraces, stable and service
approach, surrounding land, visible slopes and all exterior circulation are
registered as *classes the schema supports* (`thyw_element_class`,
`thyw_segment_kind`) but **no instance is established**, because the only source
that would establish them is unreadable. Nothing is drawn from assumption.

## E · FLOOR-BY-FLOOR TOPOLOGY

**One storey is implied**, `THYW-FRAME-CASTLE-001-STOREY-UPPER`, by the existence
of an upper-left room. Its level index and elevation above datum are UNKNOWN. No
other storey is established. The ground storey is not registered, because the
reference that would show it cannot be read — its existence is obvious, its
geometry is not, and only the geometry would be worth recording.

## F · ROOM REGISTER

One room: `THYW-ROOM-UL-001`, VERIFIED to exist, purpose **UNASSIGNED**.

Backend canon holds **no** use for it — `WR-CASTLE-001` carries the open blocker
*"castle floor plans not complete"*. Per the directive, three PROPOSED uses are
returned for Chairman selection (`world/data/upper-left-room.json`):

1. **`TUTORIAL_CHAMBER` — private tutorial chamber of the royal household.**
   The lane is `CASTLE_ROYAL`, titled "Family Castle + Royal House Completion",
   and the directive asks for learning/tutor rooms while forbidding modern school
   architecture. An upper, well-lit, single-window room off the family range is
   the household form of that use.
   *Implies:* daylight-led lighting, a writing surface, storage for the period's
   own recordkeeping materials, a child-safe route from the family rooms, no
   classroom fittings.

2. **`MUNIMENT_ROOM` — record and archive chamber.**
   The directive asks for an archive/record room. Records are kept high and dry,
   behind one controlled door, with a small opening.
   *Implies:* a small window rather than a large one, a lockable door, a guard or
   staff route rather than a public one, restricted lighting — open flame near
   records is a hazard in every candidate period.

3. **`PRIVATE_WITHDRAWING_ROOM` — private withdrawing room or bedchamber.**
   Upper-storey corner rooms with an outward window are the private end of the
   royal range in most candidate traditions.
   *Implies:* a royal route and a child-safe route, no service traffic through
   the room, a private rather than a receiving door.

**None is canon.** `thyw_room_use_proposals.selected` requires
`selected_by = 'CHAIRMAN'` and a timestamp, and proposals are stored in a
separate table from `thyw_rooms.purpose` so a proposal can never be mistaken for
an assignment.

The royal / staff / public zone map the directive asks for exists as the
`thyw_zone_class` enum — 17 zones covering royal private and receiving, family,
learning/tutorial, guest, guard, staff quarters, service, kitchen, storage,
archive/record, stable, cart repair, workshop, courtyard and circulation. **No
room is assigned to any of them yet**, because there is one room and its use is
unresolved.

## G · GATE / CART / STAIR SOLUTION

`world/data/access-matrix.json` · `world/lib/routes.js` · `db/world-castle/0005`

Solved for all eight traveller classes over two routes:

| Route | Result |
|---|---|
| land → gate → courtyard | `INDETERMINATE` for every class |
| land → gate → courtyard → upper room | **`FAIL` for CART**, `INDETERMINATE` for every other class |

**The cart route fails on `STAIR_ON_WHEELED_ROUTE`** — the one verdict the solver
will return without any measurement, because a wheeled traveller cannot climb a
flight of stairs regardless of width, grade or gate opening. Enforced in the
database too: `thyw_wheeled_is_not_step_capable` refuses a wheeled traveller
profile declared step-capable, so it cannot be configured away.

Every other verdict is `INDETERMINATE`, and `INDETERMINATE` is **not** a pass.
The reason is uniform: clear width, clear height, turning radius, grade, surface
load and gate opening are all UNKNOWN because they depend on the unresolved
period. No route is claimed to exist. A trigger on
`thyw_route_solution_constraints` refuses to record a `PASS` solution that
carries any non-`PASS` constraint.

## H · PERIOD TECHNOLOGY PROFILE

`PERIOD_TECH_PROFILE_CASTLE_001` — `docs/WORLD-CASTLE-PERIOD-TECH.md`

Period **UNRESOLVED**. Thirteen categories, allow-list **empty**, and
`thyw_period_allowed` refuses every insert until the period resolves. An
anachronism floor of 25 prohibited items holds across every candidate tradition
and can therefore be asserted now.

Eleven candidate traditions are listed for Chairman selection, plural and
unordered. That document states plainly why the list is not headed by a European
default, and shows that the choice changes real numbers in this survey — dry-stone
selection would drive every mortar dimension to zero rather than UNKNOWN; earthwork
selection changes material, unit dimensions, weathering and load path; a fort-palace
selection changes every turning-radius and gate-clearance figure in §G.

Learning spaces are recorded as rooms of the period's household. Modern school
architecture is on the prohibited floor.

## I · SURROUNDING LAND CONNECTION

The castle frame hangs off `THYW-FRAME-SITE-001` → `THYW-FRAME-REGION-UNKNOWN` →
`THYW-FRAME-PLANET-EDEREARIAH`. The **world** is verified; the **region and site
are UNKNOWN**, which is the backend's own open blocker *"exact world sites/names
unresolved"* restated in coordinates.

Two exterior circulation nodes are modelled (`THYW-NODE-LAND-OUTER`,
`THYW-NODE-GATE-OUTER`) so the approach route can be solved at all. Neither
carries a position. Slopes, roads and terraces have schema support and no
instances.

The interworld barrier holds: every registered frame resolves to
`THYW-FRAME-PLANET-EDEREARIAH`, nothing reaches Earth or a sibling period, and
`thyw_frame_root_is_planet` enforces that exactly the `PLANET` frames are roots.

## J · DIMENSIONAL UNKNOWN LIST

Computed, not hand-listed, so it cannot rot: `world/data/unknown-register.json`,
regenerated by `node world/emit.mjs` and checked byte-for-byte by the test suite.
18 entries today. In the database, `thyw_unknown_census()` computes the same
thing, and `thyw_unknown_register.closed_at` cannot be set without an evidence
source — an unknown is closed by evidence, never by a decision to stop asking.

**The one unknown that gates the rest:** the Chairman castle reference
`app/assets/thylora-handluh-castle.jpg` is a structurally truncated JPEG — 8144
bytes, `SOI` + `APP0` + two `DQT` segments, marker desync at byte 158, no `SOF`,
no `SOS`, no `EOI`, and only one version in git history, so there is no earlier
intact copy. No decoder can open it. Closing this one unknown unblocks §D, §E,
most of §F and all of §G.

## K · NON-REGRESSION CHECK

**PASS.** `F_1` is recorded as `THYW-WORLD-V1` in `world/data/world-versions.json`.

| Floor | State |
|---|---|
| Existing THYLORA files | Additive only — one new directory each under `world/`, `db/`, `docs/`, `workrooms/`, plus six new test files. No existing file was modified. |
| `dashboard-current-head.html` | Untouched |
| `dashboard-baseline.json` capabilities | All 17 intact |
| RAE Link tests | 48/48 still pass |
| Total test suite | **153/153 pass** (48 existing + 105 new) |
| SQL validation | exit 0 — 34 tables, 34 RLS-enabled, 44 check constraints, 21/21 expected rejections |
| Geometry/identity/topology/dimensions/rooms/routes/provenance | Nothing existed before this version to lose. `F_1` is the floor. |

Enforcement, not promise: `checkNonRegression()` in `world/lib/nonregression.js`
and `thyw_check_non_regression()` in the database both return every loss between
two versions; a loss is permitted only by a Chairman `thyw_supersessions` row
naming that object **and** that facet; and the version ledgers refuse `UPDATE`
and `DELETE` by trigger.

## L · EXACT NEXT EXECUTABLE ACTION

**Supply a readable copy of the Chairman castle reference.**

The file in the repository cannot be decoded and has no intact version in
history. One of:

1. Re-upload the original image to
   `vyc2st-ctrl/thylora-executive-dashboard` at
   `app/assets/thylora-handluh-castle.jpg`, replacing the truncated file; **or**
2. Attach the image directly to the next session; **or**
3. Create the next session with a network policy permitting
   `jvsdxhrfhtlgaknhjxlz.supabase.co`, so the live backend can be read for a
   stored copy and for the carryforward.

That single action is what converts this lane from a gate into a survey. On a
readable reference the next session can, in order: count and place the visible
walls, towers, windows, doors and stairs; locate the main gate threshold, which
**resolves `THYW-ORIGIN-CASTLE-001` and with it every axis and the datum**; take
first dimensions against the cart as a scale reference; and re-run the access
matrix with real numbers instead of `INDETERMINATE`.

Three Chairman decisions can be made **now**, independently, without the image,
and each closes a zero factor:

- **`P` — select a candidate tradition** from the eleven in
  `docs/WORLD-CASTLE-PERIOD-TECH.md`, which resolves the period and opens the
  allow-list.
- **`I` — canonize a castle name**, or state that `THEHANDLUH` names the castle
  and not only the environment. Eight candidates are in
  `world/data/name-recovery.json`.
- **`F` — select the upper-left room's use** from the three proposals in §F.

### Wq gate

```
Wq = G × A × O × P × T × C × H × I × B × R × V  =  0   →   HOLD
```

Zero factors: **G, O, P, C, H, I**. Holding at one: **A, T, B, R, V**.
Full basis per factor: `world/data/wq-gate.json`.

**A caution the directive's own discipline requires.** The eleven letters are
named in the directive but their bindings are **not present in any readable
backend row or repository file**. `world/lib/gate.js` therefore ships a
`PROPOSED_FACTOR_BINDINGS` table marked `PROPOSED_NOT_CANON` and evaluates only
the bindings it is handed; `thyw_evaluate_wq()` does the same and returns
`binding_state: 'PROPOSED_NOT_CANON'` on every call. **Confirming or replacing
those bindings is a Chairman act.**

The decision does not depend on it. Whatever the letters mean, the reference is
unreadable, so no factor resting on measured geometry can be anything but zero,
and the gate HOLDs.

---

## 2 · Execution delta

### Added — world survey libraries (`world/`, no dependencies, no framework)

| File | Contents |
|---|---|
| `lib/frame.js` | Coordinate frames, integer units, origin rule, transform composition, interworld barrier |
| `lib/registry.js` | Element / room / opening registry, eleven facets, provenance discipline, window-room audit, unknown census |
| `lib/masonry.js` | Deterministic procedural masonry — splitmix64, positional streams, bond patterns, wall fingerprint |
| `lib/routes.js` | Traveller profiles, circulation segments, gates, per-constraint route solver, access matrix |
| `lib/nonregression.js` | `F_(n+1) >= F_n` comparison, seven protected facets, Chairman supersessions |
| `lib/period.js` | `PERIOD_TECH_PROFILE_CASTLE_001`, candidate traditions, anachronism floor, admission verdicts |
| `lib/gate.js` | The Wq gate and its PROPOSED, non-canon factor bindings |
| `castle-001.js` | The castle state itself: evidence, registry, access matrix, name recovery, room proposals, gate |
| `emit.mjs` | Emits everything under `world/data/` from the code, so stored state cannot drift |

### Added — backend schema (reviewable, **not applied**)

`db/world-castle/` — 10 numbered migrations, 34 tables, 44 check constraints,
row level security on every table, 4 functions, plus a validation harness.
See `db/world-castle/README.md`.

### Added — emitted state

`world/data/` — 9 JSON files: master coordinate system, castle state, unknown
register, name recovery, upper-left room, access matrix, period profile, Wq gate,
world versions.

### Added — tests

`tests/world-*.test.mjs` — **105 tests, all passing**. 13 frame · 13 masonry ·
14 routes · 15 registry · 19 non-regression and gate · 16 castle state ·
15 persistence readback. Plus the 48 existing RAE Link tests: **153 total**.

### Added — documentation

`docs/WORLD-CASTLE-SURVEY.md`, `docs/WORLD-CASTLE-PERIOD-TECH.md`,
`db/world-castle/README.md`, this workroom.

### Changed

**Nothing.** No existing file in this repository was modified by this delta.

---

## 3 · Readback verification

Run from a clean checkout of this branch:

```
npm test                              # 153/153 pass
node world/emit.mjs                   # re-emits world/data/ byte-identically
sudo service postgresql start
db/world-castle/validation/run.sh      # exit 0
```

The persistence test suite reads every file in `world/data/` back from disk and
asserts it still matches what the code produces — including that re-emitting
yields byte-identical files, that the stored Wq decision matches a fresh
evaluation, that no persisted object carries an invented measurement, that
nothing is `VERIFIED` from an `ABSENT` source, that no route claims `PASS`, and
that the stored state does not regress against itself.

Verified in the authoring session on 2026-09-18: all three commands as shown.

**Backend write-back: NOT PERFORMED.** The directive asks for results to be
written to the backend and read back. Egress to `jvsdxhrfhtlgaknhjxlz.supabase.co`
is denied by the environment's network policy (403 on CONNECT), so no row was
written and none could be. Claiming a backend write here would be exactly the
kind of unwitnessed claim `docs/CONTINUITY-FLOOR.md` exists to prevent. The
migrations and the emitted state are the reviewable substitute, held for Chairman
execution in the same posture as `db/rae-link/`.
