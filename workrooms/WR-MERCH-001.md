# WR-MERCH-001 · THYLORA / ErsatzReality Merchandise + Product Development

**Lane:** Merchandise and physical product development · artwork locks · serial and provenance · approval gates
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-merchandise-dev-8fs58s`
**Opened:** 2026-09-17
**State:** `DESIGN_ACTIVE` — artwork locked, gates registered, nothing manufactured, nothing on sale

---

## 1 · Authority position

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority for
  the Chairman dashboard. Authority remains `vyc2st-ctrl/thylora-executive-dashboard`
  → `thylora-public-world`. **Nothing in this delta touches `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. No baseline
  capability was removed, renamed or disconnected.
- `db/merch/` is **reviewable schema, not applied.** Applying DDL to the live
  backend is a production mutation and is held for Chairman execution — the same
  rule this repository already holds for `db/rae-link/`.
- `merchandise_program`, `thylora_brand_asset_slots`, `thylora_jewelry_watch_registry`,
  `serialized_collectible_policy`, `thylora_person_serial_registry` and
  `thylora_news_program_registry` were **read on 2026-09-17 and not modified.**

---

## 2 · What was retrieved from `thylora-dash`

| Register | Rows read | Used for |
|---|---|---|
| `thylora_brand_asset_slots` | 9 | Masthead, glass-and-hat mark, THYLORA mark, QR, presenter, wardrobe, jewellery direction, font, tone |
| `thylora_news_program_registry` → `ER-NEWS-001` | 1 | `locked_recurring_visual_elements`, Sports Edition 001 master file and SHA-256, masthead spelling, brand-mark rule |
| `thylora_person_serial_registry` → `ER-NEWS-PRESENTER-001` | 1 | `locked_employee_props`: ORAH band, necklace, cup/mug, rear tablet mark |
| `thylora_news_episode_registry` → `THY-RAVENS-PAPER-20260917-001` | 1 | `visual_locks`: necklace `LOCKED_APPROVED`, bracelet `PENDING_CORRECTION`, master state |
| `thylora_jewelry_watch_registry` | 2 | `ORAH-BRACELET-001`, `JEWEL-WATCH-HOUSE-001` |
| `merchandise_program` | 4 | `MERCH-MUG-001`, `MERCH-CUP-001`, `MERCH-SHIRT-001`, `MERCH-HAT-001` |
| `sports_merchandise_program` | 1 | `GGL-MERCH-001` product classes and authorisation rules |
| `serialized_collectible_policy` | 1 | `THY-SERIAL-COLLECTIBLE-001` — parent policy for the serial grammar |
| `thylora_output_visual_identity_gate` | 5 | Gate G4 parentage, including the exact-text rule |
| `thylora_store_shelves` · `thylora_store_product_readiness` | 9 · 12 | Release contract for G10; no merchandise shelf exists |

### The Sports Edition 001 locked props

`ER_NEWS_MORNING_001_RAVENS_PUBLISH_MASTER.png`
SHA-256 `4b473c86aa5ea4671ac302958d36cd94f818efc4e51b0a20283fe67aa4ce6162`

Four props are locked to that master by `ER-NEWS-PRESENTER-001.continuity_lock.locked_employee_props`:
ORAH band/bracelet, Neyra necklace, ErsatzReality News cup/mug, rear computer/tablet
ErsatzReality mark. All four are carried into `merch_artwork_lock` verbatim.

**The master is in `POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED`** and the episode
records `chairman_current_asset_rejection_at 2026-09-17T16:54:34Z`. The prop locks
themselves remain locked by the person serial registry. That combination is recorded
as an `open_question` on each affected lock rather than resolved here — see §7.

---

## 3 · Execution delta

### Added — backend schema (reviewable, **not applied**)

`db/merch/` — 15 tables, 4 guarded views, 10 numbered migrations, plus a
validation harness.

| File | Contents |
|---|---|
| `0001_artwork_locks.sql` | `merch_artwork_lock` — approved mark treatments, carried verbatim |
| `0002_product_families.sql` | Families, 11 product classes, the cup side map, phrase and scene registries |
| `0003_serial_rights_provenance.sql` | Serial rule, runs, rights records, provenance chain |
| `0004_sku_registry.sql` | `merch_sku`, `merch_serial` |
| `0005_approval_gates.sql` | `merch_approval_gate`, `merch_gate_check`, `merch_make_order` |
| `0006_rls_policies.sql` | RLS enabled **and forced** on all 15 tables via `thylora_is_chairman()` |
| `0007_seed_locked_records.sql` | 11 artwork locks, 3 families, 11 classes, the cup system lock |
| `0008_seed_serial_skus_gates.sql` | Serial rule, 4 phrase candidates, 2 scene candidates, 13 runs, 13 SKUs |
| `0009_seed_gates_rights_order.sql` | 10 gates, 13 rights records, the 13-row make order |
| `0010_registry_link.sql` | `to_regclass`-guarded views into existing registries, including a drift detector |

