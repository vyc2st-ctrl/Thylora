# SEEZIN TRAIL — EPISODE TWO — CLEAN STORY PACKET

**Work code:** THY-WORK-REENTRY-SEEZIN-STORY-552
**Backend head read:** sequence 552; delta 553 landed mid-pass and was consumed as law
**Spine row written:** sequence 554 — `THY-Q-20260920-SEEZIN-STORY-PACKET-554`
**Packet of record:** `thylora_continuity_payloads` → `SEEZIN-TRAIL-STORY-552` v2.0.0
**Illustration list of record:** `thylora_page_design_specs` → `PAGE-SEEZIN-TRAIL-EP002-001`
**QYRIS:** PASS — check `4542920d-d9da-40eb-98ad-7f9ca256fd69`
**Layer:** EdereAirah unless stated

> This repository is **not** the deployment authority. See `DASHBOARD_AUTHORITY.md`.
> The backend `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) is the source of truth; this file is a readable mirror of what was written there.

---

## 1 · FIREWALL 551 — PASS

Verified, not assumed. `thylora_graph_firewall_v1` was run **15 times before any write** and **12 more after**, across all four required protected lanes.

| Lane | Probe | Verdict |
|---|---|---|
| SEEZIN TRAIL | Caleb → Seezin | PASS |
| BRAMBLE | Caleb → Bramble | FAIL_CLOSED |
| BRAMBLE | Bramble, WYCK, Bramble Box → Seezin | FAIL_CLOSED |
| TWELVE MILES | work → Seezin | PASS |
| TWELVE MILES | Earth product → EdereAirah story | FAIL_CLOSED (layer) |
| RAIN-SIDE BEANS | recipe → Seezin | PASS |
| RAIN-SIDE BEANS | recipe → Bramble | FAIL_CLOSED |
| — | unregistered ID | UNKNOWN_IDENTITY, creates nothing |

Firewall 551 needs no further work and should not be redone.

---

## 2 · THE STORY

### TITLE STATE — **UNKNOWN**
No title adopted. Naming is the Chairman's (decision 1 from 549).

Three candidates, **proposed and not adopted**:
- *The Board Still Says It Is Good* — a line spoken inside the story
- *What the Road Might Do* — from the published closing line
- *The Fourth Thing* — the one item of four he did not do

The four series pool titles (*Payday at the Crossing*, *Snow Before the Pass*, *The House on Lantern Street*, *The Brand on the Coffee Tin*) belong to **other unbuilt episodes** and were deliberately not consumed.

### SERIES
Episode two of the Seezin trail lane. It begins inside the last scene of the **published** *Twelve Miles for Flour* and runs one day and one night past it. Graph edge `EDGE-SUCCEEDS-EP002-TWELVEMILES`.

Honorific: *Unkle* on product lines, *Uncle* in published body text, bare *Seezin* in the prose. **All three carried. None normalized.**

### CHARACTERS — all recovered, none invented

| Person | Graph ID | Standing |
|---|---|---|
| Caleb | `ER-CHAR-CALEB-001` | published text; registry row stale |
| Lottie James | `ER-CHAR-LOTTIE-JAMES-001` | published text; voice ACTIVE_STORY_PROOF |
| Uncle Seezin | `ER-CHAR-UNCLE-SEEZIN-001` | WORKING_CANON |
| Isaiah | `ER-CHAR-ISAIAH-001` | published text — **newly graphed at 552** |
| Mr. Pruitt | `ER-CHAR-MR-PRUITT-001` | published text — newly graphed; not on the page |
| Mrs. Della | `ER-CHAR-MRS-DELLA-001` | published text — newly graphed; one scene |

Old Jaro and Old Gerald are deliberately kept off the page; their identity separations stay locked.

### SETTING · TIME
The unnamed camp (`ER-PLACE-SEEZIN-CAMP-001`, name UNKNOWN) and its road. Bell Crossing is spoken of and **never entered** — a deliberate structural break from *Twelve Miles*, which is entirely a journey. One day and one night, closing at dawn. Date UNKNOWN. Time-region UNKNOWN.

### PROBLEM
Caleb owes four things from the published ending: *mend the sack, clean the tins, thank Isaiah, and draw the washed bridge on the route board.* Three can be held in the hand and are done by noon. The fourth is the only one that is for people who are not there. It waits all day, and then the night runs out of light.

### CHOICE
After dark Lottie James drives in with her own night work. There is one lantern's worth of light left. Seezin lifts the oil can, hands it to Caleb, lets him feel the weight of it, says nothing about how to spend it, and goes to bed. **No number is ever spoken — the weight of the can is the information.** Caleb spends the light on Lottie's load and leaves the board for morning.

Both halves of the night are records. Lottie's is a record with a person standing next to it. The route board is a record with nobody standing next to it. He spends the light on the one that can look him in the face.

### CONSEQUENCE
Before dawn Isaiah rides out, reads the board, takes the Dry Woman Creek road because the board still says it is good, turns back at the water and goes south to the old freight ford — **the same five miles Caleb and Isaiah lost together, except this time Caleb sent him.** He comes in late. He does not scold.

> "Board still says it's good?"
> "Yeah."
> "All right."

No injury. No disaster. Five miles and half a morning, charged to the one man Caleb had just thanked for keeping him out of the water.

### ENDING
Dawn. Seezin at the board with the chalk. He does not mark it — he holds it out. Caleb takes it and draws the washed bridge. Then he does not walk away: he stands and reads the rest of the board, line by line. Seezin writes nothing beside Caleb's name and goes in to the pans.

The published story ends with the same gesture meaning *not yet judged*. Here it means *nothing needs saying*. **No line explains anything.**

Last image: **Caleb reading a board nobody asked him to read.**

### VOICE
Third person, close on Caleb, plain. Short declaratives. The world is reported, not explained. Seezin is written from the published lines only — no new register invented. Prohibited: school-lesson voice, narrator moralising, white-paper explainer register.

### SCENE MAP
1. The fourth thing
2. What the board is for
3. Lottie at the edge of the light
4. What is left in the can
5. The choice
6. One strap wrong
7. Five miles
8. Seezin at dawn
9. Talk together — questions, never answers

### OBJECTS · PROVENANCE
- **The lantern** `OBJ-TRAIL-LANTERN-001` — object evidenced, **maker UNKNOWN**. Mark: `ErsatzReality` on the base.
- **The route board** `OBJ-ROUTE-BOARD-001` — evidenced, maker UNKNOWN. *The only object in canon that other people act on without being present.*
- Grain tins `VYC2ST` · Lottie's wagon hub `TMF-0004` · the oil can, the chalk (canon by implication, unregistered, no maker invented)

`thylora_object_maker_provenance` holds 19 categories and **zero objects** with `no_invented_makers` set. This story adds none.

### WORLD CONNECTION
The first THYLORA story whose subject is a written record — which is what the continuity spine, the route board, the supply list and the graph overlay all are. The world now has a story that argues for its own operating rule without ever saying so.

---

## 3 · THE BLOCKER, ANSWERED

`SLS-F7` (BLOCKER, raised 549, left open): the lamp story was a second telling of *Twelve Miles* with lamp oil swapped for flour.

549 moved the clock. **That did not move the engine.**

| *Twelve Miles for Flour* | This story |
|---|---|
| a journey out and back | never leaves camp |
| a storm as antagonist | a piece of wood |
| Caleb wrong about the road | right about the person, wrong about the record |
| Lottie stuck, wrong help offered | Lottie moving, **right** help offered — still costs somebody |
| costs Caleb his own five miles | costs Isaiah five miles Caleb spent for him |
| ends with a man not yet judged | ends with a man not needing to be |

**Residual risk, stated plainly:** both stories contain Lottie, a wagon and a Seezin dawn beat. That is the lane's own furniture and removing it would make it a different series. Named here rather than hidden. If the Chairman prefers *Twelve Miles* to stand alone, **stopping costs nothing** — the recovered canon, the graph and the firewall all survive it.

---

## 4 · ILLUSTRATION LIST — 12 SLOTS, 0 GENERATED

`SEEZ-IMG-01` … `SEEZ-IMG-12`, all `APPROVAL_REQUIRED`. Each carries: image id, scene, characters, place, time, weather, objects, action, background life, camera, light, continuity locks.

**The visual argument is causal light:** the lit circle must *measurably shrink* across plates 06 → 07 → 08, and plate 09 has **no flame in frame at all**. If the light does not shrink, the book's argument fails. Plate 12 is the reverse camera of plate 02.

`thylora_image_generation_authorizations` holds **0 rows** and was not written to.

---

## 5 · PRODUCT CANDIDATE — **NOT READY**

`CAND-SEEZIN-TRAIL-LAMP-STORY-001`

Not ready because: no title · no writer of record · no Chairman decision on whether the story should exist beside the ACTIVE *Twelve Miles* · Lottie's problem is authored rather than recovered.

**Not** `READY_FOR_VISUAL_PRODUCTION` — that needs an authorized image and none is authorized.

Independently confirmed by the delta-553 gate `THY-GATE-STORE-DRAW-VALUE-001`:

| A | H | W | T | M | P | D | min | verdict |
|---|---|---|---|---|---|---|---|---|
| 2 | 4 | 1 | 3 | 0 | 0 | **0** | **0** | **FAIL** |

Two factors are zero and no further story work can lift them. They need a title, a writer of record and an authorized image — in that order.

---

## 6 · GRAPH WRITEBACK

| | |
|---|---|
| Nodes read | 17 |
| Nodes created | 8 |
| Nodes updated | 0 |
| Edges read | 55 |
| Edges created | 28 |
| Edges superseded | 0 |
| Versions written | 36 |
| Duplicates prevented | 8 checked against the graph before creation; none re-created |
| Conflicts found | 8 findings; 4 open |

**Graph after:** 26 nodes · 84 edges · 110 versions · 110 RDF triples · **0** nodes without a layer · **0** without evidence · **0** without a version row · **0** edges without a version row · **0** duplicate canonical names.

Additive only — no node or edge written at 550 or 551 was modified.

---

## 7 · UNKNOWN — AND STAYING UNKNOWN

Title · writer of record · oil quantity · burn time · lamp count · lamp maker · camp name · date · Bell Crossing time-region, parent land and parent region · whether Lottie is a driver or a boardinghouse owner · the Uncle/Unkle honorific.

The story is written so that **none of these is ever needed on the page.** They can stay open through visual production.

---

## 8 · FINDINGS — 8, WITH 4 OPEN

| Code | Severity | State |
|---|---|---|
| SEEZ-552-F01 — blocker SLS-F7 answered by changing the engine | BLOCKER | resolved |
| SEEZ-552-F02 — Isaiah, Pruitt, Della missing from the graph | DEFECT | fixed |
| SEEZ-552-F03 — lantern registered on visual evidence | NOTE | resolved |
| SEEZ-552-F04 — QYRIS advertises 3 verdicts, table permits 1 | DEFECT | **open** |
| SEEZ-552-F05 — Seezin voice row forbids what the store sells | CONTRADICTION | **open** |
| SEEZ-552-F06 — firewall 551 verified across 27 probes | NOTE | resolved |
| SEEZ-552-F07 — Lottie's problem authored, not recovered | UNKNOWN | **open** |
| SEEZ-552-F08 — missing companion records, 4 misses / 3 writers | DEFECT | **open** |

**Worth the Chairman's minute:** `SEEZ-552-F05`. The Seezin voice row reads `SOURCE_RECOVERY_REQUIRED` with `permitted_uses` empty while the product carrying his dialogue is ACTIVE and has taken real money. Same contradiction already on file for Caleb and Isaiah — never recorded for the man whose name is the series. All three should be answered at once.

**Found by the readback itself:** `SEEZ-552-F08`. Delta 553 wrote its gate node with no LAYER edge and its evidence edge with no version row — the same omissions 551 had already backfilled for 550. Four misses across three writers. Both backfilled additively here; a node-side constraint or an integrity patrol is **proposed, not created**.

---

## 9 · EXACT NEXT STEP

Three Chairman answers unblock everything:

1. **The title** — three candidates on file, none adopted
2. **The writer of record** — `THY-ARTIFACT-AUTHOR-VOICE-001` fails release closed; no name invented
3. **Whether this story should exist** beside the ACTIVE published *Twelve Miles*

On a yes plus a title plus an author, three steps run with **no further Chairman input**: authorize the twelve slots under `THY-VISUAL-EXPLICIT-AUTH-001`; bind extent, trim and page class using the reusable four-class page law; write the manuscript prose against the nine-scene map.

**Hard stops holding:** no image generation · no Shopify product · no rename or repurpose of the existing Bramble Wick product · no activation · no publication · no price.

---

## 10 · FALSE-COMPLETION CHECK

Nothing was written, built, tested, activated, sold or published. **No manuscript prose exists and none is claimed.**

What exists: a verified firewall, a recovered cast, a graphed lane, an answered blocker, a nine-scene map, a twelve-slot illustration list, one superseded packet preserved as evidence, eight findings, one gate evaluation and three Chairman decisions.

Zero images generated · zero image authorizations · zero Shopify calls · zero products created · **zero rows deleted**.
