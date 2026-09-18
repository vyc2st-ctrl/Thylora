# WR-LANGLAB-001 · Language Blocker / Meaning Resolver Lab

**Lane:** `LANGUAGE_BLOCKER_RESOLVER` — education · Understanding Engine layer zero
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-language-blocker-lab-9edqvc`
**Opened / closed:** 2026-09-18

---

## 1 · Authority position

Read before execution and held throughout:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority
  for the Chairman dashboard. **Nothing in this delta touches
  `dashboard-current-head.html`, `dashboard-baseline.json`, `app/`,
  `public-site/`, `rae-link/`, `vercel.json` or `package.json`.**
- Carryforward sequence **468**, which names `LANGUAGE_BLOCKER_RESOLVER` as a
  designated next lane and asks for "language/dictionary blocker treatment".
- Sequence **467** — `THY-SIX-UNDERSTANDING-ENGINE-001` — the parent engine, read
  in full (`UE-SPEC-A` … `UE-SPEC-O`) before any table was designed.

This is a **subsystem of the Understanding Engine**, not a second engine, not a
second curriculum and not a second product registry. Products are registered in
the existing `ue_products`; only their mechanics live in the new tables.

## 2 · Execution delta

### Added — backend, applied to `thylora-dash`

Seven new tables, all prefixed `ue_lb_`, all additive. No existing table was
dropped, renamed or rewritten. Fifteen migrations, listed in
`db/understanding-engine/README.md`.

| Seeded | Count |
|---|---|
| Verbatim sources (DOCUMENTED RESEARCH) | 10 |
| Terms | 40 (20 required + 20 harvested) |
| Senses | 127 |
| Sentence cases | 42 (18 sourced, 24 constructed) |
| Misreading patterns | 11 |
| Analysis sections | 9 |
| Product designs | 4 |
| Surfaces | 1, `NOT_BUILT` |
| Engine spec section | `UE-SPEC-P` |

Security posture: RLS on all seven, 14 policies, `anon` revoked entirely,
`authenticated` read-only, Chairman write via `thylora_is_chairman()`. No learner
data is held in this subsystem — learner state stays in `ue_learner_memory` under
its existing owner policy. Supabase security advisors return **no findings** for
any `ue_lb_` object.

### Added — repository

- `db/understanding-engine/0001_language_blocker_core.sql` — schema as applied
- `db/understanding-engine/0002_language_blocker_rls.sql` — RLS as applied
- `db/understanding-engine/README.md` — migration list, table map, enforced rules
- `docs/UE-LANGUAGE-BLOCKER.md` — the design in full
- `workrooms/WR-LANGLAB-001.md` — this file

Seed content is **deliberately not mirrored** into the repository. Copying 127
sense records here would create a second source of truth that drifts within one
thread. The backend is the record; `supabase db pull` retrieves the seeds.

### Changed — existing backend objects

Two, both additive:

- `ue_products` — four new rows, all `NOT_RELEASED`.
- `ue_engine_spec` — one new section `UE-SPEC-P` at ordinal 16. The engine had
  gained a layer; leaving the spec silent about it would have been drift.

### Changed — continuity spine

Captured as `THY-Q-20260918-CLAUDE-LANGUAGE-BLOCKER-LAB-471` via
`thylora_capture_query_pair`, chained from sequence 470.

**Recorded honestly:** the capture was prepared as `-469` and landed at sequence
**471**, because the CHATGPT thread captured 469 and 470 while this run was
executing. The query_id suffix was corrected to `-471` and 470's `next_query_id`
repointed in the same transaction. No message, hash, sequence or chain position
was altered. The chain was verified intact after the correction.

## 3 · Method

**Documented research was retrieved, not recalled.** Ten published standards
statements were pulled verbatim through the Learning Commons MCP against the CASE
Network and stored unedited with their CASE identifiers: 4.OA.A.2, 6.RP.A.2,
6.SP.B.5, 7.SP.C.7, 7.EE.B.4.b, MP6, 2.OA.A.1, RI.5.1, MS-PS1-2, 4.MD.A.2.

Twenty additional terms were then found by **reading those statements**, not by
recalling a list: *times as many, in terms of, such as, within, involving,
explicitly, inference, properties, model, observed, discrepancy, interpret,
represent, precision, given, interval, solution, determine, context, plus.*

Every one cites the source line it came from.

## 4 · What was found in the material

- The standards name distinctions but not the words that carry them. 4.OA.A.2
  requires children to separate multiplicative from additive comparison and never
  mentions *times as many* or *more than*.
- The word **per** does not appear anywhere in 6.RP.A.2, the standard about unit
  rate. It says "use rate language" without listing that language.
- One retrieved sentence carries **four blockers at once** — the 7.EE.B.4.b worked
  example.
- **MP6** addresses thirteen year groups in three words.
- **RI.5.1** requires children to separate *explicitly* from *inference* and
  defines neither.

## 5 · The core finding

Because `U = K × E × C × X × T` multiplies, a language blocker does not reduce
understanding — **it cancels it**. A child can be strong on every factor and score
zero because the sentence was misread, not because the reasoning failed. The
blocker check therefore runs before any low U score is treated as a knowledge gap,
and a zero caused by a misreading is recorded as a misreading, never as a
misconception about the subject.

## 6 · Held open, not estimated into the record

- No worksheet, test paper, textbook line or child error data was retrieved. The
  ordering of this lab is **reasoned, not measured**.
- Nothing has been run past a child.
- The proportion of low understanding scores actually caused by blockers is
  unknown. It is the single measurement that would justify or refute this layer.
- The sub-statements of 6.SP.B.5 — where *mean* is actually defined — were not
  retrieved, so the school definition of *mean* in this lab is THYLORA's wording,
  and says so.
- Whether eight blocker types is the right number is untested; two of them may be
  one type seen from two angles.
- The design assumes English throughout. That limit is now stated.

## 7 · Release floor

All four products `DESIGN_ONLY_NOT_BUILT`, `NOT_RELEASED`, pricing
`UNKNOWN_UNTIL_COMMERCE_EVIDENCE` — enforced by check constraint, not by
convention. The one surface is `NOT_BUILT`. Safeguarding floor, Bramble anonymity
rules and recorded-permission guardian access all carry forward unchanged.

**No publication.**

## 8 · Next

1. Run **Meaning Before Math** on one real class with a real worksheet. Count how
   many name the relationship correctly before numbers are restored. This converts
   the lab from reasoning to evidence.
2. Gather real child-facing material and rank the terms by actual failure frequency.
3. Remaining lanes from 468, still open: `UNIVERSAL_QUESTION_RESOLUTION`,
   `ADULT_CHILD_QUESTION_PARITY`, `CURRENT_INTEREST_LISTENING`,
   `STORE_PREVIEW_SURFACING`.
4. Sequences 469 and 470, captured during this run, carry directives not addressed
   here: math embedded in story, the Daniel under-18 name hold, the continuity
   watchdog, equation/explanation co-location, store differentiation and runway.
