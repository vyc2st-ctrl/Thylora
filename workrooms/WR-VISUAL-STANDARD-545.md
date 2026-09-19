# WR-VISUAL-STANDARD-545 · Visual Standard Recovery + Product Quality Gate

**Work code:** `THY-WORK-VISUAL-STANDARD-RECOVERY-545`
**Gate code:** `THY-VISUAL-QUALITY-GATE-001`
**Binds:** `THY-WORK-BRAMBLE-PROOF-PRODUCT-544`
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/visual-standard-recovery-gate-2oc3jc`
**Opened:** 2026-09-19

No image was generated. No new product was created. No new visual framework was
created. Nothing was written to the live backend.

---

## A · Backend handshake

| | |
|---|---|
| Backend named | `thylora-dash` · `jvsdxhrfhtlgaknhjxlz` |
| Read through sequence 545 | **NO — HARD BLOCKER.** See B1 below. |
| Authority position confirmed | `DASHBOARD_AUTHORITY.md` · this repository is **not** the deployment authority. Authority remains `vyc2st-ctrl/thylora-executive-dashboard` → `thylora-public-world`. |
| Baseline floor | `THY-DASH-FLOOR-20260823-001` · no baseline capability removed, renamed or disconnected |
| Dashboard head file | `dashboard-current-head.html` · **not touched** |

### B1 · The backend could not be read — HARD

`jvsdxhrfhtlgaknhjxlz.supabase.co:443` returned **403 on CONNECT** from the egress
proxy (organization policy denial), 2026-09-19. This is the same denial already
recorded as blocker B1 in `WR-RAELINK-001` on 2026-09-11; it has not lifted.

Consequences, carried honestly:

- `thylora_query_carryforward` could not be read. **Sequence 545, sequence 544 and
  every delta newer than 545 were not read.** Their content is UNKNOWN to this
  session. Neither work code appears anywhere in either repository.
- The recovery below therefore reads the *authoritative repositories and the
  shipped surfaces they deploy*, which are reachable, rather than the carryforward
  ledger, which is not. Every recovered item cites the repository, commit and file
  it came from, so the Chairman can check each one against the backend when it is
  reachable.
- What is written here is written to the repository, not to the backend. The
  migrations are reviewable and validated; **none was applied.**

Repositories actually read: `vyc2st-ctrl/Thylora` @ `3a01e82` (full history) and
`vyc2st-ctrl/thylora-executive-dashboard` @ `a634249` (shallow — file-level dates
before the clone boundary were not recoverable and are recorded as the merge date).

---

## B · QYRIS PASS

Nine inspections against every decision in this delta. **Routed** means removed or
handled here; **held** means it needs an authority this session lacks.

| # | Inspection | Gap found | Disposition |
|---|---|---|---|
| 1 | Missing prerequisite | A product could reach Chairman preview with no illustration, no author, no world detail and no page plan — `visual_preflight_passed` existed as a boolean with nothing behind it | **Routed** — 15 automatic FAIL conditions, evaluated in SQL and JS, fail-closed |
| 1b | Missing prerequisite | A maker learning blockers one at a time = one round trip per problem | **Routed** — the gate returns *every* failing condition in one call, each with a route |
| 2 | Hidden handoff | A gate run leaving no record of who ran it or what it said | **Routed** — `thylora_visual_gate_checks` is append-only, stamped with `auth.uid()` |
| 2b | Hidden handoff | A packet passing the gate, then the artifact changing underneath it | **Routed** — `thylora_preview_packets_gated_v1` shows the latest gate state beside the packet; an unevaluated packet reads `NOT_EVALUATED`, never `PASS` |
| 3 | Authority mismatch | A browser session able to mark its own product preview-ready | **Routed** — both functions are `SECURITY DEFINER` behind `thylora_is_chairman()` / `thylora_is_trusted_server()`, returning a reason rather than raising |
| 3b | Authority mismatch | This session inventing a visual standard the Chairman never approved | **Routed** — all 17 rules cite a prior record; `gap_rules = 0` is asserted by the harness |
| 4 | Evidence gap | "Visual preflight passed" assertable with no proof | **Routed** — the boolean is now computed from evidence rows; absence of a record is a FAIL |
| 4b | Evidence gap | Live backend shape unverifiable | **Partly routed, remainder held → B1.** Routed: validated end to end on PostgreSQL 16 by a committed harness, and the packet link is a `to_regclass`-guarded view that degrades instead of corrupting. Held: live-backend compatibility |
| 4c | Evidence gap | Sequence 544/545 content unverifiable | **Held → B1.** Recorded UNKNOWN, not estimated |
| 5 | Unnecessary waiting | A maker blocked from all checking until the backend exists | **Routed** — the JS gate runs offline; the same rules, proven equal to the SQL by `parity.mjs` |
| 6 | Creator friction | "Not ready" with no reason | **Routed** — every problem carries a code, a plain-language detail and a route |
| 6b | Creator friction | A gate that stays failed after repair | **Routed** — check 18 restores the removed maker detail and the same product returns to PASS |
| 7 | Rights/privacy risk | Simulated world media mistaken for a real person | **Routed** — `VIEWER_PLANE_FILM_BARRIER` recovered from the four-layer brief and carried as a rule |
| 7b | Rights/privacy risk | A name invented for an unfilled role | **Routed** — `thylora_authorship_no_generic_byline` and `..._resolved_needs_a_name` refuse it at the database, and OPEN roles are stored with a NULL byline |
| 8 | Monetization | A priced product with no explainable value | **Routed** — `PRICE_VALUE_UNEXPLAINED` |
| 9 | Failure/recovery | The superseded generic look returning later as a new idea | **Routed** — `THY-VIS-SUPERSEDED-001` is retained in the registry, not deleted |
| 9b | Failure/recovery | A blank white page being impossible even when the art calls for it | **Routed** — allowed, but only with a documented *and* justified exception, enforced by check constraint |
| 9c | Failure/recovery | The name-guard spelling conflict being silently normalised | **Routed** — recorded OPEN in `thylora_visual_open_questions`; the gate uses the shipped spelling and refuses to erase the other |

**19 inspections · 16 routed · 1 partly routed · 2 held against a named blocker.**

**QYRIS state: PASS**, with the two held items named against B1 rather than
absorbed. No inspection was reported and left unrouted where a safe reversible
route existed.

> A QYRIS row for this work code could not be written to
> `thylora_qyris_work_item_checks` — the backend is unreachable (B1). The content
> above is the Question / Yield / Reason / Inspect / Safeguard material for that
> row, ready to insert.

---

## C · Strongest recovered visual exemplars

| Asset / record ID | Date | Source | Why it passed | Rule it demonstrates | State |
|---|---|---|---|---|---|
| `THY-VIS-EXEMPLAR-001` | 2026-09-19 | `thylora-executive-dashboard` @ `a634249` · `app/assets/thylora-handluh-castle.jpg`, bound by `app/build8-visual-floor.js` (marker `THY-BUILD8-VISUAL-FLOOR-002`) | The **only** image the THEHANDLUH gallery is permitted to render. Its own shipped alt text and caption read "Chairman-approved living-art environment · castle, cart and workers" — architecture, a working object and people working in it, not a posed subject | LIVED_IN_WORLD · PEOPLE_DOING_REAL_THINGS · BACKGROUND_ACTIVITY · DEEP_SPATIAL_CONTEXT · WORLD_SPECIFIC_ARCHITECTURE · OBJECT_PROVENANCE | **CURRENT** |
| `THY-VIS-EXEMPLAR-002` | 2026-09-19 | same repo · `app/build8-visual-floor.js` gallery copy | Shipped as enforced copy: "This room uses approved THYLORA imagery only. Unapproved scene slots stay absent instead of appearing as temporary color blocks." Absence beats placeholder | NO_GENERIC_STOCK_LOOK · NO_WHITE_WORKSHEET_LOOK | **CURRENT** |
| `THY-VIS-EXEMPLAR-003` | 2026-08-25 | `Thylora` @ `af780f5` · `app/index.html` `#shows` | Names the era as a **lock**, not a mood — "1930s–1940s ERA LOCK" — and enumerates what it covers: visible technology, clothing, classrooms, transportation, tools, signs, household objects | PERIOD_MATERIAL_CULTURE · WORLD_SPECIFIC_CLOTHING · LIGHT_WEATHER_TIME | **CURRENT** |
| `THY-VIS-EXEMPLAR-004` | 2026-08-29 | `thylora-executive-dashboard` @ `a634249` · `research/historical-interactive-derivative-brief.md` | Four parallel layers — documented fact, interpretation, dramatization, UNKNOWN — with evidence cards carrying source, institution, access date, jurisdiction and confidence, and fictionalized content carrying a persistent visual label distinct from fact | VIEWER_PLANE_FILM_BARRIER · MAKER_MARKS · OBJECT_PROVENANCE | **CURRENT** |
| `THY-VIS-EXEMPLAR-005` | 2026-09-19 | same repo · `js/delivery-intake-build8.js` rendering `get_thylora_release_review_candidates_v1()` | **PARTIAL.** The release-review card already shows the product image beside `visual_preflight_passed`, `rights_passed`, `delivery_connected`, `mobile_preview_passed`. The hook exists and must not be duplicated | PAGE_TO_PAGE_VISUAL_FLOW | **CURRENT BUT UNENFORCED** |
| `THY-VIS-SUPERSEDED-001` | 2026-08-25 | `Thylora` @ `4952f4e` / `647bb80` · `app/styles.css` `.scene/.waterfront/.oldcity/.country/.downtown` | **It did not pass.** Four CSS gradient rectangles standing in for a waterfront, an old city, countryside and downtown. No people, no objects, no makers, no depth | NO_GENERIC_STOCK_LOOK (by counter-example) | **SUPERSEDED** by `THY-VIS-EXEMPLAR-002` |

