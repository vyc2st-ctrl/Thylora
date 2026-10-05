# WR-RECONCILE-667 · Cross-agent reconciliation of WR-TIMERUN-581 and WR-STORE-QYRIS-581

**Live head at time of write:** custody **667**, ledger **667** · read directly from `thylora-dash`
**Reconciles:** `97b534c` (WR-TIMERUN-581, WR-STORE-QYRIS-581), written against 581
**Branch:** `claude/time-run-binding-correction-4undjy`
**Written:** 2026-10-05 · **Author:** Claude · **Cross-checked by:** NOBODY YET

---

## 0 · Correction to the prior return

The prior return reported **Sequence 581 as current backend authority**. That was wrong.

- 581 remains the **historical workroom origin** of this lane. Nothing else.
- The live custody head on 2026-09-21, the day `97b534c` was written, was already **582**.
- The live custody head and ledger head are now **667**.

I did not have backend access in the prior session and said so, but I should have
said *"authority unknown"* rather than carrying 581 forward as the authority line.
**That is the error being corrected.**

---

## 1 · Head, read live, not reported

I reached `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`, ACTIVE_HEALTHY) through the Supabase
connector and read the head myself.

| Measure | Value | Source |
|---|---|---|
| Custody head | **667** | `max(sequence_no)` in `thylora_query_carryforward` (654 rows) |
| Ledger head | **667** | `max(sequence_no)` in `thy_sequence_ledger` (66 rows) |
| Restart head | **THY-RESTART-658** | `restart_records`, newest, `IMPLEMENTATION_ACTIVE`, `VERIFIED` |
| Head on 2026-09-21 | **582** | `max(sequence_no) where created_at < '2026-09-22'` |

### Sequence 666 — the Chairman's report verified, and one correction

| Field | Live value |
|---|---|
| `previous_query_id` | `THY-Q-20261005-MAH-COINS-SERIAL-NOLAN-SONG-PORTRAIT-665` |
| `capture_method` | `CONNECTED_CHAT_STRUCTURED_RECOVERY` |
| **`verbatim_locked`** | **`false`** |
| `capture_state` | `STRUCTURED_RECOVERY` |
| `user_message` length | 178 characters |

**The Chairman is correct on every point.** 666 follows 665, it is `STRUCTURED_RECOVERY`,
and **VERBATIM_LOCKED must not be claimed** — the flag is literally `false`. This matches the
failure mode already diagnosed in `WR-CONTINUITY-SLIP-001` (S1): a long turn captured as a
178-character summary.

**One correction:** the head is **667**, not 666. Sequence 667 (`CHAT_VERBATIM`,
`verbatim_locked = true`) is already in. It carries an instruction not in this packet:

> *"also collect indigenous history of the blackfoot history accurately the false and the
> true put through my system and apply the uploaded prompt"*

That is an open Chairman instruction at the live head, tied to the ancestor-logic rotation
already locked at 657 (`THY-POLICY-ANCESTOR-LOGIC-EVERY-REPLY-657`, Blackfoot → Egyptian →
Hebrew → Benin). **It is not mine to execute inside this reconciliation, and it is not done.**

### Repository spine vs live backend

`SPINE.md` / `spine/spine.json` on `main` report `live_backend.state = NOT_CONFIGURED`
("add THYLORA_SUPABASE_URL / THYLORA_SUPABASE_KEY secrets"). **Confirmed, and confirmed
subordinate.** The repo spine's `tests_defined: 70` and `migrations_written: 12` do not
include this lane. The connector I used is session-scoped; it is not the GitHub Actions
secret the scheduled worker needs, so the spine stays NOT_CONFIGURED until the Chairman
adds those secrets in GitHub.

---

## 2 · What the backend already contained that 581 did not know

This is the substance of the reconciliation. **Four live records changed my work.**

### 2.1 Time Run canon already existed — and already agreed

`thylora_time_run_registry` → `THY-TIME-RUN-001`, **v4**, `IMPLEMENTATION_ACTIVE`,
`truth_class CHAIRMAN_DIRECTIVE`:

