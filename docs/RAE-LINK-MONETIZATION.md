# RAE Link — monetization math

Workroom: **WR-RAELINK-001**

## The rule

> No opaque "net proceeds."

Every revenue lane exposes ten named figures. They are separate columns in
`rael_revenue_events` / `rael_ledger_entries` / `rael_payouts`, separate fields in
the `settleRevenueEvent()` return, and separate columns in the creator statement:

1. Gross revenue
2. Processor fees
3. Refunds
4. Chargebacks
5. Tax state (and amount, and who remits it)
6. Platform share
7. Creator share
8. Beneficiary share (where a partnership applies)
9. Net payable
10. Payment date **and** payment evidence

## Money representation

Integer **minor units** (cents) with an explicit ISO currency. No floating point
money exists anywhere in the schema or the JavaScript. Percentages are **basis
points**: 10000 bp = 100%. `settleRevenueEvent` throws a `TypeError` on a
non-integer amount and a `RangeError` on a negative one rather than coercing it.

## The distributable base

```
base = gross
      − refunds
      − chargebacks
      − processor fees
      − tax, only when the platform or the processor remits it
```

Tax the **creator** is responsible for is reported but **not** withheld from the
base — it is their liability, and quietly deducting it would be exactly the
opaque behaviour this design refuses. The base is floored at zero; a refund
larger than gross produces a base of 0, never a negative charge to the creator.

## The split

Each party's share is `floor(base × bp ÷ 10000)`. Flooring always leaves a
remainder of fewer minor units than there are parties. That remainder is handed
out one unit at a time in a fixed order:

```
BENEFICIARY → CREATOR → PARTNER → REFERRER → PLATFORM
```

The platform is last **by design**: rounding never favours the house. The
allocation asserts `Σ amounts == base` and throws if it ever does not — tested
across 715 awkward bases from 0 to 5000 with a 3333/3333/3334 split.

## Lanes and default platform share

| Lane | Default platform share | Pooled | Notes |
|---|---:|:---:|---|
| Advertising / sponsorship | 45% | yes | Allocated by eligible watch time; disclosure required |
| RAE Link subscription | 45% | yes | Allocated by eligible watch time |
| Creator subscription | 15% | no | Direct viewer → one channel |
| Tips and support | 10% | no | No promised deliverable |
| Paid media purchase | 20% | no | Perpetual entitlement |
| EDF / product sale | 20% | no | Links to existing passport registry |
| Licensing | 25% | no | Recorded terms, disclosure required |
| Commissioned production | 30% | no | Named client, disclosure required |
| Affiliate / referral | 50% | no | **Viewer disclosure is mandatory before the link shows** |
| Family Story Partnership | 10% | no | Beneficiary share explicit and declared before publication |

These are defaults in `rael_revenue_lanes`, not hard-coded rates. A per-channel
or per-asset `rael_split_policies` row overrides the lane, and every policy must
total exactly 10000 bp or the database rejects it.

## Pooled lanes

Advertising and platform subscription are one pot split across many works by
**eligible watch time**. Views flagged `is_monetizable = false` are excluded.
The whole pot is distributed or the call returns `NO_ELIGIBLE_WATCH_TIME` with
the undistributed amount named — money is never silently absorbed.

Measured: a 50,000,000-minor-unit pool across 10,000 assets reconciles exactly in
10.2 ms.

## Holds

| Condition | Payout state |
|---|---|
| Tax state `UNRESOLVED` | `HELD_TAX_UNRESOLVED` |
| Payout identity not verified | `HELD_IDENTITY` |
| Rights claim open on the work | `HELD_RIGHTS` |
| Below the payout minimum | `HELD_BELOW_MINIMUM` |

A held share is still **computed and visible**. It is held, not erased — the
creator can see exactly what is waiting and why.

## Payment evidence

A payout reads `PAID` only with a payment date, a processor, a processor
reference, and stored evidence whose amount equals net payable. This is enforced
twice: the `rael_payout_paid_needs_evidence` check constraint, and `markPaid()`
which returns `PENDING_EVIDENCE` with the specific problems otherwise.

## Worked example (live in the app, Earnings → Worked example)

$100.00 paid media sale, 3.2% processor fee, no tax, 20/80 split:

| Line | Amount |
|---|---:|
| Gross revenue | $100.00 |
| Processor fees | − $3.20 |
| Refunds | − $0.00 |
| Chargebacks | − $0.00 |
| Tax (NOT_APPLICABLE) | $0.00 |
| **Distributable base** | **$96.80** |
| Platform share (20.00%) | $19.36 |
| Creator share (80.00%) | $77.44 |
| **Net payable to creator** | **$77.44** |
| Payment date | — until sent |
| Payment evidence | — until sent |

Measured: 100,000 three-way settlements in 159 ms (~1.6 µs each).