Retained deliberately: the superseded row stays in the registry so the defect it
names cannot be reintroduced later as if it were a new idea.

---

## D · Exact recovered visual rules

All seventeen are in `thylora_visual_rule_registry` and
`visual-gate/lib/visual-standard.js`. Each cites the exemplar it was recovered
from. **None is new — `gap_rules = 0` is asserted by the validation harness.**

| Rule | Recovered from |
|---|---|
| LIVED_IN_WORLD | EXEMPLAR-001 |
| PEOPLE_DOING_REAL_THINGS | EXEMPLAR-001 |
| BACKGROUND_ACTIVITY | EXEMPLAR-001 |
| PERIOD_MATERIAL_CULTURE | EXEMPLAR-003 |
| MAKER_MARKS | EXEMPLAR-004 |
| WEAR_REPAIR_USE | EXEMPLAR-001 |
| DEEP_SPATIAL_CONTEXT | EXEMPLAR-001 |
| OBJECT_PROVENANCE | EXEMPLAR-004 |
| WORLD_SPECIFIC_ARCHITECTURE | EXEMPLAR-001 |
| WORLD_SPECIFIC_CLOTHING | EXEMPLAR-003 |
| LIGHT_WEATHER_TIME | EXEMPLAR-003 |
| VIEWER_PLANE_FILM_BARRIER | EXEMPLAR-004 |
| TEXT_PLACEMENT | EXEMPLAR-002 |
| PAGE_TO_PAGE_VISUAL_FLOW | EXEMPLAR-005 |
| ART_STORY_BALANCE | EXEMPLAR-002 |
| NO_GENERIC_STOCK_LOOK | EXEMPLAR-002 / SUPERSEDED-001 |
| NO_WHITE_WORKSHEET_LOOK | EXEMPLAR-002 |

