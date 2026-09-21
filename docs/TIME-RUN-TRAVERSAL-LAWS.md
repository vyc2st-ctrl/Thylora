# Time Run · Core traversal laws

**Workroom:** WR-TIMERUN-581 · **Directive:** THY-WORK-TIME-RUN-LIVE-TRAVERSAL-581
**Executable form:** `time-run/lib/traversal.js`, `time-run/lib/eras.js`
**Schema form:** `db/time-run/0001_eras_places.sql`, `0002_traversal_encounter.sql`

## Binding correction

Time Run is **not a historical viewer**. The eras are **living**. A traveler
**physically enters** another era, and the people there are **living their own
lives**. Anything that renders an era as a recording, replay, archive walk or
observer mode is a regression and is refused at the data layer.

## The eight laws

| Law | Statement |
|---|---|
| **TR-L1** | **LIVING ERA.** Every era is a present tense for the people inside it. No era may be rendered as a recording, replay, archive walk-through or viewer surface. |
| **TR-L2** | **PHYSICAL PRESENCE.** A traveler bodily enters the destination era and is present to the people there. |
| **TR-L3** | **BIDIRECTIONAL.** Later→earlier and earlier→later are both real traversals. Neither is the default direction. |
| **TR-L4** | **DESTINATION CAPABILITY ENVELOPE.** Technology is governed by the destination era, not the origin era. |
| **TR-L5** | **NO TIME-TECHNOLOGY LEAK.** Later-era capability may not function inside an earlier era, and may not be carried back out of a later era into an earlier one. |
| **TR-L6** | **PERSON LAW.** People met are persons living their own lives, never props, scenery or generated extras. |
| **TR-L7** | **RECORD LAW.** Every traversal produces an encounter contract. An unrecorded traversal is not a THYLORA event. |
| **TR-L8** | **PROVENANCE LAW.** Every encounter contract carries origin, serial and provenance, and can be read back. |

## Bidirectionality

Both directions are first-class. A person from **1922 may visit the current era**,
experience current technology, and **return to 1922** — and the envelope applies
again on the way home. What they saw is theirs. What they saw is not portable as
working technology.

## The destination capability envelope

Capability tiers are **ordinal governance numbers, not physical claims**. A higher
tier never means a better era or a better people. Tiers exist for one purpose: to
decide what functions and what does not at a boundary.

| Era | Ceiling | Computation | Transport | Recording |
|---|---|---|---|---|
| Historic Egypt | 12 | 6 | 12 | 12 |
| 1700s | 30 | 12 | 28 | 26 |
| 1922 | 55 | 20 | 55 | 48 |
| Later motor eras | 66 | 35 | 68 | 60 |
| Current era | 80 | 80 | 78 | 80 |

Five arrival states, and **no sixth**:

| State | Meaning |
|---|---|
| `NATIVE` | Within the destination envelope. Functions as itself. |
| `DEGRADED_TO_ERA` | Functions only at the destination ceiling. Later-era behaviour does not occur. |
| `INERT` | Physically present, does not function. **This is the default.** |
| `TRANSFORMED` | Re-rendered as the destination era equivalent of what it is for. |
| `REFUSED_ENTRY` | Does not cross the boundary at all. |

There is no `FUNCTIONING_ABOVE_CEILING`. `applyCapabilityEnvelope` cannot produce
one under any input, and `trun_carried_objects` carries a check constraint
(`trun_object_no_leak`) that refuses to store one.

## What a person keeps

Retained in **both directions**, always: **IDENTITY · MEMORY · KNOWLEDGE ·
EXPERIENCE**.
Not retained, ever: **TECHNOLOGICAL CAPABILITY**.

> **Knowledge is portable. Capability is not.**

## The knowledge guard

Knowledge crosses freely — that is TR-L4. The leak risk is not knowing, it is
**building**. `evaluateInstantiation` separates the two:

- A traveler may describe a later-era thing in an earlier era. The knowledge is
  retained and can be spoken.
- If the knowledge requires a capability tier above the era's ceiling, it returns
  `NOT_INSTANTIABLE_IN_ERA`: **it can be described, not built.**
- The database refuses to mark such knowledge buildable
  (`trun_disclosure_no_knowledge_leak`).

This is what stops "he told them how it worked" from becoming a technology leak
through the back door.

## What the database refuses

17 of 17 expect-reject cases in `db/time-run/validation/behaviour.sql` are
rejected by PostgreSQL 16, not by a comment. Among them: a non-living era, a
non-living stratum, a prohibited castle name, a name without derivation, a viewer
presence value, a stripped memory, a later-era device functioning in an earlier
era, an over-ceiling object marked `NATIVE`, an `INERT` object that still works,
knowledge marked buildable above the ceiling, a person met without the right to
decline, a record fulfilled before its departure exists, a branch opened under a
non-branching causality model, and a causality selection with nobody named.
