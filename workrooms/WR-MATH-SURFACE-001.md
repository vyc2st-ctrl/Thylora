# WR-MATH-SURFACE-001 · THYLORA mathematics surface layer

**Lane:** understanding mathematics · learner, teacher and family surfaces · Understanding Cards · store candidates
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-math-surface-layer-3mm0f5`
**Opened:** 2026-09-18
**Publishing state:** nothing published, nothing listed, nothing priced, no imagery produced

---

## 1 · Authority position

Read before execution, and held throughout:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority
  for the Chairman dashboard. Authority remains
  `vyc2st-ctrl/thylora-executive-dashboard` → `thylora-public-world`.
  **Nothing in this delta touches `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline
  capability was removed, renamed or disconnected.**
- The mathematics surface is a **fifth surface** beside `public-site/`, `app/`,
  `rae-link/` and Time Run. It is not a dashboard, not a second backend, not a
  second identity system, and not a second product catalogue.

Dashboard ≠ member app ≠ RAE Link ≠ mathematics surface ≠ backend ≠ Shopify.
That separation is held in this delta.

---

## 2 · The hard rule this lane exists to carry

```
L = Do I understand the sentence?
M = Do I understand the mathematical relationship?
S = Can I solve it?

P_solve = L × M × S

If L = 0: do NOT infer that the learner lacks the mathematics.
```

The instruction was that the mathematics appear on the **learner-facing and
story-facing surface**, not only in backend logic. It does, in six places:

| Surface | Where the mathematics is visible |
|---|---|
| Learner word-problem flow | A live equation across the top, refilling as each layer is measured. An unmeasured layer reads `?`, never `0`. |
| Concept cards | Each of the ten words carries all three layers, its notation and its misread on the card face. |
| Word problem flow | Four separately labelled steps: the sentence, the relationship, the working, say it back. |
| Family explanation | The equation in plain words, with why the layers are multiplied rather than added. |
| Teacher interface | Factors, admissibility, ceiling, binding constraint, lift-gain table, permitted and refused claims. |
| Understanding Cards | The equation written out with measured factors, plus the printed statement of what was **not** measured. |
| Store product candidates | Eight candidates, each naming what it refuses to claim. |

---

## 3 · Execution delta

### Added — model libraries

`math-surface/lib/` — no framework, no runtime dependency, no external script.

| File | Contents |
|---|---|
| `understanding.js` | The model. Observation admissibility, `solveProbability`, honest nulls and bounds, ceiling, binding constraint, lift gain, claim guard, next actions. |
| `language.js` | The ten-word registry: plain meaning, relationship, notation, common misread, why the misread is reasonable, an arithmetic-free probe. Language-load arithmetic. |
| `examples.js` | Twelve worked examples, four isolations each. |
| `cards.js` | Concept cards, example cards, Understanding Cards, supersede, integrity check, family reading. |
| `continuity.js` | The three standing protocols as executable checks. |
| `persistence.js` | Append-only repository, adapter-shaped (memory, browser storage). |
| `persistence-fs.js` | Filesystem adapter, kept out of the browser bundle. |
| `backend.js` | One client, one session key (`thylora_app_auth_session`, shared with `app/` and `rae-link/`). Local-first writes; honest provisioning state. |
| `store.js` | Eight store product candidates, all blocked. |

### Added — surfaces

| File | Surface |
|---|---|
| `math-surface/index.html` · `app.js` | Learner. Word problem flow, live equation, concept cards, Understanding Cards. |
| `math-surface/teacher.html` · `teacher.js` | Teacher. Isolation probes, sitting read, lift table, refusals. |
| `math-surface/family.html` · `family.js` | Family. Plain explanation, the five questions to ask a school, the ten words, the twelve examples. |
| `math-surface/styles.css` · `manifest.webmanifest` | Shared. No external font, no image, no CDN. |

### Added — backend schema (reviewable, **not applied**)

`db/math-surface/` — 6 numbered migrations plus README.

