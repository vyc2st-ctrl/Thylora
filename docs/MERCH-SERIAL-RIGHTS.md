# THYLORA merchandise — serial logic, rights, provenance and gates

Workroom: `WR-MERCH-001`. Parent policy: `THY-SERIAL-COLLECTIBLE-001`
(Chairman Vyctor Peete), already in `thylora-dash`. This lane adds a grammar for
goods. It does not relax that policy.

---

## Serial grammar — `MERCH-SERIAL-001`

```
ERM-<CLASS>-<FAMILY>-<ARTWORK>-R<run>-<COPY>[-P<digest>]

ERM-TABDEC-L-ERREARTABLET-R001-00001
ERM-MUG-L-ERGLASSHAT-R001-ORIG
ERM-CUP-LS-SPORTS001-R001-00007
ERM-MUG-L-ERGLASSHAT-R001-00003-Pdeadbeef
```

| Segment | Meaning |
|---|---|
| `ERM` | Fixed prefix, ErsatzReality Merchandise |
| `CLASS` | `MUG CUP STK PCH SHIRT SWEAT SOCK TABDEC LOCDEC NECK ORAH` |
| `FAMILY` | `L` logo only · `LP` logo + phrase · `LS` logo + scene |
| `ARTWORK` | 3–16 uppercase alphanumerics, the primary artwork lock short code |
| `run` | `R001`–`R999`, one run per approved release |
| `COPY` | `00001`–`99999` for a reproduction, `ORIG` for the source master, omitted at SKU level |
| `digest` | Optional 8 lowercase hex, the personalisation **digest only** |

The grammar is implemented twice and the two must agree: `grammar_regex` in
`merch_serial_rule`, and `SERIAL_REGEX` in `merch/lib/serial.js`. What is printed
on an object equals what the backend stores.

### Four rules the grammar enforces

1. **The original is permanently distinguished from reproductions.** `ORIG` is a
   distinct copy kind, not copy number zero. At most one may exist per run — a
   partial unique index enforces it, and no reproduction may be labelled or implied
   to be the original.
2. **No edition count is invented.** `edition_size` stays null until separately
   approved. A `NUMBERED_LIMITED` copy **cannot be issued** while it is null; an
   `OPEN_RUN` proceeds without one.
3. **Copy numbers are never reused.** Issued in sequence, never re-issued after a
   destroyed copy. A gap is recorded, not closed.
4. **Personalisation is never recoverable from the serial.** The name, date or
   dedication is carried as an 8-hex digest. A `CHECK` constraint refuses anything
   that is not 8 lowercase hex characters, so a name cannot be stored in that
   column even by mistake.

### Marking

**Visible**, on the class serial carrier: the full serial, the run's edition class,
and the creator credit — or the literal `CREATOR CREDIT UNKNOWN` when the credited
parties are not yet recorded, which is the current state.

**Non-visible**: a signed manifest carrying `serial_code`, `sku_code`, `run_code`,
copy kind and number, edition class, the artefact SHA-256 and the issue timestamp.
It carries `personal_data_included: false` and no personal data in publicly
recoverable form.

Per the substrate gate already in the backend: *visible micro-marks are discovery
clues; the backend ID and hash are the authority, because visible marks can be
copied.*

### Transfer

Ownership or authorised custody transfer is recorded through THYLORA/Vlegh before
the system treats the transfer as final inside EdereAriah. **Earth legal title
remains a separate matter** and must be satisfied where applicable.

---

## Rights and provenance

One `merch_rights_record` per SKU. Every column that is not yet known reads
`UNKNOWN`, and G5 names each one individually rather than reporting a single
aggregate failure.

Current state across all 13 SKUs: `rights_pass = false`.

