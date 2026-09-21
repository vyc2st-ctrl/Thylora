# EdereAirah world registries

Migrations in this directory are **applied against the backend of record**
`thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). They are kept here as reviewable source.

This directory does not touch `dashboard-current-head.html`, the dashboard baseline
`THY-DASH-FLOOR-20260823-001`, or the deployment authority recorded in
`DASHBOARD_AUTHORITY.md`. No baseline capability is removed, renamed or disconnected.

| File | Work code | Contents |
|---|---|---|
| `0001_ines_life_economy_575.sql` | `THY-WORK-INES-LIFE-ECONOMY-575` | Inés Morales as a complete living worker: wardrobe supply slots, garment registry, dress-cost equation, ratio-only price calibration, relief-day system, off-duty routines, residence options, castle-anchored routes, person-world-sheet proposals, wardrobe account and flows, wardrobe role slot. |

## Rules held in `0001`

- **Additive only.** Every insert is `on conflict do nothing`; no existing row is
  overwritten. `LOCK-ER-ROYAL-COOK-001` and `thylora_person_world_sheet` are untouched —
  proposals live in `thylora_person_world_sheet_proposals`.
- **No invented people.** Eleven wardrobe slots are ROLE / WORKSHOP / BUSINESS /
  MERCHANT slots with `identity_state = 'OPEN_IDENTITY'`. No maker is named.
- **No invented prices.** Every amount is `OPEN_AMOUNT` / `OPEN_NO_CANON_RATE`.
  Calibration is expressed as ratios to Inés's own pay period, never in REE, because
  REE has no smallest unit and no wage band carries a rate. `earth_wage_claim` is
  `false` on every calibration row.
- **UNKNOWN stays UNKNOWN.** Locket material and dimensions carry no proposal at all:
  the locket mechanism is marked `DO_NOT_INVENT` on the lock sheet, and closed
  includes unmeasured.
- **Nothing floats outside the castle.** Residence options and routes anchor to
  `ER-CASTLE-ROYAL-001` and to the `SEC-Z-*` security zones, with
  `measurement_state = 'UNKNOWN'` until `THY-WORK-CASTLE-DIMENSIONAL-TWIN-572`
  carries dimensions.
- **Nothing canonized.** Every proposal row carries
  `canon_state = 'PROPOSED_NOT_CANON'` and `decision_state = 'CHAIRMAN_DECISION_REQUIRED'`.