---

## E · What the prior system failed to enforce

1. **The preflight boolean had nothing behind it.** `visual_preflight_passed` has
   been rendered on the release-review card since Build 8. No record in either
   repository defines what makes it true. It was a switch anyone could flip.
2. **The standard lived in prose, not in a gate.** The Build 8 rule, the era lock
   and the four-layer labelling brief are all real and all correct — and all
   unenforceable, because each sits in page copy or a markdown file that no
   release path reads.
3. **Absence read as success.** Nothing failed a product for having no page plan,
   no author, no maker detail and no world signature. A product with no evidence
   scored the same as a product with complete evidence.
4. **The approved exemplar was never bound to anything but one gallery.** The
   THEHANDLUH image governs one room in one app. No product preview consults it.
5. **Page architecture was never modelled.** No table held a page, so "same
   composition on every page" was unrepresentable, let alone detectable.
6. **Authorship was unmodelled.** Nothing prevented a generic byline; nothing
   distinguished "unfilled" from "deliberately open".
7. **The Build 6 gradient blocks were removed but never recorded as wrong.**
   Build 8 replaced them. No record said why, so nothing stopped their return.

---

## F · Quality-gate implementation

| Layer | Object |
|---|---|
| Exemplar registry | `thylora_visual_exemplar_registry` |
| Rule registry | `thylora_visual_rule_registry` |
| Open questions | `thylora_visual_open_questions` |
| Page plan (11 questions as columns) | `thylora_product_page_plan` |
| Authored identity | `thylora_product_authorship` |
| Product visual facts | `thylora_product_visual_record` |
| Append-only gate evidence | `thylora_visual_gate_checks` |
| The gate | `thylora_visual_gate_evaluate_v1(product_code)` |
| Fail-closed preview admission | `thylora_preview_admission_v1(product_code)` |
| Packet view | `thylora_preview_packets_gated_v1` (`to_regclass`-guarded) |
| Work-code binding | `thylora_visual_gate_bindings` |
| Client gate (offline) | `visual-gate/lib/visual-gate.js` |
| Recovered standard (shared source) | `visual-gate/lib/visual-standard.js` |
| Bramble overlay | `visual-gate/lib/bramble-binding.js` |
| Tests | `tests/visual-gate.test.mjs` — 40 tests |
| SQL harness | `db/visual-gate/validation/run.sh` + `behaviour.sql` |
| SQL↔JS parity | `db/visual-gate/validation/parity.mjs` |

