# WR-CASTLE-SERVICE-ZONE-576 · Royal Kitchen Service Zone

**Primary work:** THY-WORK-KITCHEN-SUITE-RESIDENCE-576
**Runs in parallel, not merged into this one:** THY-WORK-INES-LIFE-ECONOMY-575 · THY-WORK-CASTLE-DIMENSIONAL-TWIN-572
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/royal-kitchen-service-zone-pwd4v2`
**Opened:** 2026-09-21

---

## 1 · Backend head

**Backend sequence 576 was NOT read. It was not reachable.**

The build session attempted to read all six authoritative tables directly. The
environment's egress policy denied `CONNECT` to `jvsdxhrfhtlgaknhjxlz.supabase.co`
with HTTP `403`, on every attempt:

```
thylora_castle_space_geometry          000  (proxy: connect_rejected, gateway 403)
thylora_castle_space_connections       000  (proxy: connect_rejected, gateway 403)
thylora_castle_object_state_registry   000  (proxy: connect_rejected, gateway 403)
thylora_castle_object_events           000  (proxy: connect_rejected, gateway 403)
thylora_person_world_sheet             000  (proxy: connect_rejected, gateway 403)
thylora_mirror_name_registry           000  (proxy: connect_rejected, gateway 403)
```

This is the same gap recorded at WR-RAELINK-001 and in `db/rae-link/0010`. It is a
network policy, not a missing capability, and it is not worked around.

Head of the repository's own record: `main` at `3a01e82`, RAE Link owned media +
creator economy platform. This delta is additive to it and touches nothing in it.

**Consequence, held everywhere downstream:** this work is written as **intake**,
not as canon. No dimension is stated as fact. Nothing is projected into the canon
geometry tables. Nothing is published.

## 2 · QYRIS

**QUESTION** — Could backend 576 be read before building? Does a second geometry
system get created if canon is unreadable? Can a service zone be resolved at all
without measured rooms?

**YIELD** — Backend: no, 403. Second geometry system: no — intake ledger plus a
guarded projection, and the projection refuses rather than invents. Service zone:
yes, but only as PROPOSED, and only if the proposal is machine-prevented from ever
passing itself off as measured.

**REASON** — An isolated kitchen is not a room problem, it is an adjacency problem.
The ten spaces were resolved together, as one connected slice with one spine, and
every flow was then tested against the openings that slice actually has. Where a
path did not fit, the misfit was written down rather than designed away.

**INSPECT** — Applied twice to PostgreSQL 16, clean both passes. Seven of seven
reject-cases rejected by the database. Zero teleporting object moves. Zero flow
steps failing physical fit; two honestly UNVERIFIED. Zero restricted or secure rows
reachable from the public sheet. Zero dimensions claiming DOCUMENTED. Zero
residence models canonized. One person named in the entire slice.

**SAFEGUARD** — Six, each enforced by the database rather than by discipline:
self-sourced `DOCUMENTED` rejected; `UNKNOWN` may carry no numbers;
`SECURE`/`RESTRICTED_SERVICE` cannot be flagged public; residence selection requires
`CHAIRMAN_AUTHORED`; a brand mark without a declared relationship is rejected; an
internal move with no named link is rejected.

## 3 · Current canon read

| Table | Read? | What this work did instead |
|---|---|---|
| `thylora_castle_space_geometry` | ✗ 403 | Intake only. `thy_csz_project_spaces()` refuses with `CANON_ABSENT`. |
| `thylora_castle_space_connections` | ✗ 403 | Adjacency held in intake; same projection guard. |
| `thylora_castle_object_state_registry` | ✗ 403 | Object homes held in intake, `to_regclass`-guarded. |
| `thylora_castle_object_events` | ✗ 403 | No events written. Movement is described, not logged. |
| `thylora_person_world_sheet` | ✗ 403 | Only Inés is named, carried from the work order. |
| `thylora_mirror_name_registry` | ✗ 403 | Ten native-name slots held open as UNKNOWN. |

Two facts were taken from the work order itself and used as given, not re-derived:
Inés is Head Cook, and the Deputy Cook holds kitchen authority when she is off.

## 4 · Service-zone room list

All ten resolved. **Every dimension below is PROPOSED.** Not measured, not
documented, not canon. Metres are an ERC unit and are themselves an open decision
(CSZ-DEC-004). Native names are held open — inventing them would be canon forgery.

| Stable ID | ERC mirror | Native name | W × D × H (m) | Wall | Access | Public |
|---|---|---|---|---|---|---|
| `CSZ-KITCHEN-01` | Royal kitchen | *open* | 14.00 × 10.00 × 8.50 | 1.10 | SERVICE | yes |
| `CSZ-SCULLERY-01` | Scullery | *open* | 8.00 × 6.00 × 4.20 | 0.80 | SERVICE | yes |
| `CSZ-DRYSTORE-01` | Dry store | *open* | 6.00 × 5.00 × 3.40 | 0.90 | RESTRICTED | no |
| `CSZ-COLDSTORE-01` | Cold / wet store | *open* | 6.00 × 5.00 × 3.20 | 1.20 | SERVICE | yes |
| `CSZ-LARDER-01` | Larder | *open* | 5.00 × 4.00 × 3.40 | 0.90 | SERVICE | yes |
| `CSZ-BAKEHOUSE-01` | Bake / oven room | *open* | 7.00 × 6.00 × 5.00 | 1.30 | SERVICE | yes |
| `CSZ-HERBSTORE-01` | Herb store + drying loft | *open* | 4.00 × 3.50 × 3.20 (loft 2.20) | 0.70 | SERVICE | yes |
| `CSZ-RECEIVING-01` | Receiving / weigh | *open* | 8.00 × 7.00 × 4.50 | 1.00 | SERVICE | yes |
| `CSZ-SERVCORR-01` | Service corridor | *open* | 24.00 × 2.60 × 3.20 | 0.90 | RESTRICTED | no |
| `CSZ-STAFFLINK-01` | Staff stair and lobby | *open* | 3.00 × 2.40 × 3.00 | 0.90 | SECURE | no |

Full per-room function, floor, ceiling, doors, windows, hearth/oven/water, source
and serial are in `db/castle-service-zone/0008_seed_576.sql`. Each room carries a
serial `THY-CSZ-576-001` … `-010`.

## 5 · Adjacency map

**The kitchen is no longer isolated.** Every one of its four openings lands in a
room in this slice. The spine is the service corridor: every store opens off it, so
no store opens off another store, and nobody crosses the kitchen to reach a store.

```
        OUTER YARD
             │ CART_DOOR 2.60 × 3.20
        ┌────┴─────┐          ┌─ WASTE YARD (compost/animal/spoiled/other)
        │ RECEIVING├──────────┘ 1.40 × 2.20
        └────┬─────┘
             │ 1.80 × 2.40
   ══════════╪═══════════ SERVICE CORRIDOR (24.00 × 2.60) ══════════
     │    │      │      │       │        │          │
  DRY   COLD   LARDER  HERB   BAKE     KITCHEN   SCULLERY   STAFF LINK
 STORE  STORE    │     STORE    │         │          │          │
 (keyed)(3 steps)│   (+loft)    │         │          │       STAIR ↑
                 │              │         │          │       quarters
                 └── HATCH ─────┼── ARCH ─┤          │
                   0.90 × 1.10  │  1.40   │          │
                                └─────────┴─ 1.60 ───┘ dirty return
                                          │
                                       STAIR ↑ household dining  (UNRESOLVED)