| Live rule | 581 law | Verdict |
|---|---|---|
| `living_people_rule`: "Residents of each era are living people continuing their lives, not reconstructed recordings." | TR-L1, TR-L6 | **581 restated canon. It did not create it.** |
| `technology_rule`: "Travelers may see and understand later technology, but functioning technological capability is constrained by the destination era. Technology taken back does not retain later-era operational capability." | TR-L4, TR-L5 | **Matches canon exactly, both directions.** |
| `visitor_history_rule`: "Visits and encounters become part of that eras lived history." | CA-A | **See §3.** |
| `death_rule`: `death_is_real: true`, `death_time: when death occurs, regardless of visited era`, `body_may_return_to_origin_era: true` | ID-A | **The Chairman's ID-A selection matches live canon. 581 did not have `body_may_return_to_origin_era`; it is now carried.** |
| `assigned_years: "OPEN"` | year UNSEALED | Matches. |

**The binding correction was already canon.** That is a good outcome for the lane and a
caution for me: I presented as new work what the backend already held.

### 2.2 The castle already exists — and my record was a duplicate

`thylora_world_entities` → **`ER-CASTLE-ROYAL-001`**
`canonical_name`: **"ROYAL CASTLE — CANONICAL NAME OPEN (DO NOT GUESS)"**
`truth_state`: **`OPEN_PENDING_CHAIRMAN_NAME_RECOVERY`**

`thylora_castle_space_geometry` → `THY-SPC-CASTLE-001`, layer EdereAirah,
`erc_name` **Windsor Castle**, `erc_source_ref` `RCT_OFFICIAL_WINDSOR_MIRROR`,
`source_ref` `THY-WORK-CASTLE-DIMENSIONAL-TWIN-572`, `measurement_state` **UNKNOWN**,
`public_disclosure_state` `PRIVATE_EXACT_PUBLIC_ABSTRACT`. Plus
`THY-CASTLE-ROYAL-KITCHEN-001` (Royal Kitchen).

**Three errors in `97b534c`, now corrected:**

1. **`THY-PLACE-CASTLE-001` was a second castle.** It is now marked
   `SUPERSEDED_BY_BACKEND_CANON` and subordinated to `ER-CASTLE-ROYAL-001`.
2. **I proposed three names against a record that says DO NOT GUESS.** All three
   (Ederehald, Ariahdura, Torvaenah) are **WITHDRAWN**. They are retained in full with
   their derivations and the reason for withdrawal — nothing erased.
3. **I invented site invariants** (site ground, orientation, approach, water relation).
   The live geometry carries `measurement_state UNKNOWN` and a Windsor mirror, so those
   must come from the dimensional-twin work 572. They are now marked
   `ASSUMED, NOT CANON` and flagged for continuity inspection.

The state is **name RECOVERY, not name selection**: the Chairman already has a name for
this castle. The task is to recover it, not to propose one. `THY-NAME-PROVENANCE-001`
(**LOCKED**) prohibits "silently replac[ing] canon names with assistant-invented fantasy
names", and at 660 the Chairman answered "no" to exactly this kind of derived proposal
(Sayreth House), which was withdrawn.

### 2.3 Inés Morales's role was never unsealed — it was LOCKED

`thylora_world_entities` → **`ER-ROYAL-COOK-001`**, `canonical_name` **Inés Morales**,
`entity_type` PERSON, `truth_state` **`CHAIRMAN_LOCKED`**, provenance *"Chairman current
turn 2026-09-18, uploaded cook image + direction"*. Supported by
`thylora_person_garment_registry` (work dress, apron, shoes, all `LOCK-ER-ROYAL-COOK-001`)
and `THY-WORK-INES-LIFE-ECONOMY-575`.

**She is the Royal Cook of the Royal Castle.** `97b534c` recorded her role as `UNSEALED`
with three proposed candidates. I was right not to invent an occupation — but the answer
**already existed and I should have found it**. The candidates are withdrawn; the locked
role stands. The packet's instruction "do not invent an occupation" is satisfied by
reading, not by leaving it blank.

