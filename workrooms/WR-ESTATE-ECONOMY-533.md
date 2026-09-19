# WR-ESTATE-ECONOMY-533 — EdereAirah estate and economy implementation

**Work code:** `THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533`
**Backend:** Supabase `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**QYRIS:** PASS — check `435d1ffa-52bc-4d81-92c1-6320b3cd8ae2`
**Master ledger:** entry `1a79ba5d-9959-4448-90ec-7d33f69851fc`, `VERIFIED_BACKEND_WRITE_AND_READBACK`
**Thread delta:** `THY-DELTA-20260919-533`
**Continuity log:** id 342

This run implemented. It did not audit, did not create a new framework, did not create a new
dashboard, did not generate images, did not create new products and did not publish.

---

## 1. What the head said before this run

Read at sequence 533 against the live backend, not from a handoff:

- `ER-CASTLE-ROYAL-001` existed with **16** estate functions from sequence 532. Most were `OPEN`.
- `household_role_registry` held **24** roles. `HH-1700-COOK` was already `BOUND` to
  `ER-ROYAL-COOK-001`. Every other 1700s role was `OPEN_NO_PERSON` or `DEFINED`.
- `SCHED-HH-1700-KITCHEN` held a five-segment day cycle and the rule that the kitchen is never
  unattended while the fire is alight.
- `thylora_royal_collection_registry` held **8** class spines, all `CLASS_OPEN_NO_ITEMS`.
- `financial_instrument_registry` held **3** instruments: REE `ACTIVE`, RRE
  `REGISTERED_CLASSIFICATION_ACTIVE_DESIGN`, PEETE DOLUP `CLASSIFICATION_PENDING`.
- `ersatzreality_financial_accounts` held **24** live REE accounts at ErsatzReality Financial,
  all at zero, all `REGISTERED`.
- `businesses` held **7** records, `business_accounts` **17**, `business_transactions` **0**.
- `thylora_world_market_instruments` and `thylora_world_market_quotes` were **empty**.
- `thylora_control_lane_registry` held **17** lanes, most with null NOW/NEXT text.

The gap was never the decisions above the structure. It was that there was no operating layer
underneath it. That is what this run built.

---

## 2. Reused, not rebuilt

| Existing object | How it was used |
|---|---|
| `thylora_estate_function_registry` | Extended from 16 to 28 functions. |
| `household_role_registry`, `household_shift_schedule` | Kitchen and security bind to these. Neither replaced. |
| `thylora_royal_collection_registry` | Given a security layer and a ledger destination. |
| `financial_instrument_registry` | Extended with 13 reconciliation fields. Rows updated in place. |
| `ersatzreality_financial_accounts` / `_ledger` | The personal banking spine. Extended, not replaced. |
| `businesses`, `business_accounts`, `business_transactions` | The business money spine. Extended. |
| `thylora_world_market_instruments` / `_quotes` | The market spine. Constrained, not replaced. |
| `thylora_control_lane_registry` | 19 lanes added. All 17 existing lanes kept. |
| `thylora_world_term_registry`, `thylora_name_variant_dispositions` | Spelling lock and supersession. |
| `thylora_forward_quality_standards` | Both new standards live here. No new standards framework. |
| `thy_record_qyris_pass_v1` | Used as-is to record the QYRIS pass. |

---

## 3. What was added

42 tables, 1 view, 6 tables extended, 13 migrations. See `db/estate-economy/README.md`.

**Estate (C)** — tenancies, resident households, land units, animal groups, provision orders,
receiving records, inspections, incidents, work orders, accounts, ledger.

**Security (D)** — 12 layers, outermost first: roads, delivery routes, farms and tenant land,
curtain wall, main gate, courtyard, stables, workshops, warehouses, kitchens and stores, royal
collection, inner residence. 17 posts, 16 relief rotations, 6 period-appropriate signals.

**Royal Kitchen (E)** — 8 posts bound to existing roles, 5 shift segments taken verbatim from
`SCHED-HH-1700-KITCHEN`, 6 stores, 7 waste routes, 10 supplier slots, 9 cookware classes.

**Money (K), Banking (G), Business finance (H), Markets (J)** — see README.

---

## 4. The castle economy pilot (I)

All 15 required flows are traced in `thylora_estate_ledger_entries` with FROM, TO, REASON,
AMOUNT, CURRENCY, DATE, AUTHORITY, EVIDENCE and STATUS:

`EFL-01-FUNDING` · `EFL-02-TENANT-RENT` · `EFL-03-STAFF-WAGES` · `EFL-04-ROYAL-COOK` ·
`EFL-05-FOOD-PURCHASE` · `EFL-06-ESTATE-GROWN` · `EFL-07-ANIMAL-COSTS` ·
`EFL-08-SECURITY-PAYROLL` · `EFL-09-REPAIRS` · `EFL-10-ART-COMMISSION` ·
`EFL-11-SILVER-JEWELRY` · `EFL-12-BOOKS-INK` · `EFL-13-COOKWARE` ·
`EFL-14-SUPPLIER-INVOICE` · `EFL-15-MAINTENANCE-CONTRACT`

Every amount is `OPEN_AMOUNT`. Every currency is `OPEN`, because the 1700s estate settlement
instrument has never been established and REE has not been confirmed as the period instrument.
That single decision unblocks all fifteen amount fields at once.

`EFL-04-ROYAL-COOK` pays out to `ER-ROYAL-COOK-001` because `HH-1700-COOK` is already `BOUND`
to that identity in canon. **No role was created for Veronica Hall**; hers is unresolved.

---

## 5. Two derived numbers, and why they are not inventions

Canon records guard post count, watch length and night strength as unknown. This run did not
fill those in. It recorded **minimum staffing requirements** per post, each with a written
derivation in `thylora_security_posts.derivation_note`, and marked them
`strength_state = 'REQUIREMENT_SET'` — a requirement the structure implies, not an
establishment the Chairman has approved. Example: the main gate is minimum 2 because a single
controlled crossing needs one to hold the gate and one to carry word inward without leaving it
unheld. The kitchen fire watch is exactly 1 because canon says so.

`SEC-P-RESIDENCE` carries no strength at all. The family range is withheld in canon.

---

## 6. Concurrent session

A second session worked sequence 533 at the same time under
`THY-Q-20260919-IMPLEMENT-ESTATE-ECONOMY-533`, writing into the tables this run created.
`thylora_estate_parallel_reconciliation` maps all 50 overlaps. Where both wrote the same
definition, **this** session's row was superseded in favour of theirs — preserved, never
deleted. No row of theirs was touched. Their five extra lanes were left alone.

One transient collision: this run's lane upsert at 15:50 briefly replaced lane text the other
session had written at 15:22. They have since rewritten their own lanes, so their wording is
current again. It is recorded in `REC-LANE-OVERWRITE` rather than hidden.

---

## 7. Genuinely open — Chairman only

1. The 1700s estate settlement instrument. Unblocks all 15 economy flow amounts.
2. REE supply rule, divisibility and smallest unit — the monetary constitution.
3. PEETE DOLUP instrument class.
4. RRE issuance, holders, transfer, redemption and succession.
5. The castle name, city, territory, founding date and ownership line.
6. Tenant, supplier and maker identities.
7. Veronica Hall's role.
8. The EdereAirah native name for the rosemary-mirror plant.
9. The EdereAirah native calendar — blocks every in-world date and all market hours.
10. The approved guard establishment.

## 8. Restart point

Read `thylora_control_lane_registry` for live lane state, then
`thylora_estate_parallel_reconciliation` before writing into any `thylora_estate_*` table.
Next executable step that needs no Chairman decision: admit one company to `MKT-V-EXCHANGE`
and file its first disclosure, which is the first act that can legitimately produce a quote.
