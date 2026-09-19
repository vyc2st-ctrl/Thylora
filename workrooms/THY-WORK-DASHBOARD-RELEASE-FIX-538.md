# THY-WORK-DASHBOARD-RELEASE-FIX-538 — Chairman release action path repair

**Status:** action path repaired and verified. The final attributed press is the Chairman's.
**Backend:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Runtime:** `thylora-public-world` (Vercel project `prj_GgQXKc3WWdteedBnr68Lxi2GQdYP`)
**Deployment source of truth:** `vyc2st-ctrl/thylora-executive-dashboard` (per `DASHBOARD_AUTHORITY.md`)

This repository is development/history source. The dashboard code changes for this
work code live in `thylora-executive-dashboard`, branch
`claude/thylora-chairman-dashboard-fix-5k76ix`, commit `90003f3`. This file is the
record kept alongside the rest of THYLORA history.

---

## 1. What the Chairman saw

He selected products, checked *I approve the current featured visual* and
*I confirm THYLORA/ErsatzReality has the rights needed to release*, pressed
**Record selected release decisions**, and the board said only:

> Release decision did not record: Edge Function returned a non-2xx status code

## 2. What was actually happening

Three separate defects stacked on top of each other.

### 2a. The real backend failure — a table guard, not an authority problem

`thylora_store_product_readiness` carries the trigger `thy_name_guard`
(`thylora_name_guard_block()`), installed on roughly 160 tables. It fires
BEFORE INSERT OR UPDATE and scans **every** text/jsonb column of `NEW` for a
non-canonical spelling of the planet name.

Four readiness rows already stored the misspelling `EdereAriah` inside
`evidence`. Because the guard inspects `NEW` — not just the columns being
changed — **any** update to those rows was rejected with `check_violation`,
whatever the update was actually trying to do:

| product | where the bad spelling sat |
|---|---|
| Bramble Wick — The Lantern That Wouldn't Go Out | `visual_brief`, `fresh_slate_candidate_2026_09_18`, `show_story_relationship` |
| Build a World From One Idea — THYLORA Starter Kit | `fresh_slate_candidate_2026_09_18`, `expands_existing_ip_tree` |
| THYLORA Question Deck — 50 Better Questions | `visual_brief` |
| HERB FILE 001 — ROSEMARY | the key name `edereariah_native_name` |

The guard was doing its job correctly. The stored data was wrong.

### 2b. The decision half-landed, then was reported as total failure

`thylora-release-decision` looped per product and, for each one, INSERTed the
decision row **first** and only then attempted the readiness UPDATE. When the
guard rejected the update, the function returned HTTP 500 — with part of the
Chairman's decision already written.

Edge logs for 2026-09-19 show four presses, each 500, each preceded by decision
rows that did land:

```
17:21:39  POST 500   (2 decision rows written at 17:21:39)
17:24:11  POST 500   (2 decision rows written at 17:24:10-11)
17:24:27  POST 500   (2 decision rows written at 17:24:26-27)
17:28:09  POST 500   (2 decision rows written at 17:28:08-09)
```

The board told him nothing recorded. Eight rows had recorded.

### 2c. The dashboard threw the answer away

`supabase-js` raises `FunctionsHttpError` for any non-2xx Edge Function reply,
and that error's `.message` is the fixed string *"Edge Function returned a
non-2xx status code"*. The real answer — status, code, sentence, product — is on
`error.context`, the undrained `Response`. The old handler printed `e.message`
and discarded the body.

### 2d. Production was serving a stale commit

The `thylora-public-world.vercel.app` alias pointed at `dpl_4whWJgJxmDu8...`
(master `8ff25e5`, the merge carrying `308fb39`), built 2026-09-07. Two later
master builds — `ea21b42` and `4819f99` — were built as **previews** and were
never promoted, so the production alias never moved. `js/` at `8ff25e5` contains
no `chairman-dash.js`, `control-surface.js` or `live-margin.js`, which is why
`/js/chairman-dash.js` returned 404.

