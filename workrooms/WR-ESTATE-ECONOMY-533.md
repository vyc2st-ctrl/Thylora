# WR-ESTATE-ECONOMY-533 · EdereAirah estate and economy

**Work code:** `THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533`
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/edereairah-estate-economy-8auhem`
**Run date:** 2026-09-19

---

## 1 · Authority position

- `DASHBOARD_AUTHORITY.md` holds. This repository is **not** the deployment authority for
  the Chairman dashboard. `dashboard-current-head.html` was **not touched**.
- `dashboard-baseline.json` floor `THY-DASH-FLOOR-20260823-001` holds. No baseline
  capability was removed, renamed or disconnected.
- The dashboard work in this run is in the backend control plane
  (`thylora_control_lane_registry`), which is where the lanes live. No new dashboard
  was created and no new framework was introduced.
- Canonical planet spelling is **EdereAirah**. No historical source record was rewritten
  destructively; one stale authoritative variant was superseded, recorded in §4.

---

## 2 · Concurrency finding — read this first

Two sessions executed `THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533` against
`jvsdxhrfhtlgaknhjxlz` at the same time.

The other session reached the estate, security, kitchen, castle-economy-pilot and
dashboard-lane work first. **Its structure is the one that stands.** This session wrote a
parallel estate structure at 15:50 UTC and deleted every row of it at 15:53 UTC, in
FK-safe order, touching nothing that belonged to the first writer and nothing
Chairman-authored.

Recorded in backend as:

- `thylora_qyris_work_item_checks` — one QYRIS row, `inspection_state = FAIL`
  (FAIL against the process, not against the canon)
- `thylora_master_ledger` — `CONCURRENT_WRITER_RESOLUTION`, verification
  `WRITTEN_AND_READ_BACK`

**Chairman decision required:** name one session as the writer for a `WORK_CODE`
before that code is issued twice.

---

## 3 · What this session added

Everything below was written with `ON CONFLICT DO NOTHING` so that a late collision
with the other writer would no-op rather than duplicate.

| Area | Table / object | Rows |
|---|---|---|
| Provisioning | `thylora_estate_provision_orders` | 6 standing procedures |
| Food receiving | `thylora_estate_receiving_records` | 4 standing procedures |
| Meal planning | `thylora_kitchen_meal_plans` | 5 service classes |
| Banking rates and fees | `thylora_bank_rate_schedules` | 10, every rate `OPEN_AMOUNT` |
| Business finance | `thylora_business_purchase_orders` | 4 class spines |
| Business finance | `thylora_business_invoices` | 4 (payable ×2, receivable ×2) |
| Business finance | `thylora_business_settlements` | 5 settlement classes |
| Business finance | `thylora_business_assets` | 5 asset classes with depreciation basis |
| Business finance | `thylora_business_insurance` | 4 cover classes, no insurer |
| Business finance | `thylora_business_tax_ledger` | 3 tax classes, no authority |
| Business finance | `thylora_business_period_results` | 1 estate P&L spine |
| Business finance | `thylora_business_equity` | 7, one per registered business |
| History standard | `thylora_history_method_rules` | 4 new rules |

Functions added — these are the operating architecture for banking, which previously had
schema but no way to perform any operation:

- `thylora_bank_open_statement(account_id, period_label)` — builds a statement from the
  ledger. Closes `OPEN_AMOUNT` rather than zero when any entry amount is unrecorded.
- `thylora_bank_place_fraud_hold(account_id, reason, raised_by)` — writes the event and
  moves the account to `HELD` in one act. Refuses a hold with no written reason.
- `thylora_bank_release_hold(security_event_code, resolution)` — writes the release event
  and only returns the account to `NORMAL` when no other hold or lock is active.
- `thylora_bank_open_facility(facility_class, …)` — loan, mortgage, credit line or
  overdraft, always `OPEN_AMOUNT`, always `AWAITING_CHAIRMAN_APPROVAL`, always
  `earth_credit_claim = false`.

History presentation rules added (section L and M of the directive):

- `THY-HIST-PRESENT-001` — Earth history presentation standard: DATE, PLACE, SOURCE,
  WHAT THE SOURCE SAYS, HOW PEOPLE WERE DESCRIBED OR DEPICTED, GEOGRAPHY, ANCESTRY OR
  ETHNICITY WHERE EVIDENCED, POLITICAL IDENTITY, RELIGION, UNKNOWN. A field with no
  evidence shows as UNKNOWN; it is never dropped and never filled by inference.
- `THY-HIST-PRESENT-002` — broad identity words are not racial shortcuts. What a source
  said or showed is carried under HOW PEOPLE WERE DESCRIBED OR DEPICTED, with the source
  named. Ancestry is recorded only where evidenced, with the evidence beside it.
- `THY-HIST-PRESENT-003` — EdereAirah history is never labelled mythology, myth, legend
  or folklore, and is never a lesser class of record than Earth history.
- `THY-MED-METHOD-002` — a firsthand report is preserved as that person's reported
  experience, in their own wording where it survives. Never erased because modern
  evidence does not support it. Never universalised into a claim that the thing works.

---

## 4 · Backend defect found and corrected

`thylora_world_market_instruments.reality_layer` carried a check constraint permitting
only `EDEREARIAH_CANON` — a stale misspelling that `THY-NAMEGUARD-EDEREAIRAH-001`
refuses to write. The two rules contradicted each other, so **no EdereAirah instrument
could be listed at all**. The constraint now permits the canonical `EDEREAIRAH_CANON`.
The table held zero rows, so nothing was rewritten and no history was destroyed.

---

## 5 · Not written this run

The market instrument, ownership, dividend and disclosure spines, and the single
explicitly-marked `SIMULATION` quote, were prepared but the write was **declined at the
approval step**. `thylora_world_market_instruments`, `thylora_world_market_quotes`,
`thylora_world_market_ownership`, `thylora_world_market_dividends` and
`thylora_world_market_disclosures` therefore still hold zero rows. Venues (5), companies
(6), sessions (6) and regulations (6) are already populated by the other writer.

Restart point for that slice: re-run the prepared market migration. It is additive,
`ON CONFLICT DO NOTHING`, invents no live quote, and marks the one test row
`SIMULATION` on both `source_type` and `evidence_state`.

---

## 6 · Rules held throughout

- No person invented. Every identity slot is `OPEN_IDENTITY`.
- No amount invented. Every amount is `OPEN_AMOUNT` or `NOT_APPLICABLE`.
- No institution named. Every institution remains `OPEN — NO CANON NAME (DO NOT GUESS)`.
- No live market quote invented.
- `REE`, `RRE` and `PEETE DOLUP` remain three separate instruments and were not merged,
  aliased or treated as synonyms.
- No Earth legal-tender, Earth exchange, Earth credit, Earth insurance or Earth tax
  claim was created. Each is held false by check constraint.
