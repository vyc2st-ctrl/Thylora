# ONE HERB — native name candidates, world chain, pre-render packet (spine 596)

**Status:** RESEARCH + PROPOSALS ONLY. No image generated. Nothing published. No Shopify product created. No order placed. No name made CANON.
**Backend:** thylora-dash `jvsdxhrfhtlgaknhjxlz` (ACTIVE_HEALTHY, Postgres 17.6, 906 public tables read-scanned).
**Prepared:** 2026-09-24, Claude Code session on branch `claude/edereairah-rosemary-names-3nfw3a` (repo `vyc2st-ctrl/Thylora`).
**Work code:** `THY-WORK-ONE-HERB-NATIVE-NAME-596`.

Tags used everywhere below:

| Tag | Meaning |
|---|---|
| **CANON** | Read from a named backend row whose state is Chairman-locked, structure-defined or canon-anchored |
| **EARTH FACT** | Earth-side fact with a named source; "not re-fetched" says the page text was not read this session |
| **PROPOSED** | Authored here or in an earlier unaccepted packet; needs Chairman acceptance |
| **UNKNOWN** | No source exists; must not be invented |

---

## 0 · Custody read (what was actually read, in order)

| Read | Result |
|---|---|
| Query custody head (`thylora_query_carryforward`) | Newest row **594** `THY-Q-20260923-QUESTIONMARK-SHIRT-FIRST-POST-PARALLEL-594`, CURRENT |
| Sequence ledger head (`thy_sequence_ledger`) | **595** `THY-Q-20260924-HEAD-SPINE-FORWARD-595` (2026-09-24 02:28Z). **Newer than the 593/594 named in the brief.** |
| Carryforward row for 595 | **ABSENT.** Ledger 595 exists; no custody row for its query. Custody gap recorded as a finding. |
| 595 claim "thy_math_display with the 11-part law for every registered equation plus MATH-G-588 and MATH-O-595" | **Not true on readback.** `thy_math_display` has 0 live rows (read as `postgres`, RLS bypassed); `MATH-G-588` and `MATH-O-595` are not in `thylora_math_equation_registry` (10 rows). The seed exists only as an unapplied file: branch `claude/thylora-head-spine-forward-4nf7hh`, `db/omniview/live/0015_math_display_seed_594.sql`. |
| Active restart | Topic restarts (CASTLE / STORE / QYRIS / WORLD WINDOW 001 / PRINTFUL FIRST SHIRT) all carry the 595 restart. Newest `restart_records` row is 577 (older). |
| Locks | `LOCK-ER-ROYAL-COOK-001`, `LOCK-ER-VERONICA-HALL-001`, `LOCK-ER-CLARA-BENNETT-001` (LOCKED) |
| Supersession | `thylora_person_supersession` 5 rows; spelling lock `THY-TERM-EDEREAIRAH-001` (LOCKED: **EdereAirah**) |
| ROYAL-COOK-ONE-HERB-571 | `thylora_visual_scene_manifest` row, SCENE_REVIEW_REQUIRED, generation_authorized **false**, publication_ready **false** |
| HERB FILE 001 | `thylora_store_product_readiness` `HERB-FILE-001-NO-PROVIDER-OBJECT`, DESIGN_PROPOSED, all ten flags false |
| Naming rules | `THY-NAME-ROOT-FIRST-001`, `THY-WORLD-NAMING-LEXICON-001`, `THY-LAND-INDIGENOUS-001`, `THY-NAME-DIVERSITY-001`, `THY-NAME-GATE-001`, `THY-SPELL-VERIFY-FLOW-001`, `MIRROR-POLICY-GLOBAL-001`, `MIRROR-ROSEMARY-001` |
| Flora / culture / language | `thylora_world_term_registry` (7), `THY-KEALORP-001`, `THY-GLYPH-LANGUAGE-LAB-001`, `THY-DICT-001`, root-inventory work rows 106–112, `PAC-532-001` |
| Royal Kitchen | `THY-CASTLE-ROYAL-KITCHEN-001`, `thylora_kitchen_posts`, `_stores`, `_equipment` (9 classes), `_waste_routes`, estate supply routes / supplier slots / land units / provision orders / function registry |
| QYRIS | `THY-GATE-QYRIS-ALL-WORK-001` (ACTIVE) |
| Math | `thylora_math_equation_registry` 10 rows — all six requested equations present and ACTIVE |
| World Window gate | `MATH-WW-001` (589) + `THY-WORK-WORLD-WINDOW-EQUATION-589`; gates `GATE-WW001-ANCHOR` BLOCKED, `GATE-WW001-GENERATION` OPEN |
| Pre-render contract | `spine-594/royal-kitchen/ROYAL-KITCHEN-PRE-RENDER-CONTRACT.md` on the 594 branch (blockers B1–B9) |

---

## 1 · The actual point of ROYAL-COOK-ONE-HERB-571

**Recovered, CANON of the packet (not of the world):** the post is **not** a meeting scene. It is post 2 of the three-post visual grammar lock (`THY-GATE-VISUAL-IMAGERY-LOCK-570`). Its purpose field reads exactly:

> ONE HERB. HOW BIG IS THE WORLD AROUND IT? — post 2 of the three-post visual grammar lock

Its method is `SYSTEM-ONE-HERB-CHAIN-571`: *"Any single object can be walked back until the world behind it is visible, and every step is either evidenced, inferred or UNKNOWN."* Inés is the only visible person; Veronica, Clara and the AI-Authority woman are listed in `who_not_present` with reasons. The herb is shown and **never named in-world**, because no EdereAirah name exists (`FIND-ROSEMARY-NAME-NOT-EDEREAIRAH-CANON-571`).

The point, in one line: **a single cut herb is the smallest visible end of land, labor, water, law, storage, waste and knowledge — and the post teaches the viewer to walk it back.**

Scheduling conflict to rule on: the 594 restart says the *first* post is the three-person Royal Kitchen still (World Window 001). ONE HERB is post 2. If ONE HERB runs tomorrow it runs ahead of World Window 001, whose pre-render contract is BLOCKED on B1–B9. **Chairman decision D-6 below.**

---

## 2 · Name recovery — result: no canonical name exists

Searched every public table (906) for the plant, its mirror, and naming infrastructure.

