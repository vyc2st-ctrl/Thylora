# WR-WINDSOR-MIRROR-CASTLE · EdereAriah Castle

**Work code:** `THY-WORK-WINDSOR-MIRROR-CASTLE`
**Lane:** Castle · Royal Kitchen · Rosemary · Math · People in Time · History/Evidence
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Control surface:** `thylora-public-world`
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/windsor-castle-structure-rdjaum`
**Opened:** 2026-09-19

---

## 1 · Backend handshake

| Check | Result |
|---|---|
| Backend of record identified | **YES** — `thylora-dash` / `jvsdxhrfhtlgaknhjxlz`, from `dashboard-baseline.json` and `DASHBOARD_AUTHORITY.md` |
| Control surface identified | **YES** — `thylora-public-world`; deployment authority `vyc2st-ctrl/thylora-executive-dashboard` |
| Backend REST endpoint resolved | **YES** — `https://jvsdxhrfhtlgaknhjxlz.supabase.co` |
| Carryforward table resolved | **YES** — `thylora_query_carryforward`, ordered on `sequence_no` |
| Restart table resolved | **YES** — `restart_records` |
| **Current head READ** | **NO — BLOCKED** |
| **Sequence 529 and newer deltas READ** | **NO — BLOCKED** |
| **Sequence 528 living-structure audit findings READ** | **NO — BLOCKED** |
| Block cause | **Environment network policy.** Outbound CONNECT to `jvsdxhrfhtlgaknhjxlz.supabase.co:443` refused with **HTTP 403** at the agent proxy. Logged twice in the proxy's own failure register at 13:00:12Z. Not a credential fault, not a backend fault, not an RLS refusal — the connection never reached the backend |
| Audit repeated? | **NO** — instruction held. It was not repeated and it was also not used, because it could not be reached. **No line in this delta claims to carry its findings** |
| Primary-source fetch | **BLOCKED** on `rct.uk`, `royal.uk`, `historicengland.org.uk` (`EGRESS_BLOCKED`). Search indexing of those domains was permitted. All Windsor facts therefore carry **`S1` (snippet grade)**, none carry `S0` |

**Handshake verdict: PARTIAL.** Backend identified, addressed and query-resolved;
**not read.** Every field whose answer may already exist at ≤528 is marked
`528?` and held **unauthored** rather than filled with invention.

---

## 2 · QYRIS

> **Note on this block.** The canonical QYRIS field set is backend-defined and
> was **not readable this session**. This block is rendered in the
> observable-integrity form and is **to be reconciled against the canonical
> QYRIS schema on the next backend read.** It is not asserted to be the
> canonical form.

| Field | Value |
|---|---|
| **Work code** | `THY-WORK-WINDSOR-MIRROR-CASTLE` |
| **Head read** | **NO** — network policy, HTTP 403 on CONNECT |
| **Audit repeated** | **NO** |
| **Audit findings used** | **NO** — unreachable. Declared, not concealed |
| **Truth state** | Windsor mirror facts: **`S1`**, snippet-grade, primary pages unfetched. EdereAriah values: **OPEN**. No EdereAriah fact is asserted |
| **Fabrication check** | **ZERO fabricated names.** Zero invented companies, workshops, guilds, persons, dates, prices or place-names. `OPEN` used **339 times** across the delta in place of invention |
| **Mirror correction** | Malbork **superseded**. Windsor **locked**. Prior Malbork-mirror records flagged for re-cut; none found in this repository |
| **Authority check** | `DASHBOARD_AUTHORITY.md` honoured. This repository is **not** treated as deployment authority. Dashboard change is **additive source-side only** and requires merge-forward to `vyc2st-ctrl/thylora-executive-dashboard` and witness on `thylora-public-world` before it is called live |
| **Regression check** | `dashboard-baseline.json` floor `THY-DASH-FLOOR-20260823-001` re-verified before and after. **Zero capabilities lost.** Diff is **+77 lines, −0 lines.** Six baseline capabilities were **already** absent at `HEAD` before this run — pre-existing, reported in §7, not caused here |
| **Test state** | `npm test` — **48 passed, 0 failed** |
| **Scope check** | No image generated. No publication. **No new store product.** Thinking-lane content **not modified** — state recorded only. People in Time pilot **not rewritten, not opened, not reconstructed** |
| **Duplicate dashboard** | **NONE.** One panel added to the existing Our World section of the existing surface |
| **World completeness** | `C_w`(EdereAriah) = **0.0000**, held at zero by `I` = 0 |
| **Evidence state** | **DECLARED PARTIAL** |

---

## 3 · Execution delta

### Added — world record
| File | Contents |
|---|---|
| `world/castle/WINDSOR-MIRROR-SOURCES.md` | 44-entry source register, graded; retrieval conditions and gaps declared up front |
| `world/castle/EDEREARIAH-CASTLE-DOSSIER.md` | Mirror correction; Windsor structural spine at `S1`; full EdereAriah slot sheet across identity, builders, phases, additions, line, events, fires, restorations, current use, residents, staff, roads, grounds, suppliers |
| `world/castle/ROOM-BUILDING-MAP.md` | 3 wards, 11 Lower / 6 Middle / 34 Upper / 25 Service / 11 Grounds slots; 5 circulation rules carried from the mirror |
| `world/castle/MAKER-PROVENANCE-MATRIX.md` | Twelve-slot schema, castle-wide; 24 priority classes; 4 worked slot sheets at mirror grade; fabric-level makers |
| `world/castle/ROYAL-KITCHEN.md` | Hierarchy, wing, prep rooms, pantry, storage, water, heat, receiving, waste, service path, royal dining route; **Inés Morales bound** |
| `world/castle/ROSEMARY-ROUTE.md` | Botany, source, supplier, transport, receiving, storage, preparation, culinary use, historical medicinal claim, modern evidence, native name OPEN |
| `world/castle/WORLD-COMPLETENESS-MATH.md` | `C_w = I × P × T × O × M × R × E` — whole equation, left side, equal sign, right side, variables, child/adult/scholar meanings, real castle worked twice |
| `world/lanes/THINKING-LANES.md` | State register for all five permanent lanes; two History/Evidence cases opened |
| `world/lanes/PEOPLE-IN-TIME.md` | Current state, first seeded figure, verification gaps, next executable step — pilot untouched |
| `world/LIVING-MAP.json` | 10 lane states, machine-readable |

