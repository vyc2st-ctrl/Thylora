# WR-PROD-FLOOR-001 · LANE B · First Transmission Production Department

**Lane:** LANE B — FIRST TRANSMISSION PRODUCTION DEPARTMENT
**Workroom:** WR-PROD-FLOOR-001
**Written:** 2026-09-28, production executive session
**Inputs read in full:** `SOURCE-DIRECTIVE.md` (verbatim Chairman directive), `00-RECOVERED-STATE.md` (backend read of `thylora-dash`), `workrooms/WR-RAELINK-001.md`, `docs/RAE-LINK-MONETIZATION.md`; also consulted `docs/RAE-LINK-RIGHTS-PRIVACY.md`, `docs/RAE-LINK-COSTS.md`, `db/rae-link/0001_identity_channels.sql` (channel classes).
**Backend connection in this lane:** **NONE.** This lane did not connect to the backend and made no reads or writes. Every backend fact below is taken from `00-RECOVERED-STATE.md`. Everything the backend does not hold is marked `PROPOSED`, `UNKNOWN`, `OPEN` or `UNNAMED SLOT`. Section 11 is a BACKEND CHANGE PACKET, not a write.
**Images generated:** none. No final visual is authorized until Shared-Vision Convergence passes (Section 3.2).

Truth classes used in this file:

| Class | Meaning here |
|---|---|
| `CANON` | Present in the backend as recorded in `00-RECOVERED-STATE.md` |
| `CANON-PROPOSED` | Present in the backend, but the backend itself marks it PROPOSED (e.g. Darryl Edmonds) |
| `PROPOSED` | Created by this lane. Not canon until the Chairman approves and a backend write is read back |
| `UNKNOWN` | Not found in the recovered read. Not guessed |
| `OPEN` | The backend holds the slot and marks it open ("DO NOT GUESS" where so marked) |
| `UNNAMED SLOT` | A role that exists in the scene with no person assigned |
| `ESTIMATE` | A number with a stated basis that is not a quote or a measurement |
| `ILLUSTRATIVE` | A worked-example number chosen to show the arithmetic, not a measurement |

---

## 0 · Reconciliation — what already exists and what this lane does with it

### 0.1 The backend already holds a "Transmission 001"

`00-RECOVERED-STATE.md` §4 records:

| ID | State | Content (as recorded) |
|---|---|---|
| `THY-SCENE-001-DOCTOR-LEDGER-619` | DESIGN_ACTIVE | **"Transmission 001 Scene 001."** Dr. J Lynn Edmund, network family physician, arrives ~21:30 in hard rain at the Edmonds house in the EdereAirah Maryland/Baltimore mirror, riding clinical-response vehicle UNIT 07. Darryl Edmonds (PROPOSED) holds the door. Patient PROPOSED (Malik Edmonds); diagnosis never invented. Driver = UNNAMED SLOT. Rule: "World state before camera state." |
| `THY-EDMUND-ARRIVAL-616-F01-MANIFEST` | APPROVAL_PENDING | Frame 01 object manifest for the same scene |
| `ER-TX-EDU-LMS-001` | BUILT_AWAITING_PLATE_AND_APPROVAL | Bell Crossing news transmission; STILL_PLUS_VOICE; `Q_tx = C × A × P × S` (content, audio, provenance, stability); NOT ACTIVATED |
| `THY-TRANS-HELP-607` | DESIGN_ONLY | Uses Naya Aven + Elena Marrow |
| `THY-TRANS-RIGHTS-607` | DESIGN_ONLY | Uses Samira Vale + Marcus Hale, with Maryland public-defender links |
| `THY-TRANS-WILDLIFE-607` | DESIGN_ONLY | Wildlife Refuge & Return (working name); release-readiness equation; species OPEN |
| `THY-TRANS-MODULAR-VEH-607` | DESIGN_ONLY | Modular vehicle packet (content beyond the ID not in the recovered read) |

**This lane does not replace, rename, or supersede any of these.** Specifically:

1. The title "Transmission 001" stays attached to `THY-SCENE-001-DOCTOR-LEDGER-619`. Concept A below **extends** that scene into a complete first transmission (Scene 001 → Plates 1–3). It adds no diagnosis, does not name the driver, does not promote Darryl or Malik Edmonds out of PROPOSED, and does not change anything the F01 manifest already fixes.
2. The F01 manifest (`THY-EDMUND-ARRIVAL-616-F01-MANIFEST`) was **not read at object level** in the recovered state; only its ID and state were. Every physical dimension Concept A gives for the house, steps, door and UNIT 07 is therefore `PROPOSED — RECONCILE AGAINST F01 MANIFEST`. If the manifest disagrees, the manifest wins.
3. Concepts B and C are **alternatives offered for comparison and as follow-on episodes**, not replacements. If the Chairman selects B or C as the first public transmission, the doctor scene is not deleted; it becomes the first episode after it, and the registry records the reorder explicitly (Section 11, row TR-2).
4. `ER-TX-EDU-LMS-001` stays untouched. Its `Q_tx` gate and STILL_PLUS_VOICE format are **reused** as the production format for all three concepts, not re-invented. The scale of each `Q_tx` factor was not in the recovered read, so this lane applies the gate by name and marks its scales `UNKNOWN — VERIFY`.

### 0.2 Does "EARTH REQUEST RECEIVED" survive as framing?

**Verdict: it survives as a series stamp and as the literal framing of Concept B. It does not survive as the title of Transmission 001 if Concept A is chosen.**

Reasons:

- **World state before camera state.** In the canon scene the doctor goes to the Edmonds house because an EdereAirah household called for help inside EdereAirah. Nothing in the record says an Earth request caused it. Stamping "EARTH REQUEST RECEIVED" on that scene would re-cause a canon event after the fact. That is silent canon invention, which the directive forbids.
- **World-First Law.** The correct flow is EdereAirah experience → method → Earth adapter. For Concept A the story is EdereAirah's own night; the Earth adapter comes after, on the end card. The honest framing is "this happened here; this is the method; this is how it fits your door", not "you asked and we came."
- **A request stamp must be true.** "EARTH REQUEST RECEIVED" is a factual claim. It may only appear when a real Earth request exists, is logged with an ID, and is consented for public use. The directive itself contains one real candidate: Lane G's high-water-bill / landlord-plumbing example. Concept B is built on that, and cannot publish until consent is recorded (Chairman decision D-13).
- **It is still strong framing for the series.** Used as a recurring desk-stamp format ("EARTH REQUEST RECEIVED · REQ-####"), it gives the Earth audience a doorway to ask. That doorway is the participation path, and the world never asks Earth for rescue.

### 0.3 Recommendation (full reasoning in Section 7)

**Recommend Concept A — "The Door-Side Minutes" — as Transmission 001.** It is the only concept built on a backend record that already exists, it has the highest Shared-Vision Convergence score of the three (Vc = 54 of 625; none of the three is production-ready), it shows the world alive in motion without collecting any Earth person's data, and its Earth help involves logistics only, with no diagnosis or treatment. Concept B becomes Transmission 002 and opens the "EARTH REQUEST RECEIVED" series. Concept C becomes Transmission 003 on the same storm night, subject to the spatial decision in D-14.

---

## 1 · Every-Word coverage — Lane B source atoms

Every Lane B statement in the directive leaves this lane with a state.

| # | Source atom (verbatim or near-verbatim) | State | Where handled |
|---|---|---|---|
| B-01 | "Create the FIRST PUBLIC THYLORA / EDEREAIRAH transmission as a FULL PRODUCTION, not a post idea." | EXECUTED (design) / APPROVAL_REQUIRED (publication) | §4–6, gates §12 |
| B-02 | "Do not generate the final image yet." | EXECUTED | No image generated |
| B-03 | department responsible | EXECUTED | each concept, field B |
| B-04 | city | EXECUTED (city names PROPOSED/OPEN where canon is OPEN) | each concept, X-01 |
| B-05 | exact building | EXECUTED (PROPOSED dimensions) | each concept, field D / X-02 |
| B-06 | named people | EXECUTED | field C |
| B-07 | titles | EXECUTED | field C |
| B-08 | qualifications / authority INSIDE EDEREAIRAH | EXECUTED; licensing bodies UNKNOWN | X-14 |
| B-09 | why Earth should care what this department says | EXECUTED | X-15 |
| B-10 | timestamp | EXECUTED | X-03 |
| B-11 | what happened before the camera sees them | EXECUTED (PROPOSED events) | X-04 |
| B-12 | what happens afterward | EXECUTED (PROPOSED events) | X-05 |
| B-13 | public message | EXECUTED | X-06 |
| B-14 | Earth bridge | EXECUTED | X-07 |
| B-15 | QR route | EXECUTED (domain OPEN → D-16) | X-08, field L |
| B-16 | store path | EXECUTED | X-09, field N |
| B-17 | participation path | EXECUTED | X-10 |
| B-18 | continuing episode path | EXECUTED | X-11, field M |
| B-19 | money/reinvestment path | EXECUTED | X-12, field R |
| B-20 | "show that EdereAirah is alive and can HELP Earth" | EXECUTED | Every concept; scored in §7 |
| B-21 | "Candidate framing: EARTH REQUEST RECEIVED — but do not lock this if a stronger concept emerges." | ANSWERED | §0.2 |
| B-22 | demonstrate: our world / department / people / method / a real problem / visible mathematics/evidence / Earth application / continuing story / commercial doorway / without becoming an advertisement | EXECUTED | each concept + §3.4 doorway rule |
| B-23 | "Return THREE complete production concepts." | EXECUTED | §4, §5, §6 |
| B-24 | Fields A–T for each | EXECUTED | each concept |
| B-25 | "DO NOT write three tiny pitches." / "production-ready enough for Chairman to select one and move directly into state-locking" | EXECUTED | each concept carries a state-lock list (field T) |
| B-26 | Global: Vc = S × I × G × C, min ≥ 4 before any final visual | EXECUTED | §3.2 + scorecards |
| B-27 | Global: MATH RULE | EXECUTED | one equation block per concept |
| B-28 | Global: VISUAL LAW (identity, location, dimensions US + metric, history, cause, geometry, environment, time, provenance, maker) | EXECUTED for material objects; maker UNKNOWN where no canon | object tables per concept |
| B-29 | Global: "treat an image as decoration" (DO NOT) | EXECUTED | every object in frame has a causal reason column |
| B-30 | Global: "create a person merely to fill a scene" (DO NOT) | EXECUTED | new people 0; one role-candidate flagged PROPOSED in C |
| B-31 | Global: "ask Earth to rescue EdereAirah" (DO NOT) | EXECUTED | every Earth bridge flows world → Earth |
| B-32 | Global: COMMERCE LAW scan | EXECUTED | field N/O/P/R + derivative scan per concept |
| B-33 | Global: NO NAKED LATER | EXECUTED | §9 register |
| B-34 | Global: DEPARTMENT RETURN FORMAT (20 parts) | EXECUTED | §10 |
| B-35 | Global: "If NOT connected to backend … Return a BACKEND CHANGE PACKET" | EXECUTED | §11 |
| B-36 | ELP treatment (field H) — term not defined in the backend read | UNKNOWN → working interpretation PROPOSED → Chairman decision D-03 | §3.1 |

---

## 2 · Canon inventory this lane builds on (no new canon here)

| Canon item | Class | How it is used |
|---|---|---|
| `EdereAirah` (exact spelling, LOCKED) | CANON | All text |
| `vlegh` = the THYLORA sheet | CANON | Concept B: an Earth request arrives on a vlegh sheet |
| `INTERFRAME` = authored visual/camera layer | CANON | Field I (camera) is written as the INTERFRAME spec |
| `Keal-lum` / `Kelum` = demonstrated understanding | CANON (PROVISIONAL) | Participation paths: the viewer demonstrates the method, not just views it |
| `THY-INTERWORLD-VISUAL-BARRIER-001` — localized, variable, moving translucent glaze; never full-frame, never over people, evidence or product text; never generic glow or sci-fi HUD; formal name UNKNOWN | CANON | Glaze placement specified per plate |
| `VISUAL-001 B&W Cinematic Realism`, `VISUAL-002 Amber Glaze` | CANON | Choice per concept is decision D-04 |
| `ER-PLACE-BELL-CROSSING-001` Bell Crossing (SETTLEMENT) | CANON | Concept C location |
| Districts: Civic Archive Quarter, River Court District, North Arts Quarter, Engineering Crescent, Market Archive District | CANON (attested on personnel rows) | Residences only; this lane does not assume a district is a workplace |
| `MUNZYMUUR` = proposed working desk / residence | CANON-PROPOSED | Concept B desk |
| EdereAirah Maryland/Baltimore mirror; native place name OPEN | CANON / OPEN | Concept A location; the native name is not guessed |
| `THY-INFRA-POWER-MESH-001` — distributed microgrids; "no single central failure should darken an entire community" | CANON (PLAIN_EARTH_BRIDGE_ACTIVE) | Concept C method |
| `THY-INFRA-COMM-MESH-001` — cache essential information locally and degrade gracefully | CANON | QR route must degrade to short code + printed card |
| `THY-NAMING-SOCIAL-GRAPH-001` — "no new person enters a public scene as an isolated node" | CANON | Every person in each cast table carries edges |
| REE settles ordinary payments; REE↔USD reference parity only; Earth cash redemption disabled | CANON | No REE price appears on any Earth-facing card; store prices in USD only |
| Institutions (banks, treasury, regulator, market venue) — all names OPEN, "DO NOT GUESS" | OPEN | No licensing board or institution is named in any concept |
| RAE Link: channel classes `WORLD_CHANNEL`, `EDEREARIAH_INHABITANT` must be `WORLD_SIMULATED`; `WORLD_PRODUCTION` ownership basis only on world channels; 10 revenue lanes; Family Story Partnership prohibitions (no medical disclosure, no illness exploitation, no diagnosis) | Repo (validated locally; **not applied to live backend**, WR-RAELINK-001 B1/B2) | Publication path and money math for all three concepts |

---

## 3 · Shared production rules for all three concepts

### 3.1 ELP treatment — UNKNOWN in the backend read

**State: UNKNOWN.** The term "ELP" does not appear in `00-RECOVERED-STATE.md`, in any record ID listed there, or anywhere in this repository (full-text search run 2026-09-28: zero hits outside the directive). The directive uses it as field H without defining it.

**Working interpretation — PROPOSED, not canon:**

> **ELP = Environment / Light / Performance**
> - **E — Environment:** weather, surfaces, temperature, the physical state of the place at the timestamp (wet, dry, dark, crowded), with measured or stated values.
> - **L — Light:** every light source in frame, its cause, its colour temperature, its direction, and which visual standard (VISUAL-001 / VISUAL-002) governs the grade.
> - **P — Performance:** what each body is doing, the physical effort involved, and the emotional register, held to "people are persistent people" (no posing for camera).

Other readings the Chairman may have meant, recorded so none is silently dropped:
- Establishing / Layer / Plate (a compositing order)
- Emotion / Logic / Proof (a message structure)
- Earth / Link / Publish (a distribution stage)

**Chairman decision D-03:** confirm or replace the meaning of ELP. Until then, each concept's field H is written under the Environment / Light / Performance interpretation and labelled `ELP (PROPOSED READING)`. If a different meaning is confirmed, field H is rewritten; no other field depends on it.

### 3.2 Shared-Vision Convergence (used in every scorecard)

```
Vc = S × I × G × C
```

| Symbol | Meaning | Domain |
|---|---|---|
| `Vc` | Shared-Vision Convergence score for one scene at its current scope | integer 0–625, unitless |
| `S` | subject agreement: who and what the scene is about is agreed | integer 0–5 |
| `I` | imagery/style agreement: grade, visual standard, glaze, lens language agreed | integer 0–5 |
| `G` | geometry/state agreement: dimensions, positions, object states locked | integer 0–5 |
| `C` | causal/context agreement: why everything is present and what happened before/after is agreed | integer 0–5 |
| `×` | ordinary multiplication; a single 0 zeroes the score, so no factor can be traded off against another | — |

Scale per factor (directive): 0 absent/contradictory · 1 major mismatch · 2 weak · 3 usable but unresolved · 4 strong · 5 locked/verified for current scope.

**Threshold (production rule):** `min(S, I, G, C) ≥ 4`. The product is reported for comparison only. `Vc ≥ 256` is necessary but not sufficient, because 5 × 5 × 5 × 3 = 375 still fails the min rule.
**Class:** FORMAL SYSTEM LAW (an internal production gate), not a physical law.
**Assumptions:** factors are scored by the production department and confirmed by the Chairman. **This lane scores no factor at 4 or above where reaching it needs Chairman approval.**
**Failure conditions:** any factor scored by the author of the concept without a named reason; any factor raised without a matching backend state change; treating a high product as a pass while one factor is below 4.
**Worked example:** S = 3, I = 3, G = 2, C = 3 → Vc = 3 × 3 × 2 × 3 = 54; min = 2 → **FAIL**, and the blocking factor is G.

### 3.3 Still + voice versus motion