### Added — executable rule modules

`merch/lib/` — no dependency, no framework. Each module is the client-side twin
of a migration, so what is printed on an object equals what the backend stores.

- `locks.js` — the artwork locks, families, classes and `MERCH-CUP-SYSTEM-001`, plus `lockUsable()`
- `serial.js` — twin of `MERCH-SERIAL-001`: build, parse, validate against a run, visible marking, machine payload
- `gates.js` — twin of the gate table: ordered evaluation, `claimableState()`, `makeOrder()`

### Added — tests

`tests/merch-serial.test.mjs` · `tests/merch-gates.test.mjs` — **38 tests, all passing.**
Suite total `npm test`: **86 passing** (48 pre-existing RAE Link, 38 new).

### Added — migration validation

`db/merch/validation/run.sh` against a throwaway local PostgreSQL 16 database.
Result on 2026-09-17:

```
10/10 migrations apply cleanly, first pass
10/10 migrations apply cleanly, second pass (idempotent)
13 rules rejected what they claim to reject
15/15 merch_ tables have row level security enabled and forced
```

The 13 behaviour checks include: a mug with no side A lock, a cup with no side B
kind, a `LOGO_ONLY` SKU smuggling a phrase or a scene, `commerce_state = LIVE`
without a witness, `manufacturing_state = MANUFACTURED` without a witness, an
ORIGINAL carrying a copy number, a personalisation field carrying a name instead
of a digest, a second ORIGINAL in one run, a reused copy number, and issuing past
a declared edition size.

---

## 4 · Artwork lock summary

Preservation, not redesign. `merch_artwork_lock.no_silent_change` defaults true. A
changed mark is a **new row with its own approval**, never an edit.

| Lock | Approval state | Merch use | Open question |
|---|---|---|---|
| `LOCK-ER-MASTHEAD` | CHAIRMAN_APPROVED | logo only | — |
| `LOCK-ER-MARK-GLASS-HAT` | CHAIRMAN_APPROVED | logo only | — |
| `LOCK-ER-CUP-MARK` | CHAIRMAN_APPROVED_IN_MASTER | logo only | master replacement |
| `LOCK-ER-REAR-TABLET-MARK` | CHAIRMAN_APPROVED_IN_MASTER | logo only | master replacement |
| `LOCK-NEYRA-NECKLACE` | LOCKED_APPROVED | **not cleared** | prop, not a manufacturable design |
| `LOCK-ORAH-BAND` | PENDING_CORRECTION | **not cleared** | two records disagree |
| `LOCK-PRESENTER-NEYRA` | CHAIRMAN_APPROVED_NAME | **not cleared** | no merchandise likeness decision |
| `LOCK-MASTHEAD-FONT` | CHAIRMAN_VISUAL_REFERENCE_LOCKED | **not cleared** | exact family UNKNOWN |
| `LOCK-QR-DESTINATION` | NOT_APPROVED | **not cleared** | two records disagree |
| `LOCK-THYLORA-MARK` | NOT_APPROVED | **not cleared** | no mark file exists |
| `LOCK-EDITORIAL-TONE` | CHAIRMAN_APPROVED | all families | — |

Two principles the table encodes:

1. **Editorial approval is not merchandise approval.** `merch_use_state` defaults
   `NOT_CLEARED`. A mark cleared for a newspaper page is not thereby cleared for goods.
2. **A non-null `open_question` fails gate G1.** Contradictions found in the backend
   stay visible instead of being quietly picked.

`merch_artwork_lock_source_v` is a drift detector: `value_drifted = true` means a
merchandise lock no longer matches the brand slot it came from. All seven
slot-sourced locks currently read `false`.

---

## 5 · The cup system lock — `MERCH-CUP-SYSTEM-001`

One side map governs both vessel classes, so a mug and a carry cup read identically.

- **Side A — the logo mark, alone.** One mark or masthead lock. No phrase, no
  scene, no URL, no QR, no date, no edition text.
- **Side B — exactly one of:** an approved phrase, an approved scene crop, or —
  for `LOGO_ONLY` — the masthead wordmark alone. Never two of the three. Never a
  second copy of the side A mark.
- **Handle:** the handle and a 12 mm band either side stay clear. Artwork does not
  run behind a handle.
