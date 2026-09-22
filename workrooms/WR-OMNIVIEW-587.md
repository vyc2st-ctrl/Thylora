# WR-OMNIVIEW-587 · OMNIVIEW round trip and sequence change ledger

**Lane:** current-state read model · topic expansion · sequence change ledger · dashboard CONTEXT and SEQUENCE surfaces
**Work:** `THY-WORK-OMNIVIEW-ROUNDTRIP-587`, `THY-WORK-SEQUENCE-CHANGE-LEDGER-587`, `THY-WORK-DASHBOARD-INTERACTION-CLOSEOUT-562`
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-omniview-sequence-dxpnqw`
**Opened:** 2026-09-22 · **Sequence:** 588

---

## 1 · Authority position

Read before execution, and held throughout:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority
  for the Chairman dashboard. Authority remains `vyc2st-ctrl/thylora-executive-dashboard`
  → `thylora-public-world`. This delta changes `dashboard-current-head.html` by
  **appending one script block**, in the same pattern as the SPINE FORWARD delta
  already in that file. It is not live until it is merged there and witnessed.
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline
  capability was removed, renamed or disconnected by this delta.** A pre-existing
  shortfall was found and is recorded in §5.
- **No new dashboard was built.** CONTEXT and SEQUENCE are two surfaces added
  inside the existing head and the existing member app.
- Backend DDL is **reviewable, not applied**. Applying it to `thylora-dash` is a
  production mutation held for Chairman execution — `db/omniview/APPLY.md`.

---

## 2 · Evidence position

This build session could not reach `jvsdxhrfhtlgaknhjxlz.supabase.co`: egress was
denied (HTTP 000/403, same gap the RAE Link workroom recorded on 2026-09-11).

Consequences, stated rather than worked around:

- **No live backend row was read.** Nothing in this delta claims to have read the
  live state of any THYLORA table.
- **No live backend row was written.** "WRITE BACKEND" was executed as: the
  schema, the read model, the write path and the seed were written as reviewable
  SQL, and verified by applying them to a throwaway PostgreSQL 16 database.
- **"VERIFY READBACK" was executed against that database**, not against
  `thylora-dash`. Every readback quoted below came from a real database that had
  the pack applied — not from a mock and not from a description.

---

## 3 · Execution delta

### Added — backend (reviewable, **not applied**)

`db/omniview/` — 7 numbered migrations, 8 tables, 17 functions, 4 proof tests.

| File | Contents |
|---|---|
| `0001_sequence_ledger.sql` | Sequence ledger: 12 required fields, chain guard, append-only trigger |
| `0002_topic_manifest.sql` | Topics + aliases, canon statements, linked graph, gates, questions, restarts |
| `0003_read_model.sql` | `thy_omniview_manifest`, `thy_omniview_topic`, `thy_omniview_sequence`, `thy_sequence_ledger_page`, `thy_omniview_qyris` |
| `0004_write_path.sql` | Eight writeback functions; every one returns the readback |
| `0005_rls_policies.sql` | RLS: signed-in sessions read, only the service role writes |
| `0006_seed_manifest.sql` | 11 topics, ledger floor 587, sequence 588, canon only where a file proves it |
| `0007_prior_context.sql` | Guarded bridge to pre-ledger history in `thylora_query_carryforward` |

### Added — surface (delta on the existing head)

| File | Contents |
|---|---|
| `app/omniview-surface.js` | CONTEXT and SEQUENCE surfaces. One source file, self-mounting, pure logic exported for tests |
| `tools/inject-omniview.mjs` | Inlines that one file into the standalone head and links it from the app; `--check` fails on drift |

`dashboard-current-head.html` — one appended `<script id="thy-omniview-script">`.
`app/index.html` — one appended `<script src="./omniview-surface.js">`.

### Added — tests

| File | Covers |
|---|---|
| `tests/sequence-ledger.test.mjs` | Ledger fields, immutability, chain rules, read path, QYRIS, no raw sweep, additive-only |
| `tests/omniview-surface.test.mjs` | Render order from payload, ledger columns, key normalisation, not-applied state, escaping |
| `tests/dashboard-delta.test.mjs` | Baseline floor, injection currency, no authority claimed, degradation |
| `tests/dead-controls.test.mjs` | Every control on every surface reaches a real destination |

---

## 4 · The sequence ledger, as written

### Sequence 587 — the read floor

| Field | Value |
|---|---|
| SEQUENCE | 587 |
| LOCAL DATE/TIME | 2026-09-22 00:00 |
| UTC DATE/TIME | 2026-09-22T00:00:00Z |
| PREVIOUS SEQUENCE | — (first row in this ledger) |
| WHY CHANGE OCCURRED | The Chairman named sequence 587 as the read floor for the OMNIVIEW spine. |
| WHAT CHANGED | The sequence change ledger was opened at 587. Earlier sequences were not imported. |
| WHY IT CHANGED | A ledger that back-dates rows it never witnessed would make its own truth class meaningless. |
| WHAT REMAINED | Sequences 1–586 stay in prior session history and `thylora_query_carryforward`, readable as pre-ledger context and never presented as ledger rows. |
| AUTHORITY | Chairman |
| TRUTH CLASS | CHAIRMAN_ASSERTED |
| NEXT-BETTER QUESTION | What is the Chairman local timezone of record, so LOCAL DATE/TIME stops defaulting to UTC? |
| RESTART POINT | OMNIVIEW ledger open at 587. Next sequence is 588. |

### Sequence 588 — this build

| Field | Value |
|---|---|
| SEQUENCE | 588 |
| LOCAL DATE/TIME | 2026-09-22 00:00 |
| UTC DATE/TIME | 2026-09-22T00:00:00Z |
| PREVIOUS SEQUENCE | 587 |
| WHY CHANGE OCCURRED | The spine had no single read that returns current state plus the history behind it. |
| WHAT CHANGED | `CURRENT_STATE_MANIFEST_PLUS_TOPIC_EXPANSION` implemented: manifest, authority locks, linked graph, linked people/places/objects/products, linked work, gates, current-vs-superseded canon, last restart, QYRIS trace, append-only ledger, CONTEXT and SEQUENCE surfaces inside the existing dashboard. |
| WHY IT CHANGED | Re-reading every raw backend row each turn is slow and still unprovable. One governed read returns the state and names exactly which tables it touched. |
| WHAT REMAINED | No existing table dropped, renamed or rewritten. The dashboard was extended, not replaced. Deployment authority stays with `vyc2st-ctrl/thylora-executive-dashboard`. |
| AUTHORITY | Chairman |
| TRUTH CLASS | REPO_VERIFIED |
| NEXT-BETTER QUESTION | Which UNSEEDED topic does the Chairman want seeded first: CASTLE, INÉS, VERONICA, FOOTBALL or VEHICLES? |
| RESTART POINT | OMNIVIEW pack written and verified against a throwaway PostgreSQL 16. Held for Chairman execution against `thylora-dash`; not yet applied to the live backend. |

---

## 5 · Findings raised by this work

### FINDING 1 — the head in this repository is below its own baseline

`dashboard-current-head.html` in `vyc2st-ctrl/Thylora` does not carry seven
capabilities named in `dashboard-baseline.json`:

Product & Storefront · Commerce Proof · System Health · Required Chairman Action ·
Approvals · Digital Product Passports · Connection Evidence

The shortfall is present in the file **at the commit before this delta**, so this
delta did not cause it. Whether the live head on `thylora-public-world` carries
them **could not be checked** — egress denied — and is not claimed either way.

Recorded in `dashboard-baseline-gap.json`, guarded by `tests/dashboard-delta.test.mjs`
(a new removal fails; repairing one also fails, which is the signal to shorten the
list), and held open in the backend as gate `GATE-BASELINE-FLOOR`.

### FINDING 2 — five named topics have no source

CASTLE, INÉS, VERONICA, FOOTBALL and VEHICLES are registered with their authority
lock set to the Chairman and their canon left `UNSEEDED`. Asking the read model
about any of them returns the question that would settle it and an explicit
refusal to answer, rather than a plausible answer. That is the intended
behaviour, not a gap in the build.

### FINDING 3 — dead controls: none found

Every button, control, data-attribute handler, form input and in-page link across
the dashboard, the member app, the sports surface, the Time Run surface, the
public site, the store and RAE Link was scanned. **Zero dead controls.**
`THY-WORK-DASHBOARD-INTERACTION-CLOSEOUT-562` is now held closed by a regression
test rather than by inspection.

---

## 6 · Verification

```
db/omniview/validation/run.sh        exit 0
  7 migrations applied twice (idempotency)          14/14 OK
  behavioural "expect reject" cases                 18/18 rejected
  proof tests                                        4/4  PASS

npm test                              109 pass · 0 fail
  tests/dead-controls.test.mjs                      29 pass
  tests/sequence-ledger.test.mjs                    14 pass
  tests/omniview-surface.test.mjs                   10 pass
  tests/dashboard-delta.test.mjs                     8 pass
  (pre-existing RAE Link suites)                    48 pass
```

---

## 7 · Restart point

OMNIVIEW is written, tested and verified against PostgreSQL 16 locally. It is
**not applied** to `thylora-dash`, and CONTEXT / SEQUENCE are **not live** on
`thylora-public-world`.

Next, in order:

1. Apply `db/omniview/` to `thylora-dash` — `db/omniview/APPLY.md`.
2. Verify readback with the queries in that file; expect `sequence_head = 588`.
3. Record the apply as sequence 589 through `thy_sequence_append` and close
   `GATE-OMNIVIEW-APPLIED`.
4. Merge the head change into `vyc2st-ctrl/thylora-executive-dashboard` and
   witness CONTEXT and SEQUENCE on `thylora-public-world`.
5. Answer the next-better question: which UNSEEDED topic is seeded first.