| File | Contents |
|---|---|
| `0001_model_registry.sql` | Model constants, vocabulary registry (seeded), worked examples with their four isolations |
| `0002_learners_observations.sql` | Opaque learner refs, sittings, layer observations, the admissible-factor view |
| `0003_understanding_cards.sql` | Append-only cards, supersede chain, the hard rule as a check constraint |
| `0004_protocols.sql` | The three protocols, workstream manifest, voice-line registry, protected names |
| `0005_rls_policies.sql` | Teaching material public; a child's record owner-only |
| `0006_functions.sql` | `thy_math_p_solve`, `thy_math_claim_supported`, `thy_math_read_sitting`, `thy_math_card_gate` |

### Added — tests

`tests/math-*.test.mjs` — **137 new tests**, all passing.
20 model · 10 language · 16 examples · 20 protocols · 16 cards · 12 persistence ·
10 store · 17 surfaces · 16 schema.

### Added — documentation

`docs/THY-MATH-UNDERSTANDING.md`, `db/math-surface/README.md`, this workroom.

### Changed — additive only

| File | Change |
|---|---|
| `vercel.json` | Added `/math-surface` and `/math-surface/` rewrites. Existing rewrites untouched. |
| `app/index.html` | One tab link to `../math-surface/`, matching the existing RAE Link and Time Run pattern. |

### Not touched

`dashboard-current-head.html`, `dashboard-baseline.json`, `DASHBOARD_AUTHORITY.md`,
`.github/workflows/*`, `.github/triggers/*`, `app/app.js`, `app/hotfix-*.js`,
`app/sw.js`, `app/styles.css`, `public-site/*`, `rae-link/*`, `db/rae-link/*`,
`tests/pipeline|providers|ledger|rights.test.mjs`, all Time Run and
sports-betting assets, `package.json`.

---

## 4 · The four isolations, and the twelve examples

Every example is the same problem measured four times: language alone
(arithmetic-free), relationship alone (quantities supplied, nothing computed),
procedure alone (bare working, no story), and the child explaining the result
back in their own words.

| ID | Word in focus | Built to expose |
|---|---|---|
| WE-01 | remain | the residue read as the amount given |
| WE-02 | difference | "difference" read as "how are these unalike" |
| WE-03 | per | the direction of the division |
| WE-04 | between | interval sense read as gap sense |
| WE-05 | at least | the inclusive floor thrown away |
| WE-06 | at most | the inclusive ceiling; the case where the wrong reading still gives the right answer |
| WE-07 | respectively | **the reference case** — perfect arithmetic, wrong person |
| WE-08 | estimate | the one instruction that changes what counts as correct |
| WE-09 | compare | a relationship asked for, a number produced |
| WE-10 | rate | the units dropped, the direction lost |
| WE-11 | remain + per | one word naming two different residues in one sentence |
| WE-12 | at least + difference + respectively + between | four independent failure points, no arithmetic error available |

`WE-12` is the sentence to reach for when an adult says a learner "cannot do
subtraction". Its language load is `HEAVY`; its arithmetic is `23 + 19 = 42`,
`50 − 42 = 8`.

---

## 5 · Protocols obeyed

### THY-CONTINUITY-WATCHDOG-001

Nine workstreams are named in `math-surface/lib/continuity.js` and seeded into
`thy_workstreams`. The restart point carried eight; this delta opened one. The
test suite asserts that none was dropped.

| Workstream | State in this delta |
|---|---|
| WS-DASHBOARD-AUTHORITY | carried untouched |
| WS-APP-BUILD7 | carried, one navigation entry added |
| WS-PUBLIC-SITE | carried untouched |
| WS-RAELINK | carried untouched — its 48 tests still pass unchanged |
| WS-TIME-RUN | carried untouched |
| WS-GAME-BET | carried untouched |
| WS-SPINE-VOICE | carried under the voice protocol, untouched |
| WS-FAMILY-STORY | carried untouched |
| WS-MATH-SURFACE | **opened by this delta** |

A workstream may be closed deliberately and said so. The database refuses a
closure without a stated reason (`thy_workstream_closure_is_stated`).

### THY-VOICE-PROMPT-NO-SILENT-MUTATION-001

Ten child-, family- and teacher-facing spoken lines are registered with their
text and a deterministic digest. Where a line appears in the HTML it is checked
verbatim against the registry — in the test suite, and again at runtime on page
load. Changing a line is permitted; changing it without a declaration is a
violation, and the database trigger `thy_voice_lines_declared` refuses it too.