- **Base:** the visible serial only.
- **Interior:** nothing. No inside-rim text.
- **Sides are never transposed.** `swap_prohibited` is true and G2 checks it.

Handle clearance and base-serial legibility are judged on a **physical proof**, not
a flat render. G7 refuses a render-only approval explicitly.

---

## 6 · Product families and first candidate SKUs

| Family | Short | State | Why |
|---|---|---|---|
| `LOGO_ONLY` | L | **OPEN** | Every input is an already-approved mark treatment |
| `LOGO_PHRASE` | LP | HELD | No phrase is approved; all four registry rows are candidates traced to existing backend captions |
| `LOGO_SCENE` | LS | HELD | No scene crop approved, source master rejected, presenter likeness undecided |

13 candidate SKUs across 11 classes. See `docs/MERCH-PRODUCT-FAMILIES.md` for the
full table and `merch_make_order` for the ranking and rationale.

**Fastest first five, all `LOGO_ONLY`, all ErsatzReality-marked:**

1. `ERM-TABDEC-L-ERREARTABLET-R001` — rear-mark tablet decal
2. `ERM-STK-L-ERGLASSHAT-R001` — magnifying-glass and hat sticker
3. `ERM-LOCDEC-L-ERREARTABLET-R001` — locker decal
4. `ERM-MUG-L-ERGLASSHAT-R001` — mug, mark on A, masthead on B
5. `ERM-CUP-L-ERGLASSHAT-R001` — carry cup, same side map

Held at the back: patch and socks (both ask whether the mark may be simplified for
a thread-based method), the phrase mug (no approved phrase), the scene cup (rejected
master **and** undecided likeness), the necklace and the ORAH bracelet (both need
realization briefs before they need printing).

---

## 7 · Current blockers

**Hard stops that hold for every SKU in the lane:**

- **G8 supplier** — all four `merchandise_program` rows read `earth_supplier_state UNSELECTED`.
- **G9 price** — all four read `chairman_price_state AUTHORITY_REQUIRED`.

**Contradictions found in the backend, recorded and not resolved here:**

- **Master replacement.** Four props are locked to a master in
  `POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED`.
- **QR destination.** `BRAND-QR-DESTINATIONS` reads `NOT_APPROVED` with no verified
  destination, while `ER-NEWS-001.status_snapshot` carries a `qr_target` with
  `qr_machine_decode PASS_FINAL_MASTER_2026-09-17`. No first-wave SKU carries a QR.
- **ORAH state.** The episode reads `PENDING_CORRECTION`; the jewellery registry
  reads `CHAIRMAN_VISUAL_REVIEW_PENDING`.

**Gaps, recorded as UNKNOWN rather than filled:**

- No approved THYLORA mark file exists, so no THYLORA-marked SKU can pass G1.
- The exact masthead font family is UNKNOWN. Any SKU needing new typesetting — the
  shirt inner-neck label, any phrase — is blocked until the family is identified or
  the text is supplied as approved outlines.
- No edition size is set on any `NUMBERED_LIMITED` run. No count was invented.
- No merchandise shelf exists. All nine `thylora_store_shelves` rows are BLOCKED or EMPTY.
- Creator-credit parties are not recorded, though `creator_credit_required` is true
  on every merchandise programme row.
- `Vycara` and `Edereaireum` have unverified Earth composition. No material claim
  may be printed on a tag or a listing.

---

## 8 · Not claimed

Nothing in this lane is manufactured. Nothing is on sale. No supplier exists, no
price is set, no physical proof has been produced, no shelf is assigned, no
provider listing was created, and no fulfilment has been witnessed.

This is enforced, not merely stated: `merch_sku` carries CHECK constraints so
`commerce_state` cannot become `LIVE` and `manufacturing_state` cannot become
`MANUFACTURED` unless `witness_state` is `WITNESSED`. `claimableState()` in
`merch/lib/gates.js` returns the same answer. Both are covered by tests, and the
database refusal is covered by the behaviour harness.

The one ACTIVE storefront product in `thylora-dash` remains
**Twelve Miles for Flour** at $1.99, a digital product, unrelated to this lane.

---

## 9 · Restart point

Two Chairman decisions open the whole first wave: **name a supplier** and **set a
price**. Neither needs new artwork.

Independent of those, the executable next step is the rank 1 and rank 2 artwork
extraction: pull the rear-shell mark and the glass-and-hat mark from the approved
master as vector artwork at the master's own proportions, then request one die-cut
proof covering ranks 1, 2 and 3 together. No new artwork is designed in that step,
and it is the cheapest place to catch a wrong supplier.

Before any ORAH or necklace work: close the ORAH visual lock, and decide whether the
necklace line derives from the presenter prop or is designed as its own piece.
