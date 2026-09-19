# EdereAriah Castle — Royal Kitchen

**Work code:** `THY-WORK-WINDSOR-MIRROR-CASTLE`
**Person bound:** **Inés Morales**
**Mirror:** Windsor Castle Great Kitchen and the Royal Household kitchens (`S1`)
**Depends on:** sequence 528 household findings — **NOT READ THIS RUN** (§2)

---

## 1 · The mirror, verified (`S1`)

| Fact | Value | Source |
|---|---|---|
| Fabric | Built in the reign of **Edward III** | W9 |
| Continuous use | **750 years** | W9 |
| Standing | **Oldest working kitchen in the country** | W9 |
| Surviving features | **Original fireplaces** | W9 |
| Historic output | 30-course banquets under George IV; Queen Victoria's own dining rules | W9 |
| Position | Inside the **Upper Ward**, near the State and private apartments | W3, W9 |
| Pictorial record | Stephanoff, *The Kitchen at Windsor Castle* (RCIN 922094); Livingston, 1878 (RCIN 2403097); Creswell, *Grand Kitchen after restoration* (RCIN 933500) | W20, W21 |
| Head of the kitchens | **Head Chef of the Royal Household** — post held by **Mark Flanagan** | W14 |
| Senior structure | Senior chefs, including **senior pastry chefs**, support the Head Chef with day-to-day management of the **entire catering operation**: menu creation and writing, stock management, staff training and development, health and hygiene, and team management | W14 |
| Team size at that senior tier | **A team of twenty** | W14 |
| Output range | Staff lunches · meals for two · receptions · **state dinners** | W14 |
| Pastry | A **distinct discipline with its own senior line**, not a sub-task of the main kitchen | W14 |

**The load-bearing mirror facts for EdereAriah are these three:**
1. The kitchen is **older than most of the palace around it** and has never stopped working.
2. It is **inside the seat**, not in an outbuilding.
3. It runs **two parallel senior lines** — savoury and pastry — under one head.

---

## 2 · Sequence 528 household findings — declared gap

Instruction: *"Read sequence 528 household findings."*

**This session could not read them.** Outbound HTTPS to the backend
(`jvsdxhrfhtlgaknhjxlz.supabase.co`) was refused by the environment's network
policy — `CONNECT tunnel failed, response 403`, recorded twice in the agent
proxy failure log. `thylora_query_carryforward` was therefore unreachable.

**Consequence, stated plainly:** every row below marked `528?` is a slot whose
answer may **already exist** at sequence 528. Those rows are **not** authored
here. Filling them from imagination would overwrite settled canon with
invention. They are held.

Readback:
```
GET /rest/v1/thylora_query_carryforward
    ?select=sequence_no,session_label,user_message,assistant_message
    &sequence_no=eq.528
```

---

## 3 · Kitchen hierarchy — resolution sheet

| Post | EdereAriah | State | Mirror |
|---|---|---|---|
| **Head Cook / Royal Cook** | — | **`528?` OPEN** | Head Chef of the Royal Household |
| **Deputy Cook** | — | **`528?` OPEN** | Senior chef deputising across the whole catering operation |
| **Provisioner** | — | **`528?` OPEN** | Stock management sits inside the senior team's remit |
| **Other Royal Cooks** | — | **`528?` OPEN** | Senior team of ≈20 |
| **Head of pastry** | — | **OPEN** | Senior pastry chef, own line |
| **Inés Morales** | **BOUND — rank OPEN** | **See §4** | — |
| Kitchen porters / scullery | — | OPEN | — |
| Larderer | — | OPEN | — |
| Baker | — | OPEN | — |
| Butcher | — | OPEN | — |
| Herb keeper / stillroom | — | **OPEN — load-bearing for rosemary** | — |

---

## 4 · Inés Morales — binding into the living structure

| Field | Value | State |
|---|---|---|
| Name | **Inés Morales** | **CANON — carried forward** |
| Place of work | **EdereAriah Castle Royal Kitchen**, S01 Great Kitchen | **BOUND this run** |
| Wing | Kitchen wing, Upper Ward service range | **BOUND this run** |
| Rank / post | — | **`528?` OPEN — must not be guessed** |
| Reports to | Head Cook / Royal Cook | **Structurally bound, person OPEN** |
| Shift | — | **OPEN — see §5** |
| Signature discipline | — | **OPEN** |
| Relationship to rosemary | **She is the named preparer** — the rosemary route terminates at her hands | **BOUND this run** — see `ROSEMARY-ROUTE.md` §6 |
| Objects in her custody | Pots, pans, knives, boards, stove/hearth position | **OPEN maker slots** — `MAKER-PROVENANCE-MATRIX.md` classes 01–04 |
| Evidence state | Name is canon; post is not | **PARTIAL** |

