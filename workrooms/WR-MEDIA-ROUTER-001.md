# WR-MEDIA-ROUTER-001 — THYLORA Media Router

**Lane:** MEDIA ROUTER — generate or animate registered THYLORA assets from the Chairman dashboard
**Release mark:** `THY-MEDIA-ROUTER-001`
**Authoritative backend:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`), read live on 2026-09-15

---

## What the backend read changed

The previous session recorded an evidence gap: `db/rae-link/0010_registry_link.sql`
states the build could not reach `jvsdxhrfhtlgaknhjxlz.supabase.co` (egress denied
with 403), so the live shape of the THYLORA registries was unverified and every
statement in that migration was written defensively.

**That gap is now closed.** The backend was read directly this session:
`thylora-dash`, Postgres 17.6, `ACTIVE_HEALTHY`, region ca-central-1. Everything
below is read from the live database, not inferred.

### The pipeline already exists

This is the single most important finding, and it is why the Chairman's
instruction not to duplicate the media pipeline was correct rather than
precautionary:

| Table | Rows | What it already carries |
| --- | --- | --- |
| `studio_render_jobs` | **0** | `provider_code`, `model_code`, `operation_type`, `state`, `priority`, `idempotency_key` (UNIQUE), `prompt_payload`, `reference_payload`, `requested_duration_ms`, `requested_fps`, `estimated_cost`, `actual_cost`, `attempt_count`, `max_attempts`, `retry_after`, `last_error_category`, `output_asset_id`, `continuity_snapshot` |
| `studio_render_attempts` | **0** | `provider_request_id`, `http_status`, `outcome`, `error_category`, `error_sanitized`, `provider_usage`, `output_metadata` |
| `studio_world_characters` | 13 | canon characters, `identity_state`, `base_model_seed`, `truth_class` |
| `studio_character_reference_assets` | 14 | `approved_for_generation`, `identity_lock_state`, `rights_state` |
| `thylora_visual_assets` | 36 | `asset_id`, `version`, `approval_state`, `rights_state`, `provenance_state` |
| `thylora_visual_provenance` | 10 | `generation_method`, `integrity_hash`, `source_reference` |
| `vlegh_registry` | 4 | `serial_number`, `asset_id`, `version`, `predecessor_id` |
| `assets` | 6 | `canonical_id`, `version`, `predecessor_id`, `provenance` |
| `approval_queue` | 17 | Chairman approval surface |

A provider-agnostic render-job table, with a cost column and a continuity
column, was designed and **has never been driven** — zero rows in both job
tables. What was missing was never the schema. It was a driver, and enforcement.

So this lane adds **no job table and no second pipeline**. `toRenderJobRow()` in
`dashboard/r6/lib/media-router.js` is the single place the mapping onto those
existing columns lives.

`thylora_router_jobs` (91 rows) was also inspected and is a *different* thing —
department command routing (`directive`, `department_code`, `assigned_to`). It is
not a media pipeline and has not been disturbed.

---

## Architecture

### Provider adapters behind one interface

`PROVIDER_CATALOGUE` holds Runway and fal.ai. Each entry declares operations,
models, per-model max duration, supported resolutions, whether audio is
returned, a rate card, and a credential state. Adding a provider is one
catalogue entry plus one adapter; nothing else in the router names a vendor.
`docs/RAE-LINK-PROVIDER-MAP.md` now carries `video_generation` as capability
row 26, following the existing convention that capabilities are addressed by
name and never by vendor.

### Two fields carry the honesty of the whole surface

- **`rate_card.verified_at` is `null` for every provider.** This build verified
  no price. A null here blocks paid generation outright and the offer reads
  "cost unknown" rather than a confident invented number. A price nobody checked
  is worse than no price, because it would be believed.
- **`credential_state` is `ABSENT` for every provider.** This repository holds no
  provider key and must never hold one.

The consequence is deliberate: **the router as shipped cannot spend money.** It
composes, prices, discloses and refuses. That is the correct state for a lane
that has never been witnessed.

### Never silently substitute a provider

Enforced in `selectProvider`, tested, and witnessed in a browser:

- Chairman names a provider → it is used, or the request is **refused** with the
  reason. The alternate is a proposal he must name; it is never applied for him.
- Chairman names none → automatic selection is allowed, and the chosen provider
  is still disclosed in the offer before any spend.
- A provider that *could* do the work but is blocked on money or a credential is
  **named anyway**, because "impossible" and "unfunded" are different answers and
  the Chairman is owed the right one. Today that reads: *"fal.ai can perform
  VIDEO_TO_VIDEO, but is blocked on RATE_CARD_UNVERIFIED, NO_CREDENTIAL."*

### Shown before every paid generation

Provider, estimated cost, expected duration, supported resolution, and whether
audio is included — all five are mandatory fields on the offer object, rendered
in the room, and asserted in the witness run.

### Immutable master, derivative lineage

`deriveClip()` takes a master and returns a **new** record. There is no update
path to a master anywhere in the module, the returned master is frozen, and
`verifyMasterPreserved()` proves byte-identity. Each clip gets a new
`canonical_id`, a new `serial_number`, `version = master.version + 1`, and
`predecessor_id` pointing at the master — in all three registries that record
lineage (`thylora_visual_assets`, `thylora_visual_provenance`, `vlegh_registry`).
A generated clip is never born approved.

### Continuity pulled, never invented

`buildContinuity()` reads `studio_world_characters` and
`studio_character_reference_assets`. A character with no reference
`approved_for_generation` is **not cleared**, however canon they are, and
continuity refuses as a whole when any requested character is blocked — partial
continuity is how a character drifts between clips.

---

## Bramble / Wick — the first serialized test case

The Chairman named "Bramble/WYCK". The backend spells it **Wick**, and both
exist as canon characters. This is recorded rather than silently corrected:

| Record | Value |
| --- | --- |
| Program | `ER-PROGRAM-BRAMBLE-WICK` — "Bramble Wick", `development_state: planned` |
| Character | `CHAR-BRAMBLE-001` — Bramble, `truth_class: CANON`, `identity_state: CANON_PARTIAL_PROFILE` |
| Character | `CHAR-WICK-001` — Wick, `truth_class: CANON`, `identity_state: CANON_PARTIAL_PROFILE` |
| Reference assets | **zero for both** |

**Bramble and Wick cannot be the first serialized test case today.** Neither has
a single row in `studio_character_reference_assets`, so neither has a reference
approved for generation. Generating them now would mean a provider inventing the
face of a canon character, and that face would differ in every clip produced
afterwards. The router refuses this by design, and the refusal is tested against
their real backend rows.

The 14 reference assets that do exist belong to other characters — Seezin
(`ER-CHAR-UNCLE-SEEZIN-001`, 4 approved), Caleb, Tomas, Isaiah, and two
name-unknown figures (2 approved each). Those characters *are* cleared by the
continuity gate. If the Chairman wants a first clip before Bramble/Wick
references exist, Seezin is the only canon-adjacent character with four approved
references.

There is also a separate `THY-IDEA-BRAMBLE-001` — "The Bramble Box™ Classroom
Trust System" — which is a different record and was not conflated with the
program.

---

## Money-distance: Chairman command to finished generated clip

Measured by `measureStore` with `MEDIA_ROUTER_GATES`, on the same discipline the
R6 lane already uses: **a gate closes on an evidence record, never on an
assertion.**

| # | Gate | State | Evidence |
| --- | --- | --- | --- |
| 1 | Source asset registered in THYLORA | **CLOSED** | 36 rows in `thylora_visual_assets`; 6 in `assets` |
| 2 | Character references approved for generation | OPEN | zero for Bramble/Wick |
| 3 | Provider adapter present | **CLOSED** | `dashboard/r6/lib/media-router.js` |
| 4 | Provider rate card verified | OPEN | `verified_at` null for both providers |
| 5 | Provider credential in backend secrets | OPEN | `credential_state: ABSENT` |
| 6 | Chairman authorised the spend | OPEN | no row in `approval_queue` |
| 7 | Provider accepted the job | OPEN | 0 rows in `studio_render_attempts` |
| 8 | Clip ingested as a derivative | OPEN | no `GENERATED_CLIP` row |
| 9 | Provenance and serial registered | OPEN | — |
| 10 | Chairman approved the clip | OPEN | — |

**Money-distance: 8 of 10 gates open** for a cleared character; **9 of 10** for
Bramble/Wick, whose continuity gate is also shut.

The shortest real path to a first clip is four gates, in this order, and only
the Chairman can open the first three:

1. **Verify a rate card** — one provider, one model, the published per-second
   price, written into `PROVIDER_CATALOGUE` with a real `verified_at`.
2. **Put a credential in backend secrets** — never in this repository.
3. **Stand up a worker** that leases a `QUEUED` row, calls the provider, and
   writes `studio_render_attempts`. The dashboard deliberately holds no provider
   key, so it composes and lodges jobs but cannot execute them.
4. **Register and approve reference assets for Bramble and Wick**, if they are to
   be the test case rather than Seezin.

---

## Proof

`npm test` — **175 tests, all passing**; 37 of them cover this lane.
`node dashboard/r6/proof/witness.mjs` — **123 checks, all passing**, on iPad Pro 11
portrait, iPad Pro 11 landscape and desktop. The media-router checks confirm, in
a real browser: all five disclosures render on every offer; the authorise
control stays disabled while rate cards are unverified; no invented price
appears; a provider that cannot serve is refused rather than swapped; no
substitute control appears when nothing is funded; the capable-but-unfunded
provider is still named; and money-distance is measured and stated.

### What is NOT proven

- **No provider has ever been called.** No credential exists, no worker exists,
  and no job has left `AWAITING_CONSENT`. Nothing in this lane has spent money.
- **The migration has not been applied.** `db/dashboard/0002_media_router.sql`
  needs a migration credential this repository does not hold. Until it runs, the
  guards are enforced only by the client, which is weaker — a client can be
  bypassed, a check constraint cannot.
- **No iPad round-trip has been witnessed.** Requirement 10 of the R6 lane and
  the Chairman's instruction here both stand unmet.

---

## Exact blockers

1. **No verified rate card.** Both providers ship `verified_at: null`. Blocks gate 4.
2. **No provider credential.** Both ship `credential_state: ABSENT`. Blocks gate 5.
3. **No execution worker.** `studio_render_jobs` can be written but nothing leases
   and runs it. Blocks gate 7. This is the largest piece of missing work.
4. **Bramble and Wick have no approved reference assets.** Blocks gate 2 for the
   named test case.
5. **`db/dashboard/0002_media_router.sql` not applied** to thylora-dash.
6. **Authority.** Per `DASHBOARD_AUTHORITY.md` this repository is not the
   deployment source of truth; the lane must be merged into
   `vyc2st-ctrl/thylora-executive-dashboard` and witnessed on
   `thylora-public-world` before any part of it is called live.

## Remaining actions to live operation

| # | Action | Who |
| --- | --- | --- |
| 1 | Verify one provider rate card and record `verified_at` | Chairman |
| 2 | Place the provider credential in backend secrets | Chairman |
| 3 | Apply `db/dashboard/0002_media_router.sql` | holder of migration credential |
| 4 | Build the worker that leases a QUEUED job, calls the provider, writes `studio_render_attempts`, ingests the output | build |
| 5 | Register and approve Bramble and Wick reference assets | Chairman / studio |
| 6 | Merge forward into `vyc2st-ctrl/thylora-executive-dashboard` | holder of that repository |
| 7 | Witness a full iPad round-trip: command → offer → authorise → clip → approve | Chairman |

Until 1–7 are done, **this is not live and is not claimed to be.**