*Name-collision note:* a separate **Elena Morales** exists in `thylora_person_identity`
(`EDEREAIRAH_WORLD`, `WORLD_ACTIVE`). The two must not be conflated.

### 2.4 The EdereAirah planet model binds Time Run's clock

`MATH-EA-TIME-660` and `MATH-EA-GRAVITY-660` are **ACTIVE** in
`thylora_math_equation_registry`, layer EdereAirah.

- Day = **26 hours** (93,600 s) · month = 28 days · year = **336**, or **337** on a
  Renewal year · Mirror Epoch EA 2026 M1 D1 = Earth 2026-01-01 00:00 UTC · 26 zones.
- `97b534c` recorded arrival time in **Earth terms only**, silently importing a 24-hour
  day into a 26-hour world. Now corrected.
- `time-run/lib/eatime.js` implements `MATH-EA-TIME-660` independently and **reproduces
  the value the backend states**: Earth 2026-10-05 05:36 UTC → **EA 2026 · Month 10 Day 4
  · 17:36** at Bell Crossing (PMT−6). That is an independent check of the 660 work.
- `MATH-EA-GRAVITY-660` gives **1.00 g**, so under ID-A a body behaves the same in both
  worlds and injury needs no gravity exception.

---

## 3 · Causality: the one real conflict, surfaced not resolved

The packet selects **CA-C LEDGERED CAUSALITY** and says do not canonize CA-A.
The live registry carries `visitor_history_rule`: *"Visits and encounters become part of
that eras lived history"* — inside an `IMPLEMENTATION_ACTIVE` `CHAIRMAN_DIRECTIVE` record.

**My reading, offered as a reconciliation and not applied as a decision:**
CA-A and CA-C **both** satisfy that rule. CA-A adds the stronger claims (never a branch,
plus four guards). CA-C is the narrower reading: one ledger, declared precedence,
contested entries marked. So **the live rule is the shared floor of the two**, not an
existing selection of CA-A — and selecting CA-C does not move backward from it.

**This is a Chairman call, listed in §7.** CA-A is marked
`SUPERSEDED_AS_CURRENT_CANDIDATE`; **all of its guards, tests and findings are preserved
and still run**, including the four-guard coherence test and the proof that dropping any
single guard breaks it.

---

## 4 · Working selections applied, with nothing erased

`time-run/lib/selections.js` records the six selections additively. `mechanics.js` — the
original six-option research — **is untouched**.

| Mechanic | Working selection | Other options |
|---|---|---|
| ENTRY / EXIT | **EE-A Threshold sites** | EE-B, EE-C `RETAINED_ALTERNATIVE` |
| CLOTHING | **CL-C Partial pass** | CL-A, CL-B `RETAINED_ALTERNATIVE` |
| VISIT DURATION | **VD-C Open residence** | VD-A, VD-B `RETAINED_ALTERNATIVE` |
| INJURY / DEATH | **ID-A Fully embodied** | ID-B, ID-C `RETAINED_ALTERNATIVE` |
| CAUSALITY | **CA-C Ledgered causality** | CA-A `SUPERSEDED_AS_CURRENT_CANDIDATE`, CA-B `RETAINED_ALTERNATIVE` |
| INFORMATION | **IT-C Ledgered disclosure** | IT-A, IT-B `RETAINED_ALTERNATIVE` |

Every selection is `SELECTED_WORKING`, `canon: false`. `sealedMechanics()` returns `[]`,
and the database refuses `canon = true` on a working selection.

**Consequences carried through, not just recorded:**

- **CL-C** — no clothing exception exists anywhere in the law. The wool coat is an
  ordinary carried object at materials tier 22, `NATIVE` against the 1700s ceiling of 30.
- **VD-C** — no automatic return. Residence intent (VISIT / REMAIN) must be declared, and
  REMAIN requires a recorded origin-era continuity arrangement.
