# ESTATE SUPPORT ECOSYSTEM — THY-WORK-ESTATE-SUPPLY-STAFF-LIFE-577

**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) — read and written directly.
**Sequence:** 577. Newer lanes read before writing: 578 (store fastlane, castle name time traversal), 580 (castle native name, store utility wave 1).
**Delta:** `THY-DELTA-20260921-577` · **Restart:** `THY-RESTART-577-ESTATE-SUPPLY`
**State:** `IMPLEMENTED_STRUCTURE_AWAITING_CHAIRMAN_DECISIONS`

No name, price, wage, balance, distance or piece of infrastructure was invented.
No image generated. Nothing published.

---

## Core flow, as built

```
SOURCE → GROWER/MAKER → ROAD/CART → GATE/RECEIVING → STORE → ISSUE → USE
       → CLEAN/REPAIR/WASTE → RETURN/DISPOSAL → ACCOUNT
```

Every step carries: stable ID · state · custodian role · place or named PENDING anchor ·
route · account connection · provenance rule · explicit open fields.

---

## 1 · Herb ground — RECOVERED

| Code | Meaning |
|---|---|
| `LAND-HERB-KITCHEN-001` | Kitchen herb ground. Short same-day walk from the kitchen. Worked by `HH-1700-COOK`. |
| `EST-HERB-GARDEN-001` | Herb garden function. Two destinations: kitchen culinary, household medicine as historical claim only. |
| `SUP-ESTATE-HERB` | Estate-grown supply row, `is_estate_grown = true`. |
| `EST-SUP-HERB` | New estate slot: cut and carried by hand, no cart, no gate crossing, no security check. |

Cutting authority: `HH-1700-COOK` under `EST-PO-PROC-HERB-REQ`. Received at `KIT-ST-HERB`
under `EST-RCV-PROC-HERB`. Compost returns by `KIT-W-COMPOST` → `LAND-HERB-KITCHEN-001`.

Routes written: `EST-RTE-HERB-FRESH` · `EST-RTE-HERB-DRYING` · `EST-RTE-HERB-WINTER`.

**Still blocked:** native plant names and the rosemary-mirror plant name are Chairman-only
(blocked since sequence 528). Harvest cycle is blocked on the native calendar. Water source,
tool storage at the bed and whether daily cutting is written down at all remain OPEN.

No gardener identity was invented — the Head Cook already holds the bed.

## 2 · Vegetable / farm supply — RECOVERED

`EST-VEGETABLE-GROWERS-001` · `EST-FARMS-001` · `LAND-CLASS-VEGETABLE` · `LAND-CLASS-FARM`

- **Estate-grown** (`EST-SUP-VEGETABLE`, `EST-SUP-HERB`): enters as an *estate requisition*,
  never a purchase. Recorded in kind against `EST-ACCT-INCOME-PRODUCE`; reduces
  `CAS-ACC-PROVISIONS` spending. Routes `EST-RTE-VEG-REQUISITION`, `EST-RTE-FARM-HARVEST`.
- **Bought** (`EST-SUP-GRAIN`, `-MEAT`, `-DAIRY`, `-FISH`, `-SALT-SPICE`, `-WINE-ALE`):
  cart on the approach road, gate receiving, supplier settlement.
- **Checked at** `SEC-Z-GATE` by `HH-1700-PROVISIONER` with a `HH-1700-CAPTAIN` security
  check. The receiver is not the signer (`EST-ANTI-THEFT-001` control rule).
- **Stored** in `KIT-ST-PANTRY` / `-DRY` / `-COLD` / `-LARDER` / `-CELLAR`.
- **Spoilage**: `KIT-W-SPOILED` — rejected at receiving or condemned in store, never returns
  to a table. Sound trimmings go to `KIT-W-COMPOST` or `KIT-W-FEED`.
- **Pays**: `CAS-ACC-PROVISIONS` → settles through `CAS-ACC-SUPPLIER-SETTLEMENT`.

Yield is measured at receiving, never estimated in story — count method itself is still OPEN.

## 3 · External supplier slots — 16 written, all identities OPEN

Food and fuel classes keep their single source of truth in `thylora_kitchen_suppliers`;
`thylora_estate_supplier_slots` points at them (`identity_state = INHERITED_FROM_KITCHEN_SUPPLIER`)
and adds arrival, receiving, quality, rejection and payment fields.

