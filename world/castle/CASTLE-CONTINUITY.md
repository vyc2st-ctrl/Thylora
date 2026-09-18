# CASTLE CONTINUITY — RECOVERY RECORD

**Thread:** CASTLE CONTINUITY RECOVERY
**Opened:** 2026-09-18
**Status:** OPEN — base authority image not yet bound to this record
**Rule of record:** the original uploaded castle image is the base authority. This
file describes and constrains that image. It does not replace it, rebuild it,
decorate it, or extend it.

---

## 0 · Authority position

- The **image** is authority. This file is **derived record**, never source.
- Nothing in this file is canon until it is marked `VERIFIED` against the image.
- Anything not visible in the image is `UNKNOWN` or `DERIVED-LOGIC`.
  `DERIVED-LOGIC` means: forced by physics or circulation, not by observation.
- `DASHBOARD_AUTHORITY.md` is unaffected. This is world/continuity material only.
  It touches no dashboard, no backend schema, no deployed surface.

### Confidence ladder

| Tier | Meaning | May be drawn in a later image? |
|---|---|---|
| `VERIFIED` | Directly visible in the base authority image | Yes — must be drawn consistently |
| `DERIVED-LOGIC` | Not visible, but required by an observed feature | Yes — but must not contradict `VERIFIED` |
| `UNKNOWN` | Not observed, not forced | **No** — must be decided before it is drawn |
| `INVENTED` | — | Never. Not a permitted tier. |

---

## 1 · Castle name

**UNKNOWN.**

No castle name is verified in this backend. Searched: full repository tree and
full git history — no `castle` token, no image asset of any format, no world or
lore registry. No name is asserted here. A name is a decision (§7), not a recovery.

---

## 2 · Exterior scene breakdown

Filled only from direct observation of the base authority image. Every row is
`UNKNOWN` until the image is bound to this record.

| ID | Feature | State | Observation |
|---|---|---|---|
| `EXT-GATE-01` | Main gate | UNKNOWN | position, width, arch/square head, open or shut, portcullis or leaf doors |
| `EXT-STAIR-01` | Stairs | UNKNOWN | where they begin/end, rise direction, tread count, whether they cross the approach |
| `EXT-ROAD-01` | Road / approach | UNKNOWN | surface, width, where it meets the gate, grade |
| `EXT-WALK-01` | Wall walk / ledge | UNKNOWN | height, run, parapet, how it is reached |
| `EXT-WAGON-01` | Wagon | UNKNOWN | position, orientation, loaded/unloaded, hitched/unhitched |
| `EXT-PATH-01` | Cart path | UNKNOWN | derived from wagon position + gate + grade once all three are read |
| `EXT-ENTRY-*` | Visible entrances | UNKNOWN | every opening at ground level, counted, not summarized |
| `EXT-SERVICE-*` | Service areas | UNKNOWN | yard, stable, well, stores, midden — only if visibly indicated |

### Reading order (binding, so two readers get the same result)

1. Count openings before naming them.
2. Record the wagon's position **before** proposing any path — the wagon is
   evidence of a route that already works.
3. Read the ground grade last; it governs §4 and overrides aesthetic guesses.

---

## 3 · Room / window continuity

**Binding rule: if a visible window exists, the room must exist in the plan.**

No window may be drawn in a later image without a room behind it in this table,
and no room in this table may be contradicted by a later image.