- **ID-A** — safety moved into a new **authorization / prevention layer**
  (`time-run/lib/authorization.js` + `trun_traversal_authorizations`). Death being real is
  what makes that gate load-bearing. A traversal that should not happen is **stopped before
  departure, not survived after**, and the traveler is never made less real than the people
  of the destination era. A departure cannot be recorded without a cleared authorization —
  enforced by trigger.
- **IT-C** — every disclosure is ledgered, including declined ones; the database refuses an
  unledgered IT-C disclosure.
- **EE-A** — the Royal Castle is a **working** threshold site,
  `WORKING_SUBJECT_TO_CONTINUITY_INSPECTION` against castle canon before canonization.

---

## 5 · Store lane

| Decision at head 667 | Applied |
|---|---|
| **R4 KEEP** | Already correct; now recorded as decided. A hard-to-reverse decision requires a safeguard even with observed evidence. |
| **Free preview = pages 1–3** | Corrected from pages 1–4, in the packet and in a test. |
| **Letter remains Rev A; A4 later additive** | Corrected; A4 is a later revision, never a silent edit. |
| **Release order: QuickCheck → Before You Buy → Stuck Loop Reset** | Applied. |
| **Price is a PROPOSAL, not willingness-to-pay evidence** | Applied hard — see below. |
| **Publication NOT authorized** | Held. No route, no nav entry, no listing. |

`store/lib/revenue-path.js` implements **MATH-REVENUE-PATH-PRIORITY-662**
(`R_p = (N × F × W × E) / (C × T)`) and **refuses to compute `R_p` at all**, because
`N`, `F`, `W` and `E` are `UNKNOWN` for all three instruments — no sale, survey, waitlist
or price test exists. Only `C` and `T` are observed. The ranking is therefore returned as
**`COMPLETION_RANKED`, not `MARKET_EVIDENCED`**, with `market_validated: false`.

That completion ranking **independently reproduces the Chairman's release order**:
QuickCheck (1) → Before You Buy (2) → Stuck Loop Reset (3). It is a statement about what
we can finish, **not** about what anyone will pay.

`PRICE_PROPOSAL` carries `state: PROPOSAL`, `market_validated: false`,
`willingness_to_pay_evidence: UNKNOWN`, `evidence_held: []`, and names what would validate
it. A test refuses any claim otherwise.

**Gap found:** `thylora_store_product_readiness` and `thylora_store_release_gate` are the
live store gates and **`THY-QYRIS-QUICKCHECK-001` has no row in either**. Registering it
is a backend write and is **held**.

---

## 6 · MATH-CROSS-AGENT-PATROL-653 run against my own work

`P(w) = H × N × L × X`, each 1 or 0, `P = 0 → ALERT CHAIRMAN`.
Implemented in `patrol/cross-agent.js`; the module **cannot set `X = 1` for its own author**.

| Write | H | N | L | X | P | |
|---|:-:|:-:|:-:|:-:|:-:|---|
| **`97b534c`** | 0 | 1 | 0 | 0 | **0** | **ALERT CHAIRMAN** |
| **`WR-RECONCILE-667`** (this write) | 1 | 1 | 0 | 0 | **0** | **ALERT CHAIRMAN** |

**Why each zero, with evidence:**

- **`97b534c` H = 0** — written against 581 when the live head was already **582**, and it
  carries no custody or ledger linkage.
- **`97b534c` L = 0** — lineage to the directive text exists, but the work is not
  represented in the backend: **0 rows** in `thy_sequence_ledger`, **0** in
  `restart_records`, **0** in `thylora_store_product_readiness`, **0** in
  `thylora_store_release_gate`, **0** in `thylora_math_equation_registry`. The only
  carryforward hit is sequence 666 itself — the Chairman pasting my return in.
- **`97b534c` N = 1** — purely additive, 29 files added, 0 modified, nothing deleted.
- **This write H = 1** — live head read directly before writing.
- **This write L = 0** — still not represented in the backend. Registering it is a backend
  write and is held.
