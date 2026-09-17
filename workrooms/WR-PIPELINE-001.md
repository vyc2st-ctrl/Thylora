# WR-PIPELINE-001 — Continuous Product-Production Conveyor

**Opened:** 2026-09-16 · THYLORA HEAD spine-forward run
**Authoritative backend:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) — read live, not from summary
**Store provider:** Shopify — `ersatzreality.myshopify.com` (ErsatzReality, Basic plan, USD)

---

## 1. The failure, measured

Ideas were entering THYLORA faster than products were leaving it. Measured against the
live backend on 2026-09-16:

| | Count |
| --- | --- |
| Ideas in `idea_registry` | 287 |
| Rows in `thylora_product_realization_registry` | 66 |
| Products tracked in `thylora_store_product_readiness` | 11 |
| Shopify listings | 50+, the majority `DRAFT` "Concept" rows tagged `NOT-FOR-SALE` |
| Shopify listings `ACTIVE` | 1 |
| Orders, all time | 3 |
| Revenue from a genuine external customer | **$0.00** |

The single $295.00 paid-and-fulfilled order (#1001, 2026-09-01) was placed by the
Chairman's own account. It proves the Shopify checkout and capture path works end to
end. It is not a customer.

**The structural fault was not that work was stopping. It was that nothing computed
where each product actually stood.** Four registries each held part of the answer and
none of them joined up, so "what is closest to money" could not be asked, and a blocked
product looked the same as a moving one.

## 2. What was built

### The ladder (`pipeline/stages.mjs`)

`IDEA → PRODUCT_CANDIDATE → PRODUCT_SPEC → RIGHTS_SAFETY_GATE → ARTIFACT → PRICE_COST
→ STORE_LISTING → RELEASE_GATE → PUBLISHED`

Ordinal and evidence-driven. A candidate's stage is the highest rung whose entry
condition is satisfied by live evidence, walked from the bottom so no rung can be
skipped by a later gate being incidentally set. Sixteen named gates; the count of unmet
gates is `money_distance`; the first unmet gate in ladder order is the `exact_blocker`.

### The operating rule (`pipeline/conveyor.mjs`)

    BLOCK(P1) != STOP(P2, P3, ... Pn)

Every gate is classified `EXECUTABLE` (THYLORA can clear it unattended) or held
(`CHAIRMAN_GATE`, `CHAIRMAN_OR_LEGAL`, `CREDENTIALED`, `PHYSICAL_DEVICE`,
`EXTERNAL_CUSTOMER`). A held candidate never consumes a lane — the next executable
candidate takes its place. Lanes run at a minimum of three whenever three executable
candidates exist.

`sharedBlockers()` ranks gates by how many products clearing one gate once would
release. Ranking work this way rather than by product order is the difference between
moving one product and moving eight.

### The live read model (`db/pipeline/0001_product_conveyor.sql`)

Views on the authoritative backend, additive and read-only over existing tables:
`thylora_conveyor_candidates`, `thylora_conveyor`, `thylora_conveyor_leverage`,
`thylora_conveyor_lanes`. 392 candidates unified across all five registries.

### The provider bridge — the component that was actually missing

The first version of the view reported `price_configured` as the blocker on all eight
near-money products. **That was wrong, and it was wrong in the specific way this whole
workroom exists to prevent:** the gate was hardcoded `false` because nothing joined the
conveyor to the store, so absence of evidence was being reported as absence of the fact.

Readback against live Shopify showed every one of the ten tracked products already
carried a real price and SKU. Three new tables now hold verified provider readback and
nothing else:

- `thylora_conveyor_provider_readback` — listing status, SKU, price, media, inventory
- `thylora_conveyor_order_evidence` — orders, with `is_external_customer` kept separate
  from `financial_status` so a paid order is never mistaken for a customer
- `thylora_conveyor_unit_cost` — unit economics, with `rate_confirmed` false until the
  processor rate is read from the store's own payment settings

Rows are written to these only from a live provider read.

## 3. Unit economics recorded

Processor model: 2.9% + $0.30 per transaction, plus $39.00/month plan.
**`rate_confirmed = false`** — that is the standard published Shopify Basic US online
rate, not yet read back from this account's payment settings. The arithmetic is exact;
the rate input is an assumption until confirmed.

| Product | Price | Fee | Net | Margin | Units/mo to cover plan |
| --- | ---: | ---: | ---: | ---: | ---: |
| Twelve Miles for Flour | $1.99 | $0.36 | $1.63 | 82.0% | 24 |
| Bramble Wick | $1.99 | $0.36 | $1.63 | 82.0% | 24 |
| Trail Table No. 001 | $2.00 | $0.36 | $1.64 | 82.1% | 24 |
| The Last Match | $3.00 | $0.39 | $2.61 | 87.1% | 15 |
| The City That Needed More Power | $5.00 | $0.45 | $4.56 | 91.1% | 9 |
| The Handoff | $7.00 | $0.50 | $6.50 | 92.8% | 7 |
| THYLORA Gap Hunt | $7.00 | $0.50 | $6.50 | 92.8% | 7 |
| THYLORA Question Deck | $12.00 | $0.65 | $11.35 | 94.6% | 4 |
| Build a World From One Idea | $19.00 | $0.85 | $18.15 | 95.5% | 3 |
| Bounded Problem-to-Value Diagnostic | $295.00 | $8.86 | $286.15 | 97.0% | 1 |

**Standing observation for the Chairman:** at $1.99 the fixed $0.30 fee is 15% of
revenue on its own. The $1.99 tier needs 24 sales a month just to cover the plan; the
$7.00 tier needs 7. This is a pricing-floor question, not an accounting detail.

## 4. Conveyor state after this run

392 candidates. 298 movable, 94 held (86 on `rights_passed`, 8 on `CREDENTIALED` gates).

Leverage table, live:

| Gate | Class | Products it would release |
| --- | --- | ---: |
| `spec_complete` | EXECUTABLE | 233 |
| `rights_passed` | CHAIRMAN_OR_LEGAL | 86 |
| `product_specific_visual_complete` | EXECUTABLE | 56 |
| `reaccess_verified` | CREDENTIALED | 8 |

## 4b. Gap Hunt verification run — 2026-09-17

Full twelve-step pass against `gid://shopify/Product/7957199749197`. Report:
`products/store/GAP-HUNT-VERIFICATION-001.md`. **Not ready. Stopped at Chairman approval.**

What the run settled that was previously open:

- **The zero-audit-row contradiction is resolved, and my earlier read of it was incomplete.**
  `thylora_product_download_audit` is empty because `thylora-protected-download` has never served
  a file to anyone, for any product. Twelve Miles' `reaccess_verified=true` rests on
  `thylora_entitlement_access_log` (two REACCESS rows, reader path), a different ledger. Reader
  re-access is witnessed; protected file download is witnessed nowhere. The two must not be merged.
- **The library question that was UNKNOWN is now FAIL.** `thylora_customer_library_v1()` returns
  no `entitlement_id` and no download field, so the library cannot call the download function at
  all. For a product without an EDF package it returns `openable: null` and a reason string. A
  Gap Hunt buyer could neither open nor download.
- **EDF authoring is Chairman-credentialed.** All five `thylora_edf_*` functions gate on
  `thylora_is_chairman()`; this session is `postgres` with `auth.uid()` null. A create was
  attempted and denied. Not routed around with a direct table write — the gate is the authority.
- **The Gap Hunt cover live on the product is not the approved cover.** The release decision names
  `thylora-gap-hunt-21-cover.png?v=1788370761`; the product carries
  `thylora-gap-hunt-approved-cover.png?v=1789219255`. `WR-STORE-001` has the original
  REJECTED_INTERNAL_VISUAL_LAW and the revision PENDING_CHAIRMAN_VISUAL_APPROVAL. The live alt
  text claims an approval the record does not contain. `product_specific_visual_complete` and
  `visual_preflight_passed` were true without evidence; both set false.
- **Publication is a separate gate from status.** Gap Hunt has zero `resourcePublicationsV2`
  entries. ACTIVE alone would not make it reachable.

Synthetic testing ran inside a transaction and rolled back; row counts identical before and after.

**Correction carried from the previous pass:** I reported Trail Table / Rain-Side Beans as having
no canonical product record. It has one — `gid://shopify/Product/7956697481293`, DRAFT, $2.00,
SKU `ER-TRAIL-TABLE-001`, cover bound. I had checked the readiness and realization registries and
not `thylora_store_shelf_assignments` or Shopify itself.

## 5. Standing rules for this workroom

1. Read the live backend and the live provider before reporting any state.
2. A gate with no evidence reads `false` **and is labelled as missing evidence**, never
   as a confirmed blocker. The provider-bridge defect above is the worked example.
3. Nothing is called published, purchasable, paid, delivered or verified without
   readback. A paid order from an internal account is not an external purchase.
4. When one product blocks, the next executable product moves. Every wake re-runs the
   lane selection rather than resuming the previously chosen product.
5. Minimum three lanes running whenever three executable candidates exist. Zero
   executable supply with work outstanding is an alarm (`all_lanes_held`), not a pass.