| Slot | Class | Sourcing | Pays from |
|---|---|---|---|
| `EST-SUP-GRAIN` | GRAIN | MIXED_OPEN | CAS-ACC-PROVISIONS |
| `EST-SUP-MEAT` | MEAT | MIXED_OPEN | CAS-ACC-PROVISIONS |
| `EST-SUP-DAIRY` | DAIRY | MIXED_OPEN | CAS-ACC-PROVISIONS |
| `EST-SUP-FISH` | FISH | EXTERNAL | CAS-ACC-PROVISIONS |
| `EST-SUP-SALT-SPICE` | SALT_SPICE | EXTERNAL | CAS-ACC-PROVISIONS |
| `EST-SUP-WINE-ALE` | WINE_ALE | EXTERNAL | CAS-ACC-PROVISIONS |
| `EST-SUP-VESSELS` | VESSELS | EXTERNAL | CAS-ACC-TOOLS-CUTLERY |
| `EST-SUP-FUEL` | FUEL | MIXED_OPEN | CAS-ACC-PROVISIONS |
| `EST-SUP-HERB` | CULINARY_HERB | ESTATE_GROWN | none — requisition |
| `EST-SUP-VEGETABLE` | VEGETABLE | ESTATE_GROWN | none — requisition |
| `EST-SUP-CLOTH` | CLOTH | MIXED_OPEN | CAS-ACC-WARDROBE |
| `EST-SUP-THREAD-FASTENERS` | THREAD_FASTENERS | EXTERNAL | CAS-ACC-WARDROBE |
| `EST-SUP-LEATHER` | LEATHER | MIXED_OPEN | CAS-ACC-WARDROBE |
| `EST-SUP-TOOLS` | TOOLS | MIXED_OPEN | CAS-ACC-TOOLS-CUTLERY |
| `EST-SUP-SOAP` | SOAP | MIXED_OPEN | CAS-ACC-WARDROBE |
| `EST-SUP-BUILDING-MATERIALS` | BUILDING_MATERIALS | MIXED_OPEN | CAS-ACC-FABRIC-REPAIR |

`no_invented_suppliers = true` on every row.

## 4 · Market — 3 lanes, household and personal kept apart

| Lane | Who | Account | Enters household book |
|---|---|---|---|
| `EST-MKT-HOUSEHOLD` | `HH-1700-PROVISIONER` buys for the household | CAS-ACC-PROVISIONS | **yes** |
| `EST-MKT-PERSONAL` | staff on a relief day, own money | none | **no** |
| `EST-MKT-ESTATE-SALE` | surplus out | CAS-ACC-ESTATE-REVENUE | yes |

Inés does not personally shop for the household. Her own route already exists as
`RTE-INES-TOWN` (`OFF_DAY_TOWN`), and `EST-MKT-PERSONAL` keeps that spending outside the books.

**No market or town exists as an authored place.** `TOWN-PENDING` is an anchor, not a place.

## 5 · Road / cart network — 19 legs, tied to zones

`EST-RTE-APPROACH-ROAD` → `EST-RTE-GATE-RECEIVING` → `EST-RTE-RECEIVING-STORES` →
`EST-RTE-STORES-KITCHEN`, with `EST-RTE-CART-RETURN` closing the loop outward.
Herb (3), vegetable, farm, fuel, water, laundry out/return, three waste legs and two market
legs complete the set. Every leg carries conveyance, zone path, custodian, security role,
escort and halt rules, and a geometry dependency on 572.

Outbound carts are checked at the gate: the anti-theft exposure runs outward, not inward.

## 6 · Fuel

`EST-FUEL-WOOD` · `EST-FUEL-CHARCOAL` · `EST-FUEL-KINDLING` · `EST-FUEL-ASH` ·
`EST-FUEL-COAL` (**NOT_ESTABLISHED** — no coal asserted for this layer).

Because the kitchen fire is never dead, fuel is a standing daily draw, not an occasional
purchase. Ash leaves by `KIT-W-ASH` / `EST-RTE-WASTE-ASH` to a destination that is still OPEN.

## 7 · Water

Eight stages: source · carry · kitchen · scullery · laundry · animal · foul · fire reserve.

`infrastructure_state` reads **NOT_ASSERTED** wherever canon is silent. No pipe, pump or
cistern was invented. Canon supports exactly one thing — water is carried to the kitchen at
first light — so a source and a carry route exist while the source itself has no location.

## 8 · Laundry

Six stages: `EST-LAU-10-COLLECT` → `20-WASH` → `30-DRY` → `40-MEND` → `50-RETURN` → `60-RETIRE`.

Custody passes from the wearer to the household at collection and returns through the
wardrobe keeper. That is why the apron rotation count is a real question: she must still be
dressed for service while the apron is out. Place, laundress, water, fuel, soap, drying and
turnaround are all OPEN. No laundress name was invented.

## 9 · Textiles and tailoring