---

## G · Automatic FAIL conditions

All fifteen from the directive, each with a code, a plain-language detail and a
repair route. The gate returns every one that applies in a single call.

| # | Code | Fires when |
|---|---|---|
| 1 | `WHITE_PAGE_DOMINATES` | a page is white-dominant with no documented **and** justified artistic exception |
| 2 | `TEXT_IS_THE_MAIN_VISUAL` | mean illustration area < 50%, **or** no page records its ratio at all |
| 3 | `NO_MEANINGFUL_ILLUSTRATION` | no page binds an illustration, or a page records its art as carrying no information the text does not |
| 4 | `GENERIC_AI_ILLUSTRATION` | an illustration has no reference-image binding, or the product records imagery generated without one |
| 5 | `NO_AUTHOR_IDENTITY` | AUTHOR unresolved — including explicitly OPEN, reported as a Chairman blocker |
| 6 | `NO_ART_IDENTITY` | ILLUSTRATOR unresolved — same treatment |
| 7 | `NO_WORLD_SPECIFIC_DETAIL` | no page names a location, object or person belonging to this world and no other |
| 8 | `NO_BACKGROUND_LIFE` | no page records anything happening behind the main subject |
| 9 | `NO_MAKER_SOURCE_DETAIL` | objects are present but no page records who made or supplied them |
| 10 | `NO_PAGE_ARCHITECTURE` | no page plan, or no page declares where text lives |
| 11 | `REPEATED_COMPOSITION` | every page shares one composition signature, or none records one |
| 12 | `READS_AS_LESSON_HANDOUT` | recorded as such, or half or more pages are white-dominant with almost no art |
| 13 | `PRICE_VALUE_UNEXPLAINED` | a price with no recorded basis for its value |
| 14 | `VISUAL_STORY_MISMATCH` | recorded as not matching, or no story recorded at all |
| 15 | `WORLD_STOPS_AT_SUBJECT` | no page records the world continuing beyond the main subject |

Plus per-page `PAGE_UNRESOLVED_*` for each of the eleven page questions, and
`UNRESOLVED_ROLE_*` / `GENERIC_BYLINE_*` for each of the six authored roles.

**Fail-closed throughout:** every "no record at all" branch is a FAIL, never a pass.

---

## H · Bramble binding result

`THY-WORK-BRAMBLE-PROOF-PRODUCT-544` → `THY-VISUAL-QUALITY-GATE-001`, recorded in
`thylora_visual_gate_bindings` and implemented in `visual-gate/lib/bramble-binding.js`.

- Bramble is **not rebuilt** here. No page, no manuscript line, no illustration.
- The era lock used is the one already approved — `1930s–1940s`, `THY-VIS-EXEMPLAR-003`,
  covering visible technology, clothing, classrooms, transportation, tools, signs and
  household objects, with approved exceptions honoured rather than refused outright.
