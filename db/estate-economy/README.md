# EdereAirah estate and economy — THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533

Backend: Supabase project `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`).
QYRIS: `THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533` — verdict PASS, check `435d1ffa-52bc-4d81-92c1-6320b3cd8ae2`.

These 13 migrations are applied. They are recorded in
`supabase_migrations.schema_migrations` as `estate_economy_533_0001` … `_0013`.

| # | File | What it does |
|---|------|--------------|
| 0001 | `0001_estate_operations.sql` | Tenancies, resident households, land units, animal groups, provision orders, receiving records, inspections, incidents, work orders, estate accounts, estate ledger. |
| 0002 | `0002_estate_security.sql` | Security zones, posts, relief rotations, signals, and the staffing-requirement view. |
| 0003 | `0003_royal_kitchen_operations.sql` | Kitchen posts, shift segments, stores, meal plans, waste routes, suppliers, equipment. |
| 0004 | `0004_money_system_reconciliation.sql` | EdereAirah spelling lock; 13 reconciliation fields on `financial_instrument_registry`; REE / RRE / PEETE DOLUP reconciled separately; Earth-claim constraint. |
| 0005 | `0005_personal_household_banking.sql` | Bank account types mapped onto the live ErsatzReality Financial accounts; ledger extension; credit facilities, rate schedules, statements, security events. |
| 0006 | `0006_business_finance.sql` | Purchase orders, dual-sided invoices, settlements, insurance, tax ledger, asset register, owner equity, period results, on the existing business spine. |
| 0007 | `0007_market_operating_structure.sql` | Venues, sessions, companies, ownership, dividends, disclosures, regulations; quote-truth constraints on the existing instrument/quote tables. |
| 0008 | `0008_rls_policies.sql` | RLS + `chairman_read_*` SELECT policy on all 42 new tables; `security_invoker` on the view. |
| 0009 | `0009_estate_security_kitchen_content.sql` | 12 security layers, 17 posts, 16 rotations, 6 signals; 8 kitchen posts, 5 shift segments, 6 stores, 7 waste routes, 10 supplier slots, 9 cookware classes. |
| 0010 | `0010_estate_content_and_economy_pilot.sql` | 12 new estate functions; tenancy/household/land/animal class spines; inspection, incident and work-order definitions; 16 estate accounts; the 15 traced castle economy flows. |
| 0011 | `0011_market_content.sql` | 6 regulations, 5 venues, 6 sessions, 6 EdereAirah businesses registered as PRIVATE companies. **Zero quote rows.** |
| 0012 | `0012_standards_and_dashboard_lanes.sql` | History presentation standard, historical medicine standard, correctly spelled rosemary-mirror record, 19 dashboard lanes on the existing control lane registry. |
| 0013 | `0013_parallel_session_reconciliation.sql` | Reconciles this run against a second session that worked sequence 533 concurrently. Nothing deleted. |

## Invariants this schema enforces

These are check constraints, not conventions. They cannot be bypassed by a later write.

- **No invented people.** Every identity slot carries `*_identity_state`. `NAMED` requires an
  identity code and `OPEN_IDENTITY` forbids one, paired by constraint.
- **No fabricated amounts.** Every money column is paired with `*_amount_state` defaulting to
  `OPEN_AMOUNT`. A value may only be present when the state is `RECORDED`.
- **No fake market prices.** `thylora_world_market_quotes` requires `source_type` and
  `evidence_state` to agree: a `TEST` or `SIMULATION` source must carry a `TEST` or `SIMULATION`
  evidence state, and vice versa.
- **No Earth claims.** `earth_regulator_claim`, `earth_tax_claim`, `earth_policy_claim` and
  `earth_credit_claim` are constrained false. An instrument may not assert Earth legal tender or
  Earth exchange without an authority record.
- **Dates stay honest.** Anything that would need the EdereAirah native calendar carries
  `OPEN_BLOCKED_ON_NATIVE_CALENDAR` rather than an invented date.

## Deliberately withheld

`SEC-P-RESIDENCE` (inner residence watch) carries `strength_state = 'OPEN'` and
`STRUCTURE_DEFINED_STRENGTH_WITHHELD`. The family range is withheld in canon; publishing its
watch strength would describe the family range by implication.

## Concurrent session

A second session worked the same sequence under `source_query_id`
`THY-Q-20260919-IMPLEMENT-ESTATE-ECONOMY-533` and wrote into these tables while this run was in
flight. `thylora_estate_parallel_reconciliation` holds 50 rows mapping every overlap. Where both
sessions wrote the same definition, **this** session's row was marked
`SUPERSEDED_BY_PARALLEL_SESSION` — preserved, not deleted — and the other session's row survives.
No row belonging to the other session was modified or removed.