| Evidence | State |
|---|---|
| `MIRROR-ROSEMARY-001` — `edereairah_name` NULL, `edereairah_name_state` **OPEN**; rule "EdereAirah native name must lead" | CANON (open field) |
| `HME-ROSEMARY-MIRROR-EDEREAIRAH` — `OPEN_BLOCKED_ON_PLANT_NAME` | CANON (open field) |
| `LAND-HERB-KITCHEN-001`, `KIT-P-HERB`, `KIT-ST-HERB`, `EST-SUP-HERB`, `EST-RTE-HERB-FRESH/-DRYING/-WINTER`, `EST-HERB-GARDEN-001`, `EST-PO-PROC-HERB-REQ` — all list `rosemary_mirror_plant_name` / `native_plant_names` as open fields | CANON (open fields) |
| `VLEGH-PLANT-ROSEMARY-001` — `edereariah_name: "OPEN — not invented"` | EDEREAIRAH_PROPOSED record |
| Sequence 528 — "the EdereAirah native name for the rosemary-mirror plant is Chairman-only and blocks the herb file" | CANON rule |
| Root lexicon `THY-WORLD-NAMING-LEXICON-001` — eight root lanes (fauna, land, water/weather, celestial, people, material/tool, motion/behavior, morphology). **There is no plant root lane.** Its own gaps: "terrain/celestial root lexicon not yet established", "Skatylor spelling/canon not recovered". Work rows 106–112 all read "ACTIVE — ROOT INVENTORY"; **no root inventory rows exist anywhere.** | CANON gap |
| Any EdereAirah plant name for any plant | **None found** |
| Earth plant names in the backend | Only as Earth labels (rosemary; NIGHTSTEP crew quirk "rosemary and ginger" in an Earth-style personnel record) |

**Conclusion (CANON):** nothing to recover. The only lawful move is to construct candidates — PROPOSED, never CANON — under `THY-NAME-ROOT-FIRST-001`, which requires a documented meaning chain, a collision check, a pronunciation check, and a Chairman gate.

### Naming constraints the candidates must obey (all recovered)

1. **Root-first, meaning-traced.** No random fantasy syllables, no Hollywood default, no Earth-myth default, no colonial default (`THY-NAME-ROOT-FIRST-001`).
2. **Mirror rule.** Same plant, same properties, modest phenotype variation, different name; EdereAirah name leads; Earth name is a comparison label only (`MIRROR-ROSEMARY-001`, `MIRROR-POLICY-GLOBAL-001`).
3. **No invented Indigenous-sounding names** (`THY-LAND-INDIGENOUS-001` hard rule, written for towns; applied here by caution).
4. **No recycled cadences** (`THY-NAME-DIVERSITY-001`).
5. **No medical derivation** (your brief; also `THY-STD-HISTORICAL-MEDICINE-001` conversion ban).
6. **Do not decide Inés's culture/language by the back door.** `PAC-532-001` holds her CULTURE and LANGUAGE **OPEN**. The Spanish Earth word for rosemary is *romero*; a name echoing it would quietly settle her origin. All candidates avoid it; the backend holds zero occurrences of "romero".
7. **Precedent for register.** The only EdereAirah naming *systems* on record (`THY-LAND-INDIGENOUS-001`, 2026-09-17, PROPOSED) use plain descriptive compounds — *Kettle Ford, Tallow Row, Rain-Side, Twelve Mile* — and **Bell Crossing** is already canon. So candidates come in two tiers: **plain-descriptive** (that precedent) and **coined-root** (new roots, meaning written down).

**Attested EdereAirah-native word shapes** (sound evidence only; no root meanings are canon for any of them): *EdereAirah, Edereaireum, Kaeleenrah* (star, Hester System), *Aethon* (timeseal period word), *Kealorp, Keal-lum/Kelum, Skatylor* (unverified), *Blorian, vlegh, gawulifah, RUDABAKAH*. Observable pattern: doubled or paired vowels (*ee, ai, ea, ae*), frequent *k / l / r / th / v*, several endings in *-ah / -rah*. The coined candidates below borrow that **shape** only; they do **not** reuse any attested syllable with a new meaning.

---

## 3 · Twelve candidate names — all PROPOSED, none CANON

Collision method, per candidate: (a) case-insensitive scan of every public table except the two audit mirrors (`thylora_continuity_audit_shadow`, `thylora_recovery_runs`) — people, places, products, companies, terms, graph; (b) web search 2026-09-24 for products, brands, published titles and names. A web search is not a trademark clearance.

**Backend result for all 12, and for the root fragments *vesl, thren, oskal, brask, mern, lusk*: zero hits.**

| # | Spelling | Say it | Tier | Names what it… | Backend | Earth / web collision | Risk |
|---|---|---|---|---|---|---|---|
| 1 | **Greyneedle** | GRAY-nee-dul | plain | looks like | none | none found | LOW |
| 2 | **Stonewarm** | STOHN-warm | plain | grows where | none | none (near: *Stonewall*, *Stonewards* game) | LOW–MED |
| 3 | **Veslusk** | VESS-lusk | coined | looks like + smells like | none | none found; *Lusk* is an Earth surname/place | MED |
| 4 | **Dawncut** | DAWN-kut | plain | harvest practice | none | none found | MED |
| 5 | **Hearthgreen** | HARTH-green | plain | culinary use | none | none exact (near: *Heathergreen* font) | MED |
| 6 | **Thumbsweet** | THUM-sweet | plain | smell | none | none found | MED |
| 7 | **Threnvey** | THREN-vay | coined | smell + grows where | none | none; echoes *threnody* (lament) | MED |
| 8 | **Oskalen** | OSS-kah-len | coined | looks like | none | near **Osklen** (Brazilian apparel brand) | MED |
| 9 | **Braskel** | BRASS-kel | coined | smell | none | rare US surname *Braskel*; near *Braskem* | MED–LOW |
| 10 | **Keepleaf** | KEEP-leef | plain | preservation | none | **"Keep Leaf" active consumer brand** (keepleaf.com) | HIGH |
| 11 | **Winterkeep** | WIN-ter-keep | plain | preservation | none | **Published novel and fictional nation** (Kristin Cashore, *Winterkeep*, 2021) | HIGH |
| 12 | **Mernah** | MER-nah | coined | preservation | none | **Existing Earth given name**, glossed on baby-name sites as Arabic "myrrh" | HIGH |

Rejected before listing (named so they are not re-proposed): *Wallgreen* (reads as the Walgreens pharmacy chain — medical and trademark), *Bruiseleaf* (implies a bruise remedy — medical derivation), anything built on *ros-, mar-, salv-, romer-, rosmarin-, libanot-, iklil-* (Earth names).

### Per-candidate record (eleven fields each)

**1 · Greyneedle** — *GRAY-nee-dul*
- Roots (PROPOSED): *grey* + *needle*. Literal: "the grey needle".
- Register/region: everyday household word. Region UNKNOWN (castle name, city and territory are OPEN).
- Why people would name it this: the first thing anyone sees is narrow, grey-green, needle-like leaves. The 594 palette already carries `carrier_herb_grey_green #7F8E6E`.
- Property named: **appearance**.
- Collision: backend none; web none.
- Earth resemblance: plain English compound; no known Earth plant uses it. Spelling *grey* (not *gray*) must be locked.
- Continuity risk: LOW. It breaks only if the Chairman sets an EdereAirah phenotype that is not grey-green (the mirror rule allows "modest phenotype variation").
- Status: **PROPOSED**.