`ER-TX-EDU-LMS-001` was built as **STILL_PLUS_VOICE** and carries **S (stability)** as a factor of its quality gate `Q_tx = C × A × P × S`. The directive for this lane treats moving image as **not yet stable**. For all three concepts that means:

1. **The deliverable is STILL_PLUS_VOICE:** three stills ("plates") and one voice track of 60–90 s, published as a single RAE Link asset, with captions.
2. **Motion is `HOLD_FOR_EVIDENCE`.** Owner: Lane B. Dependency: a motion test that holds identity (face, vehicle livery, house number) across ≥ 48 consecutive frames with zero drift, witnessed against the locked stills. Release condition: that test passes, and `Q_tx`'s S factor for motion is recorded as passing. Next action: after the stills lock, run a 2-second 2.5D parallax test on Plate 1 only.
3. **Allowed now:** slow push-in or pan across a locked still (a camera move over a fixed image) is not generated motion and does not break identity. It is allowed inside STILL_PLUS_VOICE.
4. What motion would add is costed separately in each concept (field Q) so the decision can be made on numbers.

### 3.4 Commercial doorway placement rule (all concepts)

The transmission is a story and a piece of help. It is not an advertisement. The rule has eight parts and applies to every plate, caption and landing page:

1. **No product, price, logo, sponsor or "buy" language inside any EdereAirah plate.** The world frame carries only world objects.
2. **The commercial doorway exists only on the Earth-side end card and the landing page**, never inside the interworld glaze area.
3. **The free help comes first and is complete on its own.** The landing page shows the free derivative above the fold. Nothing needed for safety or understanding is paywalled. The store link sits below the free item and is labelled "Support this department's next transmission". There is no "shop now".
4. **One commercial link per transmission,** and no pop-ups, countdowns, urgency or scarcity language.
5. **Disclosure line, verbatim on every landing page:** "THYLORA sells products related to this transmission. Sales fund the next transmission. The free card above is complete without buying anything."
6. **Sponsors (if any) never appear in frame**, never shape the story, and are disclosed on the landing page per the RAE Link advertising/sponsorship lane (`requires_disclosure = true`).
7. **No beneficiary is monetised.** No real Earth household's hardship is sold (Concepts A and C involve no Earth household; Concept B's household is anonymised and publishes only with consent, D-13).
8. **Voice track rule:** the voice never names a product or the store. The only call to action spoken aloud is the free help.

### 3.5 QR rule (all concepts)

- **The QR never appears on a world object.** An Earth URL painted on an EdereAirah door or vehicle would merge the two worlds, which the directive forbids. The QR lives only on the Earth-side end card and on printed derivatives.
- Treatment follows Lane D's "family seal QR" rules: standards-compliant; quiet zone ≥ 4 modules; dark-on-light contrast; error correction level **M** (≈15 % recovery) because no artwork crosses the modules. The crest or frame sits **outside** the quiet zone. Every code is accompanied by a printed **short code** and a plain **URL fallback**.
- Minimum size: on screen ≥ 180 × 180 px at 1080 px frame width. In print ≥ 0.8 in (20 mm) module area, plus the quiet zone.
- Destination: the RAE Link asset page for the transmission, with the free help derivative first. **The public domain and path are OPEN (D-16).** RAE Link today is served at `/rae-link` in this repository's surface, but it is not deployed to a verified public domain in any evidence read by this lane.
- A scan witness is required before publication: one iOS and one Android device, camera app, three distances (1 ft / 0.3 m, 3 ft / 0.9 m, 6 ft / 1.8 m from a 27 in monitor). Pass or fail is recorded per scan.

### 3.6 Cost basis (all concepts)

**Every cost below is an ESTIMATE. No vendor was contacted, no quote obtained and no pricing page read in this session.** The bands match how `docs/RAE-LINK-COSTS.md` labels its numbers: planning bands to be overwritten by quotes.

| Line | Band | Basis |
|---|---|---|
| Art direction and state-locking (human) | $60/h | Mid-range U.S. freelance art-direction rate, planning figure |
| Image candidates (AI-assisted, disclosed as `AI_ASSISTED` provenance) | $0.04–$0.20 per candidate; 60–150 candidates per plate | Typical public image-model pricing band; not verified this session |
| Retouch / compositing (glaze, text, cleanup) | 3–6 h per plate at $60/h | Planning figure |
| Voice: synthetic | $0–$25 per track | Planning figure |
| Voice: human, 60–90 s, non-broadcast usage | $150–$400 | Planning figure |
| Captions + Spanish translation, ~150 words | $15–$30 | $0.10–$0.20 per word |
| External legal / safety review (Earth wording only) | $0–$900 | $0 if an internal qualified reviewer exists; otherwise 2 h at $250–$450/h |
| Print proof of store derivative | $20–$60 | One proof run |
| Landing / hosting | $0–$20 per month | `docs/RAE-LINK-COSTS.md`, "Hosting + CDN for the surface" |
| Motion option: 2.5D parallax, 20–30 s from locked stills | +$400–$1,500 | Planning figure; HOLD_FOR_EVIDENCE (§3.3) |
| Motion option: fully generated motion | +$3,000–$15,000 | Planning figure; not recommended until stability passes |

---

## 4 · CONCEPT A — "The Door-Side Minutes" (extends canon Transmission 001 Scene 001) · RECOMMENDED

**One-line truth:** A family physician in EdereAirah reaches a rain-soaked doorstep at 21:28. The physician's own arrival ledger shows which minutes of that journey the household controlled. The Earth adapter hands every Earth household those same minutes as a free door card, without any diagnosis, medical data or advice.

**Canon anchor:** `THY-SCENE-001-DOCTOR-LEDGER-619` (DESIGN_ACTIVE) + `THY-EDMUND-ARRIVAL-616-F01-MANIFEST` (APPROVAL_PENDING). The word "LEDGER" in the canon ID is used literally: Plate 2 is the ledger.

**Structure:** 3 plates + 1 voice track (STILL_PLUS_VOICE), 75 s target.

| Plate | Frame | Time (world) | Side of barrier |
|---|---|---|---|
| Plate 1 | Arrival at the door (= canon Frame 01) | 21:28 | EdereAirah (glaze present) |
| Plate 2 | The arrival ledger, close | 21:33 (inside the hallway, after the handover) | EdereAirah (glaze present) |
| Plate 3 | "At the Door" end card + QR | — | Earth side (no glaze) |

### A. Title

**TRANSMISSION 001 · THE DOOR-SIDE MINUTES**
Sub-line (Earth chrome, Plate 1): *EdereAirah · 21:28 · rain*

### B. Department