- **Both X = 0** — ChatGPT has not checked either. **An author does not self-certify.**

**Drift index** over this lane's two writes: `D_H = 0.5`, `D_N = 0`, `D_L = 1.0`,
`D_X = 1.0`. **Worst gaps: lineage-into-backend and cross-check — both at 100%.**

---

## 7 · VERIFIED / REPORTED / ASSUMED / UNKNOWN

### VERIFIED — read by me from the live backend, 2026-10-05
- Custody head 667, ledger head 667, restart head THY-RESTART-658.
- Sequence 666: follows 665, `STRUCTURED_RECOVERY`, **`verbatim_locked = false`**.
- Head on 2026-09-21 was 582.
- `THY-TIME-RUN-001` v4 `IMPLEMENTATION_ACTIVE`: living-people, technology, visitor-history and death rules as quoted.
- `ER-CASTLE-ROYAL-001` "CANONICAL NAME OPEN (DO NOT GUESS)", `OPEN_PENDING_CHAIRMAN_NAME_RECOVERY`; geometry `THY-SPC-CASTLE-001`, erc Windsor, `measurement_state UNKNOWN`.
- `ER-ROYAL-COOK-001` Inés Morales, **`CHAIRMAN_LOCKED`**, Royal Cook.
- `THY-NAME-PROVENANCE-001` **LOCKED**, with its prohibition rule.
- `MATH-CROSS-AGENT-PATROL-653`, `MATH-EA-GRAVITY-660`, `MATH-EA-TIME-660`, `MATH-REVENUE-PATH-PRIORITY-662` all **ACTIVE**, with the equation text as quoted.
- `THY-QYRIS-QUICKCHECK-001` has **no** store readiness or release-gate row.
- 919 public tables; **no** EdereAirah language/lexicon/morpheme registry.
- My `eatime.js` reproduces the backend-stated Bell Crossing value exactly.