### THY-MINOR-NAME-ADULT-USE-001

**The protected name Daniel does not appear in any story, person example, probe,
card, product candidate or surface file in this delta.** The rule is enforced
three times over:

1. `checkMinorNameRule` / `assertMinorNameRule` in `continuity.js`.
2. Test sweeps over every string in every worked example, every store candidate,
   and the raw text of `index.html`, `teacher.html`, `family.html` and `app.js`.
3. Check constraints on `thy_math_worked_examples`, `thy_math_learner_refs` and
   `thy_math_understanding_cards`, plus `thy_math_name_rule_ok` for any text
   being considered for a surface.

A protected name passes only against a declared adult use of age ≥ 18. Declared
adult use below 18 is still refused.

---

## 6 · Evidence

| Claim | Evidence |
|---|---|
| The whole suite passes | `npm test` → **185 tests, 185 pass, 0 fail** (48 pre-existing RAE Link + 137 new) |
| RAE Link is undisturbed | its four test files pass unchanged; no file under `rae-link/` or `db/rae-link/` was edited |
| `P_solve` is the product | `L=0.5, M=0.5, S=1 → 0.25`; asserted |
| A measured zero determines the product | `L=0` with `M`, `S` unmeasured → `0`, `determined: true`, `reason: ZERO_FACTOR` |
| An unmeasured layer is never a zero | `unmeasured()` returns `score: null`, `evidence: UNMEASURED`; `NULL` in SQL, `?` on the surface |
| **`L = 0` does not permit a mathematics claim** | `claimSupported(factors, MATH_DEFICIT).permitted === false`; `assertClaim` throws `UnsupportedClaimError` |
| A mixed-task score is not evidence about a layer | an observation with `isolated: false` yields `admissible: false`, `value: null`, and the claim is refused with "the other layers could have caused the failure" |
| An isolated `M = 0` **does** permit the claim | asserted — the model is not simply refusing everything |
| Undetermined products are bounded, not guessed | `L=0.5, S=1, M` unmeasured → `value: null`, `bounds: [0, 0.5]` |
| Measurement precedes teaching when language is zero | `PROBE_MATH_LANGUAGE_REMOVED` is ordered before `TEACH_LANGUAGE` in `nextActions`; asserted by index |
| Lift gain finds the binding layer | `L=0.25, M=1, S=1` → lifting `L` returns `+0.75`, lifting `S` returns `0` |
| Every language probe is arithmetic-free | asserted over all 10 registry probes and all 12 example language isolations: no digit, no operator, no instruction to compute |
| Every example carries four isolations | asserted, in order, `L → M → S → explain back` |
| Every arithmetic step is correct | every step string machine-verified against its own operator, including `26 ÷ 8 = 3 remainder 2` and `12 ≥ 12 is true` |
| The solve isolation carries no story | asserted: no 5-letter-or-longer story word appears in any bare-working prompt |
| All ten named words are worked | `remain, difference, per, between, at least, at most, respectively, estimate, compare, rate` — each has at least one worked example |
| The child's words survive verbatim | round-tripped through the filesystem including curly quotes and an em dash, compared byte for byte |
| **Persistence verified** | a card written, the repository discarded, a **fresh** repository opened over the same real directory, the card read back with its fields intact; the JSON on disk inspected directly |
| Records are append-only | a second write of the same id raises `IMMUTABLE_RECORD` in the client; `thy_math_cards_no_update` raises on UPDATE and DELETE in the database |
| Corrections do not overwrite | superseding writes v2 with `supersedes` set; v1 re-read afterwards is unchanged; `history()` returns `[1, 2]` |
| A card cannot hide what it did not measure | `cardIntegrity` refuses a card missing `not_measured`; the schema refuses it with `thy_math_card_unmeasured_listed` |
| A card cannot claim mathematics it never measured | `cardIntegrity` refuses it; `thy_math_card_math_claim_requires_isolated_m` refuses it at the database |
| The equation is on the surface | asserted against the raw HTML of all three pages |
| Voice lines are verbatim | six lines on the learner page, one each on the family and teacher pages, digest-compared against the registry |
| No workstream dropped | `assertContinuity(RESTART_POINT.workstreams, current)` → 8 carried, 1 added, 0 dropped |
| No protected name anywhere | sweeps over 12 examples, 8 store candidates and 4 surface files return zero occurrences |
| Nothing is published | all 8 candidates `status: CANDIDATE`, `publishable: false`, `listed: false`, each carrying `CHAIRMAN_RELEASE_NOT_GIVEN` and `PRICING_NOT_SET` |
| No imagery | no `<img>` on any surface page, no icons in the manifest, no external font or CDN; asserted |
| Schema is additive | no `DROP TABLE`, no `ALTER TABLE` outside `thy_*`, no rename, no truncate; every new object namespaced |
| RLS covers everything this lane creates | every created table has `enable row level security`; asserted by comparing the two lists |
| No column for identity or diagnosis | the schema declarations are swept for `date_of_birth`, `ssn`, `diagnosis`, `medical_*`, `iep`, `legal_name`, `grade_level`, `percentile`, `iq` — none present |

