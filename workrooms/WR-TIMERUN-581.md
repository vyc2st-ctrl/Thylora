# WR-TIMERUN-581 · Time Run — binding correction

**Lane:** Time Run live traversal · living eras · encounter contracts · stable places
**Directive:** THY-WORK-TIME-RUN-LIVE-TRAVERSAL-581
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/time-run-binding-correction-4undjy`
**Opened:** 2026-09-21

---

## 1 · Authority position

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority
  for the Chairman dashboard. **Nothing in this delta touches
  `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline
  capability was removed, renamed or disconnected.**
- `db/time-run/*.sql` are **reviewable, not applied**. Applying DDL to the live
  backend is a production mutation held for Chairman execution.
- **Nothing is published.** No route, no navigation entry, no surface change.
  `vercel.json`, `public-site/`, `app/` and `rae-link/` are untouched.

## 2 · The binding correction

Time Run was carrying a passive-viewer reading. It is corrected here and the
correction is enforced in code and in schema, not in prose.

| Was | Is |
|---|---|
| A historical viewer | **A living-era traversal.** Every era is a present tense for the people inside it. |
| Eras as settings | **Eras as inhabited.** The people there are living their own lives. |
| Observation | **Physical entry.** The traveler is bodily present. |
| One direction | **Bidirectional.** Later→earlier and earlier→later are both real. |
| Technology follows the traveler | **Technology is governed by the destination era.** |

**Example locked:** Vyctor Ebenezer visits the 1700s, enters the castle of that
era, and meets Inés Morales. Recorded as `THY-ENC-0001`. **This is the
continuity packet; the scene is not written.**

## 3 · Execution delta

### Added — executable laws

`time-run/lib/` — no framework, no runtime dependency, no external script.

| File | Contents |
|---|---|
| `eras.js` | Five living eras, per-domain capability ceilings, direction of travel |
| `traversal.js` | The eight core laws, the destination capability envelope, the leak audit, what a person retains, the knowledge-instantiation guard, three information-transfer models |
| `causality.js` | Three causality candidates, the VISITS_BECOME_HISTORY consequence test, the thirteen-field encounter contract validator |
| `mechanics.js` | Six open mechanics with two or three alternatives each, every `selected` null |
| `place.js` | Place invariants vs era-variable fields, the name-derivation validator, the PEETE prohibition, stratum comparison |

### Added — backend schema (reviewable, **not applied**)

`db/time-run/` — 3 migrations, **15 tables, 30 check constraints, 1 guard
trigger**, plus `validation/run.sh` and `validation/behaviour.sql`.

### Added — records

| File | Contents |
|---|---|
| `data/time-run/THY-ENC-0001.json` | The Vyctor ↔ Inés continuity packet. All 13 contract fields present, 0 problems. |
| `data/place/THY-PLACE-CASTLE-001.json` | One castle, three era strata, three derived name candidates, none canon. |

### Added — documentation

`docs/TIME-RUN-TRAVERSAL-LAWS.md`, `docs/TIME-RUN-OPEN-MECHANICS.md`,
`docs/CASTLE-ERA-BINDING.md`, `db/time-run/README.md`.

### Added — tests

`tests/traversal.test.mjs` (18) and `tests/encounter.test.mjs` (28).
Repository total **113 tests, all passing**.

### Not touched

`dashboard-current-head.html`, `dashboard-baseline.json`, `DASHBOARD_AUTHORITY.md`,
`.github/`, `vercel.json`, `app/`, `public-site/`, `rae-link/`, `db/rae-link/`,
`time-run.html`, and every existing test.

## 4 · Evidence