| Room ID | Anchor | Level | State | Function |
|---|---|---|---|---|
| `RM-UL-01` | upper-left visible window | UNKNOWN | UNKNOWN | UNKNOWN |
| `RM-GATE-01` | gate-adjacent | ground | UNKNOWN | gate ward / porter — DERIVED-LOGIC once a gate is verified |
| `RM-WALK-01` | wall walk / ledge access | UNKNOWN | UNKNOWN | stair head or door serving `EXT-WALK-01` |
| `RM-SCHOOL-01` | learning room | UNKNOWN | UNKNOWN | candidate only — needs a verified window with usable daylight |
| `RM-STORE-01` | storage | UNKNOWN | UNKNOWN | must sit on the cart-reachable side (§4) |
| `RM-STAFF-01` | staff | UNKNOWN | UNKNOWN | — |
| `RM-GUARD-01` | guard | UNKNOWN | UNKNOWN | must have sight of `EXT-GATE-01` or `EXT-WALK-01` |
| `RM-SERVICE-01` | service / kitchen-adjacent | UNKNOWN | UNKNOWN | must be cart-reachable |

### Continuity rules for this table

- **R1 — Window/room parity.** One visible window ⇒ at least one room. Two windows
  on one level at one height with matching heads ⇒ same room *or* two rooms; that
  is a decision, recorded, never assumed.
- **R2 — Level parity.** A room's floor level is fixed by its window sill height
  relative to the gate threshold. Once set, it cannot drift between images.
- **R3 — No orphan interiors.** An interior image may not introduce a window that
  does not appear on the exterior authority.
- **R4 — Storage follows the cart.** Any room receiving goods must be reachable by
  `EXT-PATH-01` without crossing `EXT-STAIR-01`.
- **R5 — Daylight before function.** A learning room requires a verified window.
  No window, no school room — the function moves, the window does not.

---

## 4 · Movement logic

Movement is resolved as a graph, not as scenery. Each edge has a mode.

Modes: `FOOT`, `CART`, `HORSE`, `LOAD` (goods moved by hand off a stopped cart).

### Governing rules

- **M1 — A cart cannot climb stairs.** Where `EXT-STAIR-01` crosses the approach,
  the cart edge terminates. That terminus is a real place: the unloading point.
- **M2 — The wagon proves a route.** Wherever `EXT-WAGON-01` stands, a `CART` edge
  reaches it. That edge is `VERIFIED` by the wagon's presence alone.
- **M3 — Stairs force one of four resolutions.** Exactly one must be chosen:
  1. **Ramp** — a graded run parallel or adjacent to the stair.
  2. **Alternate gate** — a second, lower opening carts use instead.
  3. **Service lane** — a separate route skirting the stair entirely.
  4. **Split access** — cart stops at the stair foot; goods go up by `LOAD`+`FOOT`.
     This is the only resolution that requires no new exterior feature, and so the
     only one that can be adopted without amending the base authority image.
- **M4 — Foot and cart separate at the stair, not at the gate.** Pedestrians and
  carts share the road; they part where the grade breaks.
- **M5 — Every route terminates in a room.** A path that ends at a blank wall is a
  continuity error, not a mystery.

### Edge table

| Edge | From | To | Mode | State |
|---|---|---|---|---|
| `MV-01` | `EXT-ROAD-01` | `EXT-GATE-01` | CART, FOOT, HORSE | UNKNOWN |
| `MV-02` | `EXT-ROAD-01` | `EXT-WAGON-01` | CART | DERIVED-LOGIC (M2) |
| `MV-03` | cart terminus | `RM-STORE-01` | LOAD + FOOT | UNKNOWN |
| `MV-04` | `EXT-STAIR-01` head | `EXT-WALK-01` | FOOT | UNKNOWN |
| `MV-05` | `EXT-GATE-01` | `RM-GATE-01` | FOOT | DERIVED-LOGIC |

---

## 5 · World role logic

Roles are placed by the movement graph and the room table. A role with no room and
no edge does not exist in an image.