| Role in this transmission | Department | State | Note |
|---|---|---|---|
| World department in the scene (the physician's clinical network) | **UNKNOWN.** The recovered read records "network family physician" but no department row for the network | UNKNOWN | Not guessed. Decision D-08 |
| Publishing / host department (PROPOSED) | `WELLNESS_AND_DAILY_LIFE` | active (canon row) | Fits "daily life", and the help is household readiness, not clinical care |
| Earth adapter (the door card) | `THY-WORLD-DOUBT-REMOVER-607` — Director of Access and Follow-Through, Naya Aven | `chairman_review_required` | Dependency: D-09. Fallback if not cleared: `THY-DEPT-QUESTION-NAV-001` (active) publishes the card |
| Privacy clearance | `DEPT-LEGAL-COMP-001` — Elena Marrow, Director, Privacy, Data & Consumer Protection | active | Clears the ledger crop (no clinical line visible) and the landing page (collects nothing) |
| Store | `THY-DEPT-STORE-OPS-001` | active | Doorway per §3.4 |
| Licensing | `THY-DEPT-LICENSING-DISTRIBUTION-001` | active | Field P |
| Language access | `THY-DEPT-LANGUAGE-ACCESS-001` | active | Spanish caption + card |

### C. Named cast

| # | Person | Title / role | Truth class | Social-graph edges (THY-NAMING-SOCIAL-GRAPH-001) | Why this person is here (not frame-fill) |
|---|---|---|---|---|---|
| 1 | **Dr. J Lynn Edmund** | Network family physician | CANON | → Edmonds household (patient relationship, canon scene); → UNIT 07 driver (crew, canon scene); → Naya Aven (**PROPOSED edge**: Access & Follow-Through receives the physician's follow-up routing) | The method-holder: owns the ledger |
| 2 | **Darryl Edmonds** | Holds the door | CANON-PROPOSED | → Malik Edmonds (same household; **relationship UNKNOWN**, not assumed to be parent, sibling or other); → Dr. Edmund (called the physician: PROPOSED event, see X-04) | The household side of the door-side minutes. His actions are the ones Earth viewers can copy |
| 3 | **Malik Edmonds** | Patient | CANON-PROPOSED | → Darryl Edmonds; → Dr. Edmund | **Off-frame in every plate.** Present by cause (he is why the physician came), not by image. No diagnosis, no symptom, no face |
| 4 | **UNIT 07 driver** | Clinical-response vehicle driver | UNNAMED SLOT | → Dr. Edmund (crew) | Present because a vehicle does not park itself. Seen only as a silhouette behind a rain-streaked windscreen. **Stays unnamed** (D-07) |
| 5 | **Naya Aven** | Director of Access and Follow-Through | CANON (department under Chairman review) | → Elena Marrow (both in HELP-607, canon packet); → Dr. Edmund (PROPOSED edge above) | **Voice of Plate 3 only.** She turns the physician's method into the Earth card. Not in any world plate |
| 6 | **Elena Marrow** | Director, Privacy, Data & Consumer Protection | CANON | → Naya Aven (HELP-607) | Off-screen. Named in the landing-page credit as privacy clearance |

**New people created by this concept: 0.** One new edge proposed (Edmund ↔ Aven).
**Pronouns:** the recovered read does not record Dr. Edmund's gender. The voice script and captions use "Dr. Edmund" and "the physician" and never a pronoun until D-06 settles it.

### D. Building / location

**City:** EdereAirah Maryland/Baltimore mirror. **Native place name: OPEN (not guessed).** No real Baltimore street, institution, hospital or logo appears (see risk S-4).

**Building: the Edmonds house.** Form and every dimension below are `PROPOSED — RECONCILE AGAINST F01 MANIFEST`. The mid-block brick rowhouse form is chosen because it is the dominant residential form of the Baltimore street grid the world mirrors, and because a narrow frontage makes the door, steps, number and porch light legible in one frame.

| Element | U.S. customary | Metric | Cause / note |
|---|---|---|---|
| Frontage (party wall to party wall) | 16 ft 0 in | 4.88 m | Mid-block rowhouse |
| Depth | 44 ft 0 in | 13.41 m | Two rooms deep + rear kitchen |
| Storeys | 2 | 2 | — |
| Cornice height above sidewalk | 25 ft 0 in | 7.62 m | — |
| Front steps | 3 risers, 7 in rise × 11 in tread | 178 mm × 279 mm | Stone steps; wet in scene |
| Stoop landing | 4 ft 0 in × 5 ft 0 in | 1.22 m × 1.52 m | Where Dr. Edmund stands in Plate 1 |
| Handrail | 36 in above tread nosing, right side facing house | 914 mm | Dr. Edmund's left hand is on it |
| Front door | 36 in × 80 in | 914 mm × 2,032 mm | Inward-opening; storm door outward-opening |
| Porch light | Wall fixture, centre 66 in above landing, left of door | 1.68 m | **On.** Darryl switched it on after the call (X-04) |
| House number | Numerals 4 in high, 0.5 in stroke, right of door at 60 in | 102 mm high, 12.7 mm stroke, at 1.52 m | Sized to the Earth residential-code minimum the card cites (field O). **The number itself: OPEN** |
| Sidewalk | 6 ft 0 in wide | 1.83 m | Brick, wet |
| Curb | 6 in high | 152 mm | Runoff visibly flowing along the gutter |

**Vehicle: UNIT 07** (clinical-response vehicle; canon identity). Dimensions `PROPOSED`. **Maker: UNKNOWN.** Relation to `THY-TRANS-MODULAR-VEH-607`: UNKNOWN; the modular packet was not read at content level.

| Element | U.S. customary | Metric |
|---|---|---|
| Length | 190 in (15 ft 10 in) | 4.83 m |
| Width (body) | 76 in | 1.93 m |
| Height | 70 in | 1.78 m |
| Side marking | "UNIT 07", 6 in numerals, both front doors | 152 mm |
| Parked | Hazard lamps on, engine running, 8 in from curb | 203 mm |

### E. Exact scene

**Plate 1 — 21:28, at the door (canon Frame 01, extended not altered).**
Hard rain. UNIT 07 is double-parked alongside the curb directly in front of the Edmonds house, hazards blinking amber. Dr. J Lynn Edmund is on the second of three stone steps, hood up, clinical bag in the right hand, left hand on the wet rail. At the top, Darryl Edmonds holds the outward storm door open with his left forearm; the inner door stands open behind him, and warm hall light spills over the landing onto the wet steps. The porch light is on and the house number is lit and legible. Through the windscreen of UNIT 07, the driver is a silhouette bent toward the dash terminal, logging the arrival.

**Plate 2 — 21:33, the ledger.**
Inside the front hall, on the narrow radiator shelf. The physician's open arrival ledger, a bound paper book, lies at a slight angle under the physician's left hand. The right-hand page shows the evening's arrival line: call, dispatch, street, door, bedside, each with a time, and in the margin the physician's handwritten sum, `T_bed = T_q + T_r + T_f + T_e + T_a`, with the minutes filled in (see math block). **The clinical column of the ledger is under the physician's hand and out of frame. No diagnosis, symptom or treatment is legible anywhere.** A wet glove lies on the shelf. Darryl's socked feet are visible at the bottom edge of the frame on the hall runner; he is standing and waiting.

**Plate 3 — End card (Earth side).**
Plain paper-white card, no glaze. Title "AT THE DOOR". Five lines, each a household action (field O). One emergency line. The QR sits lower right with its short code and URL fallback. Credits line: "From the arrival ledger of Dr. J Lynn Edmund · adapted for Earth by the Office of Access and Follow-Through · privacy cleared by Elena Marrow."

### F. Background life (everything in frame has a cause)

| Thing | Where | Why it is there | Plate |
|---|---|---|---|
| Rain, heavy (≥ 0.30 in/h, ≥ 7.6 mm/h) | Whole exterior | Canon: "hard rain" | 1 |
| Gutter runoff along curb, ~1 in (25 mm) deep | Foreground left | Heavy rain on a crowned street drains to the curb | 1 |
| Neighbour rowhouse left: porch light **off**, one upstairs window lit | Frame left edge | Ordinary 21:28 domestic life; also the contrast that makes the lit Edmonds number read | 1 |
| Neighbour rowhouse right: dark, curtains drawn | Frame right edge | Occupants out or asleep; no action implied | 1 |
| Parked car across the street, reflected in a puddle, **no badge or brand visible** | Lower foreground reflection | Residential street parking; reason UNIT 07 had to double-park | 1 |
| Street lamp, single, 3,000 K LED, 60 ft (18.3 m) up-street | Background right | Street lighting; gives the rain streaks their backlight | 1 |
| **No animal in frame** | — | Animals "exist before the camera sees them". No EdereAirah urban species is canon yet (Lane A is building fauna). No stray cat or dog is added until Lane A clears a species. State: QUEUED_WITH_DEPENDENCY (§9) | 1 |
| Hall runner, coat hooks with two coats, one child-sized umbrella | Plate 2 background | A lived-in hall. The umbrella implies another household member; **who is UNKNOWN** and is not named | 2 |
| Wet glove on shelf | Plate 2 | The physician removed it to write | 2 |

### G. What each person is physically doing

| Person | Plate | Body | Hands | Eyes | Physical load / effort |
|---|---|---|---|---|---|
| Dr. J Lynn Edmund | 1 | Weight on left foot on step 2, right foot lifting to step 3; torso leaning ~10° forward into the rain | Right: bag, ~11 lb (5 kg) (PROPOSED); left: on the rail, wet | Up at Darryl's face | Climbing wet stone carrying a load; rail use is the safe choice |
| Dr. J Lynn Edmund | 2 | Standing at shelf, head bent | Left hand flat on the ledger, covering the clinical column; right hand holding a pen, cap in teeth or pocket (choose one at lock) | On the page | Writing the bedside time before going in |
| Darryl Edmonds | 1 | Standing on the threshold, half-turned toward the hall | Left forearm pinning the storm door against the wind; right hand holding a phone at his side, screen dark | On the physician | Holding a door against wind, standing still by choice |
| Darryl Edmonds | 2 | Standing on the hall runner, only socked feet visible | — | — | Waiting |
| UNIT 07 driver | 1 | Seated, bent toward the dash terminal | Right hand on the terminal | Down | Logging the arrival (the "street" and "door" lines of the ledger come from this log) |
| Malik Edmonds | — | Off-frame, upstairs (PROPOSED) | — | — | — |
| Naya Aven | 3 | Voice only | — | — | — |

### H. ELP treatment `(PROPOSED READING: Environment / Light / Performance — see §3.1)`

- **Environment:** heavy rain (≥ 7.6 mm/h, the American Meteorological Society's "heavy rain" threshold). Air temperature 48 °F / 9 °C (PROPOSED; the world season is OPEN). Light wind of 8–12 mph (13–19 km/h), just enough to push the storm door; that is why Darryl pins it. All surfaces wet and specular. Plate 2: dry interior, 68 °F / 20 °C; the physician's coat is still dripping onto the runner.
- **Light:**
  - porch fixture, 2,700 K, key light on the landing;
  - hall spill, 2,700–3,000 K, through the open door;
  - hazard lamps, amber, 1–2 Hz, caught mid-blink on the right side of UNIT 07;
  - street lamp, 3,000 K, backlighting the rain;
  - no light on the driver except the terminal glow on the hands.
  - **Visual standard:** VISUAL-002 Amber Glaze recommended, because the warm door light *is* the story. VISUAL-001 B&W is the alternative. Decision D-04.
  - **Interworld glaze placement:** a drifting translucent film in the upper-left rain field over the neighbouring roofline (about 18 % of frame area) and a thin wisp across the lower-right puddle. It never touches a face, the house number, the "UNIT 07" marking or the ledger. On Plate 2 it sits over the coat hooks only.
- **Performance:** restrained. No panic and no staged anguish (Family Story safeguard: "no sensationalism"). Urgency lives in the rain, the climbing posture and the double-parked vehicle. Darryl's face shows relief, not fear.

### I. Camera (INTERFRAME specification)

| | Plate 1 | Plate 2 | Plate 3 |
|---|---|---|---|
| Position | Opposite sidewalk, 38 ft (11.6 m) from the house face, lens at 5 ft 3 in (1.60 m) | Directly above the shelf, 20 in (0.51 m) above the page, tilted 12° off vertical toward the hall | Flat card |
| Lens (full-frame equivalent) | 50 mm. Horizontal field of view = 2·atan(18/50) = 39.6°, covering 27.4 ft (8.4 m) of street width at 38 ft: the full 16 ft house plus half of each neighbour | 35 mm | — |
| Aperture / shutter (look, not a real exposure) | f/2.8, 1/125 s: rain renders as short streaks | f/4, 1/60 s | — |
| Focus | Dr. Edmund's face | The margin equation | — |
| Master aspect | 16:9 (3840 × 2160); social crop 4:5 (1080 × 1350) keeps the door, number and UNIT 07 marking inside the safe area | same | same |
| Allowed move (still) | Slow 8 % push-in toward the door over 12 s | Slow 5 % push toward the margin | none |

### J. Embedded text

| Text | Where | World or Earth | Rule |
|---|---|---|---|
| "UNIT 07" | Vehicle front doors | World (canon) | Legible |
| House number | Right of door | World | **OPEN (not chosen here)**; must be legible |
| Ledger lines: `CALL 21:04 · DISP 21:07 · STREET 21:22 · DOOR 21:28 · BED 21:32` | Plate 2 page | World | Handwritten; ILLUSTRATIVE times consistent with canon "~21:30" |
| Margin equation `T_bed = T_q + T_r + T_f + T_e + T_a = 3+15+5+1+4 = 28 min` | Plate 2 | World | Legible at 1080 px width |
| "THYLORA · TRANSMISSION 001 · EDEREAIRAH" | Top-left chrome, Plate 1 | Earth chrome | Outside the glaze |
| "21:28 · rain" | Lower-left chrome, Plate 1 | Earth chrome | — |
| "AT THE DOOR" card text | Plate 3 | Earth | Field O, verbatim |

**Not present anywhere:** "EARTH REQUEST RECEIVED" (see §0.2), any product name, any price, any diagnosis.

### K. Public caption (draft, 88 words)

> In EdereAirah it was raining hard at 21:28 when Dr. J Lynn Edmund reached the Edmonds' door. The physician keeps an arrival ledger, and it shows 28 minutes from call to bedside. Nine of those minutes happened at the house: finding the door and getting from the door to the patient. Those are the minutes a household can shorten. Our Office of Access and Follow-Through turned them into a free card for Earth homes. No medical advice, and no data collected. In an emergency, call 911 or your local emergency number.

### L. QR placement and destination

- **Placement:** Plate 3 only, lower-right, 220 × 220 px at 1080 px width, quiet zone 4 modules, family-seal frame outside the quiet zone. Printed short code under it: `TX001`. URL fallback: `<public-domain>/rae-link/tx/001` (the domain is OPEN, D-16).
- **Destination page order:**
  1. The free "At the Door" card (view, print, download as a PDF; nothing to fill in online);
  2. Plates 1–2 and the voice track;
  3. "How the ledger works" (the equation and a worked example);
  4. the disclosure line (§3.4.5);
  5. one store link;
  6. "What happens next": Episode 002 teaser.
- **Never collects:** address, photo, health data, name. Page analytics follow RAE Link's rule: coarse country and a rotating session key only.

### M. Follow-up episode

**Transmission 001-B, "23:10 · UNIT 07 Returns".** UNIT 07 back at its depot (depot location OPEN). The UNNAMED SLOT driver closes the vehicle log. Dr. Edmund reconciles the ledger's arrival line against the vehicle log: two clocks, one truth. **Method taught:** how to reconcile two time records (the failure condition in the math block). **Earth adapter:** keeping a simple household log when a family member is ill, covering the times of calls and visits only and never symptoms. The patient still never appears, and no outcome is claimed until D-06 settles what the canon allows.
Second follow-up option: Concept C (same storm, Bell Crossing), if D-14 places Bell Crossing within reach of the same weather.

### N. Store derivative

Every item sits behind the §3.4 doorway. Nothing sold is medical.

| Item | What it is | Why it belongs to this transmission | Supplier state |
|---|---|---|---|
| N-1 Reflective house-number plate | Weatherproof plate, numerals 4 in (102 mm) high, 0.5 in (12.7 mm) stroke, customer's number | Directly shortens the ledger's `T_f` term | **No supplier approved.** Routed to Lane D supplier bridge (desk review → facility → sample test). QUEUED_WITH_DEPENDENCY |
| N-2 Plate 1 art print | Archival print of the locked Plate 1, 12 × 16 in (305 × 406 mm) and 18 × 24 in (457 × 610 mm) | The world image itself; `WORLD_PRODUCTION` rights basis | POD supplier not selected (THY-DS-MERCH-REWARDS blocker). QUEUED_WITH_DEPENDENCY |
| N-3 "Door Ledger" household notepad | 50-sheet pad with columns: time called, time answered, time arrived. **No symptom column, by design** | The household half of the method | Same POD dependency |

### O. Free help derivative — "AT THE DOOR" card (full text, draft)

> **AT THE DOOR**
> *Five things any household can do before a visiting clinician, a home-health nurse or an emergency crew arrives.*
>
> 1. **Light your number.** Porch light on. House numbers should be at least 4 in (102 mm) tall and readable from the street. Many U.S. residential codes require this; check your local code.
> 2. **Clear the path.** Clear the steps, the hallway and the stairs. Move rugs that slide.
> 3. **Secure pets** in a closed room.
> 4. **One bag at the door:** a written list of current medicines, allergies, the patient's ID and insurance card, and the name and phone number of their usual doctor.
> 5. **One person at the door,** ready to lead the way in.
>
> **In an emergency, call 911 (U.S.) or your local emergency number. This card is not medical advice.**

Formats: 4 × 6 in (102 × 152 mm) print, US Letter PDF and A4 PDF, in English and Spanish. **Nothing on this card asks the reader for data.** The code reference in line 1 is to the International Residential Code's address-identification section (R319 in the 2018/2021 editions); **VERIFY** the edition and section against the adopting jurisdiction before publication.

### P. Licensing / business derivative

- **P-1 Card licence:** non-exclusive licence of the "At the Door" card (co-branded print runs) to house-call practices, home-health agencies, community-paramedicine programmes and hospice intake teams. The free version stays free (licence = print-ready files + co-brand slot + Spanish edition).
- **P-2 Property-manager bundle:** licence of the card + number-plate standard to landlords and property managers, for addressing compliance and faster emergency access.
- **P-3 Art licence:** Plate 1 licensed for editorial use through the RAE Link licensing lane (default platform share 25 %, disclosure required).
- **P-4 Training micro-module (later):** 10-minute "door-side minutes" module for home-care staff orientation. APPROVAL_REQUIRED (needs a qualified Earth reviewer, D-15).

### Q. Production cost (ESTIMATE; basis §3.6)

| Line | Low | High |
|---|---:|---:|
| Art direction and state-locking, 10–16 h | $600 | $960 |
| Image candidates, 3 plates × 60–150 × $0.04–$0.20 | $7 | $90 |
| Retouch / compositing, 3 plates × 3–6 h | $540 | $1,080 |
| Voice (synthetic → human) | $0 | $400 |
| Captions + Spanish | $15 | $30 |
| External review of the card's Earth wording | $0 | $900 |
| Print proof (card + N-3) | $20 | $60 |
| Landing / hosting, first month | $0 | $20 |
| **Still + voice total** | **$1,182** | **$3,540** |
| Motion option, 2.5D parallax on Plates 1–2 | +$400 | +$1,500 |
| Motion option, generated motion | +$3,000 | +$15,000 |

**What still-versus-motion means for Concept A:** the concept works fully as a still. The rain streaks, the blinking hazard caught mid-cycle and the push-in carry the motion. Generated motion adds the most risk here, because it has to keep the face, the house number and the "UNIT 07" marking stable through falling rain, which is where identity drift is most likely. Recommendation: stills only for TX-001; parallax test after lock (§3.3).

### R. Revenue possibilities

| Lane (RAE Link default) | Source in this concept | State |
|---|---|---|
| EDF / product sale (20 % platform) | N-1, N-2, N-3 | QUEUED (supplier) |
| Licensing (25 %) | P-1, P-2, P-3 | APPROVAL_REQUIRED |
| Paid media purchase (20 %) | Hi-res plate download | QUEUED (RAE Link apply, WR-RAELINK-001 B1/B2) |
| Tips and support (10 %) | "Support the next transmission" | QUEUED (same) |
| Advertising / sponsorship (45 %, pooled) | **Not recommended for TX-001.** A first transmission with a sponsor reads as an advertisement | DECLINED for TX-001 |

**Worked unit economics for N-1, using Lane D's Back-to-Buy math** (`N = G − T − F − P − R`; all ILLUSTRATIVE):

| Symbol | Meaning | Value |
|---|---|---:|
| G | gross sale, tax-inclusive | $25.44 |
| T | sales tax (6 %, Maryland's general rate, applied to a $24.00 price) | $1.44 |
| F | processor fee, 3.2 % of G (the rate in the RAE Link worked example) | $0.81 |
| P | production + fulfilment (ESTIMATE, no quote) | $11.00 |
| R | refund / reserve, 5 % of G | $1.27 |
| **N** | **net distributable** = 25.44 − 1.44 − 0.81 − 11.00 − 1.27 | **$10.92** |

With a disclosed reinvestment share `s` (D-11; e.g. s = 0.50), `B = N × s = $5.46` per plate returns to the department's next transmission budget. At ~$1,182–$3,540 per transmission, one fully funded next episode needs roughly 216–648 plate sales at s = 0.50 (1,182 / 5.46 = 216.5; 3,540 / 5.46 = 648.4). **These are not forecasts.** They show how many sales it takes, so the Chairman can judge the lane.

### S. Risks / blockers

| # | Risk / blocker | Class | Control |
|---|---|---|---|
| S-1 | Medical-adjacent content read as medical advice | Legal / safety | Card is logistics only; explicit "not medical advice" line; emergency line; Earth review by a qualified human (D-15) |
| S-2 | Diagnosis leaks into the ledger plate | Canon / privacy | Clinical column physically covered by the hand and out of frame. Elena Marrow clearance. A render with any legible clinical text fails the gate |
| S-3 | F01 manifest disagrees with the PROPOSED dimensions here | Canon | Manifest wins; read it before state-lock (next action 1) |
| S-4 | "Baltimore mirror" read as a real Baltimore claim (real street, hospital, EMS livery) | Impersonation | No real street names, agency marks, hospital names or real livery; UNIT 07 livery is world-original |
| S-5 | Identity drift across plates (face, bag, coat) | Visual | Lock the character sheet before Plate 2; Vc G-factor gate |
| S-6 | Race / class stereotyping in a night medical scene | Representation | Performance rule (dignity, relief, no fear-porn); review at approval point T-5 |
| S-7 | Naya Aven's department is `chairman_review_required` | Dependency | Fallback publisher `THY-DEPT-QUESTION-NAV-001` |
| S-8 | RAE Link not applied to the live backend (WR-RAELINK-001 B1/B2) | Platform | Publish the free card as a static page first; RAE Link asset when applied |
| S-9 | Store items have no approved supplier | Commerce | Store link hidden until one item passes Lane D; the transmission can publish without it (the doorway rule allows zero links) |

### T. Approval points (the state-lock list; in order)

| # | Approval | Who | Unlocks |
|---|---|---|---|
| T-1 | Select Concept A as Transmission 001 | Chairman (D-01) | Everything below |
| T-2 | Approve the F01 manifest `THY-EDMUND-ARRIVAL-616-F01-MANIFEST` | Chairman (D-05) | G → 4 on Plate 1 |
| T-3 | Confirm the house form and dimensions, and the UNIT 07 dimensions (or replace them with the manifest's) | Chairman (D-10) | G → 4 |
| T-4 | Confirm the Edmonds household status (Darryl, Malik: PROPOSED → canon; their relationship), Dr. Edmund's pronouns, driver stays UNNAMED | Chairman (D-06, D-07) | S → 4 |
| T-5 | Visual standard (VISUAL-002 recommended) + glaze placement | Chairman (D-04) | I → 4 |
| T-6 | ELP meaning | Chairman (D-03) | Field H final |
| T-7 | Host department and Access & Follow-Through status | Chairman (D-08, D-09) | C → 4 |
| T-8 | Earth wording review of the card | Qualified Earth reviewer (D-15) | Publication |
| T-9 | Rights gate `WORLD_PRODUCTION` on a `WORLD_CHANNEL`; `AI_ASSISTED` provenance disclosed | RAE Link gate | Publication |
| T-10 | QR scan witness passes (§3.5) | Lane B | Publication |
| T-11 | Store item passes Lane D (optional for publication) | Lane D | Store link visible |

---

### A-X · The additional required fields (Concept A)

| # | Field | Content |
|---|---|---|
| X-01 | **City** | EdereAirah Maryland/Baltimore mirror (canon). Native name OPEN. Neighbourhood: OPEN |
| X-02 | **Exact building (with dimensions)** | The Edmonds house: mid-block brick rowhouse, 16 ft × 44 ft (4.88 m × 13.41 m), 2 storeys, cornice at 25 ft (7.62 m), 3 stone steps at 7 in / 11 in (178 mm / 279 mm), door 36 × 80 in (914 × 2,032 mm). **PROPOSED; reconcile against the F01 manifest.** Full table in field D |
| X-03 | **Timestamp** | Plate 1: **21:28** local (canon "~21:30"; the exact minute is PROPOSED and consistent with it). Plate 2: 21:33. World date and season: OPEN. Calendar system: UNKNOWN |
| X-04 | **What happened before the camera** (all PROPOSED, consistent with canon) | 21:04: Darryl calls the physician network from the hall phone. 21:07: dispatch; UNIT 07 leaves with Dr. Edmund aboard (driver UNNAMED). 21:22: UNIT 07 turns into the street. 21:22–21:27: the house number is not readable from the street in the rain; the driver counts doors from the corner. At 21:25, while on the phone with dispatch, Darryl is told to "put your light on" and does. 21:27: the lit number is seen; UNIT 07 double-parks because the curb is full. 21:28: Dr. Edmund reaches step 2 (Plate 1) |
| X-05 | **What happens afterward** (PROPOSED) | 21:29: the handover in the hall. 21:32: bedside (off-frame). 21:33: the physician writes the ledger line (Plate 2). The visit continues off-camera; **its content and outcome are never shown or claimed.** 23:10: UNIT 07 returns to the depot and the ledger and vehicle log are reconciled (Episode 001-B). Next morning: Naya Aven's office receives the physician's routing note, then adapts the door-side minutes into the Earth card |
| X-06 | **Public message** | "Some of the minutes before help arrives belong to the household. Here is how to shorten them." |
| X-07 | **Earth bridge** | EdereAirah experience (the ledger) → method (time decomposition; the household controls `T_f` and `T_a`) → Earth adapter (the "At the Door" card, U.S. address-number code note, emergency number) → Earth application (households, landlords, home-health agencies) → Earth evidence (anonymous self-timed door checks, X-10) → improved method → back to EdereAirah (the physician network updates its own "put your light on" script). **Earth is offered a method and is asked for nothing** |
| X-08 | **QR route** | Plate 3 QR → RAE Link asset page `tx/001` → (1) free card, (2) plates + voice, (3) ledger explainer, (4) disclosure, (5) one store link, (6) Episode 001-B teaser. Fallback: short code `TX001` + plain URL + printed card (degrades per THY-INFRA-COMM-MESH-001) |
| X-09 | **Store path** | Store navigation "I NEED HELP" → "At the door" shelf: free card (always first), N-1 number plate, N-3 door-ledger pad; "I WANT TO SUPPORT SOMEONE" → N-2 art print. Uses existing `thylora_store_shelves` (13 rows; shelf mapping VERIFY_BEFORE_APPLY) |
| X-10 | **Participation path** (Keal-lum: shown, not claimed) | "Time your door." The viewer starts a timer on the landing page, walks from the street to the place the medicine list is kept, and back to the door. They submit **only two numbers** (seconds before and after using the card) plus an optional coarse country code. No address, photo, name or health data; the fields do not exist. Aggregates are published in Episode 001-B as Earth evidence. Requires RAE Link or a static form (dependency S-8) |
| X-11 | **Continuing episode path** | 001 (door) → 001-B (23:10, two clocks, one truth) → 002 (Concept B: EARTH REQUEST RECEIVED desk) → 003 (Concept C: the same storm at Bell Crossing, if D-14 allows) |
| X-12 | **Money / reinvestment path** | Free card → trust → store (N-1..3) and licences (P-1..3) → RAE Link settlement with ten visible figures (RAE-LINK-MONETIZATION) → disclosed share `s` to the Lane B next-transmission budget → Episode 001-B production. Earth money only; no REE on any Earth surface |
| X-13 | **Department's method** | Time decomposition of the arrival (math block below). Every minute has an owner; the minutes the household owns are made visible and shortened |
| X-14 | **Qualifications / authority inside EdereAirah** | Dr. J Lynn Edmund: "network family physician" (canon title). The licensing body, the network's name and the physician's years in practice are **UNKNOWN / OPEN, not guessed**; they appear on screen only as "Network Family Physician". Authority claimed in the transmission is limited to what the ledger shows: **times the physician personally recorded.** Naya Aven: Director of Access and Follow-Through (canon title; department under Chairman review). Elena Marrow: Director, Privacy, Data & Consumer Protection (canon) |
| X-15 | **Why Earth should care** | Not because of any EdereAirah authority over Earth; there is none. Earth should care because the claim can be checked with a watch. The ledger's arithmetic is visible, the household share is computable, and the card's actions are ordinary, lawful and free. The department asks Earth to test it, not to believe it |

### A-M · Visible mathematics — the arrival-time identity

```
T_bed = T_q + T_r + T_f + T_e + T_a
H     = (T_f + T_a) / T_bed
```

| Symbol | Meaning | Unit | Domain |
|---|---|---|---|
| `T_bed` | Elapsed time from the moment the call is answered to the moment the clinician is at the patient's side | minutes (min) | ≥ 0 |
| `T_q` | Queue: call answered → vehicle dispatched | min | ≥ 0 |
| `T_r` | Road: dispatch → vehicle enters the destination street | min | ≥ 0 |
| `T_f` | Find: enters the street → the correct door is identified and the vehicle stops | min | ≥ 0 |
| `T_e` | Entry: vehicle stops → clinician at the open door | min | ≥ 0 |
| `T_a` | Access: open door → patient's side | min | ≥ 0 |
| subscripts `q, r, f, e, a, bed` | labels of the five consecutive intervals and the total; not indices or exponents | — | — |
| `+` | addition of consecutive, non-overlapping intervals | — | — |
| `/` | division | — | — |
| `H` | household-controllable share of the arrival time | unitless fraction | 0 ≤ H ≤ 1 |

- **Class:** the first line is a **FORMAL SYSTEM LAW**: a time-accounting identity, exact by construction when the intervals are consecutive and non-overlapping. The attribution of `T_f` and `T_a` to the household is a **HEURISTIC**, since the household influences but does not fully control them (a street can be hard to search even with a lit number). The interval values are **EMPIRICAL**: they have to be measured.
- **Threshold:** none is universal. Operational threshold for the card: an intervention "helps" if it lowers `T_f + T_a` in a repeated self-timed test.
- **Assumptions:** one clock or synchronised clocks; the intervals share boundaries; the start is when the call is answered (not when it is placed).
- **Failure conditions:** overlapping intervals (double counting); two unsynchronised clocks (the vehicle log and the ledger disagree, which is Episode 001-B's subject); an undefined start point; a negative interval (a clock error); treating `H` as blame on the household.
- **Worked example (ILLUSTRATIVE, the canon night):** T_q = 3 (21:04→21:07), T_r = 15 (→21:22), T_f = 5 (→21:27), T_e = 1 (→21:28, door), T_a = 4 (→21:32, bedside).
  T_bed = 3 + 15 + 5 + 1 + 4 = **28 min**. H = (5 + 4) / 28 = 9 / 28 = **0.32 (32 %)**.
  With the lit number and a ready bag (ILLUSTRATIVE: T_f = 1, T_a = 2): T_bed = 3 + 15 + 1 + 1 + 2 = **22 min**; H = 3 / 22 = 0.14.
- **Where it appears on screen:** Plate 2, handwritten in the ledger margin in the physician's hand, with the five filled-in minutes. The voice track reads the sum aloud once. The landing page repeats it in type with this full notation table.

### A-V · Shared-Vision Convergence scorecard (Concept A)

| Factor | Score | Reason | What must happen to reach ≥ 4 |
|---|---:|---|---|
| S — subject | **3** | The subject (physician's arrival at the Edmonds door) is canon and DESIGN_ACTIVE. Two cast members are PROPOSED, the scene is not Chairman-approved, and the Earth-help element is new | T-1 + T-4: Chairman selects A and settles the Edmonds household status |
| I — imagery | **3** | VISUAL-001 and VISUAL-002 both exist, and the glaze law is canon, but neither standard is chosen for this scene and the glaze has no formal name | T-5: standard chosen; one approved look-frame (a test render that is not published) |
| G — geometry | **2** | The F01 manifest exists but was not read at object level. House, steps and vehicle dimensions here are PROPOSED; no character sheet is locked | Read the F01 manifest; T-2 + T-3; character sheet for Dr. Edmund and Darryl locked |
| C — cause | **3** | Canon rule "World state before camera state" plus a full PROPOSED before/after chain (X-04, X-05). The call chain and the "put your light on" event are new | T-7 + Chairman approval of the X-04 chain |

**Vc = 3 × 3 × 2 × 3 = 54** (of 625). **min = 2 → NOT production-ready.** Blocking factor: G. Fastest route: read the F01 manifest (safe, no approval needed), then T-2/T-3.

### A-D · Commerce-law derivative scan (Concept A)

| Derivative | State | Note |
|---|---|---|
| Free help | NOW (text drafted, field O) | Needs D-15 before publication |
| Public story | NOW (design) | This transmission |
| Short video | HOLD_FOR_EVIDENCE | Motion stability (§3.3) |
| Long video | QUEUED_WITH_DEPENDENCY | After 001-B |
| Still image | NOW (design) → APPROVAL_REQUIRED (render) | Plates 1–3 |
| PDF / book | NOW | The card PDF |
| Children's derivative | QUEUED_WITH_DEPENDENCY | "Can you find the door?" picture page: a child learns to read the house number and turn on the porch light. After Plate 1 locks |
| Teacher derivative | QUEUED_WITH_DEPENDENCY | Maths lesson: time intervals and fractions using the ledger (grades 4–6) |
| Family derivative | NOW | The card itself |
| Business derivative | APPROVAL_REQUIRED | P-1, P-2 |
| Institutional derivative | APPROVAL_REQUIRED | Home-health agency print licence |
| Software / app function | QUEUED_WITH_DEPENDENCY | "Time your door" timer (X-10) |
| Subscription | QUEUED | RAE Link subscription lane after apply |
| Licensing | APPROVAL_REQUIRED | P-3 |
| Sponsorship | DECLINED for TX-001 | Reads as an advertisement |
| Merchandise | QUEUED_WITH_DEPENDENCY | N-2 |
| Training | APPROVAL_REQUIRED | P-4 |
| Consulting / service | NONACTIONABLE_CONTEXT for now | No service offered to Earth clinicians until a qualified reviewer exists |
| Recurring support | QUEUED | Tips lane |
| Data / evidence product | HOLD_FOR_EVIDENCE | Aggregate self-timing data only; never sold at row level; the ethics decision rests with Elena Marrow |
| Store product | QUEUED_WITH_DEPENDENCY | N-1, N-3 |
| Earth partnership | APPROVAL_REQUIRED | Home-health agencies (P-1) |
| EdereAirah derivative | NOW (design) | The physician network adopts the "put your light on" dispatch script |

---

## 5 · CONCEPT B — "EARTH REQUEST RECEIVED · The Meter Does Not Lie"

**One-line truth:** An Earth household's question about a high water bill and an unresolved plumbing problem reaches the Office of Access and Follow-Through on a vlegh sheet. The office has already solved the same kind of problem in EdereAirah, so it sends back its own method: a measured meter-still test, the arithmetic, and a list of who to ask. It gives no legal ruling and does not take a side.

**Framing:** this is the concept where **"EARTH REQUEST RECEIVED" survives literally**, as a stamp on a real, logged, consented request. It cannot publish on a composite or invented request (§0.2).

**Hard evidence that shapes it:** `thylora_help_intake_index` holds **0 rows** (recovered state §4). **No Earth request is logged in the backend today.** The request this concept is designed around is the high-water-bill / landlord-plumbing example stated in the directive's Lane G. Its owner, consent and jurisdiction are **UNKNOWN**. Until a request is logged with consent, the stamp would be false, and Concept B cannot be Transmission 001 on schedule. This is the main reason it is not recommended first.

**Structure:** 3 plates + voice (STILL_PLUS_VOICE), 80 s target.

| Plate | Frame | Time (world) | Side |
|---|---|---|---|
| Plate 1 | The desk: the request arrives, is redacted and stamped | 10:40 | EdereAirah |
| Plate 2 | Case archive: the world precedent, the Rowan meter test | 16:10, nine days earlier | EdereAirah |
| Plate 3 | "Meter-Still Test" end card + QR | — | Earth side |

### A. Title

**EARTH REQUEST RECEIVED · REQ-0001 · THE METER DOES NOT LIE**
(`REQ-0001` is a placeholder for the real intake ID once logged; see D-13.)

### B. Department

| Role | Department | State |
|---|---|---|
| Lead world department | `THY-WORLD-DOUBT-REMOVER-607`, Access and Follow-Through (Naya Aven, Director) | `chairman_review_required`. **Blocking for this concept** (D-09) |
| Privacy / redaction | `DEPT-LEGAL-COMP-001` (Elena Marrow) | active |
| Case-packet production | `DEPT-LEGAL-COMP-001` (Darius Cole, Legal Production & PDF Manager) | active |
| Earth intake (where REQ-0001 must be logged) | `CUSTOMER_HELP_AND_RESOLUTION` / `THY-DEPT-QUESTION-NAV-001`, coordinated with **Lane G** (Earth Help Desk intake design) | active; intake table empty |
| Water systems (world) | Nearest existing department: `OCEAN_SYSTEMS_AND_INFRASTRUCTURE`. **Whether its scope includes household water service is UNKNOWN** | active |
| Language access | `THY-DEPT-LANGUAGE-ACCESS-001` | active |

### C. Named cast

| # | Person | Title / role | Truth class | Edges | Reason present |
|---|---|---|---|---|---|
| 1 | **Naya Aven** | Director of Access and Follow-Through | CANON (department under review) | → Elena Marrow (HELP-607); → Darius Cole (**PROPOSED**: requests packets from Legal Production); → Maren Rowan (**PROPOSED**: prior case) | Receives, stamps and answers the request. The method-holder |
| 2 | **Elena Marrow** | Director, Privacy, Data & Consumer Protection | CANON | → Naya Aven (HELP-607); → Darius Cole (same department, canon) | Redacts the Earth request **on camera**: the audience sees privacy being done, not promised |
| 3 | **Darius Cole** | Legal Production & PDF Manager | CANON | → Elena Marrow (same department); → Naya Aven (PROPOSED) | Builds the case-packet template that becomes the free derivative |
| 4 | **Maren Rowan** | Guardian (canon role). **Role in this story PROPOSED**: household that ran the world precedent test | CANON person / PROPOSED event | → Talia Rowan (guardian, **relationship to verify in the entity row**); → Naya Aven (PROPOSED) | The world precedent: the method worked in EdereAirah before it was offered to Earth |
| 5 | **Talia Rowan** | Learner (canon role). **PROPOSED**: reads the meter dial and runs the stopwatch | CANON person / PROPOSED event | → Maren Rowan | The children's and teacher derivative: a learner doing real measurement |
| 6 | **Earth requester (REQ-0001)** | — | **PRIVATE** | → Naya Aven's office (intake) | Never named, never shown, never described beyond "a U.S. household" |

**New people: 0.** Two PROPOSED edges (Aven–Cole, Aven–Rowan). Two canon persons are given a PROPOSED event (D-13b).

### D. Building / location

**City: OPEN.** `MUNZYMUUR` is canon-proposed as Naya Aven's "working desk / residence", but **its settlement is not recorded.** Candidates: Bell Crossing (canon settlement) or the Maryland/Baltimore mirror. Decision D-13c. The districts where Elena Marrow and Darius Cole *live* (Civic Archive Quarter, Market Archive District) are residences, not workplaces, and are not used as the set.

**Building: MUNZYMUUR, ground-floor desk room.** All values PROPOSED.

| Element | U.S. customary | Metric | Cause |
|---|---|---|---|
| Building footprint | 24 ft × 50 ft | 7.32 m × 15.24 m | Narrow two-storey working house (desk below, residence above), matching the canon "desk / residence" |
| Desk room | 20 ft × 16 ft, ceiling 11 ft | 6.10 m × 4.88 m, 3.35 m | Front room |
| Street window | 6 ft wide × 7 ft tall, sill 30 in | 1.83 m × 2.13 m, sill 0.76 m | Morning key light |
| Desk | 72 in × 36 in, 30 in high | 1.83 m × 0.91 m, 0.76 m | Oak (PROPOSED); maker UNKNOWN |
| Slate board on wall behind desk | 36 in × 24 in | 914 mm × 610 mm | Where Naya writes the working equation |
| Intake tray | 10 in × 13 in | 254 mm × 330 mm | Where vlegh sheets land |

**Plate 2 location: the Rowan household meter** (settlement OPEN). Residential water meter in a basement meter bay, dial face 4 in (102 mm) across, with a small low-flow indicator (a star or triangle wheel that turns at very low flow, which is how many Earth meters show leaks). Maker UNKNOWN; world unit of volume **OPEN**, so the dial is shown with numerals and no unit legend.

### E. Exact scene

**Plate 1 — 10:40, the desk.** Morning light from the street window. Naya Aven stands at the desk and brings a rubber stamp down onto a vlegh sheet: **EARTH REQUEST RECEIVED · REQ-0001**. The sheet's typed lines are already crossed by solid black bars. Elena Marrow, seated at the desk's short end, is drawing the last bar with a steel rule and a broad marker; the only unredacted words are "high water bill", "landlord", "plumbing" and "U.S.". Behind them, Darius Cole at a side table squares a stack of blank case-packet folders. On the slate behind the desk, in Naya's chalk hand: `q = ΔV / Δt`.

**Plate 2 — 16:10, nine days earlier (archive).** A basement meter bay under a single hanging bulb. Talia Rowan crouches with a stopwatch in her right hand, her face close to the dial. Maren Rowan kneels behind her holding a hand lamp angled onto the dial glass, with her other hand on Talia's shoulder. On the stair behind them hangs a tag, handwritten: "ALL TAPS OFF 16:00". The low-flow indicator wheel is visibly turned partway (a still cannot show motion, so the position is marked by the child's pencil tick on the dial glass). Earth chrome label, lower left: "CASE ARCHIVE · 9 DAYS EARLIER · EdereAirah".

**Plate 3 — Earth card.** "METER-STILL TEST" (field O) + worked example + "Who fixes it?" routing + QR.

### F. Background life

| Thing | Plate | Cause |
|---|---|---|
| A second vlegh sheet in the intake tray, face down | 1 | The desk is busy; the next request is not shown (privacy) |
| Street outside window: a passer-by's umbrella, a handcart, blurred, no faces resolvable | 1 | Ordinary morning; persistent but UNNAMED persons, not identifiable |
| A tea cup, half full, cold (no steam) | 1 | Naya has been at the desk a while |
| Elena's own reading glasses pushed up on her head | 1 | She is doing close redaction work |
| A child's school satchel on the basement stair | 2 | Talia came down straight after school (16:10 is consistent) |
| A shut-off valve with a paper tag "MAIN" | 2 | Real procedure: know where the main is |
| No animals | 1, 2 | Same Lane A dependency as Concept A |

### G. What each person is physically doing

| Person | Plate | Action | Effort / state |
|---|---|---|---|
| Naya Aven | 1 | Standing, right arm driving the stamp down, left hand flat holding the sheet | Firm, deliberate: receipt is a commitment |
| Elena Marrow | 1 | Seated, drawing a black bar along a steel rule | Precise, unhurried |
| Darius Cole | 1 | Standing at the side table, tapping a stack of folders square | Background task, eyes on his work |
| Talia Rowan | 2 | Crouched, stopwatch raised, eyes on the dial | Concentration; a learner doing measurement |
| Maren Rowan | 2 | Kneeling, holding the lamp, hand on Talia's shoulder | Support, not taking over |

### H. ELP treatment `(PROPOSED READING)`

- **Environment:** Plate 1 is a dry, calm morning, 64 °F / 18 °C inside. Plate 2 is a cool basement, 58 °F / 14 °C, dry floor; the plate shows no visible leak, because the leak is inside a fixture and only the meter reveals it. That is the point.
- **Light:** Plate 1: soft daylight through the window (~5,000–5,500 K), falling left to right; the stamp's ink is a single strong red (the only saturated colour in the frame). Plate 2: one bare bulb (2,700 K) plus Maren's hand lamp (cooler, ~4,000 K) aimed at the dial. Visual standard: **VISUAL-001 B&W with the single red stamp retained** (a selective-colour exception, which needs Chairman approval inside VISUAL-001) or VISUAL-002. Decision D-04. Glaze: a slow film drifting across the upper window pane in Plate 1, never over the sheet or faces; a thin sheet across the dark stair corner in Plate 2, never over the dial.
- **Performance:** office competence, no heroics. The drama is the stamp coming down.

### I. Camera (INTERFRAME)

| | Plate 1 | Plate 2 |
|---|---|---|
| Position | Across the desk, 7 ft (2.13 m) from Naya, lens at 4 ft 6 in (1.37 m), slightly below the stamping hand | Low, 3 ft (0.91 m) from the dial, lens at 2 ft (0.61 m), over Maren's shoulder |
| Lens (FF eq.) | 40 mm | 35 mm |
| Focus | The stamp face meeting the paper | The dial and Talia's eye line |
| Aspect | 16:9 master, 4:5 social crop keeping the stamp and slate | same |
| Allowed move | 6 % push-in to the stamp | none |

### J. Embedded text

| Text | Where | World / Earth |
|---|---|---|
| "EARTH REQUEST RECEIVED · REQ-0001" | Stamp impression on the vlegh sheet | World object carrying an Earth-facing phrase. **Permitted only because the request is real (D-13)** |
| Redacted request; visible words "high water bill", "landlord", "plumbing", "U.S." | Vlegh sheet | World |
| `q = ΔV / Δt` | Slate | World |
| "ALL TAPS OFF 16:00", "MAIN" | Paper tags | World |
| "CASE ARCHIVE · 9 DAYS EARLIER" | Chrome | Earth |
| Card text | Plate 3 | Earth |

### K. Public caption (draft, 86 words)

> An Earth household asked us why their water bill is so high and who should fix the plumbing. We can't tell you what your lease or your local law says. What we can give you is what worked here first. Turn everything off, watch the meter for 15 minutes, and do the arithmetic. A meter that moves with every tap off is evidence. The free card shows the test, the math, and who to ask next. Your request was redacted before anyone in EdereAirah read it.

### L. QR placement and destination

Plate 3, lower right, as §3.5. Short code `TX002` (`TX001` if B is chosen first). Destination order:
1. free Meter-Still Test card + printable log;
2. "Who fixes it?": routing to Lane G's intake (lease, local housing agency, utility dispute process, legal-aid finder), with no legal conclusion;
3. plates + voice;
4. "Send your own request", the consented intake that creates REQ-0002 (Lane G owns the form; it collects only what the Lane G intake design specifies, and asks for consent before anything is used publicly);
5. disclosure;
6. one store link.

### M. Follow-up episode

**002-B, "The Number Came Back".** With the requester's consent, their measured `q` returns to the desk as the Earth evidence. Naya and Darius file it in the case packet. If the requester declines publication, the episode uses **the Rowan world case's second reading after the repair** instead, and says plainly that the Earth result is private. **Episode 002-C:** Talia Rowan teaches the test to her class (the children's derivative on screen).

### N. Store derivative

| Item | What | Supplier state |
|---|---|---|
| N-1 Leak-dye tablets, 2-pack | Toilet-tank dye tablets for the flapper test (a common, non-toxic household product category) | Lane D supplier bridge; product-safety data sheet required; QUEUED_WITH_DEPENDENCY |
| N-2 Laminated meter log card + grease pencil | Records start and end readings and times; repeatable | POD / maker, Lane D |
| N-3 Case-packet folder | Darius Cole's template printed: timeline, bills, photos, communications, repair evidence (Lane G fields) | POD |
| N-4 "Meter Reader" activity booklet (children's) | Talia's method for kids 8–12 | POD |

### O. Free help derivative — "METER-STILL TEST" card (draft)

> **METER-STILL TEST — is water moving when nothing is on?**
> 1. Turn off every tap, appliance and irrigation line. Don't use water during the test.
> 2. Find your water meter (often in a basement, a curb box or a utility closet). Write down the reading and the time.
> 3. Wait 15 minutes. Write down the reading again.
> 4. **Flow rate:** q = (second reading − first reading) ÷ minutes.
> 5. **Per month:** q × 43,200 (minutes in 30 days).
> 6. **Cost:** monthly volume × your rate (it's printed on your bill).
> 7. If the meter moved: put a few drops of food colouring or a dye tablet in the toilet tank. Colour in the bowl after 15 minutes without flushing points to a leaking flapper.
> 8. **Who fixes it?** That depends on your lease, your local housing code and your utility's dispute process. We can't decide that for you. Use the "Who fixes it?" page to find your local housing agency and legal-aid office. **This card is not legal advice.**

Formats: US Letter, A4 and 4 × 6 in; English and Spanish; a meter-log table on the back.

### P. Licensing / business derivative

- **P-1** Tenant unions, legal-aid organisations and housing counsellors: co-branded card + case-packet template (non-exclusive).
- **P-2** Property managers: move-in packet insert ("know your meter").
- **P-3** Utility customer-education programmes: licensed card and children's booklet.
- **P-4** THYLORA Library / Help Desk (Lane G) service: navigation + evidence packet assembly, **not** legal representation, on terms Lane G sets. APPROVAL_REQUIRED.

### Q. Production cost (ESTIMATE; §3.6)

| Line | Low | High |
|---|---:|---:|
| Art direction and state-locking, 10–16 h | $600 | $960 |
| Image candidates, 3 plates | $7 | $90 |
| Retouch / compositing, 3 plates | $540 | $1,080 |
| Voice | $0 | $400 |
| Captions + Spanish | $15 | $30 |
| External review (housing / consumer wording) | $0 | $900 |
| Case-packet template design, 4–8 h | $240 | $480 |
| Print proofs | $20 | $60 |
| Landing / hosting | $0 | $20 |
| Consent capture for REQ-0001 (internal) | $0 | $0 |
| **Still + voice total** | **$1,422** | **$4,020** |
| Motion option, parallax | +$400 | +$1,500 |

**Still versus motion for Concept B:** this concept depends least on motion of the three. A stamp coming down and a stopwatch are complete as stills, and desk interiors are the easiest to hold stable. If motion becomes stable, B is the best first motion test: 2 seconds of the stamp's descent.

### R. Revenue possibilities

EDF / product sale (N-1..4, 20 %), licensing (P-1..3, 25 %), commissioned production (a utility commissioning a local edition, 30 %, named client, disclosure), tips (10 %). **Back-to-Buy (Lane D) "household repair" support** is the natural community lane: a household facing a repair bill receives a disclosed share `s` of product sales. **This is never offered to REQ-0001 by default.** It is offered only if that household asks for it and consents, per Lane D. Worked unit math follows Concept A's `N = G − T − F − P − R` table with the product's own P.

### S. Risks / blockers

| # | Risk / blocker | Control |
|---|---|---|
| S-1 | **No logged Earth request** (`thylora_help_intake_index` = 0 rows) | HARD blocker for the stamp. Log a real request with consent via the Lane G intake |
| S-2 | Requester re-identified from details | Redaction on camera; only four words visible; jurisdiction not shown; Elena Marrow sign-off |
| S-3 | Read as legal advice or taking the tenant's side against the landlord | Card states the limit; routing only; external review (D-15) |
| S-4 | Access & Follow-Through department under Chairman review | D-09; no fallback lead (Naya is the concept) |
| S-5 | MUNZYMUUR has no settlement or geometry | D-13c |
| S-6 | A child character doing basement work | Supervised by a guardian on screen; nothing hazardous shown; no valve operation by the child |
| S-7 | Water-rate numbers read as a real tariff | Rate labelled ILLUSTRATIVE; the card tells the reader to use their own bill |

### T. Approval points

T-1 concept selected (D-01) → T-2 real REQ logged + consent (D-13) → T-3 Access & Follow-Through cleared (D-09) → T-4 MUNZYMUUR city + geometry (D-13c) → T-5 Rowan PROPOSED events approved (D-13b) → T-6 visual standard incl. red-stamp exception (D-04) → T-7 ELP (D-03) → T-8 external wording review (D-15) → T-9 RAE Link rights gate → T-10 QR witness → T-11 store items via Lane D (optional).

### B-X · Additional required fields (Concept B)

| # | Field | Content |
|---|---|---|
| X-01 | City | **OPEN** (MUNZYMUUR's settlement unrecorded; D-13c) |
| X-02 | Exact building | MUNZYMUUR: 24 × 50 ft (7.32 × 15.24 m) two-storey working house; desk room 20 × 16 ft, 11 ft ceiling (6.10 × 4.88 m, 3.35 m). PROPOSED |
| X-03 | Timestamp | Plate 1 10:40; Plate 2 16:10 nine days earlier. Dates OPEN |
| X-04 | Before camera | (World) 9 days earlier the Rowans' water account ran high. Maren Rowan brought the bill to Access & Follow-Through. Naya sent the meter-still test home, Talia ran it at 16:10, the meter moved, and the dye test found a leaking flapper. (Earth) A U.S. household submitted a request through THYLORA intake (**must actually happen and be logged**). It arrived on a vlegh sheet (arrival mechanism OPEN) |
| X-05 | After camera | Darius assembles the packet. Naya's reply sheet goes back with the card. The requester runs the test; the result (with consent) returns as REQ-0001 evidence. In the world, the Rowans' next reading after the repair closes their case |
| X-06 | Public message | "Measure before you argue. A still meter is evidence, and so is a moving one." |
| X-07 | Earth bridge | World precedent (the Rowan test) → method (flow = volume ÷ time) → Earth adapter (U.S. meters read in gallons or cubic feet; bill-rate lookup; tenant routing via Lane G) → Earth application → Earth evidence (the requester's `q`, consented) → improved method (the card revised) → back to EdereAirah (the office's world checklist). EdereAirah asks Earth for nothing and offers the method in reply to a request |
| X-08 | QR route | Plate 3 → `tx/002` → free card → "Who fixes it?" → plates → "Send your request" (Lane G intake) → disclosure → one store link |
| X-09 | Store path | "I NEED HELP" → "Home & bills" shelf: free card, N-1, N-2, N-3; "I'M A PARENT" / "I'M A TEACHER" → N-4 |
| X-10 | Participation path | (a) Run the test and report only `q` and a country code (Keal-lum: demonstrated understanding). (b) Submit your own request, which becomes REQ-0002 with consent |
| X-11 | Continuing episodes | 002 → 002-B (the number came back) → 002-C (Talia teaches the class) → the REQ series: one real request per episode |
| X-12 | Money / reinvestment | Free card → store and licences → RAE Link settlement → disclosed `s` → the next REQ episode's budget; Back-to-Buy household-repair lane only by the household's own choice |
| X-13 | Department's method | Receive → redact → stamp → match to a world precedent → send the measured method → route the decision to whoever actually holds it |
| X-14 | Qualifications inside EdereAirah | Naya Aven: Director of Access and Follow-Through (canon title; department under review). Elena Marrow: Director, Privacy, Data & Consumer Protection. Darius Cole: Legal Production & PDF Manager. **No EdereAirah licence, bar or court authority is claimed**; the office's authority is follow-through, not adjudication |
| X-15 | Why Earth should care | The office does not claim to know Earth law. It gives a test that a meter will confirm or refute within 15 minutes, and it shows privacy being done on camera |

### B-M · Visible mathematics — meter-still flow and monthly cost

```
q     = ΔV / Δt
V_30  = q × 43,200
C_30  = V_30 × r
```

| Symbol | Meaning | Unit | Domain |
|---|---|---|---|
| `q` | Leak (unmetered-use) flow rate while all fixtures are off | gallons per minute (gal/min); metric: litres per minute | ≥ 0 |
| `ΔV` | Change in meter reading over the test: second − first | gal (or ft³; 1 ft³ = 7.48052 gal) | ≥ 0 |
| `Δt` | Test duration | min | > 0; recommended ≥ 15 |
| `Δ` | "change in" (the difference between two readings) | — | — |
| `/` | division | — | — |
| `43,200` | minutes in 30 days (30 × 24 × 60) | min | constant |
| `V_30` | volume lost over 30 days at constant `q` | gal | ≥ 0 |
| `r` | billed rate per gallon, water + sewer combined if billed that way | $/gal | from the reader's own bill |
| `C_30` | cost of that volume over 30 days | $ | ≥ 0 |
| subscript `30` | a 30-day period | — | — |
| `×` | multiplication | — | — |

- **Class:** `q = ΔV/Δt` is a **FORMAL SYSTEM LAW**: it is the definition of average volumetric flow rate, applied to a physical measurement. It is not itself a law of physics. The extrapolation `V_30 = q × 43,200` is an **EMPIRICAL MODEL** that assumes a constant leak rate. `C_30` is an **ENGINEERING / accounting relation** and ignores tiered tariffs.
- **Threshold:** any `ΔV > 0` with everything off indicates unmetered flow, provided the meter's resolution can register it. A reading that does not move in 15 minutes does **not** prove there is no leak below the meter's resolution; the low-flow indicator is the finer check.
- **Assumptions:** truly no intentional use during `Δt` (ice makers, humidifiers, irrigation and water softeners are off); a constant leak; a single meter serving only this household; a flat rate `r`.
- **Failure conditions:** a shared meter (multi-unit building), where the result is not attributable to one unit, which matters in landlord disputes; an intermittent leak (a toilet refilling on a cycle), which under- or over-estimates `q`; a tiered tariff, where `C_30` is wrong at the margin; a misread dial (a cubic-feet meter read as gallons); a meter that is itself faulty (a utility test is needed).
- **Worked example (ILLUSTRATIVE):** first reading at 16:00, second at 16:15; ΔV = 0.8 gal (≈ 0.107 ft³), Δt = 15 min.
  q = 0.8 / 15 = **0.0533 gal/min**.
  V_30 = 0.0533… × 43,200 = **2,304 gal** (= 8.72 m³, using 1 gal = 3.78541 L).
  At an ILLUSTRATIVE combined rate of $12.00 per 1,000 gal (r = $0.012/gal): C_30 = 2,304 × 0.012 = **$27.65 per month**, or about $331.78 over 12 such months.
- **Where it appears on screen:** Plate 1 slate (`q = ΔV / Δt`, chalk); Plate 3 card in full with the worked numbers; the voice reads the three lines once.

### B-V · Shared-Vision Convergence scorecard (Concept B)

| Factor | Score | Reason | To reach ≥ 4 |
|---|---:|---|---|
| S | **2** | The lead department is `chairman_review_required`; the Earth request that defines the subject does not exist in the backend (0 intake rows) | D-09 + a real REQ logged and consented (D-13) |
| I | **2** | No look designed for the MUNZYMUUR interior; the red-stamp exception is untested against VISUAL-001 | D-04 + one approved look-frame |
| G | **1** | MUNZYMUUR has no settlement, footprint or interior on record; the Rowan house has none either | D-13c + geometry lock of both sets |
| C | **2** | The world precedent (Rowan case) is wholly PROPOSED; the Earth cause is not logged; the interworld arrival mechanism of the vlegh sheet is OPEN | D-13, D-13b, and a canon statement of how a request reaches EdereAirah |

**Vc = 2 × 2 × 1 × 2 = 8** (of 625). **min = 1 → NOT production-ready.** Blocking factor: G, then S and C, which are gated on real-world consent.

### B-D · Commerce-law derivative scan (Concept B)

Free help NOW (card drafted) · public story NOW (design) · short video HOLD_FOR_EVIDENCE · long video QUEUED (REQ series) · still NOW → APPROVAL_REQUIRED · PDF NOW (card + case-packet template) · children's QUEUED (N-4, after Plate 2 locks) · teacher QUEUED (rates, unit conversion and extrapolation for grades 6–8) · family NOW · business APPROVAL_REQUIRED (P-2) · institutional APPROVAL_REQUIRED (P-1, P-3) · software QUEUED (meter-log calculator in the RAE Link/Lane G surface) · subscription QUEUED · licensing APPROVAL_REQUIRED · sponsorship DECLINED (a plumbing or utility sponsor would compromise neutrality in a landlord question) · merchandise QUEUED · training APPROVAL_REQUIRED (housing-counsellor module) · consulting/service APPROVAL_REQUIRED (P-4) · recurring support QUEUED · data/evidence product HOLD_FOR_EVIDENCE (aggregate `q` only, never row-level, Elena Marrow decides) · store product QUEUED (N-1..4) · Earth partnership APPROVAL_REQUIRED (legal-aid organisations) · EdereAirah derivative NOW (design: the office's world checklist).

---

## 6 · CONCEPT C — "The Crossing Stays Lit"

**One-line truth:** On a storm night, an upstream line fault cuts Bell Crossing off from the wider grid. Its neighbourhood microgrid islands, as the canon power-mesh blueprint says it should ("no single central failure should darken an entire community"). Reporter Denise Carter stands in the mesh hall in front of the board that shows how many hours of reserve the Crossing has left. The Earth adapter gives every household the same arithmetic for its own outage hours, with safety lines signed off.

**Canon anchors:** `ER-PLACE-BELL-CROSSING-001` (settlement), `THY-INFRA-POWER-MESH-001` (PLAIN_EARTH_BRIDGE_ACTIVE), `EDEREARIAH_NEWSROOM` (active department), Denise Carter (PERSON, reporter, 41, replaced Mara Quill). **Relation to `ER-TX-EDU-LMS-001`:** that record is also a Bell Crossing news transmission, but its content was not in the recovered read. Collision check required before state-lock (next action in §9). Concept C does not modify it.

**Structure:** 3 plates + voice (STILL_PLUS_VOICE), 80 s target.

| Plate | Frame | Time | Side |
|---|---|---|---|
| Plate 1 | Bell Crossing street: lit windows during the regional outage | 21:40 | EdereAirah |
| Plate 2 | Inside the mesh hall, at the reserve board | 21:46 | EdereAirah |
| Plate 3 | "Your Outage Hours" card + QR | — | Earth side |

### A. Title

**THE CROSSING STAYS LIT**
Sub-line: *Bell Crossing · 21:40 · islanded*

### B. Department

| Role | Department | State |
|---|---|---|
| Reporting department | `EDEREARIAH_NEWSROOM` | active |
| Operating department for the Bell Crossing mesh | **UNKNOWN.** Nearest existing: `OCEAN_SYSTEMS_AND_INFRASTRUCTURE`; whether it covers power is UNKNOWN | D-14b |
| Safety sign-off on the Earth card | `DEPT-LEGAL-COMP-001`: Caleb Ishikawa, Director, Product & Regulatory Safety | active |
| Language access | `THY-DEPT-LANGUAGE-ACCESS-001` | active |

### C. Named cast

| # | Person | Title / role | Truth class | Edges | Reason present |
|---|---|---|---|---|---|
| 1 | **Denise Carter** | Reporter (41) | CANON | → EDEREARIAH_NEWSROOM (**department membership: VERIFY in the entity row**); → mesh operator (interview, PROPOSED); → Caleb Ishikawa (PROPOSED: source for the safety lines) | Carries the story; asks the question Earth would ask |
| 2 | **Mesh operator, Bell Crossing hall** | Duty operator | **UNNAMED SLOT.** Candidate: **Inés Morales** (canon PERSON whose role is not in the recovered read). Assigning her is a PROPOSED role and needs her entity row read for conflicts | → Denise Carter (interviewee); → Caleb Ishikawa (PROPOSED: safety standards) | Holds the method: reads the reserve board and sets load priorities |
| 3 | **Caleb Ishikawa** | Director, Product & Regulatory Safety | CANON (residence Engineering Crescent) | → DEPT-LEGAL-COMP-001 colleagues (canon); → Denise (PROPOSED) | **Off-screen.** Signs the safety lines on the Earth card |
| 4 | **Bell Crossing residents in Plate 1** | Background residents | UNNAMED SLOTs, persistent: `BC-RES-01` (window, upper floor), `BC-RES-02` (doorway, with a lantern kept as habit) | → the Crossing (residence) | Show that households are lit; no dialogue, no faces resolvable |

**New people: 0.** One role candidate (Inés Morales) marked PROPOSED. Two persistent unnamed resident slots carry IDs so they stay the same people in any later frame.

### D. Building / location

**City:** Bell Crossing (`ER-PLACE-BELL-CROSSING-001`, SETTLEMENT; canon). **Whether Bell Crossing lies in or near the Maryland/Baltimore mirror, and so under Concept A's storm, is UNKNOWN (D-14).** If it does not, Concept C gets its own storm and the shared-night link is dropped.

**Building: Bell Crossing Mesh Hall.** PROPOSED; the building's canon name is OPEN.

| Element | U.S. customary | Metric | Cause |
|---|---|---|---|
| Footprint | 40 ft × 30 ft | 12.19 m × 9.14 m | Single-storey masonry neighbourhood utility hall |
| Eave height | 14 ft | 4.27 m | Clearance for the switchgear room |
| Battery room (rear, behind a fire-rated wall) | 12 ft × 16 ft | 3.66 m × 4.88 m | Storage isolated from the public front room |
| Front room | 28 ft × 30 ft | 8.53 m × 9.14 m | Public side: the board, a bench, a desk |
| Reserve board | 8 ft wide × 4 ft tall, enamel with magnetic tiles + chalk column | 2.44 m × 1.22 m | **Physical board, not a screen or HUD** (the glaze law forbids sci-fi HUD styling) |
| Front door | 42 in × 84 in | 1.07 m × 2.13 m | Public access |
| Street | 24 ft (7.32 m) carriageway, 5 ft (1.52 m) sidewalks | — | Plate 1 |

Maker of the storage and switchgear: **UNKNOWN**. `Edereaireum` is **not** used for any component (its properties are UNKNOWN by canon).

### E. Exact scene

**Plate 1 — 21:40, the street.** Rain easing to moderate. The long view down a Bell Crossing street: the ridge beyond is dark (the wider region is out), but this street's windows are lit at a reduced, even level. Street lamps are **off by design** (load shedding: the mesh's lowest priority). At the far end, the mesh hall's front window glows. Denise Carter walks toward it on the sidewalk, notebook tucked inside her coat. `BC-RES-02` stands in an open doorway holding an unlit lantern, watching the street.

**Plate 2 — 21:46, the reserve board.** Inside the hall. The mesh operator stands at the board with a chalk stick, having just rewritten the reserve column. Denise stands one step back, pen on notebook. The board reads (tiles + chalk): `GRID TIE: OPEN 21:12 · ISLANDED` / `HOUSEHOLDS: 212` / `STORE: … kWh` / `LOAD: … kW` / `RESERVE: … h` / `SHED: STREET LIGHTS 21:14 · HALL HEAT 21:20`. At the board's side, in chalk: `t = E × D × η ÷ P`. **All the numbers on the board are PROPOSED** and must be locked together, so that the reserve equals the equation applied to the displayed store and load.

**Plate 3 — Earth card.** "YOUR OUTAGE HOURS" + worked example + safety lines + QR.

### F. Background life

| Thing | Plate | Cause |
|---|---|---|
| Dark ridge / dark distant district | 1 | The regional outage; the Crossing is the exception |
| Street lamps off | 1 | Shed at 21:14 (board) |
| Lit windows, dimmer than usual | 1 | Households on reduced-load priority |
| `BC-RES-02` with an unlit lantern | 1 | A habit from before the mesh; shows the change without a speech |
| Water sheeting off the hall's roof edge | 1 | Rain easing but still running off |
| A bench with two folded blankets and a kettle on a trivet (unplugged) | 2 | The hall doubles as a warm room, but heat was shed at 21:20; the blankets are the fallback |
| A wall clock reading 21:46 | 2 | Timestamp is witnessed in-world |
| No animals | 1, 2 | Lane A dependency, as in A and B |

### G. What each person is physically doing

| Person | Plate | Action |
|---|---|---|
| Denise Carter | 1 | Walking, head slightly down against the rain, left hand holding her coat closed over the notebook |
| Denise Carter | 2 | Standing, weight on her back foot, writing; eyes on the board, not the operator |
| Mesh operator | 2 | Right arm raised, chalk at the reserve line, finishing the last digit; left hand holding a clipboard with the load log |
| `BC-RES-01` | 1 | Silhouette at an upper window, one hand on the curtain |
| `BC-RES-02` | 1 | In a doorway, lantern hanging from the right hand, looking toward the hall |
| Caleb Ishikawa | — | Off-screen |

### H. ELP treatment `(PROPOSED READING)`

- **Environment:** rain easing from heavy to moderate (2.5–7.6 mm/h, 0.10–0.30 in/h), 50 °F / 10 °C (PROPOSED), wet streets, runoff at the roof edges, no wind to speak of.
- **Light:** the story is told in light levels. Windows are warm and even (2,700–3,000 K) but dimmer than normal; street lamps are dark; the hall window is the brightest source; the far region is black. Inside the hall: one overhead fixture at reduced output plus the operator's headlamp, which is off and hanging round the neck. Visual standard: **VISUAL-001 B&W** is recommended here, because lit versus dark reads best in monochrome. D-04. Glaze: over the dark ridge in Plate 1 (never over the lit windows, which are the evidence) and over the upper corner of the hall's back wall in Plate 2 (never over the board).
- **Performance:** calm operators, a curious reporter, residents who are watchful rather than afraid.

### I. Camera (INTERFRAME)

| | Plate 1 | Plate 2 |
|---|---|---|
| Position | Middle of the street, 120 ft (36.6 m) from the hall, lens at 5 ft 6 in (1.68 m) | Behind and left of Denise, 9 ft (2.74 m) from the board, lens at 5 ft (1.52 m) |
| Lens (FF eq.) | 85 mm, which compresses the street so the hall and lit windows stack | 28 mm, which keeps the whole 8 ft board plus both people in frame |
| Focus | The hall window (Denise slightly soft in the midground) | The board's reserve line |
| Aspect | 16:9 master; 4:5 crop keeps the hall + three lit windows | 16:9; 4:5 crop keeps the board's RESERVE and equation lines |
| Allowed move | none | 5 % push to the reserve line |

### J. Embedded text

Board tiles and chalk (Plate 2; world; all numbers PROPOSED and mutually consistent); the equation `t = E × D × η ÷ P` in chalk; chrome "THYLORA · TRANSMISSION · EDEREAIRAH" and "Bell Crossing · 21:40 · islanded" (Earth); the Plate 3 card text. No brand, product or price anywhere in the world plates.

### K. Public caption (draft, 82 words)

> At 21:12 the line into Bell Crossing failed. At 21:12 the Crossing's own grid took over. At 21:46 the board in the mesh hall showed how many hours of power were left, and why. The street lights went dark first, on purpose. The same arithmetic works for any Earth home with a battery or a backup plan. Our free card shows how to count your own outage hours. Never run a generator indoors.

### L. QR placement and destination

Plate 3, lower right, per §3.5. Short code `TX003`. Destination order:
1. free "Your Outage Hours" card + load worksheet;
2. plates + voice;
3. "How a neighbourhood grid islands", a plain explainer drawn from `THY-INFRA-POWER-MESH-001`'s Earth bridge;
4. disclosure;
5. one store link.

### M. Follow-up episode

**003-B, "06:05 · Grid Tie Closed".** Morning. The operator closes the tie back to the regional grid, the board's reserve column stops falling, and Denise's piece runs. Method taught: **restoration order**, meaning which loads come back first and why. Earth adapter: after an outage, bring appliances back one at a time.

### N. Store derivative

| Item | What | State |
|---|---|---|
| N-1 Laminated load-planner card + marker | Wattage × hours worksheet, reusable | POD / maker, Lane D |
| N-2 "The Crossing Stays Lit" art print (Plate 1) | World image | POD not selected |
| N-3 "Power Detective" children's worksheet pack | Read an appliance label and add up the watts | POD |
| **Not sold:** batteries, generators, inverters | Safety, liability and neutrality | DECLINED |

### O. Free help derivative — "YOUR OUTAGE HOURS" card (draft)

> **YOUR OUTAGE HOURS — how long will your backup last?**
> 1. List what you would keep on (fridge, a few lights, phone charging, internet router).
> 2. Find each item's watts on its label, or measure it with a plug-in power meter. Add them up. That's **P**.
> 3. Find your battery's energy in watt-hours (Wh) on its label. That's **E**.
> 4. **Hours ≈ E × 0.9 × 0.9 ÷ P**. The first 0.9 is the share of the battery you should use; the second is a typical inverter efficiency. Use your product's own figures if it lists them.
> 5. Turn off what you don't need. Halving P roughly doubles the hours.
>
> **Safety (reviewed):** Never run a generator indoors or in a garage. Keep it at least 20 ft (6 m) from windows, doors and vents. Have a working carbon-monoxide alarm. **If someone depends on powered medical equipment, make a plan with their provider and your utility in advance.** In an emergency, call 911 or your local emergency number.

The generator line matches the U.S. CDC's public carbon-monoxide guidance (at least 20 ft from windows and doors). **VERIFY the current wording against the source before publication** (D-15).

### P. Licensing / business derivative

- **P-1** Community resilience hubs, faith-community warming centres, and schools: co-branded card + worksheet licence.
- **P-2** Utility and municipal emergency-management public education: licensed card and the Plate 1 image (commissioned-production lane possible, named client, disclosure).
- **P-3** Microgrid and community-energy nonprofits: explainer licence. **Sponsorship by equipment makers is declined** (neutrality).

### Q. Production cost (ESTIMATE; §3.6)

| Line | Low | High |
|---|---:|---:|
| Art direction and state-locking, 10–16 h | $600 | $960 |
| Image candidates, 3 plates | $7 | $90 |
| Retouch / compositing, 3 plates | $540 | $1,080 |
| Board design (tile and chalk layout consistent with the math), 2–4 h | $120 | $240 |
| Voice | $0 | $400 |
| Captions + Spanish | $15 | $30 |
| External electrical-safety wording review | $0 | $900 |
| Print proofs | $20 | $60 |
| Landing / hosting | $0 | $20 |
| **Still + voice total** | **$1,302** | **$3,780** |
| Motion option, parallax | +$400 | +$1,500 |

**Still versus motion for Concept C:** the long street with dozens of windows is the plate most prone to drift under generated motion (window counts and lit states would change between frames). Keep it still. The one motion beat worth testing later is the chalk digit being finished, which is small, local and easy to verify.

### R. Revenue possibilities

EDF / product sale (N-1..3, 20 %), licensing (P-1..3, 25 %), commissioned production (a municipality's local edition, 30 %), tips (10 %). No sponsorship. Unit math per Concept A's table.

### S. Risks / blockers

| # | Risk / blocker | Control |
|---|---|---|
| S-1 | Electrical and generator safety wording wrong or incomplete | Caleb Ishikawa (world) + a qualified Earth reviewer (D-15); VERIFY the CDC wording |
| S-2 | Collision with `ER-TX-EDU-LMS-001` (also a Bell Crossing news transmission) | Read its content before state-lock |
| S-3 | Operating department for the mesh unknown | D-14b |
| S-4 | No physics canon (the recovered state records no planetary physics) | The equation is dimensionally independent of gravity and atmosphere; E, P and η are device-level. Board numbers are PROPOSED |
| S-5 | Seen as equipment marketing | No equipment sold, no sponsor, no brand |
| S-6 | The Inés Morales role assignment conflicts with her existing record | Read her entity row first; otherwise keep UNNAMED SLOT |

### T. Approval points

T-1 concept selected (D-01) → T-2 Bell Crossing spatial relation + storm link (D-14) → T-3 mesh operating department (D-14b) → T-4 operator: Inés Morales or UNNAMED (D-14c) → T-5 mesh hall geometry + board numbers → T-6 visual standard (D-04) → T-7 ELP (D-03) → T-8 safety wording review (D-15) → T-9 RAE Link rights gate → T-10 QR witness → T-11 store via Lane D (optional).

### C-X · Additional required fields (Concept C)

| # | Field | Content |
|---|---|---|
| X-01 | City | Bell Crossing (canon settlement) |
| X-02 | Exact building | Bell Crossing Mesh Hall: 40 × 30 ft (12.19 × 9.14 m), eave 14 ft (4.27 m), battery room 12 × 16 ft (3.66 × 4.88 m), board 8 × 4 ft (2.44 × 1.22 m). PROPOSED |
| X-03 | Timestamp | Plate 1 21:40; Plate 2 21:46 (wall clock in frame). Date OPEN; same night as Concept A only if D-14 allows |
| X-04 | Before camera | 21:12 upstream line fault; the tie opens automatically and the Crossing islands. 21:14 street lamps shed. 21:20 hall heat shed. 21:30 Denise, at home in the Crossing (**her residence is UNKNOWN**; the "at home" detail is PROPOSED), sees the ridge go dark while her street stays lit, and walks to the hall |
| X-05 | After camera | 21:50 Denise interviews the operator. The reserve is re-chalked hourly. 06:05 the tie closes (003-B). The morning bulletin carries the piece |
| X-06 | Public message | "A community that can island can keep its lights on; a household can learn its own hours." |
| X-07 | Earth bridge | World experience (the Crossing islands) → method (reserve hours = usable energy ÷ load; shed the lowest priority first) → Earth adapter (household battery card, generator safety, planning for powered medical equipment) → Earth application (homes, warming centres) → Earth evidence (anonymous self-reported planned hours versus actual hours) → improved method → EdereAirah (the mesh's household priority guide) |
| X-08 | QR route | Plate 3 → `tx/003` → free card → plates → islanding explainer → disclosure → store |
| X-09 | Store path | "I'M A PARENT" / "I NEED HELP" → "When the power goes" shelf: free card, N-1; "I'M A TEACHER" → N-3; "I WANT TO SUPPORT SOMEONE" → N-2 |
| X-10 | Participation path | "Count your hours": the viewer computes their own `t` and, after a real outage, reports planned versus actual hours (two numbers + country code). Keal-lum: demonstrated understanding |
| X-11 | Continuing episodes | 003 → 003-B (06:05 restoration order) → a series on the canon infrastructure blueprints (the comm mesh: "degrade gracefully") |
| X-12 | Money / reinvestment | Free card → store and licences → RAE Link settlement → disclosed `s` → the next infrastructure episode |
| X-13 | Department's method | Prioritised load shedding against a visible, recomputed reserve |
| X-14 | Qualifications inside EdereAirah | Denise Carter: reporter (canon). Mesh operator: the qualification is the duty post itself; the certifying institution is **UNKNOWN**. Caleb Ishikawa: Director, Product & Regulatory Safety (canon). No EdereAirah engineering licence is claimed |
| X-15 | Why Earth should care | Outages are common on Earth. The arithmetic is the same on any planet because it depends on the device, not the world, and the safety lines are Earth-sourced and reviewed |

### C-M · Visible mathematics — backup runtime

```
t = (E × D × η) / P
```

| Symbol | Meaning | Unit | Domain |
|---|---|---|---|
| `t` | Runtime of the load on the stored energy | hours (h) | ≥ 0 |
| `E` | Rated (nameplate) energy capacity of the battery | watt-hours (Wh) | > 0 |
| `D` | Usable depth-of-discharge fraction | unitless | 0 < D ≤ 1 |
| `η` (eta) | Round-trip or discharge + inverter efficiency from battery to load | unitless | 0 < η ≤ 1 |
| `P` | Average electrical power drawn by the connected load | watts (W) | > 0 |
| `×` | multiplication | — | — |
| `/` | division; W·h ÷ W = h | — | — |

- **Class:** **ENGINEERING CONSTRAINT / EMPIRICAL MODEL.** It rests on energy conservation (a physical law: energy = power × time), but `D` and `η` are empirical device parameters, and the model assumes they are constant.
- **Threshold:** a plan is adequate when `t ≥` the expected outage duration plus a margin. On the board this appears as `RESERVE ≥ 8 h` (a PROPOSED operating threshold).
- **Assumptions:** constant average `P` (a fridge cycles, so `P` is its duty-averaged draw); `η` constant across the discharge; temperature effects on capacity ignored; the battery starts full.
- **Failure conditions:** cold batteries deliver less than their rated `E`; surge loads (motor starts) trip the inverter even when average `P` is fine; the battery is not full at the start; `P` is taken from nameplate maximums, which **underestimates** `t`, or omits phantom loads, which **overestimates** `t`; an aged battery has lost capacity.
- **Worked example (ILLUSTRATIVE, one household):** E = 5,000 Wh, D = 0.90, η = 0.92, P = 400 W.
  Usable energy = 5,000 × 0.90 × 0.92 = **4,140 Wh**. t = 4,140 / 400 = **10.35 h** (10 h 21 min).
  Shed to P = 250 W: t = 4,140 / 250 = **16.56 h**.
  (The card's simplified 0.9 × 0.9 = 0.81 factor gives 5,000 × 0.81 / 400 = 10.1 h. It is slightly conservative, which is the safe direction.)
- **Where it appears on screen:** Plate 2 in chalk on the board, with the board's own store, load and reserve numbers satisfying it; Plate 3 card; spoken once.

### C-V · Shared-Vision Convergence scorecard (Concept C)

| Factor | Score | Reason | To reach ≥ 4 |
|---|---:|---|---|
| S | **2** | Denise Carter and Bell Crossing are canon, but the story is new; the operator is an UNNAMED SLOT; possible collision with `ER-TX-EDU-LMS-001` | D-01 + D-14c + ER-TX-EDU-LMS-001 content read |
| I | **2** | VISUAL-001 fits, but no look-frame exists; street window-count consistency is untested | D-04 + look-frame |
| G | **1** | No geometry for Bell Crossing streets or the hall; board numbers unlocked | Geometry lock + board numbers solved against the equation |
| C | **3** | The canon power-mesh blueprint supplies the cause (islanding) directly; the timeline is PROPOSED but internally consistent | D-14 / D-14b + approval of the X-04 chain |

**Vc = 2 × 2 × 1 × 3 = 12** (of 625). **min = 1 → NOT production-ready.** Blocking factor: G.

### C-D · Commerce-law derivative scan (Concept C)

Free help NOW (card drafted) · public story NOW (design) · short video HOLD_FOR_EVIDENCE · long video QUEUED (infrastructure series) · still NOW → APPROVAL_REQUIRED · PDF NOW · children's QUEUED (N-3) · teacher QUEUED (energy = power × time; grades 5–8) · family NOW · business APPROVAL_REQUIRED (small-business outage planning variant) · institutional APPROVAL_REQUIRED (P-1, P-2) · software QUEUED (outage-hours calculator) · subscription QUEUED · licensing APPROVAL_REQUIRED · sponsorship DECLINED · merchandise QUEUED (N-2) · training APPROVAL_REQUIRED (warming-centre volunteers) · consulting/service NONACTIONABLE_CONTEXT (no electrical service offered) · recurring support QUEUED · data/evidence HOLD_FOR_EVIDENCE (planned-versus-actual aggregates) · store product QUEUED · Earth partnership APPROVAL_REQUIRED (resilience hubs) · EdereAirah derivative NOW (design: the mesh's household priority guide).

---

## 7 · Comparison and recommendation

| Test (from the directive) | A · Door-Side Minutes | B · Earth Request Received | C · Crossing Stays Lit |
|---|---|---|---|
| Built on existing backend canon | **Yes**: extends `THY-SCENE-001-DOCTOR-LEDGER-619` + F01 manifest | Partly: canon people and department; the request is not logged | Partly: canon place, reporter and blueprint; new story |
| Our world, alive | Strong: rain, vehicle, family, lived-in hall | Medium: interior desk | Strong: a whole lit street |
| Our department | Physician network (department UNKNOWN) + Access & Follow-Through | Access & Follow-Through (under review) | Newsroom + mesh (operating department UNKNOWN) |
| Our people | Canon physician; PROPOSED family | Four canon people | One canon reporter + UNNAMED operator |
| Our method | Time decomposition of arrival | Measure flow, then route the decision | Reserve = usable energy ÷ load; shed by priority |
| A real problem | Getting help through the door fast | High water bill, unresolved repair | Outage |
| Visible mathematics | `T_bed` identity, `H` share | `q = ΔV/Δt`, `V_30`, `C_30` | `t = E·D·η / P` |
| Earth application | Any household | Tenants and homeowners with metered water | Any household with backup power |
| Continuing story | 001-B (two clocks, one truth) → 002 → 003 | REQ series (one real request per episode) | Infrastructure series |
| Commercial doorway | Number plate, pad, print | Dye tablets, log card, case folder | Load card, worksheet, print |
| Earth data collected | **None** (two optional numbers) | A real person's request (consent-critical) | None (two optional numbers) |
| Hardest dependency | F01 manifest read + approval | A **real consented Earth request** (0 intake rows) | Bell Crossing geography + mesh department |
| Sensitivity | Medical-adjacent (handled as logistics only) | Legal-adjacent + privacy | Electrical-safety wording |
| **Vc now** | **54** (3·3·2·3) | **8** (2·2·1·2) | **12** (2·2·1·3) |
| min factor | 2 (G) | 1 (G) | 1 (G) |
| Still + voice cost (ESTIMATE) | $1,182–$3,540 | $1,422–$4,020 | $1,302–$3,780 |

**Recommendation: Concept A as Transmission 001.**

1. **It is already Transmission 001 in the backend.** Choosing it continues canon; choosing another means reordering canon.
2. **Highest convergence** (54 against 8 and 12) and the shortest path to `min ≥ 4`: its blocking factor (G) can be cleared by one safe read (the F01 manifest) and one approval, not by waiting for an outside party.
3. **It shows the world alive before it shows the world helping.** That follows World-First Law: EdereAirah's night happens for its own reasons, and the method is then offered.
4. **It collects nothing from Earth.** A first public transmission should not start with a real person's case (B) or with a safety-critical electrical claim (C).
5. **"EARTH REQUEST RECEIVED" is kept, not dropped.** It becomes the stamp of the Transmission 002 series (Concept B), where it will be literally true.

Sequence proposed: **001 = A** → **001-B** (23:10) → **002 = B** once a real request is logged with consent → **003 = C** if D-14 places Bell Crossing within reach of the same storm, otherwise on its own night.

---

## 8 · Chairman decisions needed

| # | Decision | Recommendation | Blocks |
|---|---|---|---|
| D-01 | Select the concept for Transmission 001 | **A** | Everything |
| D-02 | Accept the verdict on "EARTH REQUEST RECEIVED": series stamp and Concept B framing, not TX-001's title | Accept | Title lock |
| D-03 | Define **ELP** (UNKNOWN in the backend). Confirm "Environment / Light / Performance" or give the meaning | Confirm or replace | Field H lock |
| D-04 | Visual standard per concept: A → VISUAL-002 Amber Glaze; B → VISUAL-001 with a red-stamp exception, or VISUAL-002; C → VISUAL-001 | As listed | I-factor |
| D-05 | Approve `THY-EDMUND-ARRIVAL-616-F01-MANIFEST` (APPROVAL_PENDING) after Lane B reconciles it with §4 | Approve after the reconciliation read | G-factor |
| D-06 | Darryl Edmonds and Malik Edmonds: promote from PROPOSED or keep; state their relationship; state Dr. J Lynn Edmund's pronouns | Promote both; relationship at the Chairman's choice | S-factor |
| D-07 | UNIT 07 driver: keep UNNAMED SLOT for TX-001 | Keep unnamed | — |
| D-08 | Host department for TX-001 (`WELLNESS_AND_DAILY_LIFE` proposed) and the physician network's department and name (UNKNOWN) | Approve host; leave the network name OPEN until chosen | C-factor |
| D-09 | Outcome of the review of `THY-WORLD-DOUBT-REMOVER-607` (Naya Aven's department) | Clear it (needed for A's Plate 3 voice and all of B) | A-Plate 3 (fallback exists), B entirely |
| D-10 | Edmonds house form and dimensions; UNIT 07 dimensions and maker (OPEN) | Accept the PROPOSED values unless the manifest differs | G-factor |
| D-11 | Disclosed reinvestment share `s` of net store/licence revenue returned to the next transmission | Set and publish it (e.g. 0.50) | Money path |
| D-12 | Confirm STILL_PLUS_VOICE for TX-001; motion stays HOLD_FOR_EVIDENCE | Confirm | Format |
| D-13 | Concept B: permission to log the Lane G high-water-bill example as REQ-0001, and whose case it is (if it is the Chairman's own, it is PRIVATE until he consents in writing) | Decide before B is scheduled | B entirely |
| D-13b | Concept B: approve the PROPOSED Rowan household events (Maren and Talia Rowan) | Approve, or replace them with UNNAMED | B C-factor |
| D-13c | Concept B: the settlement where MUNZYMUUR stands | Chairman's choice | B G-factor |
| D-14 | Concept C: Bell Crossing's spatial relation to the Maryland/Baltimore mirror (shared storm or not) | Chairman's choice | C C-factor |
| D-14b | Concept C: the department that operates the Bell Crossing mesh | Chairman's choice | C S-factor |
| D-14c | Concept C: assign Inés Morales as mesh operator (after her row is read) or keep UNNAMED | Keep unnamed until her row is read | C S-factor |
| D-15 | Appoint a qualified Earth reviewer for medical-adjacent (A), housing/consumer (B) and electrical-safety (C) wording | Appoint before publication | Publication |
| D-16 | Public domain and path for QR destinations (`<domain>/rae-link/tx/###`) | Decide with the RAE Link deploy | QR, landing |
| D-17 | Voice: synthetic or human, and the voice for each plate (A: narrator for Plates 1–2, Naya Aven for Plate 3) | Human voice for TX-001 | Voice track |

---

## 9 · NO NAKED LATER register (every non-NOW item)

| Item | State | Owner | Dependency | Release condition | Next action |
|---|---|---|---|---|---|
| Read the F01 manifest and SCENE-619 at object level | QUEUED_WITH_DEPENDENCY | Lane B (next session with a backend read) | Backend read access (Supabase connector) | Connector reads both rows | `select *` on both IDs in `thylora_world_design_records` (table VERIFY), then reconcile with §4 field D |
| Read `thylora_transmission_registry` (1 row) + columns of both target tables | QUEUED_WITH_DEPENDENCY | Lane B | Backend read | Columns known | `information_schema.columns` query for both tables |
| Read `ER-TX-EDU-LMS-001` content (collision check for C; `Q_tx` scales) | QUEUED_WITH_DEPENDENCY | Lane B | Backend read | Row read | Select by ID |
| Read entity rows: Inés Morales, Maren/Talia Rowan, Denise Carter | QUEUED_WITH_DEPENDENCY | Lane B | Backend read | Rows read | Select from `thylora_world_entities` |
| Concept selection | APPROVAL_REQUIRED | Chairman VYC | — | D-01 answered | Present §7 |
| ELP definition | APPROVAL_REQUIRED | Chairman VYC | — | D-03 answered | Rewrite field H if the meaning differs |
| Look-frame tests (non-public) | QUEUED_WITH_DEPENDENCY | Lane B | D-01, D-04, D-05 | Approvals recorded | Generate ≤ 20 test candidates for Plate 1; score I and G |
| Final plates | HOLD_FOR_EVIDENCE | Lane B | Vc min ≥ 4 | All four factors ≥ 4 recorded | Render, then witness against the manifest |
| Motion | HOLD_FOR_EVIDENCE | Lane B | Identity stability ≥ 48 frames | Stability test passes | 2 s parallax test on the locked Plate 1 |
| Animals in background | QUEUED_WITH_DEPENDENCY | Lane A | A native urban species with a canon record | Lane A delivers one species fit for a street at night | Revisit Plate 1 background |
| Earth wording review | APPROVAL_REQUIRED | Chairman (appoints) → reviewer | D-15 | Reviewer signs the card text | Send the field O texts |
| Store items N-1..N-4 | QUEUED_WITH_DEPENDENCY | Lane D | Supplier bridge approval; POD selection (THY-DS-MERCH-REWARDS blocker) | One supplier passes desk + sample review | Submit the item specs to Lane D |
| RAE Link publication | QUEUED_WITH_DEPENDENCY | Chairman (DDL apply) | WR-RAELINK-001 B1/B2 | Migrations applied; `BACKEND · READY` | Meanwhile: static landing with the free card |
| Participation forms | QUEUED_WITH_DEPENDENCY | Lane B + Lane G | Landing live + privacy clearance | Elena Marrow (world) / Earth reviewer clearance | Build the two-number form with no PII fields |
| REQ-0001 intake row | APPROVAL_REQUIRED | Chairman VYC + Lane G | D-13 consent | Signed consent recorded | Lane G logs the request in `thylora_help_intake_index` |
| Reinvestment share `s` | APPROVAL_REQUIRED | Chairman VYC | — | D-11 answered | Publish on the landing page |
| QR domain | APPROVAL_REQUIRED | Chairman VYC | D-16 | Domain resolves over HTTPS | Generate codes; run the scan witness |
| Data/evidence aggregates | HOLD_FOR_EVIDENCE | Lane B | ≥ 1 published transmission + participation data | n ≥ 30 submissions | Publish aggregates in 001-B |
| Training and consulting derivatives | APPROVAL_REQUIRED | Chairman VYC | D-15 reviewer | Reviewer approves the scope | Draft the module outline |
| Sponsorship | DECLINED for TX-001–003 | — | — | Reopened only by Chairman instruction | — |

---

## 10 · DEPARTMENT RETURN FORMAT

**1 · CURRENT TRUTH**
Transmission 001 exists in the backend as a scene design (`THY-SCENE-001-DOCTOR-LEDGER-619`, DESIGN_ACTIVE) with a Frame 01 manifest awaiting approval. No transmission is rendered or published. `THY-DS-PUBLIC-MEDIA` remains IMPLEMENTATION_ACTIVE / PARTIAL: "Final rendered teaser is not yet produced." RAE Link is built and locally validated but not applied to the live backend. The Earth help intake index holds 0 rows. This lane made no backend reads or writes.

**2 · WHAT WAS RECOVERED**
Transmission 001 Scene 001 and its F01 manifest; ER-TX-EDU-LMS-001 (STILL_PLUS_VOICE, `Q_tx`); the four 607 transmission packets; the canon terms (vlegh, INTERFRAME, Keal-lum, the interworld glaze law, VISUAL-001/002); the canon people (12 personnel + the PERSON entities); Bell Crossing; the power- and comm-mesh blueprints; RAE Link's channel classes, rights gate, revenue lanes and Family Story prohibitions. The recovered read contains no ELP definition, no physician-network department, no MUNZYMUUR settlement, no Bell Crossing geography and no physics canon.

**3 · WHAT WAS CREATED**
This file:
- three full concepts, each with fields A–T, fields X-01–X-15, a math block, a Vc scorecard and a derivative scan;
- the ELP working interpretation;
- the verdict on "EARTH REQUEST RECEIVED";
- an 8-part commercial doorway rule and a QR rule;
- a cost basis;
- 17 (+4 sub) Chairman decisions;
- a NO NAKED LATER register;
- a backend change packet.

All new content is PROPOSED.

**4 · NUMBERS / QUANTIFIED MOVEMENT**
- Concepts: 3.
- Required fields per concept: 20 (A–T) + 15 (X) = 35; 105 fields authored.
- Equations: 3 (one per concept) + Vc, all with a full notation table and a worked example.
- Vc: A = 54, B = 8, C = 12 (max 625; none passes).
- Costs (ESTIMATE, still + voice): A $1,182–$3,540, B $1,422–$4,020, C $1,302–$3,780.
- New people: 0.
- PROPOSED edges: 1 (A) + 2 (B) + 3 (C).
- UNNAMED SLOTs held: driver (A), mesh operator and two residents (C).
- Chairman decisions: 21.
- Publication gates passed: 2 / 17 (§12).

**5 · FILES / ASSETS / RECORD IDs**
- File: `/home/user/Thylora/workrooms/WR-PROD-FLOOR-001/LANE-B-FIRST-TRANSMISSION.md`.
- Canon IDs referenced: THY-SCENE-001-DOCTOR-LEDGER-619, THY-EDMUND-ARRIVAL-616-F01-MANIFEST, ER-TX-EDU-LMS-001, THY-TRANS-HELP-607, THY-TRANS-RIGHTS-607, THY-TRANS-WILDLIFE-607, THY-TRANS-MODULAR-VEH-607, ER-PLACE-BELL-CROSSING-001, THY-INFRA-POWER-MESH-001, THY-INFRA-COMM-MESH-001, THY-INTERWORLD-VISUAL-BARRIER-001, THY-NAMING-SOCIAL-GRAPH-001.
- Proposed IDs: §11.
- No images and no backend rows were created.

**6 · WHAT IS STILL UNKNOWN**
- the meaning of ELP;
- the physician network's department and name;
- the licensing bodies (institutions are OPEN, DO NOT GUESS);
- the F01 manifest's object-level content;
- the world date, season and calendar;
- the native place name of the Maryland mirror;
- the house number;
- the maker of UNIT 07 and its link to MODULAR-VEH-607;
- Dr. Edmund's pronouns;
- the Edmonds' relationship;
- the settlement of MUNZYMUUR;
- how an Earth request physically reaches EdereAirah;
- Bell Crossing's geography and its relation to the mirror;
- the mesh operating department;
- the content of ER-TX-EDU-LMS-001 and its `Q_tx` scales;
- the column names of both target tables;
- vendor prices (all costs are ESTIMATEs).

**7 · BLOCKERS**
- **B-1:** Vc min < 4 for every concept (final visuals are blocked by rule).
- **B-2:** Chairman selection and approvals D-01 to D-06.
- **B-3:** no backend read access in this lane (F01 manifest, registry rows, columns).
- **B-4:** RAE Link not applied (WR-RAELINK-001 B1/B2).
- **B-5:** no qualified Earth wording reviewer appointed (D-15).
- **B-6:** no approved supplier or POD for store items.
- **B-7 (Concept B only):** no logged, consented Earth request.
- **B-8:** public domain for QR destinations OPEN.

**8 · SAFE WORK ALREADY CONTINUING**
No background process is running from this lane, and this file does not claim one. The following are ready to execute without Chairman approval by the next session that has backend read access: reading the F01 manifest, SCENE-619, the transmission registry and the target-table columns; reading ER-TX-EDU-LMS-001; reading the entity rows for Inés Morales, the Rowans and Denise Carter; and drafting the Spanish text of the three free cards. Lane D can already review the store-item specs (N-lists) as supplier inputs.

**9 · CHAIRMAN DECISIONS NEEDED**
D-01 to D-17 plus D-13b, D-13c, D-14b and D-14c (§8). The first five unlock Concept A: **D-01, D-02, D-03, D-04, D-05.**

**10 · NEXT 3 ACTIONS**
1. **Lane B (next session with the backend):** read `THY-EDMUND-ARRIVAL-616-F01-MANIFEST` and `THY-SCENE-001-DOCTOR-LEDGER-619` at object level, and the columns of `thylora_world_design_records` and `thylora_transmission_registry`. Reconcile §4 field D and finalise the §11 column mapping.
2. **Chairman:** answer D-01 to D-05 (a single sitting, using §7 and §8).
3. **Lane B, after approval:** lock the character sheets for Dr. Edmund and Darryl Edmonds, generate ≤ 20 non-public look-frame candidates for Plate 1, rescore Vc, and send the "At the Door" card to the reviewer appointed under D-15.

**11 · HELP VALUE**
Three free, complete cards, none of which collects data:
- "At the Door" shortens the household-controlled minutes before any visiting clinician or crew arrives;
- "Meter-Still Test" turns a billing dispute into measured evidence;
- "Your Outage Hours" helps households plan backup power and states generator safety.

**12 · EARTH VALUE**
Each concept hands Earth a method it can check with a watch, a meter or an appliance label. None claims EdereAirah authority over Earth, and none asks Earth to rescue EdereAirah. Earth evidence (anonymous two-number submissions) flows back to improve the world method.

**13 · COMMERCE / MONEY PATH**
Free card first → one store link → RAE Link settlement with ten visible figures → disclosed reinvestment share `s` → the next transmission. Lanes: EDF / product sale, licensing, commissioned production, tips. Sponsorship is declined for 001–003. Worked Back-to-Buy example: N = $10.92 per $25.44 plate sale; at s = 0.50, 216–648 sales fund one episode (illustrative, not a forecast).

**14 · MEDIA / STORY PATH**
001 (door) → 001-B (two clocks, one truth) → 002 (EARTH REQUEST RECEIVED series) → 003 (the Crossing) → 003-B (restoration order). All STILL_PLUS_VOICE until motion is stable.

**15 · EDUCATION PATH**
- A: time intervals and fractions (grades 4–6);
- B: rates, unit conversion and extrapolation (grades 6–8), with Talia Rowan as the learner on screen;
- C: energy = power × time (grades 5–8).

Each has a children's derivative and a teacher derivative queued.

**16 · SOFTWARE PATH**
- A "time your door" timer;
- a meter-log calculator;
- an outage-hours calculator.

All are small client-side functions on the RAE Link / Lane G surface, with no PII fields, and are queued behind the landing deploy.

**17 · STORE PATH**
- "I NEED HELP" → At the Door / Home & Bills / When the Power Goes shelves;
- "I'M A PARENT" / "I'M A TEACHER" → children's and teacher packs;
- "I WANT TO SUPPORT SOMEONE" → art prints.

Items are routed through the Lane D supplier bridge. Nothing medical, electrical-hardware or legal-service is sold.

**18 · RISKS**
- medical-adjacent reading (A);
- re-identification and legal-advice reading (B);
- electrical-safety wording (C);
- real-place impersonation (the Baltimore mirror);
- identity drift;
- representation;
- an unlogged Earth request (B);
- sponsor or advert perception.

Each has a control in the concept's field S.

**19 · EVIDENCE**
- `00-RECOVERED-STATE.md` §2 and §4 (canon and status);
- `WR-RAELINK-001.md` (platform state, B1/B2);
- `RAE-LINK-MONETIZATION.md` (lanes, 3.2 % worked fee);
- `RAE-LINK-RIGHTS-PRIVACY.md` (world-channel truth, Family Story prohibitions);
- `RAE-LINK-COSTS.md` (hosting band);
- repo full-text search for "ELP": 0 hits outside the directive;
- worked arithmetic re-computed in this session (FOV 39.6° / 27.4 ft; 2,304 gal / 8.72 m³ / $27.65; 4,140 Wh / 10.35 h / 16.56 h; N = $10.92).

**20 · PERCENT COMPLETE:** see §12. **Authoring: 105 / 105 required concept fields (100 %). Publication: 2 / 17 gates verified (11.8 %).**

---

## 11 · BACKEND CHANGE PACKET (not applied; this lane is not connected to the backend)

**Targets:** `thylora_transmission_registry` (1 row at the recovered read) and `thylora_world_design_records` (88 rows at the recovered read).

**Column mapping: VERIFY_BEFORE_APPLY for every field.** The recovered state says column schemas were read for `thylora_world_design_records` but does not list them, and it lists no columns for `thylora_transmission_registry`. **No column name for either target table appears in `00-RECOVERED-STATE.md`.** The only column names it shows (`canonical_id`, `state`, `gate`, `evidence`, `blocker`) belong to `dashboard_status`, so they are used below only as *candidate* names. The logical field names below must be mapped to the real columns after the pre-apply read.

**Pre-apply read (required, in this order):**
1. `select column_name, data_type, is_nullable from information_schema.columns where table_schema='public' and table_name in ('thylora_world_design_records','thylora_transmission_registry') order by table_name, ordinal_position;`
2. Read the existing `thylora_transmission_registry` row(s). **If a row already represents Transmission 001, do not insert TR-1; patch-link to it instead.**
3. Read `THY-SCENE-001-DOCTOR-LEDGER-619` and `THY-EDMUND-ARRIVAL-616-F01-MANIFEST`. **They must not be overwritten.** Every row below links to them; none replaces them.
4. Check that none of the proposed IDs already exists.

**Write rule:** insert only; no update to any existing row, except the optional link patch LP-1, which is additive (and itself VERIFY_BEFORE_APPLY). Read back after every write and return the exact IDs.

### 11.1 `thylora_world_design_records` — proposed rows

| Ref | Proposed canonical ID | Logical fields (→ columns VERIFY_BEFORE_APPLY) | Truth class | Evidence | Blocker | Next action |
|---|---|---|---|---|---|---|
| WDR-1 | `THY-TX001-CONCEPT-A-DOORSIDE-PF001` | title "Transmission 001 · The Door-Side Minutes"; state `DESIGN_ACTIVE`; approval `APPROVAL_REQUIRED`; extends `THY-SCENE-001-DOCTOR-LEDGER-619`; manifest `THY-EDMUND-ARRIVAL-616-F01-MANIFEST`; format `STILL_PLUS_VOICE`; plates 3; equation `T_bed = T_q+T_r+T_f+T_e+T_a`; Vc `{S:3,I:3,G:2,C:3,product:54,min:2}`; source file this path | PROPOSED | This file §4 | D-01, D-05, Vc | Insert after the pre-apply read |
| WDR-2 | `THY-TX-CONCEPT-B-METER-PF001` | title "EARTH REQUEST RECEIVED · The Meter Does Not Lie"; state `DESIGN_ONLY`; department `THY-WORLD-DOUBT-REMOVER-607`; equation `q = ΔV/Δt; V_30 = q×43,200; C_30 = V_30×r`; Vc `{2,2,1,2,8,1}`; blocker "no logged consented Earth request; thylora_help_intake_index = 0 rows" | PROPOSED | §5 | D-09, D-13 | Insert |
| WDR-3 | `THY-TX-CONCEPT-C-CROSSING-PF001` | title "The Crossing Stays Lit"; state `DESIGN_ONLY`; place `ER-PLACE-BELL-CROSSING-001`; method source `THY-INFRA-POWER-MESH-001`; equation `t = E×D×η/P`; Vc `{2,2,1,3,12,1}` | PROPOSED | §6 | D-14 | Insert |
| WDR-4 | `THY-TERM-ELP-PF001` | term "ELP"; state `UNKNOWN`; working reading "Environment / Light / Performance" (PROPOSED); alternates listed; decision D-03 | UNKNOWN + PROPOSED reading | §3.1; repo search 0 hits | D-03 | Insert as a decision record. **Do not** insert into `thylora_world_term_registry` until defined |
| WDR-5 | `THY-TX-FRAMING-EARTH-REQUEST-PF001` | verdict "EARTH REQUEST RECEIVED = series stamp + Concept B framing; not TX-001 title; only on a real logged consented request" | PROPOSED | §0.2 | D-02 | Insert |
| WDR-6 | `THY-TX-DOORWAY-RULE-PF001` | the 8-part commercial doorway rule (§3.4) and QR rule (§3.5) | PROPOSED (production rule) | §3.4–3.5 | D-01 | Insert |

### 11.2 `thylora_transmission_registry` — proposed rows

| Ref | Proposed canonical ID | Logical fields (→ columns VERIFY_BEFORE_APPLY) | Truth class | Evidence | Blocker | Next action |
|---|---|---|---|---|---|---|
| TR-1 | `THY-TX-001` (**only if** no existing row already represents Transmission 001) | title "The Door-Side Minutes"; scene `THY-SCENE-001-DOCTOR-LEDGER-619`; design `THY-TX001-CONCEPT-A-DOORSIDE-PF001`; format `STILL_PLUS_VOICE`; state `APPROVAL_REQUIRED`; activated `false`; channel class `WORLD_CHANNEL` / `WORLD_SIMULATED`; rights basis `WORLD_PRODUCTION`; provenance `AI_ASSISTED` (disclosed); QR short code `TX001`; destination OPEN (D-16); quality gate `Q_tx = C×A×P×S` (scales VERIFY) | PROPOSED | §4 | D-01, Vc, RAE Link B1/B2 | Pre-apply read step 2, then insert |
| TR-2 | *(conditional)* reorder record | Only if the Chairman selects B or C for first publication: records that the doctor scene moves to the next slot and keeps its ID; **no row is renamed** | PROPOSED | §0.1 item 3 | D-01 ≠ A | Insert only on that decision |
| TR-3 | `THY-TX-002-CANDIDATE` | design WDR-2; state `QUEUED_WITH_DEPENDENCY`; dependency "REQ logged + consent (D-13)"; short code `TX002` | PROPOSED | §5 | D-13 | Insert |
| TR-4 | `THY-TX-003-CANDIDATE` | design WDR-3; state `QUEUED_WITH_DEPENDENCY`; dependency D-14; short code `TX003` | PROPOSED | §6 | D-14 | Insert |

**`ER-TX-EDU-LMS-001` is not touched** by any row above.

### 11.3 Optional link patch

| Ref | Target | Patch | State |
|---|---|---|---|
| LP-1 | `THY-SCENE-001-DOCTOR-LEDGER-619` in `thylora_world_design_records` | Additive link only: `extended_by = THY-TX001-CONCEPT-A-DOORSIDE-PF001`. Apply **only if** the table has a links/metadata column that accepts additive keys; otherwise skip and rely on WDR-1's forward link | VERIFY_BEFORE_APPLY; APPROVAL_REQUIRED |

### 11.4 Outside the named targets (listed, not packaged)

The three equations are candidates for `thylora_math_equation_registry` (32 rows), and the three free cards are candidates for `thylora_store_shelves` mapping. Both are **left out of this packet** because the task names only the two targets above. They are recorded here so they do not silently disappear. State: QUEUED_WITH_DEPENDENCY. Owner: Lane B. Dependency: column read of those tables. Release condition: D-01. Next action: add them to the next packet.

---

## 12 · Percent complete (explicit denominators)

**Measure 1 — Authoring coverage (what this lane was asked to write):**
3 concepts × 35 required fields (A–T = 20, plus X-01 to X-15 = 15) = **105 fields. Authored: 105 / 105 = 100 %.** This measures authoring only. Most field *values* are PROPOSED, not canon.

**Measure 2 — Publication gates for Transmission 001 (verified items only):**

| Gate | Item | State |
|---|---|---|
| G01 | Canon scene for Transmission 001 exists in the backend | **PASS**: recovered-state read of `THY-SCENE-001-DOCTOR-LEDGER-619` |
| G02 | Three complete production concepts exist for selection | **PASS**: this file |
| G03 | Chairman selects the concept (D-01) | OPEN |
| G04 | ELP defined (D-03) | OPEN |
| G05 | F01 manifest read at object level and reconciled | OPEN |
| G06 | F01 manifest approved (D-05) | OPEN |
| G07 | Cast states approved (D-06, D-07) | OPEN |
| G08 | Vc min(S, I, G, C) ≥ 4 recorded | OPEN |
| G09 | Math independently checked by a second reviewer | OPEN (self-checked only) |
| G10 | Earth wording reviewed (D-15) | OPEN |
| G11 | Privacy clearance recorded | OPEN |
| G12 | Plates rendered and witnessed against the manifest | OPEN |
| G13 | Voice track recorded | OPEN |
| G14 | QR scan witness passes (§3.5) | OPEN |
| G15 | Landing page live on the public domain (D-16) | OPEN |
| G16 | Published through the RAE Link rights and publication gate | OPEN |
| G17 | First participation evidence received | OPEN |

**Verified: 2 / 17 = 11.8 %.** The next four gates that can move without outside parties are G03–G06 (one Chairman sitting plus one backend read).
