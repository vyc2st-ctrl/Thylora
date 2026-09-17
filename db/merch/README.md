# THYLORA merchandise lane — database migrations

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`).

**These files are not applied by this repository.** Applying DDL to the live
backend is a production mutation and is held for Chairman execution — the same
rule this repository already holds for `db/rae-link/`.

Every row in `0007`–`0009` was read out of `thylora-dash` on **2026-09-17** and
copied, not restyled. Where the backend records UNKNOWN, these files record
UNKNOWN.

## Apply order

| File | Contents |
|---|---|
| `0001_artwork_locks.sql` | `merch_artwork_lock` — approved mark treatments carried forward verbatim |
| `0002_product_families.sql` | Families, product classes, the cup side map, phrase and scene registries |
| `0003_serial_rights_provenance.sql` | Serial rule, runs, rights records, provenance chain |
| `0004_sku_registry.sql` | `merch_sku`, `merch_serial` |
| `0005_approval_gates.sql` | `merch_approval_gate`, `merch_gate_check`, `merch_make_order` |
| `0006_rls_policies.sql` | RLS on all 15 tables via `thylora_is_chairman()` |
| `0007_seed_locked_records.sql` | Artwork locks, families, 11 classes, cup system lock |
| `0008_seed_serial_skus_gates.sql` | Serial rule, phrase/scene candidates, 13 runs, 13 candidate SKUs |
| `0009_seed_gates_rights_order.sql` | 10 gates, one rights record per SKU, the make order |
| `0010_registry_link.sql` | `to_regclass`-guarded views into existing registries |

Run in numeric order, one transaction per file.

## Design rules held throughout

1. **Additive only.** Every object is new and prefixed `merch_`. No existing
   table is dropped, renamed or rewritten. `merchandise_program`,
   `thylora_brand_asset_slots`, `thylora_jewelry_watch_registry`,
   `serialized_collectible_policy` and `thylora_person_serial_registry` are read,
   never edited.
2. **Preservation over design.** `merch_artwork_lock` is a lock, not a canvas.
   `no_silent_change` defaults true. A changed mark is a new row with its own
   approval, never an edit to an existing one.
3. **No second source of truth.** Merchandise programmes and jewellery designs
   stay where they live; this lane holds soft `*_ref` text and resolves it
   through the guarded views in `0010`.
4. **Editorial approval is not merchandise approval.** `merch_use_state`
   defaults `NOT_CLEARED`. A mark cleared for a newspaper page is not thereby
   cleared for goods.
5. **Contradictions stay visible.** `open_question` holds the two disagreements
   found on 2026-09-17 (the QR destination, and the ORAH bracelet state). A
   non-null `open_question` fails gate G1 rather than being quietly resolved.
6. **Unknowns stay unknown.** No font family is guessed, no edition size is
   invented, no supplier is assumed, no price is set, no material claim is made.
7. **Nothing is manufactured or live.** `merch_sku` carries CHECK constraints so
   `commerce_state` cannot become `LIVE` and `manufacturing_state` cannot become
   `MANUFACTURED` unless `witness_state` is `WITNESSED`. The database refuses the
   claim, not just the prose.