Connected to 575. The eleven existing `WRD-SLOT-*` rows stand unchanged; 577 adds the
`EST-TEXTILE-CLOTHING-001` function and the `EST-SUP-CLOTH` / `-THREAD-FASTENERS` slots that
feed them, plus `CAS-FLOW-300/302/304` continuity.

`DRESS_COST = CLOTH + LINING + THREAD + FASTENERS + CUTTING + SEWING + FITTING + REPAIRS − HOUSEHOLD_ALLOWANCE`

Still cannot close: no prices, no allowance rule, no rotation count.

## 10 · Shoes

`EST-FOOTWEAR-001` + `EST-SUP-LEATHER`, feeding `WRD-SLOT-SHOEMAKER` and `WRD-SLOT-COBBLER`.
`GAR-INES-SHOES-001` locks sturdy flat shoes; brown is proposed, not locked. Retirement is
`EST-WR-WORN-SHOE`: resoled shoes return to service, a pair past resoling has no destination yet.

## 11 · Staff lodging — 10 roles, all decisions open

`EST-LODGE-COOK` carries Inés with the three existing residence models (`RES-INES-A/B/C`)
attached and **not** resolved. The Deputy Cook's lodging is flagged as the constraint on how
long a relief day can last. Nine other roles are written with lodging class OPEN.

## 12 · Waste and compost — 11 returns, no generic trash

Seven existing kitchen routes are linked, not restated; four estate-level returns added
(laundry water, stable muck, worn cloth, worn footwear). Destination named for 4, partly
open for 3, open for 4 — each stated as such.

The one fully closed loop: kitchen → `KIT-W-COMPOST` → `LAND-HERB-KITCHEN-001` → kitchen.

## 13 · Economy

Four new flows on the existing accounts: `CAS-FLOW-310` fuel · `320` laundry · `330` staff
lodging in kind · `340` market purchasing. Personal purchasing is deliberately absent from
the flow table. No balance, rate or price was written; every amount reads `OPEN_NO_CANON_RATE`.

## 14 · Staff life

- **Inés** — supply, laundry, footwear and lodging now attach to her without a new identity.
- **Deputy Cook** — documented DAY-service relief; lodging decides relief-day length.
- **Provisioner** — buys, receives at the gate, holds the requisition.
- **Scullery** — fire post is never unattended; carries water and ash.
- **Baker** — oven hot before the household wakes.

All except Inés are roles with person identity OPEN. No new personal identity was created.

## 15 · Mirror

EdereAirah first, ERC second. `ER-CASTLE-ROYAL-001` mirrors Windsor Castle functionally;
the EdereAirah name is OPEN and, per 578/580, must come from the land and language — never
"Peete Castle". Nothing in this delta names the castle.

What the mirror helps us ask: what a castle of this layout needs daily, and where a fire,
a theft or a spoiled consignment actually happens. What does not transfer: any Earth name,
date, person, price, tenure law or fuel history.

## 16 · Public-safe world sheet

Food, clothing, fuel, water, workers, money and waste as connected systems, using zone
codes structurally. No post count, watch length, muster point, key custody detail or
family-range detail is written or published. `publish = false` on the work record.

## 17 · Graph

Six `FIND-577-*` Finding nodes with twelve edges (`EVIDENCED_BY`, `LAYER`) and six version
rows. **No predicate was added to the live vocabulary** — it still holds exactly 8.

Five contract *proposals* written to `thylora_graph_predicate_contract_proposals`:
`SUPPLIES` · `ROUTES_TO` · `RETURNS_TO` · `PAYS_FROM` · `CUSTODY_OF`.

Using `PART_OF` for supply would make the herb bed part of the kitchen. It was refused.

## Chairman decisions — 14

1. Fuel: estate-cut, bought, or both — and which account carries it.
2. Does coal exist on this layer at all?
3. Where is the receiving yard, and what are the count, tally and rejection rules?
4. Where is the water source, and does any cistern or pipe exist?
5. Where is the laundry, and who does the wash?
6. Soap: bought, or made from `KIT-W-ASH`?
7. Ash destination.
8. Foul discharge and the foul-to-water distance rule.
9. Per-role lodging class, starting with Inés (`RES-INES-A` / `B` / `C`).
10. Is lodging and board added to the wage or deducted from it?
11. Off-duty meal entitlement — is the staff table pay, or leftovers?
12. Is a market or town authored as a place?
13. May staff carry personal goods inward through the gate?
14. The five proposed graph predicates.

## Restart point

Estate support ecosystem written and read back at sequence 577. The cheapest first move is
the **receiving yard**: seven routes end there and the anti-theft control rule depends on it.