- Two Bramble-specific overlays on top of the shared gate: `ERA_NOT_DECLARED` and
  `ERA_LOCK_BREACH`.
- **Bramble authorship is OPEN on all six roles.** No record in either repository
  names an author, editor, illustrator, designer, imprint or production house for
  it. No name was invented. Consequently Bramble **cannot currently pass** the gate:
  it returns `NO_AUTHOR_IDENTITY` and `NO_ART_IDENTITY` as Chairman blockers.
- An empty Bramble page plan is refused and never shown to the Chairman (tested).

---

## I · Preview-pipeline enforcement result

```
DRAFT → QUALITY_GATE → PASS → CHAIRMAN_PREVIEW
                     ↘ FAIL → INTERNAL_REPAIR   (never shown to the Chairman)
```

Enforced in `thylora_preview_admission_v1()` and `previewPipelineStep()`. Every run
writes an append-only row to `thylora_visual_gate_checks` whether it passes or fails,
so a refusal is evidence too.

Existing surfaces are **read, not replaced**: `thylora_chairman_preview_packets`,
`thylora_preview_token_mint_v1`, the `chairman-preview` edge function and
`thylora_chairman_preview_decisions` are untouched. The gate sits in front of them.

### Evidence

| Claim | Evidence |
|---|---|
| JavaScript tests pass | `npm test` → **88 tests, 88 pass, 0 fail** (48 pre-existing RAE Link + 40 new) |
| Migrations apply cleanly | Both files `OK` against a fresh PostgreSQL 16 database |
| Migrations are idempotent | The same two files re-applied to the same database with no error |
| Constraints actually fire | 3 of 3 "expect reject" cases rejected by the database, not by a comment |
| Fail-closed confirmed | `fail_closed = FAIL` on a product with nothing recorded |
| A complete product passes | `good_gate_state = PASS`, `good_to_state = CHAIRMAN_PREVIEW` |
| One missing field is enough to fail | Nulling `object_makers` alone flips PASS → FAIL |
| The gate is not sticky | Restoring `object_makers` restores PASS |
| A FAIL never reaches the Chairman | `fail_to_state = FAIL`, `shown = false` |
| SQL and JS agree | `parity.mjs` → **PARITY OK** on both the FAIL and the PASS fixture, identical problem-code sets |
| No rule was invented | `rules = 17, gap_rules = 0` |
| The superseded look is retained | `superseded_retained = 1` |
| The name conflict is open, not resolved | `nameguard_state = OPEN` |
| A non-Chairman caller is refused legibly | `non_chairman_ok = false`, with a reason string, no stack trace |

**Not measured, and not claimed:** anything on the live backend, anything on
`thylora-public-world`, and any rendering of this gate on a Chairman device. All
unreachable from this session and named below rather than estimated.

---

## J · Exact remaining OPEN fields

| # | Open field | Why it is open | Who can close it |
|---|---|---|---|
| O1 | **Sequence 544, 545 and all newer deltas** | Backend unreachable (B1). Their content is UNKNOWN to this session | A session with egress, or the Chairman |
| O2 | **Backend apply** | The two migrations are written and validated but **not applied**. Production DDL is a held Chairman action | Chairman |
| O3 | **World-name spelling** | Shipped surfaces say `EdereAriah` (14×, 0× `EdereAirah`); the name guard is `THY-NAMEGUARD-EDEREAIRAH-001` and the directive says `EdereAirah`. Both are real records. Recorded OPEN; not normalised away | Chairman |
| O4 | **Bramble AUTHOR** | No record names one. No name was invented | Chairman |
| O5 | **Bramble EDITOR** | as above | Chairman |
| O6 | **Bramble ILLUSTRATOR / ARTIST** | as above | Chairman |
| O7 | **Bramble DESIGNER** | as above | Chairman |
| O8 | **Bramble PUBLISHER / IMPRINT** | as above | Chairman |
| O9 | **Bramble PRODUCTION HOUSE** | as above | Chairman |
| O10 | **Bramble page plan** | No manuscript or page plan exists in either repository. The gate is ready to check one; there is nothing yet to check | Chairman / the author once named |
| O11 | **Reference-image library beyond one asset** | Exactly one approved image exists (`thylora-handluh-castle.jpg`). Every other page must bind to it or to a named source until more are approved | Chairman |
| O12 | **Approved-exception register** | The era lock allows approved exceptions; no register of granted exceptions exists | Chairman |
| O13 | **Merge-forward to the deployment repository** | Per `DASHBOARD_AUTHORITY.md` this repository is not the deployment authority. This delta is material to be merged forward into `vyc2st-ctrl/thylora-executive-dashboard`, not deployed from here | Chairman |