```

19 links recorded, `CSZ-LINK-001` … `-019`, each with kind, proposed clear width and
height, direction rule and access class. Five are edges out of the slice and are
recorded as soft external edges, never as invented rooms. Two carry `UNKNOWN`
geometry on purpose: the dining stair and the quarters stair.

There is deliberately **no** direct receiving-to-herb-store door. Cut herb travels
the corridor like everything else.

## 6 · Proposed dimensions

The basis is written on every row, and it is functional, not decorative:

- **Kitchen 14 × 10 × 8.5** — two hearth bays plus a spit range plus a boiling
  range, a 10 m bench line, and two people passing behind a working cook without
  contact. Height is set by heat and smoke, not by grandeur.
- **Scullery 8 × 6** — three trough positions, a rack run, a return landing, and a
  clear lane between them.
- **Corridor 2.60 wide** — two people passing with loaded baskets. Length follows
  the frontages it must serve.
- **Bakehouse wall 1.30** — oven mass carried in the wall, not defence.
- **Cold store wall 1.20, floor sunk 0.90** — thermal mass doing the work no
  machine is doing.
- **Herb loft 2.20 clear** — a hanging bunch plus headroom under it.

Checked for plausibility only against ERC royal-kitchen mirrors (Windsor, Hampton
Court) to answer functional questions: does a great kitchen need this much hearth
frontage, does a scullery need two doors, does an oven room need its own ash route.
**Earth layout was not copied into EdereAirah as fact.** The mirrors validated
questions; they did not supply answers.

## 7 · Delivery / food flow — `CSZ-FLOW-FOOD-IN`

| # | Step | Route | Fit |
|---|---|---|---|
| 1 | Delivery arrives | yard → receiving, cart door 2.60 × 3.20 | FITS |
| 2 | **Weigh and check** | inside receiving | FITS |
| 3 | Store — dry goods | receiving → corridor → dry store | FITS |
| 4 | Store — cold/wet | receiving → corridor → cold store | **FITS_WITH_CONDITION** — three steps down; loads by hand, not barrow |
| 5 | Issue against the day list | store → corridor → kitchen, 1.80 door | FITS |
| 6 | Prep | kitchen bench line | FITS |
| 7 | Cook | hearth / range / spit / oven | FITS |
| 8 | Service | kitchen → dining stair | **UNVERIFIED** — far end outside this slice |

Step 2 is the control on the whole suite. Nothing reaches a store unweighed; if it
could, the day list, the ledger and every shortage response downstream become
guesswork.

## 8 · Herb flow — `CSZ-FLOW-HERB`, and where the herb actually is

The plant is recorded as **NATIVE_HERB_UNRESOLVED**. Rosemary is carried only as an
ERC functional mirror — woody evergreen, dries well, hangs in bunches, strips to
leaf — and is labelled as a mirror everywhere it appears.

| State | Where it physically is | Form | Custodian |
|---|---|---|---|
| 1 Herb ground | in the bed, standing | growing | Herb Keeper |
| 2 Cut | flat basket at the bed edge | cut fresh | Herb Keeper |
| 3 Receiving | on the weigh bench, in its basket | cut fresh | Herb Keeper |
| 4 Cleaning | at the receiving wash-down point; split into two lots | cleaned | Herb Keeper |
| 5 Fresh issue | shallow crock of water, herb end of the kitchen prep bench | fresh | Head Cook |
| 6 Drying | bunched on the loft rails, in the through-draught | drying | Herb Keeper |
| 7 Dry store | stripped to leaf, lidded crocks on the raised shelf below the loft | dried | Herb Keeper |
| 8 In use | the **day crock** at the herb end of the prep bench | dried | Head Cook |
| 9 Spent | compost bay, via the kitchen pail and the receiving sort | spent | Herb Keeper |

Two design facts fall out of this and are worth stating plainly. The herb store has
**no water and no fire** — cleaning therefore happens in receiving, and drying herb
never hangs near a flame. And only a **day measure** travels to the kitchen; the
store crock stays put, so a spilled or spoiled day costs a day, not a season.

## 9 · Scullery / wash flow — `CSZ-FLOW-WASH`

Dining → kitchen return table (UNVERIFIED stair) → **dirty-return double door
1.60** → scullery → wash → rinse and dry on the racks → **back by the corridor**,
not back through the dirty-return door.

That last move is why the scullery needs two doors. With one, clean and dirty ware
share a threshold, and the whole separation is theatre.

One honest misfit: **the largest cauldron does not fit the proposed troughs.** It is
scoured in place at the kitchen hearth and never enters the scullery. Recorded on
the object row, on the flow step, and as conflict `CSZ-CONF-002`.

## 10 · Waste flow — `CSZ-FLOW-WASTE`

Separated **at the bench**, in five pails, not at the yard — sorting a mixed pail
later is the step that never actually happens.

| Stream | Route out |
|---|---|
| Compost — vegetable trim, herb stalk | kitchen → receiving → waste yard compost bay |
| Animal — permitted scraps | same door, separate bay; herb waste excluded by default |
| Ash | **bakehouse → ash yard**, cold, in a lidded iron box; never crosses the kitchen or corridor |
| Spoiled | weighed out as it was weighed in, so loss is a number and not a rumour |
| Other — breakage, sweepings | kept separate so ceramic sherds never reach compost or feed |

## 11 · Object home map

13 objects, `CSZ-OBJ-001` … `-013`. Every one has exactly one home, and
`thy_csz_teleport_report()` confirms **0** declared moves that no recorded link can
carry.

| Object | Home | In use | Wash | Dry | Repair | Custodian |
|---|---|---|---|---|---|---|
| **Inés' brown-handled knife** | kitchen — her knife roll, numbered peg above the head of the bench | kitchen | **kitchen sink, by her** | kitchen, wiped at once | estate forge / grinding wheel | Head Cook |
| Pots | kitchen — pot shelf over the boiling range | kitchen | scullery | scullery rack | brazier / tinsmith | Scullion |
| Pans | kitchen — hanging rail at the hearth wall | kitchen | scullery | scullery rack | brazier / tinsmith | Scullion |
| Cauldrons | kitchen — crane and hearth floor | kitchen | scullery *(large one: in place)* | scullery | estate forge | Scullion |
| Spit and crane irons | kitchen — spit rack | kitchen | kitchen hearth | kitchen | estate forge | Head Cook |
| Cutlery (service holding) | scullery — chest on the dry shelf | kitchen | scullery | scullery | — | Scullion |
| Beam scale and weights | receiving — fixed bracket | receiving | — | — | estate forge | Storekeeper |
| Ceramic store crocks | dry store — shelf run above the bins | kitchen | scullery | scullery | — | Storekeeper |
| Herb crocks and baskets | herb store — raised shelf; baskets stacked below | receiving | receiving | receiving | basketmaker / potter | Herb Keeper |
| Ledger and day list | kitchen — board by the corridor door, ledger box below | kitchen | — | — | — | Head Cook |
| Aprons | kitchen — pegs inside the corridor door | kitchen | laundry *(location UNKNOWN)* | — | laundry | Head Cook |
| Shoes | **staff link lobby** — shoe shelf, the change point | kitchen | — | — | cordwainer | Head Cook |
| Drying racks | scullery — between rinse trough and corridor door | scullery | scullery | scullery | estate carpenter | Scullion |

Three deliberate exceptions, each recorded rather than smoothed:

- **The knife never goes to the scullery.** A wooden handle left in a soaking trough
  is how a handle is lost. She washes and dries it herself, at the bench.
- **The large cauldron never leaves the kitchen** (see §9).
- **The spit is scoured hot at the hearth** — a spit long enough to cross the hearth
  will not turn in the scullery.

No maker, supplier or craftsman is named. Repair destinations are functional places
outside this slice.

## 12 · Residence option A — castle service apartment

| | |
|---|---|
| Distance / travel | ~40 m · ~1 min, entirely inside the envelope |
| Route | her room → staff stair → staff-link lobby → corridor → kitchen |
| Meals | from the kitchen, at the service table, on the establishment |
| Lodging / rent | part of the position. No rent moves — and the room ends when the position ends |
| Privacy | lowest. The walls that hear her are the household's walls |
| Personal storage | one room, one chest |
| Day off | not fully a day off. She will be seen, and being seen is being asked |
| Emergency recall | ~3 min |
| Security | highest access, highest exposure. Interior night access, permanently inside the secure envelope |

## 13 · Residence option B — estate cottage

| | |
|---|---|
| Distance / travel | ~900 m · ~12 min, one outside walk in all weather, twice a day |
| Route | cottage → estate path → outer yard → staff gate → corridor → kitchen |
| Meals | kitchen while on duty; cooks for herself on days off — a real second fire and a real second food cost |
| Lodging / rent | a cottage with the position, or at a rent set against wage. Either way a tenancy, and a tenancy can be a lever |
| Privacy | real. Her door closes and the household is not behind it |
| Personal storage | a cottage's worth |
| Day off | genuinely off. Small problems get solved without her — which is what a Deputy Cook is for |
| Emergency recall | ~20 min (someone must go, wake her, return with her) |
| Security | moderate. Gate or yard access, loggable at one point; the interior stays closed at night with her outside it |

## 14 · Residence option C — nearby town residence

| | |
|---|---|
| Distance / travel | ~3.2 km · ~40 min on foot, ~15 by cart when a cart is going |
| Route | town house → road → approach → outer yard → staff gate → corridor → kitchen |
| Meals | kitchen on duty only. The establishment feeds her for the hours it owns and no more |
| Lodging / rent | she rents or owns in town; the castle pays wage, not lodging. The only model where she is a townswoman who works at the castle rather than a servant who sleeps somewhere |
| Privacy | complete |
| Personal storage | a household's worth, with no ceiling set by the castle |
| Day off | true. She can be genuinely unreachable — and the establishment must survive that |
| Emergency recall | ~75 min, **conditional**: if the gates are shut, effectively not at all |
| Security | lowest access and lowest exposure — and the highest operational risk. She cannot hold interior night access, so someone else must be able to open the stores at night |

**None of the three is canonized.** All figures are PROPOSED and illustrative.

## 15 · Day-off / recall comparison

Using the existing Deputy Cook relief fact: with Inés off, the Deputy Cook holds
kitchen authority. What changes is not *who* holds it but *whether holding it means
anything*.

| | **A · apartment** | **B · cottage** | **C · town** |
|---|---|---|---|
| Handoff | verbal, minutes before she goes | written the evening before — the distance forces it | fully written, covering the unexpected too |
| Recall | 3 min, and used for anything | ~20 min, used for real problems only | ~75 min, conditional on the gates |
| Herb control | she keeps it in fact | genuinely handed over, with the draw recorded | fully devolved, **including a store key** |
| Menu change | routes back to her anyway | Deputy decides within a written standing limit | Deputy decides and owns the outcome |
| Shortage | solved by fetching her — teaches the establishment nothing | substitute from store, recorded, reviewed on return | must be solved without her: substitute, reduce, or tell the household |
| Personal time | poorest. Proximity erases the day off | real | complete |

The pattern is worth naming, because it is the actual finding of this section:
**the closer she lives, the weaker the Deputy Cook's authority becomes in practice.**
Model A gives the best recall time and the worst succession. Model C gives the worst
recall time and the only arrangement that forces the establishment to be able to run
without her — at the price of a store key in someone else's hand
(`CSZ-DEC-006`, undecided).

## 16 · Wardrobe storage and laundry path

Six rows, `CSZ-WARD-01` … `-06`, connected to THY-WORK-INES-LIFE-ECONOMY-575 without
restating its economy facts.

| Garment | Work storage | Personal storage | Laundry / repair |
|---|---|---|---|
| Work dress | numbered hook and shelf, **staff-link lobby** | model-dependent | soiled → staff-link basket → laundry → same hook |
| Apron | her peg inside the kitchen corridor door | — | daily or on soiling, same path |
| Spare apron | **same peg, behind the worn one** | — | as apron |
| Shoes | shoe shelf, staff-link lobby | outdoor pair lives where she sleeps | cleaned at the lobby; cordwainer for repair |
| Spare clothing | her own locked chest, staff-link lobby | — | staff-link basket → laundry → chest |
| Personal clothing | **none, under any model** | wherever she lives | her own, or household laundry if her terms include it — a 575 question |

Three things this resolves. The **spare apron hangs behind the worn one** — a spare
stored elsewhere is a spare that is not there when it is needed. The **staff-link
lobby is the change point**, which under models B and C stops being a convenience
and becomes a requirement, because the outdoor shoes arrive off a road. And the
**spare clothing chest** is what makes a night recall or a soaking survivable when
she does not live in the building.

Open: the laundry itself is outside this slice and its location is genuinely
unknown (`CSZ-UNK-005`). Six rows terminate there. The garment path is complete
inside the slice and open outside it.

## 17 · Public-safe world sheet

Published as `docs/CASTLE-SERVICE-ZONE-PUBLIC-SHEET.md` and as the database view
`thy_csz_public_world_sheet`. **Not actually published anywhere — prepared only.**

Withheld, structurally rather than by care: all dimensions, all adjacency rows, the
service corridor, the dry store, the staff link, every clear width, every door
count, every link-by-link route, all recall times and all lock and keying detail.
The view exposes no dimension column and no adjacency row at all, and a check
constraint makes flagging a `RESTRICTED_SERVICE` or `SECURE` row as publishable
impossible. Verified: **0** restricted or secure rows reachable from it.

## 18 · ERC mirror

**EdereAirah first. ERC second. Always labelled.**

Windsor and historical royal-kitchen mirrors were used to validate *questions*:
does a great kitchen need that much hearth frontage; does a scullery need two doors
so clean never re-crosses dirty; does an oven room need its own ash route; does a
dry store need to be raised off the floor; does a cold store do its work by mass and
orientation. Every answer was then re-derived from what **this** suite must carry.

Not done: no Earth plan was transcribed, no Earth room was renamed into EdereAirah,
and no ERC mirror is recorded as a native name. Ten native-name slots are held open.

## 19 · Conflicts

| ID | Conflict | State |
|---|---|---|
| `CSZ-CONF-001` | The order requires reading backend 576 first; the backend was unreachable (403) | **OPEN** — proceeded intake-only, projected nothing |
| `CSZ-CONF-002` | All vessels wash in the scullery vs. the large cauldron does not fit the trough | RESOLVED — scoured in place, never enters the scullery |
| `CSZ-CONF-003` | Cutlery homed in the scullery vs. the household ewery may already hold custody | **OPEN** — row scoped to a service-zone holding; one set may not have two homes |
| `CSZ-CONF-004` | The herb path needs water vs. the herb store deliberately has none | RESOLVED — cleaning happens at receiving |
| `CSZ-CONF-005` | Cold store floor sunk 0.90 m vs. site levels belong to 572 | **OPEN** — conditional on 572 |

## 20 · Unknown

Eight, recorded rather than filled:

1. **The EdereAirah native names of all ten rooms.** Until resolved, every room
   carries an ERC mirror as a temporary handle.
2. **Which native herb this is.** Rosemary is a mirror. The real plant sets drying
   time, loft dwell, crock life and waste stream.
3. **Where the dining stair lands.** Two flow steps are UNVERIFIED because of it.
4. **Storey height and plan above the staff link** — model A is unpriceable in space
   terms without it.
5. **Where the laundry is.** Six wardrobe rows terminate there.
6. **Who the Deputy Cook is.** The role is real, the person is not named, and will
   not be invented here.
7. **Whether EdereAirah measures in metres or a native unit.** Every figure in this
   slice is a translation if the answer is the latter.
8. **Where the standpipe water comes from, and whether it runs in winter.** Three
   rooms assume piped water.

## 21 · Exact Chairman decisions

1. **`CSZ-DEC-001` — Which residence model, if any?** A (3-min recall, no privacy,
   no rent, day off erased) / B (20-min recall, real privacy, tenancy question,
   written handoff) / C (75-min conditional recall, complete privacy, Deputy Cook
   must hold a store key). *Silent default: none selected, all three stay live.*
2. **`CSZ-DEC-002` — Native names:** resolved from the mirror registry, Chairman-authored,
   or left open? *Silent default: left open. No name invented.*
3. **`CSZ-DEC-003` — Which native herb** replaces the rosemary mirror? *Silent default:
   NATIVE_HERB_UNRESOLVED, mirror kept and labelled.*
4. **`CSZ-DEC-004` — Metres, or a native unit of measure?** *Silent default: metres,
   flagged as an ERC unit, every figure PROPOSED.*
5. **`CSZ-DEC-005` — The exact real relationship of VYC2ST and ERSATZREALITY to these
   records.** *Silent default: not asserted. Only THYLORA `PUBLISHED_BY` is recorded,
   because that one is known.*
6. **`CSZ-DEC-006` — Under models B and C, may the Deputy Cook hold a store key on
   Inés's days off?** Standing / issued per day / no, and the establishment accepts
   the shortage risk. *Silent default: recorded as a consequence, not decided.*

## 22 · Graph writeback

**Written to the repository, not to the live backend** — the backend was unreachable,
and applying DDL there is a production mutation held for Chairman execution.

`db/castle-service-zone/` — 8 numbered migrations, 17 tables, 1 view, 6 functions,
1 trigger pair, and the seeded slice. Validated on PostgreSQL 16: both passes clean,
seven of seven reject-cases rejected.

Readback from the validated build:

```
spaces 10 · links 19 · flows 4 · flow_steps 29 · herb_states 9
objects 13 · wardrobe_rows 6 · residence_models 3 · relief_rows 3
dimension_states { PROPOSED: 10 }      spaces_claiming_DOCUMENTED 0
native_names_open 10                   objects_homeless 0
steps_failing_fit 0                    steps_unverified 2
teleporting_objects 0                  restricted_rows_published 0
residence_selected 0                   people_named 1
marks_in_world 0
conflicts_open 3 · unknowns_open 8 · decisions_pending 6
canon: all six tables present=false (unreachable from this session)
```

Projection tested both ways: canon absent → `CANON_ABSENT`, nothing created. Canon
present (stub) → **0 rows written, 10 refused as not-fact**.

## 23 · Restart point

`CSZ-RESTART-001`. From a session **with backend egress**, in this order:

1. `select thy_csz_canon_probe();` — establish what the six canon tables actually
   are. Everything else waits on this.
2. `select thy_csz_resolve_native_name(stable_id) from thy_csz_space_intake;` —
   close `CSZ-UNK-001` from the registry rather than by authoring.
3. Reconcile the ten PROPOSED dimensions against whatever
   `thylora_castle_space_geometry` already holds. Canon wins every disagreement;
   this slice's numbers are the ones that move.
4. Complete the column mapping in `thy_csz_project_spaces()` once the real geometry
   columns are known. Guessing them now would fabricate canon.
5. Take `CSZ-DEC-001` to the Chairman with §15 in hand.

Blocked by: backend egress (403), and the eight open unknowns.

---

## Authority position

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority for
  the Chairman dashboard. **Nothing in this delta touches `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. No baseline
  capability was removed, renamed or disconnected.
- `app/`, `public-site/` and `rae-link/` are untouched. This delta adds
  `db/castle-service-zone/`, this workroom, and one public-safe document.
- No image was generated. Nothing was published. No live backend write was made.