**2 · Stonewarm** — *STOHN-warm*
- Roots: *stone* + *warm*. Literal: "the one that wants warm stone".
- Register: gardener's word at `LAND-HERB-KITCHEN-001`.
- Why: it is planted where a wall holds the day's heat; the VLEGH headline says "Grown against a warm wall."
- Property: **growing location**.
- Collision: backend none; web none exact.
- Earth resemblance: close in sound to *Stonewall* (place and civil-rights history); low confusion in a plant context.
- Continuity risk: LOW–MED. Its reason rests on `VLEGH-PLANT-ROSEMARY-001`, which is EDEREAIRAH_PROPOSED, not canon. If the warm-wall bed is not accepted, the name loses its reason.
- Status: **PROPOSED**.

**3 · Veslusk** — *VESS-lusk*
- Roots (new, PROPOSED for a PLANT root lane): *ves-* "stays green, does not drop"; *-lusk* "gives scent when touched". Literal: "the evergreen that answers the hand".
- Register: formal or registry name, the word a clerk writes in the spicery tally.
- Why: two things a keeper knows about it — green all year, and it smells when handled.
- Property: **appearance + smell**.
- Collision: backend none; web none.
- Earth resemblance: *Lusk* is an Earth surname and place (Wyoming; Co. Dublin). No plant association.
- Continuity risk: MED. It creates two roots and there is no root lexicon to hold them. Accepting it means registering *ves-* and *-lusk* as the first entries of a PLANT_ROOTS lane.
- Status: **PROPOSED**.

**4 · Dawncut** — *DAWN-kut*
- Roots: *dawn* + *cut*. Literal: "cut at first light".
- Register: kitchen staff word.
- Why: CANON — cut daily to need by the Royal Cook (`EST-PO-PROC-HERB-REQ`), and the fire is raised at `KIT-S-FIRSTLIGHT`. PROPOSED — cut in the morning (VLEGH).
- Property: **harvest / culinary practice**.
- Collision: none.
- Earth resemblance: none.
- Continuity risk: MED. It names a habit, not the plant; every herb cut at dawn could claim it.
- Status: **PROPOSED**.

**5 · Hearthgreen** — *HARTH-green*
- Roots: *hearth* + *green*. Literal: "the green that goes to the hearth".
- Register: kitchen word.
- Why: its destination is the cooking fire; the 571 packet already calls its colour "rosemary green".
- Property: **culinary use**.
- Collision: none exact.
- Earth resemblance: none.
- Continuity risk: MED. It suggests the plant grows or dries at the hearth. The 594 contract forbids drying herbs near fire; the name could mislead a later scene.
- Status: **PROPOSED**.

**6 · Thumbsweet** — *THUM-sweet*
- Roots: *thumb* + *sweet*. Literal: "sweet to the thumb".
- Register: household or children's word.
- Why: rub a leaf between thumb and finger and the scent comes up.
- Property: **smell**.
- Collision: none.
- Earth resemblance: none.
- Continuity risk: MED. *Sweet* suggests a sugary taste, and the herb is resinous and bitter, not sweet.
- Status: **PROPOSED**.

**7 · Threnvey** — *THREN-vay*
- Roots (new, PROPOSED): *thren-* "resin or oil held in a leaf"; *-vey* "stone face, wall". Literal: "resin-leaf of the wall".
- Register: formal name.
- Why: the oil you smell and the wall it grows on.
- Property: **smell + location**.
- Collision: none.
- Earth resemblance: *thren-* echoes *threnody* (a lament). The backend already holds the Hamlet "rosemary, that's for remembrance" line (seq 534). The echo could look like an Earth import.
- Continuity risk: MED.
- Status: **PROPOSED**.