### REPORTED — told to me, consistent with what I verified, not independently re-derived
- That ChatGPT reached the backend and found 665, and that 666 was captured by STRUCTURED_RECOVERY. (666's row and its `previous_query_id` are verified; **who wrote it** is not something I can verify.)
- The Chairman's six working mechanic selections. Applied as given.

### ASSUMED — my judgement, flagged as such
- That the live `visitor_history_rule` is the **shared floor** of CA-A and CA-C rather than an existing selection of CA-A. **§3 — this is the one I most want checked.**
- Capability tiers and era ceilings in `eras.js`: ordinal governance numbers I assigned, with no canon source. Unchanged from 581 and still unverified.
- The castle site invariants from 581 — now explicitly marked `ASSUMED, NOT CANON`.
- Completion cost/time factors `C` and `T` for the three store products.

### UNKNOWN — searched, genuinely absent, not invented
- **The EdereAirah native language.** Searched all 919 public tables for language/lexicon/morpheme/tongue columns. The only match is `er_vehicle_brand_language_registry` (vehicle brands). **No world language exists.** The withdrawn castle-name morphemes therefore had no canonical source and could not have had one.
- **The Royal Castle's canonical name.** State is RECOVERY; the backend says DO NOT GUESS. **I propose nothing.**
- The 1700s exact year, the EA zone of the Royal Castle, and the residence intent for THY-ENC-0001.

---

## 8 · Evidence

| Claim | Evidence |
|---|---|
| Tests pass | `npm test` → **155 tests, 155 pass, 0 fail** (113 at 97b534c + 42 added here) |
| Migrations apply and re-apply | All **4** applied to a fresh PostgreSQL 16 database and re-applied idempotently: **19 tables, 46 check constraints** |
| Constraints fire | **32 of 32** expect-reject cases rejected by the database; **7** expect-accept accepted; **0** failures |
| Nothing is canon | `sealedMechanics()` → `[]`; `trun_open_mechanics where canon` → **0**; every record carries `canon: false` |
| NO-LOSS | 18 option dispositions recorded; all 3 withdrawn castle names retained with derivations; all 3 withdrawn Inés role candidates retained; all 3 era strata retained; CA-A guards and tests still run |
| EA clock is right | `eatime.js` reproduces EA 2026 · Month 10 Day 4 · 17:36 PMT−6 from Earth 2026-10-05 05:36 UTC |
| 26-hour day enforced | `trun_ea_hour_range` rejects hour 26; Renewal Day cannot sit inside a month |
| ID-A gate is load-bearing | A departure without a cleared authorization is rejected by trigger; unacknowledged death rule, non-admitting threshold, unmet medical floor and unresolved REMAIN all refuse |
| Price not validated | `PRICE_PROPOSAL.market_validated === false`, `evidence_held: []`; ranking returns `COMPLETION_RANKED` |
| Spelling corrected | `EdereAirah` throughout this lane; a test fails on `EdereAriah` in Time Run files |
| Patrol is honest | Both writes score **P = 0 / ALERT CHAIRMAN**; the module cannot self-certify `X` |

---

## 9 · For ChatGPT — identifiers to cross-check this write

Repository `vyc2st-ctrl/Thylora`, branch `claude/time-run-binding-correction-4undjy`.

**Check these claims against the live backend:**
`thylora_query_carryforward` head = 667 · sequence 666 `verbatim_locked = false` ·
`thy_sequence_ledger` head = 667 · `restart_records` newest = `THY-RESTART-658` ·
`thylora_time_run_registry.THY-TIME-RUN-001` v4 rules · `ER-CASTLE-ROYAL-001` truth_state ·
`THY-SPC-CASTLE-001` geometry · `ER-ROYAL-COOK-001` truth_state `CHAIRMAN_LOCKED` ·
`THY-NAME-PROVENANCE-001` LOCKED · the four MATH equations · absence of any
EdereAirah language registry · absence of a `THY-QYRIS-QUICKCHECK-001` store-gate row.

**Check these files in the repository:**
`time-run/lib/eatime.js` (MATH-EA-TIME-660) · `time-run/lib/selections.js` (dispositions) ·
`time-run/lib/authorization.js` (ID-A gate) · `patrol/cross-agent.js` (653) ·
`store/lib/revenue-path.js` (662) · `db/time-run/0004_reconcile_667.sql` ·
`db/time-run/validation/behaviour-667.sql` · `data/time-run/THY-ENC-0001.json` ·
`data/place/THY-PLACE-CASTLE-001.json`.

**Reproduce:** `npm test` → 155/155. `db/time-run/validation/run.sh` → 32 rejected, 7 accepted.

**The three things I most want challenged:**
1. The CA-A / CA-C shared-floor reading in §3.
2. The capability tiers in `eras.js` — assigned by me, no canon source.
3. Whether withdrawing the castle names was right, or whether a *labelled hybrid/derived
   proposal* is permitted under `THY-NAME-PROVENANCE-001`'s `naming_output_rule`, which asks
   for Earth, EdereAirah **and** hybrid options per naming task.

**Set `X` for `97b534c` and for this write.** I cannot set my own.

---

## 10 · Held — not done, and not claimed

- **No backend write of any kind.** No custody row, no ledger row, no restart record, no registry row. The connector can write; I did not.
- **No migration applied.** `db/time-run/0001–0004` are reviewable only, and the set must pass independent cross-agent review plus an authority / precondition / evidence / readback gate first.
- **No publication.** No route, no nav entry, no store listing. `vercel.json`, `public-site/`, `app/`, `rae-link/` and the dashboard baseline are untouched.
- **Sequence 667's Blackfoot instruction is not executed.** It is live and open.
- **The branch is not merged to `main`**, which has advanced to `2579ae2` with 17 commits this lane does not carry. Reconciling the branch onto `main` is separate work and is not done.
- **`rae-link` carries the old spelling** as a database enum value (`EDEREARIAH_INHABITANT`) and in prose. Correcting it is a breaking schema change to a built lane and needs its own migration and cross-check. **Flagged, not touched.**