### Added — backend (reviewable, **not applied**)
| File | Contents |
|---|---|
| `db/world/0001_living_map_and_castle.sql` | 8 additive tables + RLS: living map, castle record, phases, spaces, object provenance (12 slots), kitchen posts, supply routes, world completeness (`c_w` as a generated column) |
| `db/world/0002_living_map_seed.sql` | Upsert-only lane seed and the two completeness scores |

**Schema-level fabrication guard:** `thylora_object_provenance` carries a check
constraint — a row may be `OPEN`, or it must declare `canon_source`. **An
invented maker cannot be written without declaring where it came from.** The
rule is enforced by the database, not by discipline.

### Changed — control surface, additively
| File | Change |
|---|---|
| `dashboard-current-head.html` | **+77 lines, −0 lines.** One marked block `THY-WINDSOR-LIVING-MAP-001` appended, following the existing house pattern of `THY-SPINE-FORWARD-VOICE-001`. Adds a **Living Map** panel into the existing **Our World** section. Reads `thylora_living_map` when signed in and reachable; otherwise renders the lane states carried in source. Every failure path is silent. No existing selector, function, table binding or capability touched |

---

## 4 · Completed work

1. **Castle mirror corrected.** Malbork superseded; Windsor locked with a graded source register and a stated reason the swap was structurally necessary.
2. **Castle historical structure cut** across all fifteen required areas.
3. **Room and building map** built, service range mapped at equal weight to the state range.
4. **Maker provenance matrix** made castle-wide and schema-enforced; 24 classes slotted; zero names invented.
5. **Royal Kitchen structured**, and **Inés Morales bound** into room, wing, route, chain of command and object custody.
6. **Rosemary routed end to end**, with claim and evidence held apart and the EMA's own "not based on clinical studies" qualifier carried verbatim.
7. **Math attached** and used — the model located the single blocking variable.
8. **People in Time** state returned without touching the pilot.
9. **History/Evidence lane advanced** with two cases, including the Queen Charlotte line carried as a primary subject with claim, counter-claim, bias in both directions and an honest open verdict.
10. **Dashboard Living Map** added to the existing surface with no duplicate and no regression.

---

## 5 · OPEN fields

| Group | Count | Why |
|---|---|---|
| Castle identity | 9 | Chairman authors |
| Castle structure slots | 71 | Chairman authors / `528?` |
| Maker classes | 24 | No invention permitted; may exist in backend canon |
| Kitchen posts | 11 | 6 marked `528?` |
| Rosemary slots | 26 | Includes the native name |
| Lanes blocked on backend | 3 | People in Time, Vlegh, History/Evidence primary |
| Restoration architects (mirror) | 2 | Not confirmed on a primary domain — held rather than asserted |
| Windsor room count | 1 | Widely asserted, not primary-confirmed — **not asserted here** |

---

## 6 · Exact next execution

**In order. The first is the only one the Chairman alone can do.**

1. **Author castle Identity** — native name, city, territory, founder.
   `C_w` is exactly zero until this lands, and every other factor is currently
   multiplying by nothing.
2. **Read the backend** from an environment whose network policy permits
   `*.supabase.co` — or paste sequences 520–529 into the next turn. Then:
   reconcile the sequence-528 household findings into `ROYAL-KITCHEN.md` §3,
   back-fill maker canon into the matrix §4, return the People in Time pilot
   state and first seeded figure, and set the VLEGH lane state.
3. **Promote the Windsor sources from `S1` to `S0`** by full-page read of W1,
   W3, W9, W11, H1 and H5.
4. **Retrieve the Charlotte claim at primary** (Q5) before any position hardens.
5. **Set the rosemary native name and the grow-or-buy fork.**
6. **Merge-forward** the Living Map block to
   `vyc2st-ctrl/thylora-executive-dashboard` and witness on
   `thylora-public-world`. Until then it is **source-side, not live.**

---

## 7 · Pre-existing finding, reported not fixed

Six capabilities named in the `dashboard-baseline.json` floor
(`THY-DASH-FLOOR-20260823-001`) are **already absent from
`dashboard-current-head.html` at `HEAD`**, before this run:

`Product & Storefront` · `Commerce Proof` · `Required Chairman Action` ·
`Approvals` · `Digital Product Passports` · `Connection Evidence`

This run **did not cause** them and **did not fix** them — repairing the
baseline floor is outside this work code and would be an unrequested change to
the control surface. **Flagged for the Chairman's decision.**

---

## 8 · Restart point

> **`THY-WORK-WINDSOR-MIRROR-CASTLE`** — Windsor mirror locked and sourced.
> Castle structure, room map, maker matrix, kitchen and rosemary route cut.
> Inés Morales bound. Math attached and the world scored. Living Map on the
> existing surface, additive, no regression, 48/48 tests green.
>
> **Blocked on exactly two things:**
> **(1)** the Chairman authors the castle's Identity;
> **(2)** a backend-reachable session reads sequences 520–529.
>
> Nothing else is waiting on analysis. Everything else is waiting on those two.