| Group | Anchored to | Requires | State |
|---|---|---|---|
| Guards | `EXT-GATE-01`, `EXT-WALK-01`, `RM-GUARD-01` | sight line to gate or walk | UNKNOWN |
| Staff | interior rooms, `RM-STAFF-01` | foot route not crossing the cart terminus at working hours | UNKNOWN |
| Maintenance | `EXT-WALK-01`, roof, wall faces | ledge access via `RM-WALK-01` | UNKNOWN |
| Horse / cart handlers | `EXT-WAGON-01`, cart terminus, service yard | `CART` edge + standing room + water | UNKNOWN |
| Teachers | `RM-SCHOOL-01` | verified daylight window (R5) | UNKNOWN |
| Learners — internal | `RM-SCHOOL-01` | interior route from residence rooms | UNKNOWN |
| Learners — public | gate → school route | a route from `EXT-GATE-01` to `RM-SCHOOL-01` that does not pass guard or service space | UNKNOWN |

**Role rule W1:** public learners are the hardest constraint in the castle. If the
only route from the gate to the school room passes the guard room or the service
yard, then the castle is *not* publicly taught — it is internally taught. That is a
decision the exterior makes for you; read it, don't overrule it.

---

## 6 · Image badging system

A castle image is a record. It carries identity without becoming a poster.
No banners. No ribbons. No logo lockups. No frames drawn over the scene.

### Placement grid

The image is divided into a 12-column grid with a margin gutter of 4% of the short
edge. All badging lives **in the gutter**, never over the scene.

| Element | Placement | Form | Rule |
|---|---|---|---|
| **Mark** | bottom-left gutter, baseline-aligned | single small glyph, monochrome, ≤ 2% of image height | one mark, never repeated, never over architecture |
| **Serial** | bottom-right gutter, same baseline as mark | `THY-CST-<seq>-<view>-<rev>` e.g. `THY-CST-0007-GATE-R2` | machine-first, human-legible; increments, never reused |
| **Title** | bottom-left gutter, immediately right of the mark | plain text, sentence case, no styling | names the *view*, not the mood: "gate approach from the road" |
| **Rights / provenance** | bottom edge, full-width gutter, smallest type in the system | holder · year · derivation ref | states what the image was derived from — ties back to base authority ID |
| **In-world brand** *(optional)* | inside the scene only | carved, painted, woven, or flown as the world would carry it | must be a physical object in the scene, casting the scene's light; if it cannot be a real object there, it is omitted |

### Badging rules

- **B1 — Gutter, not scene.** Identity never overlaps architecture, sky, or figures.
- **B2 — One baseline.** Mark, title and serial share a single baseline. Provenance
  sits below it. Nothing floats.
- **B3 — Derivation is named.** Every image records the authority it came from.
  A view derived from the base castle image cites that image's ID.
- **B4 — The in-world brand obeys the world.** It is subject to perspective, light,
  weather, and wear, or it is not used. It is never an overlay.
- **B5 — No decoration.** The badging system adds no border, corner, flourish,
  gradient, seal, or banner. If an element is not in this table, it is not drawn.

---

## 7 · Decisions required before any image generation

Ordered. Each blocks the ones after it.

1. **Bind the base authority image.** Supply the original castle image and give it
   a permanent ID (`THY-CST-0000-BASE-R1`). Everything in §2 and §3 stays `UNKNOWN`
   until this is done. **This is the hard block — nothing else can be resolved first.**
2. **Castle name.** Named, or deliberately left unnamed. If it is to be tied to a
   real lineage or historical record rather than invented, that sourcing is its own
   task and must be evidenced, not assumed.
3. **Window census.** Count and locate every visible window on the authority image.
   R1 converts that count directly into the room table.
4. **Stair/cart resolution (M3).** Choose ramp, alternate gate, service lane, or
   split access. Only *split access* requires no change to the base image.
5. **School room placement.** Which verified window is the learning room, and
   whether learners are public or internal (W1).
6. **Service side.** Which face of the castle carries goods. Fixes `RM-STORE-01`,
   `RM-SERVICE-01`, and the handlers' standing ground.
7. **Serial seed and rights holder.** The `<seq>` start value and the provenance
   holder string, so §6 can be applied to the first generated image.

Until 1–4 are answered, later images cannot be built logically — they can only be
built decoratively, which this thread exists to prevent.