### What is **not** verified

- **The migrations have not been applied.** `psql` is present in the build
  session but no PostgreSQL server is, so no claim is made that they apply
  cleanly. That check belongs to the session that applies them. The static
  properties above (additivity, namespacing, constraints, RLS coverage) were
  checked by reading the files, which is a weaker thing and is labelled as such.
- **The backend tables do not exist yet.** The client degrades honestly: a
  missing table is reported as `BACKEND · NOT PROVISIONED` with a plain
  explanation, never as an empty result that looks like a learner with no
  record. Every card is written to append-only local storage first, so a sitting
  is never lost waiting on a migration.
- **No learner has used this.** The model is THYLORA's position with its
  reasoning exposed. It is not presented as established educational research,
  and `SPC-MATH-006` carries that refusal in writing.
- **No visual acceptance.** The surfaces have not been witnessed on the
  Chairman's iPad.

---

## 7 · Backend handoff

### To provision

1. Apply `db/math-surface/0001` → `0006` in order, one transaction per file,
   against `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`).
2. Seed `thy_math_worked_examples` from `math-surface/lib/examples.js` and
   `thy_voice_lines` from `math-surface/lib/continuity.js`. Both carry stable
   ids; the voice lines carry their digests.
3. Confirm `thy_math_p_solve(0, null, null) = 0` and
   `thy_math_p_solve(0.5, null, 1) is null`. If the second returns `0`, the
   branches have been reordered and the hard rule is broken.
4. Confirm an UPDATE against `thy_math_understanding_cards` raises.
5. Confirm an INSERT with `claims_made = '{MATH_DEFICIT}'` and
   `layer_m_isolated = false` is refused.

### Interfaces the client already expects

| Path | Used by |
|---|---|
| `GET /rest/v1/thy_math_understanding_cards?select=id&limit=1` | provisioning probe |
| `POST /rest/v1/thy_math_understanding_cards` | card write; row shape in `backend.js → toRow()` |

`toRow()` and the `0003` column list are kept side by side deliberately. If one
changes, the other is wrong, and the test `the backend row shape carries the
refusal fields` will say so.

### Open questions for the Chairman

1. **Who holds a child's record?** `SPC-MATH-003` is blocked on
   `CHILD_DATA_POLICY_UNRESOLVED`. The schema currently grants a card to the
   owning account only — no school, no staff role, no cohort view. That is a
   defensible default and it is also a commercial constraint; a school
   deployment needs a decision, not a permissive policy added quietly.
2. **Does a school ever get a read across learners?** Deliberately absent. It
   would be a separate, argued migration.
3. **Release.** Eight store candidates are held. None is priced, none has a cost
   of goods, and two need imagery that was not produced.
4. **Curriculum mapping.** Twelve examples are not a curriculum, and
   `SPC-MATH-002` says so in its blockers.

---

## 8 · Parallel workstreams at this restart point

None dropped. Carried forward for the next session:

- RAE Link (`WR-RAELINK-001`) — schema held for application, 48 tests green.
- Chairman dashboard authority — unchanged, still `thylora-executive-dashboard`.
- Member app Build 7, Time Run, GAME-BET-001, SPINE FORWARD voice spine,
  public site and storefront, Family Story archive and Story Studio — all
  untouched by this delta.
- Mathematics surface (`WR-MATH-SURFACE-001`) — opened here.