| Column | Current | Note |
|---|---|---|
| `mark_rights_state` | `APPROVED_MARK_MERCH_USE_UNVERIFIED` | The mark is approved; its use on goods is not separately verified |
| `font_rights_state` | `UNKNOWN_FONT_FAMILY_NOT_IDENTIFIED` | Where the SKU needs typesetting |
| `likeness_rights_state` | `NOT_CLEARED_FOR_MERCHANDISE` | Any SKU depicting the presenter |
| `trademark_clearance` | `UNKNOWN` | Clearance for the mark *as applied to these goods classes* |
| `material_claim_state` | `UNVERIFIED_WORLD_MATERIAL_CLAIMS_PROHIBITED` | Jewellery classes |
| `supplier_rights_state` | `UNKNOWN` | No supplier selected |
| `creator_credit_names` | `UNKNOWN` | `creator_credit_required` is true on every programme row |
| `vlegh_ref` | null | Assigned at G5 |

**A presenter identity lock is an editorial continuity instrument, not a
merchandise likeness licence.** `ER-NEWS-PRESENTER-001` locks Neyra Sol as the
recurring correspondent so the newspaper does not invent a new reporter each issue.
It says nothing about selling goods that depict her. Until a likeness decision is
recorded, no SKU may show the presenter — which is what holds the entire
`LOGO_SCENE` family today.

`merch_provenance_event` preserves the chain named by the parent policy: concept
originator, designer, artist, digitiser, printer, tag maker, packer, shipper,
custodian, transferee. Unknowns stay unknown.

---

## Ten approval gates

Ordered. A SKU may not skip one. `evaluateSku()` stops at the first failure, so a
SKU blocked at G1 is never described as nearly ready because G4 would pass.

| Gate | Name | Authority | Fail stop |
|---|---|---|---|
| G1 | Artwork lock verified | SYSTEM | A SKU referencing an unapproved or contested mark is not designed further |
| G2 | Cup side map verified | SYSTEM | A vessel with an ambiguous or swapped side map does not go to proof |
| G3 | Family composition verified | SYSTEM | No SKU is built on a candidate phrase or a rejected master |
| G4 | Visual identity and exactness | SYSTEM | A regenerated or re-typed mark fails, however close it looks |
| G5 | Rights, likeness and materials | **CHAIRMAN** | No goods are made against an UNKNOWN rights column |
| G6 | Serial assigned | SYSTEM | No copy is issued without a conforming serial |
| G7 | Physical proof approved | **CHAIRMAN** | A render-only approval does not pass |
| G8 | Supplier selected and contracted | **CHAIRMAN** | Hard stop for every class today |
| G9 | Chairman price set | **CHAIRMAN** | Hard stop for every class today |
| G10 | Store release and witness | **CHAIRMAN** | Until this passes, nothing is manufactured or on sale, and nothing may be described as either |

### G1 — an unresolved open question is a failure

`merch_artwork_lock.open_question` holds the contradictions found in the backend on
2026-09-17. A non-null value fails G1 rather than being quietly resolved in favour
of whichever record looked more recent.

### G4 — the exactness rule

Inherited from `THY-SUBSTRATE-LOCKED-VISUAL-ARCHITECTURE-001`: *exact identifiers
and logos must be applied or verified deterministically; generative text alone
cannot pass.* `artwork_application` must read
`DETERMINISTIC_FROM_APPROVED_ARTWORK`. `REGENERATED` and `RETYPED` fail.

### G7 — the object, not the render

Handle clearance, base-serial legibility after glaze, colour under ordinary light,
and apparel after one wash cycle are judged on the physical object. This is the
cheapest place to catch a wrong supplier, which is why it sits ahead of G8.

### G10 — the witness

`merch_sku` carries CHECK constraints: `commerce_state` cannot become `LIVE` and
`manufacturing_state` cannot become `MANUFACTURED` unless `witness_state` is
`WITNESSED`. The database refuses the claim, not just the prose.

`external_product_id` is populated only from a provider readback, never written
ahead of one. In `merch_sku_readiness_v`, a null `readiness_id` is the **expected**
state — it is not a gap to be filled by writing one.
