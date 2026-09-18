# THYLORA world castle — survey frame and topology

Workroom: `WR-WORLD-CASTLE-001`
Lane: `CASTLE_ROYAL`
Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
Date: 2026-09-18

This document states the **rules** by which the castle resolves as a coordinate
object. It states almost no **values**, because almost none are known. Separating
the two is the point: a rule can be canon before a measurement exists, and a
measurement may never be invented to make a rule look finished.

---

## 1 · Evidence position

Four sources were searched. Two are readable, one is Chairman-attested, one is
unreadable.

| Source | What it is | State |
|---|---|---|
| `S1` | `app/thylora-forward.js`, `app/build8-visual-floor.js`, `app/index-v8.html` in `vyc2st-ctrl/thylora-executive-dashboard@ea21b42` | **READABLE.** Three independent surfaces describe the approved reference as a **castle, cart and workers** scene named **THEHANDLUH**, "Chairman-supplied", "approved as the primary visual direction for this room". |
| `S2` | `tests/chairman-dash-render.html` in the same repository | **READABLE.** Carries the `WR-CASTLE-001` registry row: lane `CASTLE_ROYAL`, title "Family Castle + Royal House Completion", state `ACTIVE`, blockers *"exact world sites/names unresolved"*, *"person-by-person title matrix incomplete"*, *"castle floor plans not complete"*. |
| `S3` | The Chairman directive opening this workroom | **ATTESTED.** States that a room is visible in the upper left of the castle reference. |
| `S4` | `app/assets/thylora-handluh-castle.jpg` in the same repository | **UNREADABLE.** See below. |
| `S5` | `db/rae-link/0001_identity_channels.sql`, `rae-link/lib/rights.js`, `docs/RAE-LINK-ARCHITECTURE.md`, `public-site/index.html`, `app/sports-betting.html` | **READABLE.** The world is named **EdereAriah** and is held distinct from Earth. |

### S4 — the castle reference is not readable

The Chairman castle reference is a structurally truncated JPEG:

```
bytes            8144
markers found    SOI (FFD8), APP0, DQT, DQT
marker desync    byte 158
SOF              absent   (no frame header, so no dimensions)
SOS              absent   (no scan, so no image data)
EOI              absent   (file ends FF 64)
sha256           6f0fd858e7649e8079e6572d53b94306a2c202fc12fbcf860d15c93d907d689c
history          one version only, commit 96a8a1b — no earlier intact copy exists
```

No decoder can open it, and no geometry can be taken from it. Network egress to
both the live backend (`jvsdxhrfhtlgaknhjxlz.supabase.co`) and the deployed host
(`thylora-public-world.vercel.app`) is denied by policy in the authoring
environment, so no second copy was reachable either.

**This is the single fact that holds the survey.** Everything downstream of a
measured dimension is UNKNOWN because of it.

---

## 2 · Master coordinate system

Emitted state: `world/data/master-coordinate-system.json`
Reference implementation: `world/lib/frame.js`

### Units

| Quantity | Unit | Storage |
|---|---|---|
| Linear | millimetre | signed integer (`bigint`) |
| Angular | millidegree | signed integer (`integer`), normalised into `[0, 360000)` |

No floating point appears in stored geometry, for the same reason RAE Link stores
money in integer minor units: a float that is written, read and re-written
drifts, and drift in a survey frame is silent loss of established geometry, which
the non-regression floor forbids.

### Parent hierarchy

```
THYW-FRAME-PLANET-EDEREARIAH   PLANET      name VERIFIED; figure, radius, datum UNKNOWN
  └─ THYW-FRAME-REGION-UNKNOWN REGION      UNKNOWN — "exact world sites/names unresolved"
       └─ THYW-FRAME-SITE-001  SITE        UNKNOWN
            └─ THYW-FRAME-CASTLE-001       COMPLEX — the master survey frame
                 └─ …-STOREY-UPPER  STOREY — implied by the upper-left room
                      └─ structure / element frames
```

Every transform in this tree is UNKNOWN. The **shape** of the tree is canon; the
**placements** are not.

### Origin — `THYW-ORIGIN-CASTLE-001`

| | Rule | Value |
|---|---|---|
| Horizontal origin | Midpoint of the **outer face of the main gate threshold** | UNKNOWN |
| Vertical origin | `THYW-DATUM-CASTLE-001` — finished ground level of the principal courtyard immediately inside that gate | UNKNOWN |
| `+Y` (grid north) | The inward horizontal normal of that same gate opening | UNKNOWN |
| `+X` (grid east) | 90° clockwise from `+Y` in plan | — |
| `+Z` | Up, opposite local gravity | — |
| Handedness | Right-handed, Z-up | — |
| Declination to true north | — | UNKNOWN |
| Datum offset to planetary sea level | — | UNKNOWN |

The rule is **fully determined**: the moment the gate is located in any survey
source, the origin and all three axes resolve with no further choice and no
drift. That is why it is canon while every value under it is UNKNOWN.

`thyw_origin_rules` refuses to be marked `resolved` without the point it resolved
to, so this cannot be quietly upgraded.

### The interworld barrier in coordinates

THYLORA already holds Earth and EdereAriah apart at the data layer, through the
`EARTH_REAL` / `WORLD_SIMULATED` split in `rael_channel_class`. The frame
hierarchy holds the same line in geometry: **a frame may only be expressed in one
of its own ancestors.** There is no coordinate path from the castle frame to
Earth, or to a sibling scene in another period, so nothing can bleed into this
scene by being placed relative to it. `thyw_world_frames` enforces it — exactly
the `PLANET` frames are roots, and every other frame must hang off a named world.

---

## 3 · Architectural topology