**What binding means here:** Inés Morales is no longer a name attached to a
world. She is attached to a **room** (S01), a **wing** (Upper Ward service
range), a **route** (rosemary, §6 of the rosemary file), a **chain of command**
(under the Head Cook), and a **set of objects** with maker slots. Four of those
five are now structural. Her **rank** is the one thing left, and it is the one
thing that may already be settled at 528.

---

## 5 · Shift structure — slot sheet

| Slot | State | Mirror logic |
|---|---|---|
| Shift pattern | **OPEN** | A kitchen serving staff lunches, meals for two, receptions and state dinners cannot run one shift |
| Early / bake shift | **OPEN** | Bread and pastry start before the house wakes |
| Main service shift | **OPEN** | Covers principal meals |
| Late / banquet shift | **OPEN** | State dinners run long |
| Standing (non-event) day | **OPEN** | Household and staff feeding continues when there is no event |
| Event escalation | **OPEN** | Mirror: 30-course banquets historically |
| Rest / rotation | **OPEN** | |
| Inés' shift | **OPEN** | |

---

## 6 · Kitchen wing — room resolution

Cross-referenced to `ROOM-BUILDING-MAP.md` §5.

| Ref | Room | Function | State |
|---|---|---|---|
| S01 | **Great Kitchen** | Main cooking floor; hearths/stoves; the historic core | **BOUND** (EdereAriah name OPEN) |
| S02 | **Pastry kitchen** | Separate senior line | **BOUND as required by mirror** |
| S06 | **Vegetable prep room** | Prep | OPEN |
| S07 | **Butchery** | Prep | OPEN |
| S08 | **Fish room** | Prep | OPEN |
| S03 | **Larder / cold store** | Storage — perishable | OPEN |
| S04 | **Dry store** | Storage — flour, grain, pulses, spice | OPEN |
| S05 | **Herb store / stillroom** | Storage — **rosemary terminus** | **BOUND** |
| S13 | Cellars | Storage — drink | OPEN |
| S17 | **Water** | Supply point into the kitchen | OPEN |
| S18 | **Fuel store** | **Heat** — wood/coal/other | OPEN |
| S15 | **Receiving** | Goods in, tradesman's entrance | **BOUND as required** |
| S16 | **Waste and return yard** | Goods out | **BOUND as required** |
| S09 | Scullery / wash | Return path | OPEN |
| S10 | Silver pantry | Service ware, separate custody | OPEN |
| S19 | **Service path** | Stairs and corridors from kitchen to table | **BOUND as required** |
| S20 | Staff hall | Household eats here | OPEN |

---

## 7 · The two routes

### 7.1 Supply route — outside to store
```
supplier → transport → S15 RECEIVING → check/weigh → S03 larder
                                                   → S04 dry store
                                                   → S05 herb store
                                                   → S13 cellar
```

### 7.2 Royal dining route — store to table and back
```
S03/S04/S05 store
   → S06/S07/S08 prep
      → S01 GREAT KITCHEN  (hearth · Inés' station)
         → S02 pastry (parallel line, rejoins at service)
            → plating / S10 silver pantry
               → S19 SERVICE PATH  (internal, protected, short)
                  → U33/U34 private dining   [everyday]
                  → U25 State Dining Room    [state]
                  → U10 great ceremonial hall [Garter-scale occasion]
                     → return → S09 scullery → S16 waste yard
```

**Mirror rule enforced:** the service path is **internal and short**, because
the kitchen sits inside the Upper Ward with the apartments. Food does not
cross an open ward or a public route. That is a structural property of the
mirror and it is now a structural property of EdereAriah Castle.

---

## 8 · Open, and why

| Item | Why it is open |
|---|---|
| Head Cook, Deputy, Provisioner, other Royal Cooks | **`528?`** — may already be settled; blocked on backend read |
| Inés Morales' rank | **`528?`** — same |
| Shift structure | Authoring decision |
| EdereAriah room names | Chairman authors |
| Water source, heat source, fuel | Authoring decision, constrained by era |
| Kitchen object makers | `MAKER-PROVENANCE-MATRIX.md` — no invention permitted |

**Bound this run and not open:** Inés' room, wing, route, chain of command,
and her position on the rosemary route. That is real structural progress made
without touching a single field that 528 may already own.