## 3. What was repaired

1. **Data** — migration
   `thy_work_dashboard_release_fix_538_canonicalize_readiness_evidence`.
   Canonicalizes `EdereAriah` → `EdereAirah` in `evidence` for exactly the rows
   the guard blocked, preserving the two legacy identifier fragments the guard
   itself whitelists (`edereariah_counterpart`, `edereariah_place`).
   The guard itself was **not** touched.
2. **Edge Function** `thylora-release-decision` v3 (`THY-RELEASE-DECISION-538`).
   Authority logic unchanged. Every non-2xx now carries `code`, `message` and
   `external_product_id`. A readiness rehearsal (writing `updated_at` back
   unchanged) runs for every row *before* any decision row is inserted, so a
   blocked row can no longer produce a half-recorded batch. If a batch still
   lands partially, the reply names which products recorded and which did not.
3. **Dashboard** `js/release-decision-fix-build8.js`. Drains `error.context` and
   shows HTTP STATUS, ERROR CODE, ERROR MESSAGE and PRODUCT ID. Selection and
   both confirmation checkboxes persist to `localStorage` and are restored on
   every re-render, cleared only once custody is confirmed.
4. **Production** — new production deployment `dpl_CYd64iR6miVsVhfGQWEup9EY87P1`
   from commit `90003f3`, aliased to `thylora-public-world.vercel.app`.

## 4. Readback

Asset status, taken from the database via `pg_net` against the production alias:

| path | status |
|---|---|
| `/index.html` | 200 |
| `/` | 200 |
| `/js/chairman-dash.js` | **200** (18,077 bytes) |
| `/js/release-decision-fix-build8.js` | 200 (13,076 bytes) |
| `/js/dashboard-repair-build8.js` | 200 |
| `/js/delivery-intake-build8.js` | 200 |
| `/js/control-surface.js` | 200 |
| `/js/edf-release-approval.js` | 200 |
| `/js/store-release-actions.js` | 200 |
| `/supabase-config.js` | 200 |

Live HTTP probe of the deployed function returned structured JSON, not a bare
status:

```json
{"ok":false,"error":"INVALID_SESSION","code":"INVALID_SESSION",
 "message":"The session token was rejected by the backend: invalid JWT ... Sign in again and press again.",
 "build":"THY-RELEASE-DECISION-538"}
```

Write-path replay for one DRAFT product (THYLORA Question Deck — the row that
failed at 17:28), run in a transaction and rolled back:

```
visual gate     : PASS (current visual present)
decision insert : OK
readiness update: OK   <-- the step that returned HTTP 500 before the repair
```

Guard probe across all 14 sellable readiness rows: **0 blocked** (was 4).

## 5. Not done, and why

No Chairman-attributed decision row was created by this work. Recording one
would require minting a session as the Chairman and writing `decided_by` as him
for a press he did not make. The repair exists precisely so that his decisions
are recorded truthfully; fabricating one to close out a test would contradict it.
The write path is proven by the rolled-back replay above. The attributed press
is his.

## 6. Open items for the Chairman

- **Branch not merged.** Production is currently served from
  `claude/thylora-chairman-dashboard-fix-5k76ix`, not `master`. The next push to
  `master` will auto-deploy and revert production to a build without this fix.
  Merge the branch to `master` to close that gap.
- **Eight decision rows from 2026-09-19 are real.** The presses at 17:21, 17:24
  and 17:28 recorded decisions for Bramble Wick, The City That Needed More Power,
  The Last Match and THYLORA Question Deck even though the board reported
  failure. They are already in custody and do not need deciding again.
- **The promotion gap is the standing risk.** Two master builds sat unpromoted
  for twelve days while the Required Chairman Action card reported the drift.
  Nothing currently promotes a master build to production automatically.