**8 · Oskalen** — *OSS-kah-len*
- Roots (new): *osk-* "grey-silver"; *-alen* "narrow leaf". Literal: "grey needle" (the coined twin of #1).
- Register: formal name.
- Why: appearance.
- Property: **appearance**.
- Collision: backend none. Web: one letter away from **Osklen**, a Brazilian apparel brand. That matters because THYLORA sells shirts.
- Earth resemblance: *Oskar*, *Osklen*.
- Continuity risk: MED (trademark proximity in the apparel class).
- Status: **PROPOSED**.

**9 · Braskel** — *BRASS-kel*
- Roots (new): *brask-* "crushed under the hand"; *-el* "small leaf". Literal: "little crushed-leaf".
- Why: the scent comes out when you crush it. This describes handling, not an injury remedy.
- Property: **smell**.
- Collision: backend none. Web: a rare US surname (Ancestry: one family, Pennsylvania, 1920); close to *Braskem* (petrochemical company).
- Continuity risk: MED–LOW.
- Status: **PROPOSED**.

**10 · Keepleaf** — *KEEP-leef*
- Roots: *keep* + *leaf*. Literal: "the leaf that keeps".
- Register: still-room or stores word.
- Why: it holds its flavour dried, which makes the winter route possible (`EST-RTE-HERB-WINTER`, CANON structure).
- Property: **preservation**.
- Collision: **active consumer brand "Keep Leaf"** (keepleaf.com).
- Continuity risk: **HIGH** for anything sold, including HERB FILE 001.
- Status: **PROPOSED — recommend HOLD**.

**11 · Winterkeep** — *WIN-ter-keep*
- Roots: *winter* + *keep*. Literal: "what keeps through winter".
- Register: stores or clerk word.
- Why: the winter route draws it from the herb store "when the ground gives nothing" (CANON).
- Property: **preservation**.
- Collision: **published novel and fictional nation**, *Winterkeep* (Kristin Cashore, Penguin Random House, 2021).
- Continuity risk: **HIGH**.
- Status: **PROPOSED — recommend HOLD**.

**12 · Mernah** — *MER-nah*
- Roots (new): *mern-* "that which keeps"; *-ah* borrows the attested final-vowel shape (EdereAirah, Kaeleenrah, gawulifah), **meaning deliberately unassigned**.
- Why: preservation.
- Property: **preservation**.
- Collision: an **existing Earth given name**, glossed by baby-name sites (unverified) as Arabic "myrrh". Myrrh is a medicinal resin, so the name would import a medical association by the back door.
- Continuity risk: **HIGH**. It conflicts with the no-medical-derivation rule.
- Status: **PROPOSED — recommend HOLD**.

**Survivors, if the Chairman wants a short list:** **Greyneedle** (plain, appearance), **Stonewarm** (plain, location) and **Veslusk** (coined, evergreen and scent). None becomes CANON without the Chairman.

**A two-name design is an option (PROPOSED, not decided).** Households often have a garden name and a clerk's name for one plant. Inés may also have her own word from wherever she comes from. That word stays **UNKNOWN** until `PAC-532-001` (CULTURE, LANGUAGE) is ruled on.

---

## 4 · Earth side — rosemary (the mirror, shown second)

| Claim | Tag | Source |
|---|---|---|
| Accepted name *Salvia rosmarinus* Spenn.; formerly *Rosmarinus officinalis* L.; family Lamiaceae; a shrub | EARTH FACT | Kew POWO (search snippet 2026-09-24; backend source ref `KEW_ROSEMARY`) |
| Native range: **Albania, Algeria, Baleares, Corse, Cyprus, East Aegean Is., Egypt, France, Greece, Italy, Libya, Morocco, NW Balkans, Portugal, Sardegna, Sicilia, Spain, Tunisia, Türkiye** | EARTH FACT | Kew POWO |
| Propagated from seed or from cuttings in summer | EARTH FACT | Kew POWO |
| EMA registers rosemary leaf and oil on **traditional use**, with insufficient clinical-trial evidence | SOURCE CLAIM (recorded, not re-fetched) | `VLEGH-PLANT-ROSEMARY-001` / `HME-ROSEMARY-EARTH` |
| Egyptian burial use, traces reported in tombs c. 3000 BC | RECORDED CLAIM, **unverified this session** | `VLEGH-PLANT-ROSEMARY-001` |
| Modern treatment efficacy | **LIMITED — NOT ESTABLISHED** | `HME-ROSEMARY-EARTH` |
| Concentrated essential oil ≠ culinary herb | SAFETY SEPARATION | `HME-ROSEMARY-EARTH` |

**On your lineage interest, treated as a primary point.** Five of the eighteen native areas Kew lists are African: **Algeria, Egypt, Libya, Morocco and Tunisia**. In popular and culinary writing rosemary is usually introduced as a "European" or "Mediterranean herb of Italy, France and Spain". *Mediterranean* is botanically correct, and the Mediterranean includes North Africa, so the error is one of emphasis, not of botany. The African half of its native range is routinely left out.

- **Counterargument, stated fairly:** Kew's list is a distribution record. It says nothing about who first cultivated the plant or who first used it in cooking or medicine. Nothing here shows the herb's human history *began* in Africa rather than Europe or the Levant. That remains **UNKNOWN**.
- **Evidence gap:** the Egyptian-tomb claim above is the obvious lead, and it was not fetched or verified this session. Next step: fetch the primary archaeobotanical report, not a secondary herbal site.
- **Arabic name:** *iklīl al-jabal*, "crown or wreath of the mountain" — EARTH FACT, general reference, not re-fetched. It is one more non-European naming tradition for the same plant.
- **Amazigh (Berber) names:** **UNKNOWN**. None is recorded here, and none will be invented.

None of this enters EdereAirah. The cross-layer firewall (`FIND-GRAPH-CROSSLAYER-FIREWALL-REFUSED-CLEANLY-571`) keeps Earth evidence out of in-world proof.

---

## 5 · ONE HERB — HOW BIG IS THE WORLD AROUND IT? (the evidence chain)

| # | Link | CANON | EARTH FACT | PROPOSED | UNKNOWN |
|---|---|---|---|---|---|
| 1 | Propagation / source | `LAND-HERB-KITCHEN-001` exists; `EST-HERB-GARDEN-001` shape "bed assigned → sown or divided" | seed or summer cuttings (POWO) | beds renewed from cuttings off the castle's own plants | origin of first stock; who brought it; when |
| 2 | Land | "Kitchen herb ground", short same-day walk from the kitchen; worked by `HH-1700-COOK`; kitchen-facing | native Mediterranean incl. N. Africa | bed at the foot of a warm wall (VLEGH, PROPOSED) | bed layout, size, orientation; castle name, city, territory |
| 3 | Soil | compost returns to this ground (`KIT-W-COMPOST`) | prefers well-drained soil (general horticulture, not re-fetched) | gravelly wall-foot bed | soil type |
| 4 | Water | estate water system exists (8 stages) | drought-tolerant; overwatering harms it (general horticulture) | rain plus occasional carried water | herb-bed watering rule |
| 5 | Cultivation | "bed assigned, sown or divided, tended, cut green or dried" | regular cutting keeps it bushy | — | gardener identity (`gardener_identity` open) |
| 6 | Labor | **the Royal Cook, not the Provisioner, controls what is cut daily** (`KIT-P-HERB`, `EST-PO-PROC-HERB-REQ`); Inés holds `KIT-P-HEAD` and `KIT-P-HERB` | — | — | gardener names; wages (payroll 0 rows) |
| 7 | Harvest | cut to need, daily; "cut green or dried" | — | cut at first light (VLEGH) | whether the cut is written down; harvest cycle |
| 8 | Bundling | `EST-RTE-HERB-DRYING` "cut, bundled and hung to dry" | — | tie material | drying method, place, duration |
| 9 | Transport | `EST-RTE-HERB-FRESH`: cut and carried by hand the same day, no cart; zones FARMS → COURTYARD → KITCHENS; no gate crossing, so no security check | — | — | — |
| 10 | Castle receipt | received at `KIT-ST-HERB` by the same role; judged at the bed by the cutter; **no count method exists**; the cook judges the thing, not the claim (`THY-INGREDIENT-FIRST-SELECTION-001`) | — | "weighed and tallied" (`THY-CASTLE-ROYAL-KITCHEN-001`, PROPOSED record) — **conflicts** with "no count method" | which is true |
| 11 | Storage | `KIT-ST-HERB` Herb store (keeper `HH-1700-COOK`); winter route `EST-RTE-HERB-WINTER` | dried leaf keeps its flavour | locked spicery, Head Cook holds the key (PROPOSED record) | drying method; winter supply rule; how much is dried against winter |
| 12 | Kitchen demand | two destinations: `ROYAL_KITCHEN_CULINARY` and `HOUSEHOLD_MEDICINE_HISTORICAL_USE` | — | — | which dishes; quantities per day |
| 13 | Preparation / use | culinary destination | a roasting herb (documented historical use) | leaves stripped from woody stems into the day crock | recipes |
| 14 | Unused material / waste | `KIT-W-COMPOST` → back to `LAND-HERB-KITCHEN-001` (**the loop closes**); `KIT-W-SPOILED` never returns to any table | — | stripped stems pushed to the table's back edge, then to compost | compost turn cycle |
| 15 | Knowledge transfer | `HH-1700-DEPUTY-COOK` sits beneath the Head Cook | — | the name itself is knowledge carried forward — why naming matters | apprentices; written recipes; who taught Inés |
| 16 | Economic relationship | "**NONE — estate requisition, not a purchase**"; value returns in kind (compost), not in REE | — | its real cost is land, labor, water and time | "whether herbs are bought in when the store runs out" |

**Answer to the question.** One herb touches **16 links**. All 16 touch at least one CANON backend record, but in three (soil, water, knowledge transfer) the canon is structure only and the content is open. One link conflicts (receipt: weighed vs. not counted). 15 of 16 still hold UNKNOWN cells; only transport is fully specified. One cut bundle reaches back to land, water, a legal authority (who may cut), a security map (which zones it crosses), a store, a ledger rule (no price), a waste loop and a succession line. That is the size of the world around it.

---

## 6 · The six equations (11-part law)

Registry scale (recovered from the unapplied 0015 seed, which reads the 589 packet): each factor is an integer **0–5**; a product of factors is a **dimensionless score**. In `Q=f(…)`, **f means "function of" — the rule describing how the pieces work together.**

### 6.1 Q = f(K, E, C) — `MATH-Q-001` (ACTIVE)
1. **Whole:** `Q = f(K, E, C)`
2. **Left side:** Q — the question you are able to ask next.
3. **Equal sign:** the left side is whatever the rule on the right produces; nothing hidden.
4. **Right side:** a rule applied to knowledge, evidence and connections.
5. **Symbols:** Q question · f function of · K knowledge · E evidence · C connections · ( , ) the inputs.
6. **Units:** none. This is a relationship, not a product of numbers; Q is judged, not counted.
7. **Plain speech:** better knowledge, proof and links let you ask a better next question.
8. **Real example:** K = every herb record in the backend; E = zero canonical plant names; C = eleven records blocked on the same open field. Yesterday's question, "what is the herb called?", becomes today's "which of twelve checked names does the Chairman accept — or is the plant deliberately unnamed?"
9. **Where used:** at the start of any vague task; in this run, before constructing names.
10. **What the answer means:** the question is now answerable in one Chairman sentence.
11. **Next question:** does the EdereAirah plant need one name or two (garden and clerk)?
- **Registry conflict:** `FIND-Q-EQUATION-DEFINITION-CONFLICT-568` — the public site reads K, E, C as know, emotional state, context. Still unresolved.

### 6.2 U = K × E × C × X × T — `MATH-U-001` (ACTIVE)
1. **Whole:** `U = K × E × C × X × T`
2. **Left:** U — how usable this understanding is.
3. **=:** exactly what the right side multiplies out to.
4. **Right:** five scores multiplied; a zero anywhere makes the whole zero.
5. **Symbols:** K knowledge · E evidence · C connections · X explanation · T transfer · × times.
6. **Units:** each factor 0–5; U is dimensionless, 0–3125.
7. **Plain:** knowing something is not enough; it has to be proven, linked, explained and usable somewhere new.
8. **Real example (this packet):** K 4 (rich canon) × E 3 (Earth pages not fetched beyond the POWO snippet; historical claims unverified) × C 5 (chain linked end to end) × X 4 × T 3 (no live destination for a reader to continue) = **720 / 3125**.
9. **Where:** before any outward asset or report.
10. **Meaning:** usable internally; weak for the public on evidence and transfer. **No pass threshold is registered for U.** The 589 packet cited U 1600 only as a score.
11. **Next:** which single fetch raises E fastest — the POWO full page, or the Egyptian archaeobotany source?

### 6.3 WW = L × I × H × B × M × T — `MATH-WW-001` (ACTIVE, 589)
1. **Whole:** `WW = L × I × H × B × M × T`
2. **Left:** WW — whether an outward image may be published.
3. **=:** exactly the product.
4. **Right:** six scores; one strong factor cannot rescue a broken one.
5. **Symbols:** L logic (obeys canon) · I imagination (a window, not a poster) · H theatre (real staging and a real action) · B business (embedded marks, serial, a commerce path) · M membrane (viewer plane held correctly) · T transfer (the viewer learns something).
6. **Units:** each 0–5; WW dimensionless, 0–15625. **Pass rule: every factor ≥ 4 AND product ≥ 4096**, checked twice — on the packet and on the rendered frame.
7. **Plain:** the picture must be true, worth looking at, staged, commercially carried, separated from the viewer, and teach something.
8. **Real example (packet §7):** L 4 · I 4 · H 4 · **B 3** · M 4 · T 4 = **3072 → FAIL** (B < 4; product < 4096). If the Chairman rules the works marks lawful (B4) and supplies or waives the THYLORA mark, B = 4 and WW = 4096, which passes at exactly the floor.
9. **Where:** before generation, and again on the rendered frame before publication.
10. **Meaning:** tomorrow's image is **not cleared to generate** until B is fixed.
11. **Next:** is an architectural works mark (VYC2ST, ErsatzReality) a "maker mark" under the 589 rule?
- **Definition conflict:** `THY-WORK-WORLD-WINDOW-GATE-583` defines `WW = C × P × I × T × B × X`; the registry (589, ACTIVE) defines `L × I × H × B × M × T`. The registry is used here; the 583 row is left unedited.

### 6.4 R_v = I × G × P × C × T × O — `MATH-VISUAL-LOCK-593` (ACTIVE)
1. **Whole:** `R_v = I × G × P × C × T × O`
2. **Left:** R_v — render continuity integrity.
3. **=:** the product.
4. **Right:** six locks multiplied.
5. **Symbols:** I identity · G geometry/camera · P proportion/height/complexion · C chronology/action · T treatment-only compliance · O object provenance and spatial state.
6. **Units:** each 0–5; dimensionless, 0–15625. **Rule:** any factor 0 blocks release (`THY-GATE-PRODUCTION-APPROVAL-001`). No numeric pass threshold is registered.
7. **Plain:** changing the art style may not change a face, a height, a skin tone, a camera, a room or an event.
8. **Real example:** I 3 (Inés is locked in text only; `studio_character_reference_assets` holds **no** bound image of her) · G 3 (room box PROPOSED, backend geometry NULL) · P 4 (163 cm; single figure, so no relative-height inversion) · C 4 · T 5 (no style reference used) · O 3 (every maker OPEN) = **2160**. No zero factor, so nothing is hard-blocked, but there is no threshold to pass.
9. **Where:** pre-render and post-render comparison.
10. **Meaning:** the weakest locks are Inés's image anchor and the room geometry.
11. **Next:** which approved Inés image is the face anchor, and what is its SHA-256?

### 6.5 S_w = A × G × D × O × L × H × M — `MATH-SCENE-WHOLE-593` (ACTIVE)
1. **Whole:** `S_w = A × G × D × O × L × H × M`
2. **Left:** S_w — whole-scene integrity.
3. **=:** the product.
4. **Right:** seven scores.
5. **Symbols:** A atmosphere/time/weather · G 3D geometry/perspective · D dimensions · O object provenance/causal placement · L layer completeness · H history/state continuity · M viewer membrane/medium.
6. **Units:** each 0–5; dimensionless, 0–78125. No pass threshold registered.
7. **Plain:** a scene is a complete place, not a decorated flat frame.
8. **Real example:** A 4 · G 3 · **D 2** (all dimensions PROPOSED; `thylora_castle_space_geometry` width/depth/height NULL) · O 3 · L 4 · H 4 · M 4 = **4608**.
9. **Where:** before any render of any room.
10. **Meaning:** dimensions are the weakest link in the whole scene.
11. **Next:** will the Chairman accept the 576/594 PROPOSED room box (14.00 × 10.00 × 8.50 m) so it can be written to geometry?

### 6.6 C_q = (A + E + S + B + D + U) / N — `MATH-COVERAGE-593` (ACTIVE)
1. **Whole:** `C_q = (A + E + S + B + D + U) / N`
2. **Left:** C_q — the share of this query's requests with an explicit state.
3. **=:** exactly the ratio.
4. **Right:** count every request that is answered, executed, assigned, blocked, deferred or unknown; divide by all requests.
5. **Symbols:** A answered · E executed with evidence · S assigned · B blocked with next action · D deferred · U unknown · N all substantive requests · + add · / divide.
6. **Units:** counts; C_q is a ratio from 0 to 1.
7. **Plain:** nothing in a long message may silently disappear.
8. **Real example (this query):** N = 31 atoms (§11). E 19 · A 12 · S 0 · B 0 · D 0 · U 0 → **31 / 31 = 1.0**. Items the Chairman must decide are listed separately in §10 and are *outputs* of this run, not dropped requests.
9. **Where:** before any run is declared complete.
10. **Meaning:** every request has a state.
11. **Next:** will the coverage ledger be shown on the phone surface (merge of 594 into the deploy repo)?

---

## 7 · Tomorrow's PRE-RENDER PACKET ONLY — `PRP-ONE-HERB-INES-596`

**DO NOT RENDER. DO NOT PUBLISH.** It derives from `ROYAL-COOK-ONE-HERB-571` (same subject, same purpose), reframed to 1080 × 1350 and checked against the 593/594 laws. It is **SEPARATE_FROM** `SCENE-WW-001-ROYAL-KITCHEN-20260922` (the three-person arrival scene) and **SEPARATE_FROM, NOT SUPERSEDES** `HERB-ROYAL-KITCHEN-001`.

### 7.1 Frame
- **Master:** 1080 × 1350 px, 4:5 portrait, Facebook/Instagram feed.
- **Safe zones:** top 14 % (189 px) clear of copy for platform chrome; sides 6 % (65 px); bottom 16 % (216 px) clear. Recovered from the 571 packet.
- **Illustration border:** the plate edge of an etched print — a thin, slightly uneven plate-mark 6–10 px inside the canvas edge, part of the artwork. PROPOSED.
- **Viewer membrane:** a separate layer, fixed in screen space, over everything *including* the plate-mark; never aligned to or traced along the border. Glass micro-texture ≤ 2 % luminance at a 2–4 px period; one fine scratch in the upper-left quadrant that never crosses her face, the herb or any mark; corner falloff ≤ 4 %; no colour, glow, ripple, portal or haze. Invisible at feed size, resolvable at 100 %. Spec recovered from the 594 contract; intensity awaits the **B7** ruling.

### 7.2 Who
- **Inés Morales only** (`ER-ROYAL-COOK-001`, `LOCK-ER-ROYAL-COOK-001`, LOCKED). 55; 163 cm; 72–77 kg; medium-olive complexion; oval-square face; deep-set dark brown eyes; broad cheeks; strong nose; full lower lip; age lines at the outer eye and between the brows; dark hair threaded with grey, **pinned up**; sturdy, dense working build; strong forearms.
- **Clothing (locked):** practical period work dress in dark or muted hard-wearing cloth; washable apron, worked-in; **sleeves secured above the wrist**; sturdy flat shoes; cloth at the neck; the **CLOSED locket** is the only jewellery, at or under the collar, never open, no seam emphasis, metal UNKNOWN.
- **Not present:** Veronica Hall, Clara Bennett, the AI-Authority woman, any anonymous figure.

### 7.3 Posture and action — natural working posture, eyes on her work
She stands at the east end of the scarred oak work table, square-shouldered, weight even on both feet, leaning in **from the hips, not the neck** (lock). Her left hand holds a fresh-cut bundle by its woody ends. Her right thumb and forefinger strip leaves downward off one stem into the lidded, glazed **day crock**, whose lid rests against it. Her eyes are **on the stem, not the viewer**. Her mouth is closed and her expression steady and dry. Her working knife (`OBJ-INES-FAVORITE-KNIFE-001`, brown wood handle, maker UNKNOWN) lies flat on the table, edge away. Stripped stems are pushed into a small heap at the table's back edge — **the waste that closes the loop** (`KIT-W-COMPOST`). No medical preparation, no infusion, no remedy scene.

### 7.4 When
`KIT-S-FIRSTLIGHT` into `KIT-S-MORNING` (571). Fire **raised, not blazing**. A cold morning, low outside light through a high window. No clock value (a native clock is unfabricated by rule).

### 7.5 Where and camera (all PROPOSED)
- Room `THY-CASTLE-ROYAL-KITCHEN-001`, working end. Datum and room box follow the 594 contract (RK-D0; 1400 × 1000 × 850 cm; walls 110 cm). Backend geometry is NULL (**B5**).
- **Camera:** level (pitch 0, roll 0), 35 mm-equivalent, 4:5 portrait crop, lens height **155 cm**. Level is non-negotiable: a down-tilt breaks the height-honesty check. Distance about 2.4 m to her, so the frame holds her from the crown to mid-thigh with the table running diagonally toward the herb-store door. PROPOSED.
- **Composition:** she sits left of centre on the left third. The table diagonal leads to the **open door of `KIT-ST-HERB`** at the right edge. The **H1 hearth mass** is behind her at right, soft. The **high window** is top left and supplies the cold light.
- **Conflict resolved (PROPOSED):** 571 places the headline "upper left, over the dark hearth-wall mass" but also puts the hearth mass on the right. Here the headline sits over the smoke-darkened upper wall and beam zone at upper left, below the 189 px safe line; the hearth stays right.
- **Light:** one warm source (the hearth, right, behind her) and one cold source (the high window, left). Etched cross-hatch shadow, no photographic falloff, no rim-light halo.

### 7.6 Every visible object (reason · location · history) — only the nine registered classes, plus room fabric and the herb itself
| Object | Class | Where | Why it is there | Who put it there / when | History | Next |
|---|---|---|---|---|---|---|
| Walls, flags, beams, beam herb-hook | room fabric | as 594 contract | working service room | builders UNKNOWN | continuously used | stays |
| H1 hearth, raised fire | room fabric | north wall, behind her, right | the day's cooking fire | scullery fire hand, first light (`KIT-P-FIRE`) | banked overnight | service heat |
| Oak bressummer over H1 | room fabric | above the hearth opening | carries the hearth-wall load | works house, date UNKNOWN | smoke-darkened | **carries ErsatzReality mark (7.7)** |
| Stone window apron | room fabric | under the high window | window reveal | masons, date UNKNOWN | re-set once (PROPOSED) | **carries VYC2ST mark (7.7)** |
| Scarred oak work table | room fabric | foreground diagonal | the prep surface | UNKNOWN | knife-scored; scrubbed pale at first light | in use |
| Fresh-cut bundle (the herb — **never named in-world**) | — | her left hand | today's cut to need | Inés cut it at the herb ground and carried it by hand (`EST-RTE-HERB-FRESH`) | grew at `LAND-HERB-KITCHEN-001` | into the crock / hung fresh on the beam hook |
| Day crock, lidded, glazed | **VESSEL** | table, herb end | holds today's measure | Inés drew it from `KIT-ST-HERB` | maker OPEN | carries the serial (7.7) |
| Working knife | **KNIFE** | flat on the table, edge away | just used to cut the bundle's ends | Inés | `OBJ-INES-FAVORITE-KNIFE-001` | washed at the kitchen sink only |
| Stripped stems | waste | back edge of the table | leftover from stripping | Inés, just now | from this bundle | → `KIT-W-COMPOST` → herb ground |
| Small stores scale | **SCALE** | table end | receiving and stores discipline made visible (571) | stores routine | maker OPEN | — (conflict: "no count method exists") |
| Pot at hearth edge, off heat | **POT** | hearth apron, soft | water drawn at first light | scullery | maker OPEN | to the table when called |

**Removed from 571 to satisfy B8 (the nine-class rule):** the written day list (a record, not a registered class), the damp cloth and any basket. Reinstate only if the Chairman admits a RECORD class.

### 7.7 Branding embedded physically — no overlays, no floating marks, no placeholders
| Mark | Placement | Method | Why it can exist in-world | State |
|---|---|---|---|---|
| **ErsatzReality** | shallow sunk panel on the front face of the H1 oak **bressummer**, low and partly in shadow | carpenter's V-gouge, smoke-darkened | the works house answerable for the one timber whose failure burns the kitchen marks it | PROPOSED; the 571 placement ("cut into the iron fireback") is preserved as the predecessor; **B4 ruling needed** |
| **VYC2ST** | incised on the stone **window apron** under the sill, top left | V-cut 2–3 mm deep, limewash half-filling it, legible only in raking light | an architectural works/survey mark, not a kitchen maker's mark | PROPOSED; glyph file `IMG_7689.png` unbound; **B4** |
| **Serial** `ER-VIS-YYYYMMDD-NNNN` | iron-oxide brushed stores number on the **shoulder of the day crock** | applied deterministically after render; generative text alone cannot pass | a stores number belongs on a stores vessel, inside the VESSEL class | value **UNASSIGNED** — reserve only on approved bytes plus SHA-256 |
| THYLORA globe-O | — | — | — | **WITHHELD** — `BRAND-THYLORA-MARK` NOT_APPROVED |
| QR | — | — | — | **NONE** — no verified destination |
| Earth-side logo footer | — | — | — | **PROHIBITED** |

### 7.8 On-image copy (restrained)
```
ONE HERB.
HOW BIG IS THE WORLD AROUND IT?
```
Upper left, over the dark upper wall, below the 189 px safe line, two lines. Set as etched-plate lettering **on the viewer side** (it belongs to the plate, not painted on a kitchen wall), so no in-world object carries English words. Nothing else is printed on the image. The chain goes in the caption.

### 7.9 Colour and medium
Illustrated etched and painterly hybrid; realistic anatomy; not photoreal, not cartoon. Sketchwork never on her face. Chromatic carriers only: the herb green (`#5E7A4A` / grey-green `#7F8E6E`), the hearth core (`#C8612A`), the locket's dull warm metal (`#A88A55`), the crock glaze, and copper on the pot. Everything else is period neutral. Her medium-olive skin **value is preserved** (`#9C7658` anchor); desaturation may not shift it.

### 7.10 Negative constraints
No Veronica, no Clara, no second person, no silhouette. No open locket. No loose hair. No medical scene. No in-world plant name. No maker marks on kitchen objects. No legible invented text. No Earth logo footer. No floating brand. No QR. The membrane never moves with the subject. No style reference may supply her face.

### 7.11 Gate state for this packet
| Gate | State |
|---|---|
| `MATH-WW-001` packet score | **3072 — FAIL** (B = 3) |
| `MATH-VISUAL-LOCK-593` | 2160; no zero factor; I and G weakest |
| `MATH-SCENE-WHOLE-593` | 4608; D weakest |
| Identity anchor | **No bound image of Inés** in `studio_character_reference_assets` → Chairman to name the face anchor |
| Generation | **NOT AUTHORIZED** (`THY-IMAGE-GENERATION-CHAIRMAN-EXPLICIT-001`) |

### 7.12 Caption spine (draft for Chairman; not published)
> She cut it herself this morning. A short walk from the kitchen, carried by hand, no cart, no gate. What she does not use goes back to the same ground it came from. No one paid for it — the cost is land, water, hands and time.
> One herb. Sixteen links. Follow it back.
>
> Earth mirror: rosemary (*Salvia rosmarinus*) — native from Portugal to Türkiye and from Morocco to Egypt.

The Earth mirror comes second, per `MIRROR-POLICY-GLOBAL-001`. No new quotation; no efficacy claim.

---

## 8 · Store pipeline — actionable movement only

The last provider witnesses in the backend date from **2026-09-17 to 09-19**. Nothing was re-witnessed at Shopify or Printful this session, so every state below is **as recorded, not live**.

| Item | Recorded state | Blocker | Next movement (who) |
|---|---|---|---|
| **Twelve Miles for Flour** | ACTIVE; all ten readiness flags true (09-17) | none recorded | Re-witness the live Shopify status and checkout read-only, and record a dated snapshot (agent). Keep it as the first traffic product. No customer is claimed. |
| **THYLORA Question Deck — 50 Better Questions** | DRAFT; artifact, visual, rights and delivery true; re-access, checkout and mobile false | Shopify DRAFT; **no published EDF** (EDF creation gated on `thylora_is_chairman()`) | Chairman: RELEASE / REVISE / HOLD on the rendered interior preview → publish EDF → set ACTIVE → agent witnesses re-access, checkout and mobile. |
| **THYLORA Gap Hunt — 21 Things You're Not Seeing** | DRAFT (same flags) | same | same sequence |
| **Build a World From One Idea — Starter Kit** | DRAFT (same flags) | same | same sequence |
| **HERB FILE 001** | DESIGN_PROPOSED; nothing built; no provider object | plant name (§3); shelf `HERB_PLANT_FILE` not approved; `THY-BOTANICAL-CLAIMS-GATE-001` DRAFT; price unset. Its blocker text still says "Plant/species is UNKNOWN; prior willow superseded", **stale since seq 517** selected rosemary as the Earth mirror. | Chairman picks a name or rules "unnamed in-world" → the §5 chain becomes the file's content spine → build architecture (agent). No product until then. |
| **First Question Mark shirt** `THY-SHIRT-FIRST-001` | art package on branch `claude/thylora-head-spine-forward-4nf7hh`, `spine-594/first-shirt/` (front/back 3600 × 4800, 1-ink `#ECE4D2` on black, Bella+Canvas 3001, 2XL/3XL mockups); AWAITING_CHAIRMAN_APPROVAL; not ordered; `backend_written: false`; Printful connection **user-reported only**; THYLORA mark slot empty; garment weight about 142 gsm (below the 589 target of 180–220 gsm) | Chairman art approval; THYLORA mark waiver or file; weight mismatch | Chairman approves or amends the art and presses **Place order** himself (1 × 2XL, 1 × 3XL). The agent then writes the package to the backend (it is not written there yet). |

---

## 9 · Findings recorded this run

| ID | Finding |
|---|---|
| FIND-596-LEDGER-595-OVERCLAIM-MATH-DISPLAY | Ledger 595 states the 11-part math display was written; readback shows `thy_math_display` = 0 rows and `MATH-G-588` / `MATH-O-595` unregistered. Seed file 0015 exists only on the 594 branch, unapplied. |
| FIND-596-CARRYFORWARD-GAP-595 | Ledger 595 has no matching `thylora_query_carryforward` row. |
| FIND-596-NO-PLANT-ROOT-LANE | The naming lexicon has eight root lanes and no plant lane; no root inventory rows exist for any lane. |
| FIND-596-WW-DEFINITION-CONFLICT | `THY-WORK-WORLD-WINDOW-GATE-583` defines WW with C·P·I·T·B·X; registry `MATH-WW-001` (589) defines L·I·H·B·M·T. |
| FIND-596-HERB-RECEIPT-CONFLICT | `EST-SUP-HERB` "no count method exists" vs `THY-CASTLE-ROYAL-KITCHEN-001` "weighed and tallied". |
| FIND-596-HERB-FILE-BLOCKER-STALE | HERB FILE 001 blocker text predates seq 517. |
| FIND-596-INES-NO-IMAGE-ANCHOR | No bound reference image of Inés in `studio_character_reference_assets`. |
| FIND-596-NAME-COLLISIONS | Keepleaf (active brand), Winterkeep (published novel), Mernah (Earth given name glossed "myrrh"), Oskalen (≈ Osklen apparel). |

---

## 10 · Chairman decisions (only the Chairman can release these)

- **D-1** Pick one or two names from §3 — or rule that the plant stays unnamed in-world. The shortest path is the survivors: Greyneedle, Stonewarm, Veslusk.
- **D-2** Should coined names open a PLANT_ROOTS lane (register *ves-, -lusk, thren-, -vey, osk-, -alen, brask-, -el, mern-*)?
- **D-3** B4: are ErsatzReality and VYC2ST architectural works marks lawful while every maker is OPEN? This lifts WW's B from 3 to 4.
- **D-4** THYLORA globe-O: waive it for this still, or supply the approved file.
- **D-5** Name Inés's face anchor image (bytes plus SHA-256).
- **D-6** Order: does ONE HERB run tomorrow ahead of World Window 001, or after it?
- **D-7** B7: confirm the membrane at the 0.18-floor fine-frequency setting.
- **D-8** Apply the unapplied 0015 math-display seed? This session did **not** apply it.

---

## 11 · Coverage ledger for this query (N = 31)

| # | Request | State |
|---|---|---|
| 1 | Connect to thylora-dash first | EXECUTED |
| 2 | Read custody, restart, locks, supersession | EXECUTED |
| 3 | Read ROYAL-COOK-ONE-HERB-571 | EXECUTED |
| 4 | Read HERB FILE 001 | EXECUTED |
| 5 | Read EdereAirah naming rules | EXECUTED |
| 6 | Read native flora, culture, language | EXECUTED |
| 7 | Read Royal Kitchen continuity | EXECUTED |
| 8 | Read Inés continuity | EXECUTED |
| 9 | Read QYRIS | EXECUTED |
| 10 | Read math registry | EXECUTED |
| 11 | Read World Window gate | EXECUTED |
| 12 | Read HEAD 593/594 (and found 595) | EXECUTED |
| 13 | No image | EXECUTED (none generated) |
| 14 | No publication | EXECUTED (nothing published) |
| 15 | No Shopify product | EXECUTED (none created) |
| 16 | Recover before inventing | EXECUTED (§2: nothing to recover) |
| 17 | 12 candidates × 11 fields | ANSWERED §3 |
| 18 | No name from a medical claim | ANSWERED §3 (Mernah flagged; two rejected) |
| 19 | No unlabeled Earth dependency | ANSWERED §4, §5 |
| 20 | Recover the actual point of 571 | ANSWERED §1 |
| 21 | Evidence chain, 16 links | ANSWERED §5 |
| 22 | CANON / EARTH / PROPOSED / UNKNOWN separation | ANSWERED §5 |
| 23 | Six equations × 11 parts | ANSWERED §6 |
| 24 | Pre-render packet only | ANSWERED §7 |
| 25 | Preserve UNKNOWN | ANSWERED throughout |
| 26 | Store pipeline, six items | ANSWERED §8 |
| 27 | No unwitnessed claims | ANSWERED §8 header |
| 28 | Write valid results to backend | EXECUTED (see readback in the chat report) |
| 29 | Preserve predecessors | EXECUTED (inserts only; no update or delete) |
| 30 | Verify readback | EXECUTED |
| 31 | Exact morning restart point | ANSWERED §12 |

**C_q = 31 / 31 = 1.0**

---

## 12 · Morning restart point

**RESTART 596 — ONE HERB.** Read ledger 595, then this file (`spine-596/one-herb-571/`). Then:

1. Put **D-1** to the Chairman first, with the three survivors: *Greyneedle, Stonewarm, Veslusk*.
2. Then **D-3** and **D-4** (brand marks), which decide whether WW reaches 4096.
3. Then **D-5**: Inés's face-anchor bytes.
4. Then **D-6**: post order against World Window 001.

Agent work needing no Chairman: re-witness Twelve Miles live status read-only; correct the stale HERB FILE 001 blocker text through a new version, not an in-place edit; fetch the primary archaeobotanical source behind the Egyptian-tomb claim; decide with the Chairman whether to apply seed 0015 (**D-8**).

Do not: generate, publish, create a product, name the plant in-world, or apply 0015 without a ruling.