Reference implementation: `world/lib/registry.js`
Emitted state: `world/data/castle-001.state.json`

Every wall, masonry unit, beam, roof, window, door, stair, ledge, gate, lantern,
room, corridor, tower and arch resolves to one row carrying eleven facets:

`element_id` · `parent_id` · world coordinates · local coordinates ·
`dimensions` · `orientation` · `material` · `tolerance` · `build_phase` ·
`version` · `provenance`

A row may be created with UNKNOWN measurements. It may **not** be created without
provenance, because a row without provenance is indistinguishable from an
invention. And a row may not be marked `VERIFIED` against an `ABSENT` or
unreadable source — the constraint that stops `S4` from being treated as survey
evidence.

### What is registered now

| ID | Class | Evidence | Basis |
|---|---|---|---|
| `THYW-EL-CASTLE-001` | TOWER | **VERIFIED** | `S1` — a castle is in the approved scene |
| `THYW-EL-CART-001` | CART | **VERIFIED** | `S1` — a cart is in the approved scene |
| `THYW-EL-GATE-001` | GATE | INFERRED | A wheeled vehicle at a castle requires a wheeled entry |
| `THYW-EL-WALL-UL-001` | WALL | INFERRED | An opening must be cut in something |
| `THYW-ROOM-UL-001` | ROOM | **VERIFIED** | `S3` — the Chairman states the room is visible |
| `THYW-OPEN-UL-001` | WINDOW | **VERIFIED** | `S3` — the opening that makes it visible |

Four elements, one room, one opening. Not one of them carries a dimension or a
placement. That is the honest size of the verified castle today.

### The window / room rule

```
VISIBLE WINDOW => REAL ROOM
VISIBLE DOOR   => REAL CONNECTED SPACE
```

Enforced three times over: by `audit()` in `world/lib/registry.js`, by
`thyw_audit_openings()` in the database, and by the check constraints
`thyw_opening_has_an_inner_space` and `thyw_door_or_gate_connects_two_spaces`,
which make a spaceless opening **uncommittable**. A castle with painted windows
cannot be stored in this schema.

`THYW-ROOM-UL-001` exists because of this rule and nothing else.

### Masonry

Reference implementation: `world/lib/masonry.js`

Individual masonry may be stored explicitly (`thyw_masonry_instances`) or
generated procedurally (`thyw_masonry_specs`). A procedural spec records seed,
unit dimensions, bond pattern, mortar dimensions, material, deformation and
weathering rules, placement bounds, build phase and crew attribution class.

**The same seed and spec reproduce the same wall exactly.** The PRNG is
splitmix64 over `BigInt`; every unit's variation is drawn from a stream keyed by
`(seed, course_index, unit_index, channel)`, so a unit's jitter does not depend
on how many units were generated before it. A wall generated in one pass is
identical to the same wall generated course by course, and the test suite asserts
both, plus a stable `wallFingerprint` that a later regeneration can be checked
against rather than trusted.

A spec missing any number the generator needs returns `HELD_UNKNOWN` and
generates nothing. It does not fall back to a default wall, because a default
wall is invented canon. `thyw_masonry_fingerprint_needs_a_resolvable_spec`
enforces the same thing in the database.

---

## 4 · Movement and access

Reference implementation: `world/lib/routes.js`
Emitted state: `world/data/access-matrix.json`

Three verdicts only:

| Verdict | Meaning |
|---|---|
| `PASS` | Every constraint checked against a known value and satisfied |
| `FAIL` | At least one constraint violated by a known value — the route does not exist physically |
| `INDETERMINATE` | No constraint violated, but at least one required value is UNKNOWN — **the route is NOT established** |

`INDETERMINATE` is not a soft pass. A cart route that cannot be proved is not a
cart route. Checked per segment: clear width, clear height, turning radius,
grade, surface load capacity, gate clear width, gate clear height, gate threshold
rise, and step rise.

**The one result that needs no measurement:** a flight of stairs — or a single
step — on a wheeled traveller's path is `FAIL`, regardless of every other
dimension. `thyw_traveller_profiles` carries the same rule as a check constraint
(`thyw_wheeled_is_not_step_capable`) so it cannot be configured away.

Current matrix: every traveller class over both modelled routes returns
`INDETERMINATE` or `FAIL`. **No route is established.** The cart route to the
upper room returns `FAIL` on `STAIR_ON_WHEELED_ROUTE`; every other verdict is
`INDETERMINATE` because every dimensional requirement depends on the unresolved
period.

---

## 5 · Non-regression

Reference implementation: `world/lib/nonregression.js` ·
database: `thyw_check_non_regression()`

```
F_(n+1) >= F_n
```

Seven protected facets: `GEOMETRY`, `IDENTITY`, `TOPOLOGY`, `DIMENSIONS`,
`ROOM_ASSIGNMENT`, `ROUTES`, `PROVENANCE`.

- Filling in an UNKNOWN is **never** a regression.
- A KNOWN value becoming UNKNOWN **always** is.
- A KNOWN value silently changing **always** is.
- Adding objects is a gain, recorded as one.
- Downgrading a `VERIFIED` object is a provenance regression.

A loss is permitted only by a `thyw_supersessions` row naming **that object and
that facet**, issued by the Chairman and citing a directive. A `DIMENSIONS`
supersession does not excuse a `TOPOLOGY` loss — the test suite asserts that
specifically.

`thyw_world_versions` and `thyw_element_versions` refuse `UPDATE` and `DELETE` by
trigger, so the floor can be checked against what was actually there.

Version 1, `THYW-WORLD-V1`, is recorded in `world/data/world-versions.json`. It
is the floor no later version may fall below.