| Claim | Evidence |
|---|---|
| Tests pass | `npm test` → 113 tests, 113 pass, 0 fail |
| Migrations apply cleanly | All 3 applied to a fresh PostgreSQL 16 database: 15 tables, 30 check constraints |
| Migrations are idempotent | The same 3 files re-applied to the same database with no error |
| Constraints actually fire | **17 of 17 expect-reject cases rejected by the database**, 3 expect-accept cases accepted |
| No viewer state exists | `presence` is constrained to `PHYSICAL`; `ARRIVAL_STATES` has 5 members and none matches `VIEW|PASSIVE|OBSERV`; a contract with `viewer_mode: true` returns `PASSIVE_VIEWER_REGRESSION` |
| No era can be non-living | `trun_eras_living_only` rejects it; every era in the registry asserts `living === true` |
| No technology leak is representable | `applyCapabilityEnvelope` returns `functioning_tier <= destination_ceiling` for **every** envelope rule including invalid ones; `trun_object_no_leak` rejects a stored leak |
| A handset does not work in the 1700s | tier 80 against a COMPUTATION ceiling of 12 → `INERT`, `functioning_tier: 0` |
| Current technology cannot be carried back to 1922 | tier 80 against 1922 COMPUTATION ceiling 20 → `INERT`, `functioning_tier: 0` |
| A manifest that claims otherwise is refused | `ENVELOPE_RULE_INVALID`; a transformation recorded as `NATIVE` returns `TRANSFORMATION_MISDECLARED` **and** `TIME_TECHNOLOGY_LEAK` |
| Knowledge crosses; capability does not | `retainedByTraveler` returns IDENTITY, MEMORY, KNOWLEDGE, EXPERIENCE in both directions and never TECHNOLOGICAL_CAPABILITY |
| Knowledge cannot become a leak | `evaluateInstantiation` returns `NOT_INSTANTIABLE_IN_ERA`; `trun_disclosure_no_knowledge_leak` rejects the dishonest row |
| Nothing is silently canonized | `CANON_CAUSALITY_MODEL === null`; `openMechanics()` returns all six; `trun_causality_models` has 0 selected; a selection without a decider is rejected in JS and in SQL |
| The CA-A consequence test is real | All four guards are load-bearing: dropping any single one returns `coherent: false` |
| THY-ENC-0001 is complete | 13 of 13 fields, 0 problems |
| Inés Morales is a person, not a prop | `living: true`, own native era, right to decline, memory of the meeting recorded as hers |
| The castle is one place | `compareStrata` across 1700s / 1922 / current: `same_place: true`, `broken_invariants: []`, 9 era-variable fields differ |
| PEETE CASTLE is impossible | Rejected by `isProhibitedName`, by `validateNativeName`, and by two database check constraints |
| Every candidate name is derived | All three pass `validateNativeName` with land, language, history and ≥ 2 glossed morphemes |

## 5 · What is NOT done

- **No causality model is selected.** Six mechanics remain open.
- **No castle name is sealed.** Three candidates; the native language of
  EdereAriah is still unnamed, so every derivation rests on an unnamed source.
- **Inés Morales's role in the era is UNSEALED**, with three candidates.
- **The 1700s exact year is UNSEALED**, per the released rule that event years
  stay open until a run is sealed.
- **Migrations are not applied.** Nothing has been written to the live backend.
- **No scene is written.** The packet is continuity, not prose.
- **The open question under CA-A is open**: what prevents an action that would
  stop the departure. Named `CONSISTENCY_PRESSURE`. Not canonized.
- **Spelling note:** the directive wrote EDEREAIRAH; the backend of record uses
  **EdereAriah**, and that spelling is kept. Flagged rather than silently changed.

## 6 · Chairman decisions required

| # | Decision |
|---|---|
| 1 | ENTRY / EXIT mechanic — EE-A, EE-B or EE-C |
| 2 | CLOTHING mechanic — CL-A, CL-B or CL-C |
| 3 | VISIT DURATION mechanic — VD-A, VD-B or VD-C *(VD-B binds entry/exit to EE-B)* |
| 4 | INJURY / DEATH mechanic — ID-A, ID-B or ID-C |
| 5 | CAUSALITY model — CA-A, CA-B or CA-C. If CA-A, all four guards adopt with it. |
| 6 | INFORMATION TRANSFER model — IT-A, IT-B or IT-C |
| 7 | Castle native name — NAME-A Ederehald, NAME-B Ariahdura, NAME-C Torvaenah, or reject all three |
| 8 | Name the native language of EdereAriah |
| 9 | Inés Morales's role in the 1700s, or leave UNSEALED |
| 10 | Whether the castle is a Time Run threshold site *(binds decision 1)* |
| 11 | Whether `db/time-run/*.sql` may be applied to `thylora-dash` |
| 12 | EDEREAIRAH vs EdereAriah — confirm the backend spelling stands |