---

## K · Exact next executable action

**When backend egress exists** (first, because it unblocks O1 and O2):

```sql
-- 1 · read what this session could not
select sequence_no, query_id, authority, supersession_state, restart_point
  from thylora_query_carryforward
 where sequence_no >= 540 order by sequence_no desc;

-- 2 · reconcile the recovered exemplars and rules against 544/545,
--     then apply, in order:
--     db/visual-gate/0001_visual_standard_registry.sql
--     db/visual-gate/0002_visual_quality_gate.sql

-- 3 · write the QYRIS row for this work code from section B above
--     into thylora_qyris_work_item_checks

-- 4 · confirm the gate sees the live packets
select packet_code, visual_gate_state, visual_preflight_passed_evidenced
  from thylora_preview_packets_gated_v1 order by packet_code;
```

**Without backend egress**, the next executable action needs no authority this
session lacked: run `npm test` and `db/visual-gate/validation/run.sh`, then check
any existing product page plan against the gate offline via
`evaluateProductVisualGate()`. Every product currently in the repository returns
FAIL, because none has a page plan — which is the correct answer, not a defect.

**Chairman-only action, stated minimally:** name the six Bramble roles (O4–O9), or
mark them OPEN in the backend as a recorded decision. Until one of those happens,
Bramble cannot pass the gate and will not be shown as preview-ready.

---

## L · Restart point

If this work resumes cold, start here:

1. **Read first:** `DASHBOARD_AUTHORITY.md`, `dashboard-baseline.json`, this file.
   Confirm dashboard authority still sits outside this repository.
2. **Verify the floor:** `npm test` → expect **88 passing**. Then
   `sudo service postgresql start && db/visual-gate/validation/run.sh` → expect both
   migrations OK twice, `fail_closed = FAIL`, `good_gate_state = PASS`,
   `rules = 17, gap_rules = 0`. Then `node db/visual-gate/validation/parity.mjs`
   → expect **PARITY OK** twice.
3. **Check B1 first.** Try `jvsdxhrfhtlgaknhjxlz.supabase.co:443`. If reachable,
   the next action is section K step 1 — read sequences 540+ and reconcile this
   recovery against 544/545 before applying anything.
4. **If the Chairman has applied the migrations:** the next work is binding the
   gate into the release-review surface so `visual_preflight_passed` reads from
   `thylora_preview_packets_gated_v1` instead of a free-standing boolean.
5. **Do not:** generate an image, create a new product, create a second visual
   framework, rebuild Bramble independently of this gate, invent a byline to clear
   the gate, apply DDL to production without Chairman execution, or normalise the
   `EdereAriah` / `EdereAirah` spelling on your own authority.

---

## State

| | |
|---|---|
| Workroom | **OPEN** |
| Recovery | Complete against the reachable repositories · **incomplete against the backend** (B1) |
| Visual standard | 6 exemplars · 17 rules · 0 invented |
| Gate | Written · **validated on PostgreSQL 16** · idempotent · **not applied** (O2) |
| Client gate | Built · runs offline · proven equal to the SQL by `parity.mjs` |
| Tests | 88 / 88 JavaScript · 2 / 2 migrations applied twice · 3 / 3 constraint rejections · SQL↔JS parity confirmed |
| Preview pipeline | Fail-closed · existing preview surfaces untouched |
| Bramble | Bound · **cannot pass** until authorship is named (O4–O9) |
| Sequence 544/545 | **UNKNOWN** — not read (B1) |
| Baseline regression | **None.** No baseline capability removed, renamed or disconnected. |
| Dashboard head | Not touched |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS. UNKNOWN REMAINS UNKNOWN.
